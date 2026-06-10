'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('trabajos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      titulo: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      autor: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      tutor: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      anio: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      resumen: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      palabras_clave: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      categoria_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categorias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      archivo_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadatos: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      estado: {
        type: Sequelize.ENUM('borrador', 'publicado', 'archivado'),
        defaultValue: 'borrador'
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    await queryInterface.addIndex('trabajos', ['titulo']);
    await queryInterface.addIndex('trabajos', ['autor']);
    await queryInterface.addIndex('trabajos', ['anio']);
    await queryInterface.addIndex('trabajos', ['categoria_id']);
    await queryInterface.addIndex('trabajos', ['estado']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('trabajos');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_trabajos_estado;');
  }
};
