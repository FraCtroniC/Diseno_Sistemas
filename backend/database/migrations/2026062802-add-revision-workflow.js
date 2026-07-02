'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `ALTER TYPE enum_trabajos_estado ADD VALUE IF NOT EXISTS 'en_revision';`
    );

    await queryInterface.createTable('revisiones', {
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
      revisor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      estado_anterior: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      estado_nuevo: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      comentario: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('revisiones', ['trabajo_id']);
    await queryInterface.addIndex('revisiones', ['revisor_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('revisiones');
  }
};
