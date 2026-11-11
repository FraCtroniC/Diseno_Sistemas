'use strict';

/**
 * La búsqueda calculaba to_tsvector('spanish', texto_completo) dos veces por
 * fila (filtro y ranking), lo que la convertía en el endpoint más costoso.
 * Una columna generada almacena el vector una sola vez y permite usar el
 * índice GIN tanto para filtrar como para ordenar por relevancia.
 */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE trabajos
      ADD COLUMN IF NOT EXISTS search_vector tsvector
      GENERATED ALWAYS AS (to_tsvector('spanish', coalesce(texto_completo, ''))) STORED;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_trabajos_search_vector_gin
      ON trabajos USING gin (search_vector);
    `);

    // El índice sobre la expresión ya no se usa: la columna generada lo reemplaza.
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_trabajos_texto_completo_fts;');

    await queryInterface.sequelize.query('ANALYZE trabajos;');
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_trabajos_search_vector_gin;');
    await queryInterface.sequelize.query('ALTER TABLE trabajos DROP COLUMN IF EXISTS search_vector;');
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_trabajos_texto_completo_fts
      ON trabajos USING gin (to_tsvector('spanish', coalesce(texto_completo, '')));
    `);
  }
};
