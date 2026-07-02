'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('carreras', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      slug: {
        type: Sequelize.STRING(220),
        allowNull: false,
        unique: true
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

    await queryInterface.createTable('tutores', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      cedula: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(20),
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

    await queryInterface.createTable('estudiantes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      cedula: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      carrera_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'carreras', key: 'id' },
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

    await queryInterface.addColumn('trabajos', 'carrera_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'carreras', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.addColumn('trabajos', 'tutor_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'tutores', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.addColumn('trabajos', 'estudiante_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'estudiantes', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.addIndex('carreras', ['slug']);
    await queryInterface.addIndex('estudiantes', ['carrera_id']);
    await queryInterface.addIndex('trabajos', ['carrera_id']);
    await queryInterface.addIndex('trabajos', ['tutor_id']);
    await queryInterface.addIndex('trabajos', ['estudiante_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('trabajos', 'estudiante_id');
    await queryInterface.removeColumn('trabajos', 'tutor_id');
    await queryInterface.removeColumn('trabajos', 'carrera_id');
    await queryInterface.dropTable('estudiantes');
    await queryInterface.dropTable('tutores');
    await queryInterface.dropTable('carreras');
  }
};
