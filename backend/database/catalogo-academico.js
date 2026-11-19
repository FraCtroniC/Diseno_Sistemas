'use strict';

/**
 * Fuente única de verdad del catálogo académico de la UNEFA Núcleo Táchira.
 *
 * La usan la migración que crea los niveles y los programas de posgrado y el
 * seeder de carreras, para que una instalación nueva y una existente acaben
 * exactamente igual. `nivelSlug` se resuelve a `nivel_id` en ambos casos.
 */

const NIVELES = [
  {
    id: 'd1a00001-0000-4000-8000-000000000001',
    nombre: 'Pregrado',
    slug: 'pregrado',
    grupo: 'pregrado',
    orden: 1
  },
  {
    id: 'd1a00002-0000-4000-8000-000000000002',
    nombre: 'Maestría',
    slug: 'maestria',
    grupo: 'postgrado',
    orden: 2
  },
  {
    id: 'd1a00003-0000-4000-8000-000000000003',
    nombre: 'Doctorado',
    slug: 'doctorado',
    grupo: 'postgrado',
    orden: 3
  }
];

const CARRERAS = [
  {
    id: 'b1a00001-0000-4000-8000-000000000001',
    nombre: 'Administración y Gestión Municipal',
    slug: 'administracion-y-gestion-municipal',
    descripcion: 'Gestión pública, organización y administración municipal.',
    nivelSlug: 'pregrado'
  },
  {
    id: 'b1a00002-0000-4000-8000-000000000002',
    nombre: 'Licenciatura en Turismo',
    slug: 'licenciatura-en-turismo',
    descripcion: 'Turismo, patrimonio, cultura y desarrollo comunitario.',
    nivelSlug: 'pregrado'
  },
  {
    id: 'b1a00003-0000-4000-8000-000000000003',
    nombre: 'Economía',
    slug: 'economia',
    descripcion: 'Economía, finanzas y análisis económico.',
    nivelSlug: 'pregrado'
  },
  {
    id: 'b1a00004-0000-4000-8000-000000000004',
    nombre: 'Ingeniería de Sistemas',
    slug: 'ingenieria-de-sistemas',
    descripcion: 'Software, redes, datos y sistemas de información.',
    nivelSlug: 'pregrado'
  },
  {
    id: 'b1a00005-0000-4000-8000-000000000005',
    nombre: 'Ingeniería Civil',
    slug: 'ingenieria-civil',
    descripcion: 'Obras civiles, estructuras e infraestructura.',
    nivelSlug: 'pregrado'
  },
  {
    id: 'b1a00006-0000-4000-8000-000000000006',
    nombre: 'Ingeniería Eléctrica',
    slug: 'ingenieria-electrica',
    descripcion: 'Sistemas eléctricos, potencia y energía.',
    nivelSlug: 'pregrado'
  },
  {
    id: 'b1a00007-0000-4000-8000-000000000007',
    nombre: 'Maestría en Recursos Humanos',
    slug: 'maestria-en-recursos-humanos',
    descripcion: 'Gestión del talento humano, organización y desarrollo de personal.',
    nivelSlug: 'maestria'
  },
  {
    id: 'b1a00008-0000-4000-8000-000000000008',
    nombre: 'Maestría en Ciencias Jurídicas',
    slug: 'maestria-en-ciencias-juridicas',
    descripcion: 'Investigación jurídica, derecho público y privado.',
    nivelSlug: 'maestria'
  },
  {
    id: 'b1a00009-0000-4000-8000-000000000009',
    nombre: 'Maestría Ambiental',
    slug: 'maestria-ambiental',
    descripcion: 'Gestión ambiental, sostenibilidad y recursos naturales.',
    nivelSlug: 'maestria'
  },
  {
    id: 'b1a00010-0000-4000-8000-000000000010',
    nombre: 'Doctorado en Ciencias Gerenciales',
    slug: 'doctorado-en-ciencias-gerenciales',
    descripcion: 'Investigación avanzada en dirección, gestión y decisiones organizacionales.',
    nivelSlug: 'doctorado'
  },
  {
    id: 'b1a00011-0000-4000-8000-000000000011',
    nombre: 'Doctorado en Innovaciones Educativas',
    slug: 'doctorado-en-innovaciones-educativas',
    descripcion: 'Investigación avanzada en innovación pedagógica y educación.',
    nivelSlug: 'doctorado'
  }
];

function nivelIdPorSlug(slug) {
  const nivel = NIVELES.find((item) => item.slug === slug);
  if (!nivel) {
    throw new Error(`Nivel académico desconocido: ${slug}`);
  }
  return nivel.id;
}

const CARRERAS_POSGRADO = CARRERAS.filter((carrera) => carrera.nivelSlug !== 'pregrado');

module.exports = { NIVELES, CARRERAS, CARRERAS_POSGRADO, nivelIdPorSlug };
