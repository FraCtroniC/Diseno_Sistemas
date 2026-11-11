'use strict';

/**
 * Índices para las consultas más costosas del repositorio:
 * búsqueda de texto completo, búsqueda por similitud, filtros del catálogo
 * y listados de notificaciones/comentarios.
 */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_trabajos_texto_completo_fts
      ON trabajos USING gin (to_tsvector('spanish', coalesce(texto_completo, '')));
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_trabajos_titulo_trgm
      ON trabajos USING gin (titulo gin_trgm_ops);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_trabajos_autor_trgm
      ON trabajos USING gin (autor gin_trgm_ops);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_trabajos_palabras_clave_gin
      ON trabajos USING gin (palabras_clave);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_trabajos_metadatos_gin
      ON trabajos USING gin (metadatos jsonb_path_ops);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_trabajos_estado_created
      ON trabajos (estado, "createdAt" DESC);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_trabajos_usuario_estado
      ON trabajos (usuario_id, estado);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_leida_created
      ON notificaciones (usuario_id, leida, "createdAt" DESC);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_comentarios_trabajo_created
      ON comentarios (trabajo_id, "createdAt" DESC);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_tutores_nombre_trgm
      ON tutores USING gin (nombre gin_trgm_ops);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_estudiantes_nombre_trgm
      ON estudiantes USING gin (nombre gin_trgm_ops);
    `);

    await queryInterface.sequelize.query('ANALYZE trabajos;');
    await queryInterface.sequelize.query('ANALYZE notificaciones;');
    await queryInterface.sequelize.query('ANALYZE comentarios;');
  },

  down: async (queryInterface) => {
    const indices = [
      'idx_trabajos_texto_completo_fts',
      'idx_trabajos_titulo_trgm',
      'idx_trabajos_autor_trgm',
      'idx_trabajos_palabras_clave_gin',
      'idx_trabajos_metadatos_gin',
      'idx_trabajos_estado_created',
      'idx_trabajos_usuario_estado',
      'idx_notificaciones_usuario_leida_created',
      'idx_comentarios_trabajo_created',
      'idx_tutores_nombre_trgm',
      'idx_estudiantes_nombre_trgm'
    ];

    for (const indice of indices) {
      await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${indice};`);
    }
  }
};
