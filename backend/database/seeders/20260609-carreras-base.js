'use strict';

const { CARRERAS, nivelIdPorSlug } = require('../catalogo-academico');

module.exports = {
  up: async (queryInterface) => {
    const ahora = new Date();
    await queryInterface.bulkInsert(
      'carreras',
      CARRERAS.map((carrera) => ({
        id: carrera.id,
        nombre: carrera.nombre,
        slug: carrera.slug,
        descripcion: carrera.descripcion,
        nivel_id: nivelIdPorSlug(carrera.nivelSlug),
        createdAt: ahora,
        updatedAt: ahora
      })),
      { ignoreDuplicates: true }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('carreras', {
      id: CARRERAS.map((carrera) => carrera.id)
    });
  }
};
