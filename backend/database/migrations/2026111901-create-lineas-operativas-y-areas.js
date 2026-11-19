'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('lineas_operativas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      sigla: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      slug: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.createTable('areas_estrategicas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      linea_operativa_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'lineas_operativas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      slug: {
        type: Sequelize.STRING(160),
        allowNull: false
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex('areas_estrategicas', {
      fields: ['linea_operativa_id', 'slug'],
      unique: true
    });

    await queryInterface.addColumn('trabajos', 'linea_operativa_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'lineas_operativas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.createTable('trabajo_area_estrategica', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      trabajo_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'trabajos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      area_estrategica_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'areas_estrategicas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    await queryInterface.addIndex('trabajo_area_estrategica', {
      fields: ['trabajo_id', 'area_estrategica_id'],
      unique: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('trabajo_area_estrategica');
    await queryInterface.removeColumn('trabajos', 'linea_operativa_id');
    await queryInterface.dropTable('areas_estrategicas');
    await queryInterface.dropTable('lineas_operativas');
  }
};
