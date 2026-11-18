'use strict';

const CARRERAS = [
  {
    id: 'b1a00001-0000-4000-8000-000000000001',
    nombre: 'Administración y Gestión Municipal',
    slug: 'administracion-y-gestion-municipal',
    descripcion: 'Gestión pública, organización y administración municipal.'
  },
  {
    id: 'b1a00002-0000-4000-8000-000000000002',
    nombre: 'Licenciatura en Turismo',
    slug: 'licenciatura-en-turismo',
    descripcion: 'Turismo, patrimonio, cultura y desarrollo comunitario.'
  },
  {
    id: 'b1a00003-0000-4000-8000-000000000003',
    nombre: 'Economía',
    slug: 'economia',
    descripcion: 'Economía, finanzas y análisis económico.'
  },
  {
    id: 'b1a00004-0000-4000-8000-000000000004',
    nombre: 'Ingeniería de Sistemas',
    slug: 'ingenieria-de-sistemas',
    descripcion: 'Software, redes, datos y sistemas de información.'
  },
  {
    id: 'b1a00005-0000-4000-8000-000000000005',
    nombre: 'Ingeniería Civil',
    slug: 'ingenieria-civil',
    descripcion: 'Obras civiles, estructuras e infraestructura.'
  },
  {
    id: 'b1a00006-0000-4000-8000-000000000006',
    nombre: 'Ingeniería Eléctrica',
    slug: 'ingenieria-electrica',
    descripcion: 'Sistemas eléctricos, potencia y energía.'
  }
];

module.exports = {
  up: async (queryInterface) => {
    const ahora = new Date();
    await queryInterface.bulkInsert(
      'carreras',
      CARRERAS.map((carrera) => ({
        ...carrera,
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
