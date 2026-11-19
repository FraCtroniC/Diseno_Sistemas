'use strict';

module.exports = {
  up: async (queryInterface) => {
    const ahora = new Date();
    await queryInterface.bulkInsert('lineas_operativas', [
      {
        id: '11111111-1111-4111-8111-111111111101',
        nombre: 'Estado, Gerencia y Sociedad',
        sigla: 'ESGESO',
        descripcion: 'Facilitar un espacio académico para el estudio, la reflexión y generación de nuevas investigaciones sobre Estado, Gerencia y Sociedad.',
        slug: 'esgeso-estado-gerencia-sociedad',
        orden: 1,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '11111111-1111-4111-8111-111111111102',
        nombre: 'Desarrollo Sostenible y Comunidad',
        sigla: 'DESUCO',
        descripcion: 'Generar los conocimientos o insumos pertinentes a la integración de lo ambiental, lo social, lo económico y lo energético.',
        slug: 'descuo-desarrollo-sostenible-comunidad',
        orden: 2,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '11111111-1111-4111-8111-111111111103',
        nombre: 'Ingeniería, Tecnología e Innovación',
        sigla: 'INTEI',
        descripcion: 'Desarrollar y promover conocimientos científicos y tecnológicos orientados a la solución de problemas de la sociedad venezolana.',
        slug: 'intei-ingenieria-tecnologia-innovacion',
        orden: 3,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '11111111-1111-4111-8111-111111111104',
        nombre: 'Educación, Desarrollo, Innovación y Tecnología',
        sigla: 'EDIT',
        descripcion: 'Atender la descripción, construcción teórica, validación y aplicación de investigaciones referidas a la educación en diversos elementos, niveles y modalidades.',
        slug: 'edit-educacion-desarrollo-innovacion-tecnologia',
        orden: 4,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      }
    ], { ignoreDuplicates: true });
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('lineas_operativas', null, {});
  }
};
