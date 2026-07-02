'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('comentarios', {
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
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      comentario: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      calificacion: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 }
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

    await queryInterface.addIndex('comentarios', ['trabajo_id']);
    await queryInterface.addIndex('comentarios', ['usuario_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('comentarios');
  }
};
