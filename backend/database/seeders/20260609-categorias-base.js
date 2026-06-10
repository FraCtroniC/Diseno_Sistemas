'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('categorias', [
      {
        id: 'adc2de6b-25f2-4056-af26-9654a4c62361',
        nombre: 'Ingeniería de Sistemas',
        descripcion: 'Trabajos relacionados con Ingeniería de Sistemas',
        slug: 'ingenieria-de-sistemas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '53fb5fad-fa55-4000-a5af-f89efe6f8f92',
        nombre: 'Ingeniería Civil',
        descripcion: 'Trabajos relacionados con Ingeniería Civil',
        slug: 'ingenieria-civil',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'ee37b974-2e5c-4955-9381-c0ec91475474',
        nombre: 'Administración de Empresas',
        descripcion: 'Trabajos relacionados con Administración de Empresas',
        slug: 'administracion-de-empresas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '721e96ea-d4b1-4267-a3a3-27ef767a4243',
        nombre: 'Contaduría Pública',
        descripcion: 'Trabajos relacionados con Contaduría Pública',
        slug: 'contaduria-publica',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'b5a8b06f-7aae-4cbe-a3c2-a6406abe0552',
        nombre: 'Educación',
        descripcion: 'Trabajos relacionados con Educación',
        slug: 'educacion',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categorias', null, {});
  }
};
