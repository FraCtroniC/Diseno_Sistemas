'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('trabajos', 'texto_completo', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_trabajos_texto_completo_fts
       ON trabajos USING gin(to_tsvector('spanish', coalesce("texto_completo", '')));`
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_trabajos_texto_completo_fts;'
    );
    await queryInterface.removeColumn('trabajos', 'texto_completo');
  }
};
