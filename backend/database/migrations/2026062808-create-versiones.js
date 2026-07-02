'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('versiones', {
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
      version: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      datos: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      archivo_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('versiones', ['trabajo_id']);
    await queryInterface.addIndex('versiones', ['version']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('versiones');
  }
};
