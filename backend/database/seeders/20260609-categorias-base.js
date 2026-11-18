'use strict';

module.exports = {
  up: async (queryInterface) => {
    const ahora = new Date();
    await queryInterface.bulkInsert('categorias', [
      {
        id: 'adc2de6b-25f2-4056-af26-9654a4c62361',
        nombre: 'Tecnología y Sistemas',
        descripcion: 'Software, redes, datos y sistemas de información.',
        slug: 'tecnologia-y-sistemas',
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '53fb5fad-fa55-4000-a5af-f89efe6f8f92',
        nombre: 'Ingeniería y Construcción',
        descripcion: 'Obras civiles, estructuras e infraestructura.',
        slug: 'ingenieria-y-construccion',
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: 'ee37b974-2e5c-4955-9381-c0ec91475474',
        nombre: 'Administración y Gestión',
        descripcion: 'Gestión pública, organización, procedimientos y proyectos.',
        slug: 'administracion-y-gestion',
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '721e96ea-d4b1-4267-a3a3-27ef767a4243',
        nombre: 'Economía y Finanzas',
        descripcion: 'Economía, contabilidad, presupuesto y finanzas.',
        slug: 'economia-y-finanzas',
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: 'b5a8b06f-7aae-4cbe-a3c2-a6406abe0552',
        nombre: 'Estudios Institucionales',
        descripcion: 'Reglamentos, manuales, normativas y documentos internos.',
        slug: 'estudios-institucionales',
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: 'c1a00001-0000-4000-8000-000000000001',
        nombre: 'Turismo y Sociedad',
        descripcion: 'Turismo, patrimonio, cultura y comunidad.',
        slug: 'turismo-y-sociedad',
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: 'c1a00002-0000-4000-8000-000000000002',
        nombre: 'Energía y Electricidad',
        descripcion: 'Sistemas eléctricos, potencia y energías.',
        slug: 'energia-y-electricidad',
        createdAt: ahora,
        updatedAt: ahora
      }
    ], { ignoreDuplicates: true });
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categorias', null, {});
  }
};
