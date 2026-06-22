'use strict';

module.exports = {
  up: async (queryInterface) => {
    const adminId = '0becd959-117e-495d-8e46-cb5cecd89fab';
    const sisId = 'adc2de6b-25f2-4056-af26-9654a4c62361';
    const civilId = '53fb5fad-fa55-4000-a5af-f89efe6f8f92';
    const adminEmpId = 'ee37b974-2e5c-4955-9381-c0ec91475474';
    const contId = '721e96ea-d4b1-4267-a3a3-27ef767a4243';
    const eduId = 'b5a8b06f-7aae-4cbe-a3c2-a6406abe0552';

    await queryInterface.bulkInsert('trabajos', [
      {
        id: 'a0000001-0000-0000-0000-000000000001',
        titulo: 'Diseño Curricular en la UNEFA',
        autor: 'A. Pérez, M. Gómez',
        tutor: 'Dr. Rodríguez',
        anio: 2026,
        resumen: 'Estudio sobre el rediseño curricular y su impacto en la formación integral por competencias.',
        palabras_clave: ['curriculo', 'competencias', 'educacion'],
        categoria_id: eduId,
        metadatos: JSON.stringify({ tipo_documento: 'pregrado', idioma: 'es', paginas: 120, carrera: 'Educación' }),
        archivo_url: null,
        estado: 'publicado',
        usuario_id: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'a0000001-0000-0000-0000-000000000002',
        titulo: 'Transformación Digital en la Gestión Académica',
        autor: 'L. Rodríguez, C. Pérez',
        tutor: 'MSc. Castillo',
        anio: 2025,
        resumen: 'Análisis de herramientas digitales para optimizar procesos académicos, administrativos y de consulta.',
        palabras_clave: ['transformacion digital', 'gestion academica', 'tecnologia'],
        categoria_id: sisId,
        metadatos: JSON.stringify({ tipo_documento: 'institucional', idioma: 'es', paginas: 85, carrera: 'Ingeniería de Sistemas' }),
        archivo_url: null,
        estado: 'publicado',
        usuario_id: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'a0000001-0000-0000-0000-000000000003',
        titulo: 'Metodologías Activas de Aprendizaje',
        autor: 'M. Salazar',
        tutor: 'Dra. Mendoza',
        anio: 2025,
        resumen: 'Sistematización de estrategias didácticas centradas en el estudiante y la evaluación formativa.',
        palabras_clave: ['metodologias activas', 'aprendizaje', 'evaluacion'],
        categoria_id: eduId,
        metadatos: JSON.stringify({ tipo_documento: 'pregrado', idioma: 'es', paginas: 95, carrera: 'Educación' }),
        archivo_url: null,
        estado: 'publicado',
        usuario_id: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'a0000001-0000-0000-0000-000000000004',
        titulo: 'Líneas de Investigación en Ingeniería',
        autor: 'J. Méndez, R. Flores',
        tutor: 'PhD. Contreras',
        anio: 2024,
        resumen: 'Mapa de líneas priorizadas para la producción de trabajos de grado y proyectos aplicados.',
        palabras_clave: ['investigacion', 'ingenieria', 'trabajos de grado'],
        categoria_id: sisId,
        metadatos: JSON.stringify({ tipo_documento: 'postgrado', idioma: 'es', paginas: 150, carrera: 'Ingeniería de Sistemas' }),
        archivo_url: null,
        estado: 'publicado',
        usuario_id: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'a0000001-0000-0000-0000-000000000005',
        titulo: 'Boletín de Divulgación Científica',
        autor: 'Equipo Editorial',
        tutor: null,
        anio: 2023,
        resumen: 'Selección de artículos, memorias y reseñas de interés para la comunidad universitaria.',
        palabras_clave: ['divulgacion', 'cientifico', 'boletin'],
        categoria_id: adminEmpId,
        metadatos: JSON.stringify({ tipo_documento: 'divulgacion', idioma: 'es', paginas: 45, carrera: 'Administración de Empresas' }),
        archivo_url: null,
        estado: 'publicado',
        usuario_id: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'a0000001-0000-0000-0000-000000000006',
        titulo: 'Reglamento de Citas y Referencias',
        autor: 'Comisión Normativa',
        tutor: null,
        anio: 2024,
        resumen: 'Lineamientos para la presentación formal de trabajos académicos y publicaciones institucionales.',
        palabras_clave: ['normativas', 'citas', 'referencias'],
        categoria_id: eduId,
        metadatos: JSON.stringify({ tipo_documento: 'normativas', idioma: 'es', paginas: 32, carrera: 'Educación' }),
        archivo_url: null,
        estado: 'publicado',
        usuario_id: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'a0000001-0000-0000-0000-000000000007',
        titulo: 'Manual de Procedimientos Académicos',
        autor: 'Secretaría Académica',
        tutor: null,
        anio: 2023,
        resumen: 'Compendio de procesos internos para solicitudes, validaciones y trámites académicos.',
        palabras_clave: ['procedimientos', 'academico', 'manual'],
        categoria_id: adminEmpId,
        metadatos: JSON.stringify({ tipo_documento: 'institucional', idioma: 'es', paginas: 68, carrera: 'Administración de Empresas' }),
        archivo_url: null,
        estado: 'publicado',
        usuario_id: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'a0000001-0000-0000-0000-000000000008',
        titulo: 'Memorias Editoriales UNEFA',
        autor: 'Equipo Editorial',
        tutor: null,
        anio: 2022,
        resumen: 'Selección de libros, cuadernos y publicaciones especiales generadas por la institución.',
        palabras_clave: ['editorial', 'memorias', 'publicaciones'],
        categoria_id: eduId,
        metadatos: JSON.stringify({ tipo_documento: 'editorial', idioma: 'es', paginas: 200, carrera: 'Educación' }),
        archivo_url: null,
        estado: 'publicado',
        usuario_id: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'a0000001-0000-0000-0000-000000000009',
        titulo: 'Sistema de Gestión de Inventarios para PYMES',
        autor: 'C. Medina, D. Rojas',
        tutor: 'Dr. Sánchez',
        anio: 2025,
        resumen: 'Desarrollo de una aplicación web para la gestión de inventarios en pequeñas y medianas empresas.',
        palabras_clave: ['inventarios', 'pymes', 'sistema web'],
        categoria_id: sisId,
        metadatos: JSON.stringify({ tipo_documento: 'pregrado', idioma: 'es', paginas: 110, carrera: 'Ingeniería de Sistemas' }),
        archivo_url: null,
        estado: 'publicado',
        usuario_id: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'a0000001-0000-0000-0000-000000000010',
        titulo: 'Análisis Estructural de Puentes Peatonales',
        autor: 'F. Ramírez',
        tutor: 'MSc. Vargas',
        anio: 2024,
        resumen: 'Evaluación de cargas y resistencia de puentes peatonales en zonas urbanas del estado Táchira.',
        palabras_clave: ['puentes', 'estructural', 'peatonal'],
        categoria_id: civilId,
        metadatos: JSON.stringify({ tipo_documento: 'pregrado', idioma: 'es', paginas: 130, carrera: 'Ingeniería Civil' }),
        archivo_url: null,
        estado: 'publicado',
        usuario_id: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('trabajos', null, {});
  }
};
