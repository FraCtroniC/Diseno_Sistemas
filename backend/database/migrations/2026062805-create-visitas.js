'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('visitas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      trabajo_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'trabajos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo: {
        type: Sequelize.ENUM('vista', 'descarga'),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('visitas', ['trabajo_id']);
    await queryInterface.addIndex('visitas', ['tipo']);
    await queryInterface.addIndex('visitas', ['createdAt']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('visitas');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_visitas_tipo;');
  }
};
