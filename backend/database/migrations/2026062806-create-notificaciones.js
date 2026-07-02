'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notificaciones', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      mensaje: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      trabajo_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'trabajos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      leida: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('notificaciones', ['usuario_id']);
    await queryInterface.addIndex('notificaciones', ['leida']);
    await queryInterface.addIndex('notificaciones', ['createdAt']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('notificaciones');
  }
};
