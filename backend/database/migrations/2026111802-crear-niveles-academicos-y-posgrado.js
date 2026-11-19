'use strict';

/**
 * Incorpora el posgrado al catálogo académico.
 *
 * - Crea `niveles_academicos` (pregrado, maestría, doctorado) con su `grupo`,
 *   que es lo que permite tratar maestrías y doctorados como "postgrado" sin
 *   mantener esa lista hardcodeada en el frontend.
 * - Agrega `carreras.nivel_id` como FK obligatoria y backfinea las 6 carreras
 *   existentes a "pregrado".
 * - Inserta los 5 programas de posgrado de la UNEFA Núcleo Táchira.
 *
 * Esta migración debe ejecutarse después de 2026111801, que eliminaba las
 * carreras fuera de su catálogo de seis programas.
 */

const { NIVELES, CARRERAS_POSGRADO, nivelIdPorSlug } = require('../catalogo-academico');

const IDS_POSGRADO = CARRERAS_POSGRADO.map((carrera) => carrera.id);

function insertarCarreraSql() {
  return `
    INSERT INTO carreras (id, nombre, descripcion, slug, nivel_id, "createdAt", "updatedAt")
    VALUES (:id, :nombre, :descripcion, :slug, :nivel_id, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      await queryInterface.createTable('niveles_academicos', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true
        },
        nombre: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true
        },
        slug: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true
        },
        grupo: {
          type: Sequelize.STRING(20),
          allowNull: false
        },
        orden: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
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
      }, { transaction });

      for (const nivel of NIVELES) {
        await sequelize.query(
          `INSERT INTO niveles_academicos (id, nombre, slug, grupo, orden, "createdAt", "updatedAt")
           VALUES (:id, :nombre, :slug, :grupo, :orden, NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          { replacements: nivel, transaction }
        );
      }

      await queryInterface.addColumn('carreras', 'nivel_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'niveles_academicos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }, { transaction });

      await sequelize.query(
        'UPDATE carreras SET nivel_id = :pregrado WHERE nivel_id IS NULL',
        { replacements: { pregrado: nivelIdPorSlug('pregrado') }, transaction }
      );

      for (const carrera of CARRERAS_POSGRADO) {
        await sequelize.query(insertarCarreraSql(), {
          replacements: { ...carrera, nivel_id: nivelIdPorSlug(carrera.nivelSlug) },
          transaction
        });
      }

      await queryInterface.changeColumn('carreras', 'nivel_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'niveles_academicos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }, { transaction });

      await queryInterface.addIndex('carreras', ['nivel_id'], { transaction });
    });
  },

  down: async (queryInterface) => {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      const [referencias] = await sequelize.query(
        `SELECT
           (SELECT COUNT(*) FROM trabajos WHERE carrera_id IN (:ids)) AS trabajos,
           (SELECT COUNT(*) FROM estudiantes WHERE carrera_id IN (:ids)) AS estudiantes`,
        { replacements: { ids: IDS_POSGRADO }, transaction }
      );

      const { trabajos, estudiantes } = referencias[0];
      if (Number(trabajos) > 0 || Number(estudiantes) > 0) {
        throw new Error(
          'No se puede revertir el catálogo de posgrado: existen trabajos o estudiantes asociados a esos programas.'
        );
      }

      await queryInterface.removeIndex('carreras', ['nivel_id'], { transaction });
      await queryInterface.changeColumn('carreras', 'nivel_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'niveles_academicos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }, { transaction });

      await sequelize.query(
        'DELETE FROM carreras WHERE id IN (:ids)',
        { replacements: { ids: IDS_POSGRADO }, transaction }
      );

      await queryInterface.removeColumn('carreras', 'nivel_id', { transaction });
      await queryInterface.dropTable('niveles_academicos', { transaction });
    });
  }
};
