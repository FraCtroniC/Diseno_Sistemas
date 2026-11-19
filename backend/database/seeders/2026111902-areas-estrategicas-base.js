'use strict';

module.exports = {
  up: async (queryInterface) => {
    const ahora = new Date();
    const ESGESO = '11111111-1111-4111-8111-111111111101';
    const DESUCO = '11111111-1111-4111-8111-111111111102';
    const INTEI = '11111111-1111-4111-8111-111111111103';
    const EDIT = '11111111-1111-4111-8111-111111111104';

    await queryInterface.bulkInsert('areas_estrategicas', [
      // === ESGESO ===
      {
        id: '21111111-1111-4111-8111-111111111101',
        linea_operativa_id: ESGESO,
        nombre: 'Gerencia y Ética',
        descripcion: 'Gerencia pública, ética profesional y valores.',
        slug: 'gerencia-y-etica',
        orden: 1,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '21111111-1111-4111-8111-111111111102',
        linea_operativa_id: ESGESO,
        nombre: 'Seguridad, Defensa y Desarrollo',
        descripcion: 'Seguridad nacional, defensa y desarrollo territorial.',
        slug: 'seguridad-defensa-desarrollo',
        orden: 2,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '21111111-1111-4111-8111-111111111103',
        linea_operativa_id: ESGESO,
        nombre: 'Ambiente y Bienestar Social',
        descripcion: 'Gestión ambiental, bienestar social y calidad de vida.',
        slug: 'ambiente-bienestar-social',
        orden: 3,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '21111111-1111-4111-8111-111111111104',
        linea_operativa_id: ESGESO,
        nombre: 'Energía',
        descripcion: 'Energía, potencia y sistemas eléctricos.',
        slug: 'energia',
        orden: 4,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '21111111-1111-4111-8111-111111111105',
        linea_operativa_id: ESGESO,
        nombre: 'Logística y Mantenimiento',
        descripcion: 'Logística, transporte y mantenimiento de activos.',
        slug: 'logistica-mantenimiento',
        orden: 5,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '21111111-1111-4111-8111-111111111106',
        linea_operativa_id: ESGESO,
        nombre: 'Transporte',
        descripcion: 'Sistemas de transporte y movilidad.',
        slug: 'transporte',
        orden: 6,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '21111111-1111-4111-8111-111111111107',
        linea_operativa_id: ESGESO,
        nombre: 'Jurídico y Militar',
        descripcion: 'Derecho, jurídico militar y normativa institucional.',
        slug: 'juridico-militar',
        orden: 7,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '21111111-1111-4111-8111-111111111108',
        linea_operativa_id: ESGESO,
        nombre: 'Comercio Exterior',
        descripcion: 'Gestión de importación y exportación de productos manufacturados.',
        slug: 'comercio-exterior',
        orden: 8,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '21111111-1111-4111-8111-111111111109',
        linea_operativa_id: ESGESO,
        nombre: 'Producción Económica',
        descripcion: 'Métodos y técnicas de producción económica.',
        slug: 'produccion-economica',
        orden: 9,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '21111111-1111-4111-8111-111111111110',
        linea_operativa_id: ESGESO,
        nombre: 'Paz y Seguridad Territorial',
        descripcion: 'Paz, seguridad e integridad territorial.',
        slug: 'paz-seguridad-territorial',
        orden: 10,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },

      // === DESUCO ===
      {
        id: '22111111-1111-4111-8111-111111111101',
        linea_operativa_id: DESUCO,
        nombre: 'Petróleo, Gas y Energías Alternas',
        descripcion: 'Hidrocarburos, gas y fuentes de energía renovable.',
        slug: 'petroleo-gas-energias-alternas',
        orden: 1,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '22111111-1111-4111-8111-111111111102',
        linea_operativa_id: DESUCO,
        nombre: 'Desarrollo, Ambiente, Hábitat y Vivienda',
        descripcion: 'Desarrollo sostenible, ambiente, hábitat y vivienda.',
        slug: 'desarrollo-ambiente-habitat-vivienda',
        orden: 2,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '22111111-1111-4111-8111-111111111103',
        linea_operativa_id: DESUCO,
        nombre: 'Impacto Ambiental',
        descripcion: 'Evaluación y gestión del impacto ambiental.',
        slug: 'impacto-ambiental',
        orden: 3,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '22111111-1111-4111-8111-111111111104',
        linea_operativa_id: DESUCO,
        nombre: 'Seguridad y Soberanía Alimentaria',
        descripcion: 'Producción, acceso y soberanía alimentaria.',
        slug: 'seguridad-soberania-alimentaria',
        orden: 4,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '22111111-1111-4111-8111-111111111105',
        linea_operativa_id: DESUCO,
        nombre: 'Salud y Epidemiología',
        descripcion: 'Salud pública, epidemiología y prevención de enfermedades.',
        slug: 'salud-epidemiologia',
        orden: 5,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '22111111-1111-4111-8111-111111111106',
        linea_operativa_id: DESUCO,
        nombre: 'Agroindustria y Gestión Sostenible',
        descripcion: 'Agroindustria, gestión sostenible y desarrollo rural.',
        slug: 'agroindustria-gestion-sostenible',
        orden: 6,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },

      // === INTEI ===
      {
        id: '23111111-1111-4111-8111-111111111101',
        linea_operativa_id: INTEI,
        nombre: 'Ingeniería',
        descripcion: 'Ingeniería en sus distintas ramas.',
        slug: 'ingenieria',
        orden: 1,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '23111111-1111-4111-8111-111111111102',
        linea_operativa_id: INTEI,
        nombre: 'Recursos Energéticos',
        descripcion: 'Gestión y aprovechamiento de recursos energéticos.',
        slug: 'recursos-energeticos',
        orden: 2,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '23111111-1111-4111-8111-111111111103',
        linea_operativa_id: INTEI,
        nombre: 'Transporte',
        descripcion: 'Sistemas y tecnologías de transporte.',
        slug: 'transporte-intei',
        orden: 3,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '23111111-1111-4111-8111-111111111104',
        linea_operativa_id: INTEI,
        nombre: 'Logística',
        descripcion: 'Logística industrial y de suministros.',
        slug: 'logistica-intei',
        orden: 4,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '23111111-1111-4111-8111-111111111105',
        linea_operativa_id: INTEI,
        nombre: 'Mantenimiento',
        descripcion: 'Mantenimiento de equipos e infraestructura.',
        slug: 'mantenimiento-intei',
        orden: 5,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '23111111-1111-4111-8111-111111111106',
        linea_operativa_id: INTEI,
        nombre: 'Tecnología y Comunicaciones',
        descripcion: 'Tecnologías de la información y comunicaciones.',
        slug: 'tecnologia-comunicaciones',
        orden: 6,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '23111111-1111-4111-8111-111111111107',
        linea_operativa_id: INTEI,
        nombre: 'Ambiente y Gestión de Riesgos',
        descripcion: 'Gestión ambiental y de riesgos tecnológicos.',
        slug: 'ambiente-gestion-riesgos',
        orden: 7,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '23111111-1111-4111-8111-111111111108',
        linea_operativa_id: INTEI,
        nombre: 'Militar, Táctica y Estratégica',
        descripcion: 'Aplicaciones militares, tácticas y estratégicas.',
        slug: 'militar-tactica-estrategica',
        orden: 8,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '23111111-1111-4111-8111-111111111109',
        linea_operativa_id: INTEI,
        nombre: 'Biotecnología',
        descripcion: 'Biotecnología y aplicaciones.',
        slug: 'biotecnologia',
        orden: 9,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '23111111-1111-4111-8111-111111111110',
        linea_operativa_id: INTEI,
        nombre: 'Nanotecnología',
        descripcion: 'Nanotecnología y nanomateriales.',
        slug: 'nanotecnologia',
        orden: 10,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '23111111-1111-4111-8111-111111111111',
        linea_operativa_id: INTEI,
        nombre: 'Inteligencia Artificial',
        descripcion: 'IA, machine learning y sistemas inteligentes.',
        slug: 'inteligencia-artificial',
        orden: 11,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '23111111-1111-4111-8111-111111111112',
        linea_operativa_id: INTEI,
        nombre: 'Diversificación y Modernización Industrial',
        descripcion: 'Diversificación y modernización de la industria.',
        slug: 'diversificacion-modernizacion-industria',
        orden: 12,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '23111111-1111-4111-8111-111111111113',
        linea_operativa_id: INTEI,
        nombre: 'Ciencia y Tecnología Espacial',
        descripcion: 'Ciencia y tecnología espacial.',
        slug: 'ciencia-tecnologia-espacial',
        orden: 13,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },

      // === EDIT ===
      {
        id: '24111111-1111-4111-8111-111111111101',
        linea_operativa_id: EDIT,
        nombre: 'Educación y Desarrollo Humano',
        descripcion: 'Educación para todos y desarrollo humano.',
        slug: 'educacion-desarrollo-humano',
        orden: 1,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '24111111-1111-4111-8111-111111111102',
        linea_operativa_id: EDIT,
        nombre: 'Docencia y Currículum',
        descripcion: 'Docencia, currículum y prácticas educativas.',
        slug: 'docencia-curriculum',
        orden: 2,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '24111111-1111-4111-8111-111111111103',
        linea_operativa_id: EDIT,
        nombre: 'Ética y Valores',
        descripcion: 'Ética y valores en la educación.',
        slug: 'etica-valores-educacion',
        orden: 3,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '24111111-1111-4111-8111-111111111104',
        linea_operativa_id: EDIT,
        nombre: 'Gerencia Educativa',
        descripcion: 'Gerencia y administración educativa.',
        slug: 'gerencia-educativa',
        orden: 4,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '24111111-1111-4111-8111-111111111105',
        linea_operativa_id: EDIT,
        nombre: 'Investigaciones Educativas',
        descripcion: 'Investigación en educación y pedagogía.',
        slug: 'investigaciones-educativas',
        orden: 5,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '24111111-1111-4111-8111-111111111106',
        linea_operativa_id: EDIT,
        nombre: 'Tecnología Educativa',
        descripcion: 'Tecnología aplicada a la educación.',
        slug: 'tecnologia-educativa',
        orden: 6,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '24111111-1111-4111-8111-111111111107',
        linea_operativa_id: EDIT,
        nombre: 'Creación de Contenidos Digitales',
        descripcion: 'Creatividad y creación de contenidos digitales.',
        slug: 'creacion-contenidos-digitales',
        orden: 7,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      },
      {
        id: '24111111-1111-4111-8111-111111111108',
        linea_operativa_id: EDIT,
        nombre: 'Bienestar Social e Integración',
        descripcion: 'Bienestar social, integración latinoamericana y caribeña.',
        slug: 'bienestar-social-integracion',
        orden: 8,
        activo: true,
        createdAt: ahora,
        updatedAt: ahora
      }
    ], { ignoreDuplicates: true });
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('areas_estrategicas', null, {});
  }
};
