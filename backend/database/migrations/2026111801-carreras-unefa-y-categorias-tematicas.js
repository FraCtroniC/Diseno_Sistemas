'use strict';

/**
 * Separa el catálogo de carreras de las categorías temáticas.
 *
 * - Crea las 6 carreras que se imparten en la UNEFA.
 * - Renombra las 5 categorías existentes (que en realidad eran carreras) a
 *   áreas temáticas, reutilizando sus IDs para no romper los trabajos.
 * - Agrega las categorías que faltaban (Turismo y Energía).
 * - Rellena `trabajos.carrera_id` usando la categoría y, como respaldo, el
 *   metadato legado `metadatos.carrera`.
 * - Elimina `metadatos.carrera` y deja `carrera_id` como obligatorio.
 */

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

const CATEGORIAS_RENOMBRADAS = [
  {
    id: 'ee37b974-2e5c-4955-9381-c0ec91475474',
    nombre: 'Administración y Gestión',
    slug: 'administracion-y-gestion',
    descripcion: 'Gestión pública, organización, procedimientos y proyectos.'
  },
  {
    id: '721e96ea-d4b1-4267-a3a3-27ef767a4243',
    nombre: 'Economía y Finanzas',
    slug: 'economia-y-finanzas',
    descripcion: 'Economía, contabilidad, presupuesto y finanzas.'
  },
  {
    id: 'b5a8b06f-7aae-4cbe-a3c2-a6406abe0552',
    nombre: 'Estudios Institucionales',
    slug: 'estudios-institucionales',
    descripcion: 'Reglamentos, manuales, normativas y documentos internos.'
  },
  {
    id: '53fb5fad-fa55-4000-a5af-f89efe6f8f92',
    nombre: 'Ingeniería y Construcción',
    slug: 'ingenieria-y-construccion',
    descripcion: 'Obras civiles, estructuras e infraestructura.'
  },
  {
    id: 'adc2de6b-25f2-4056-af26-9654a4c62361',
    nombre: 'Tecnología y Sistemas',
    slug: 'tecnologia-y-sistemas',
    descripcion: 'Software, redes, datos y sistemas de información.'
  }
];

const CATEGORIAS_NUEVAS = [
  {
    id: 'c1a00001-0000-4000-8000-000000000001',
    nombre: 'Turismo y Sociedad',
    slug: 'turismo-y-sociedad',
    descripcion: 'Turismo, patrimonio, cultura y comunidad.'
  },
  {
    id: 'c1a00002-0000-4000-8000-000000000002',
    nombre: 'Energía y Electricidad',
    slug: 'energia-y-electricidad',
    descripcion: 'Sistemas eléctricos, potencia y energías.'
  }
];

/** Categoría temática resultante -> carrera más cercana. */
const MAPEO_CATEGORIA_CARRERA = [
  ['adc2de6b-25f2-4056-af26-9654a4c62361', 'b1a00004-0000-4000-8000-000000000004'], // Tecnología y Sistemas -> Ing. Sistemas
  ['53fb5fad-fa55-4000-a5af-f89efe6f8f92', 'b1a00005-0000-4000-8000-000000000005'], // Ingeniería y Construcción -> Ing. Civil
  ['ee37b974-2e5c-4955-9381-c0ec91475474', 'b1a00001-0000-4000-8000-000000000001'], // Administración y Gestión -> Admin. y Gestión Municipal
  ['721e96ea-d4b1-4267-a3a3-27ef767a4243', 'b1a00003-0000-4000-8000-000000000003'], // Economía y Finanzas -> Economía
  ['b5a8b06f-7aae-4cbe-a3c2-a6406abe0552', 'b1a00002-0000-4000-8000-000000000002'] // Estudios Institucionales -> Licenciatura en Turismo
];

const IDS_CARRERAS = CARRERAS.map((carrera) => carrera.id);

function insertarCarreraSql() {
  return `
    INSERT INTO carreras (id, nombre, descripcion, slug, "createdAt", "updatedAt")
    VALUES (:id, :nombre, :descripcion, :slug, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
}

function insertarCategoriaSql() {
  return `
    INSERT INTO categorias (id, nombre, descripcion, slug, "createdAt", "updatedAt")
    VALUES (:id, :nombre, :descripcion, :slug, NOW(), NOW())
    ON CONFLICT DO NOTHING
  `;
}

module.exports = {
  up: async (queryInterface) => {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      for (const carrera of CARRERAS) {
        await sequelize.query(insertarCarreraSql(), { replacements: carrera, transaction });
      }

      for (const categoria of CATEGORIAS_RENOMBRADAS) {
        await sequelize.query(
          `UPDATE categorias
             SET nombre = :nombre,
                 slug = :slug,
                 descripcion = :descripcion,
                 "updatedAt" = NOW()
           WHERE id = :id`,
          { replacements: categoria, transaction }
        );
      }

      for (const categoria of CATEGORIAS_NUEVAS) {
        await sequelize.query(insertarCategoriaSql(), { replacements: categoria, transaction });
      }

      for (const [categoriaId, carreraId] of MAPEO_CATEGORIA_CARRERA) {
        await sequelize.query(
          `UPDATE trabajos
              SET carrera_id = :carreraId
            WHERE categoria_id = :categoriaId
              AND carrera_id IS NULL`,
          { replacements: { categoriaId, carreraId }, transaction }
        );
      }

      // Respaldo: trabajos cuya categoría no esté mapeada se resuelven con el
      // metadato legado `metadatos.carrera`, normalizado sin acentos.
      await sequelize.query(
        `UPDATE trabajos
            SET carrera_id = CASE
              WHEN lower(translate(coalesce(metadatos->>'carrera', ''), 'áéíóúÁÉÍÓÚüÜ', 'aeiouaeiouuu')) LIKE '%sistema%' THEN :sis
              WHEN lower(translate(coalesce(metadatos->>'carrera', ''), 'áéíóúÁÉÍÓÚüÜ', 'aeiouaeiouuu')) LIKE '%civil%' THEN :civil
              WHEN lower(translate(coalesce(metadatos->>'carrera', ''), 'áéíóúÁÉÍÓÚüÜ', 'aeiouaeiouuu')) LIKE '%electric%' THEN :electrica
              WHEN lower(translate(coalesce(metadatos->>'carrera', ''), 'áéíóúÁÉÍÓÚüÜ', 'aeiouaeiouuu')) LIKE '%turismo%' THEN :turismo
              WHEN lower(translate(coalesce(metadatos->>'carrera', ''), 'áéíóúÁÉÍÓÚüÜ', 'aeiouaeiouuu')) LIKE '%econom%' THEN :economia
              WHEN lower(translate(coalesce(metadatos->>'carrera', ''), 'áéíóúÁÉÍÓÚüÜ', 'aeiouaeiouuu')) LIKE '%contadur%' THEN :economia
              WHEN lower(translate(coalesce(metadatos->>'carrera', ''), 'áéíóúÁÉÍÓÚüÜ', 'aeiouaeiouuu')) LIKE '%administracion%' THEN :administracion
              WHEN lower(translate(coalesce(metadatos->>'carrera', ''), 'áéíóúÁÉÍÓÚüÜ', 'aeiouaeiouuu')) LIKE '%educacion%' THEN :turismo
              ELSE carrera_id
            END
          WHERE carrera_id IS NULL
            AND metadatos ? 'carrera'`,
        {
          replacements: {
            sis: 'b1a00004-0000-4000-8000-000000000004',
            civil: 'b1a00005-0000-4000-8000-000000000005',
            electrica: 'b1a00006-0000-4000-8000-000000000006',
            turismo: 'b1a00002-0000-4000-8000-000000000002',
            economia: 'b1a00003-0000-4000-8000-000000000003',
            administracion: 'b1a00001-0000-4000-8000-000000000001'
          },
          transaction
        }
      );

      const [faltantes] = await sequelize.query(
        'SELECT id, titulo FROM trabajos WHERE carrera_id IS NULL',
        { transaction }
      );

      if (faltantes.length > 0) {
        const titulos = faltantes.map((trabajo) => `"${trabajo.titulo}"`).join(', ');
        throw new Error(
          `No se pudo asignar una carrera a ${faltantes.length} trabajo(s): ${titulos}. ` +
          'Asigna la carrera manualmente y vuelve a ejecutar la migración.'
        );
      }

      // Una sola fuente de verdad: la carrera vive en `carrera_id`.
      await sequelize.query(
        `UPDATE trabajos SET metadatos = metadatos - 'carrera' WHERE metadatos ? 'carrera'`,
        { transaction }
      );

      await sequelize.query(
        'ALTER TABLE trabajos ALTER COLUMN carrera_id SET NOT NULL',
        { transaction }
      );

      // Fuera del alcance de UNEFA: se eliminan las carreras sin uso. Si alguna
      // tiene referencias se aborta para no dejar datos huérfanos.
      await sequelize.query(
        `DELETE FROM carreras
          WHERE id NOT IN (:idsCarreras)
            AND NOT EXISTS (SELECT 1 FROM trabajos t WHERE t.carrera_id = carreras.id)
            AND NOT EXISTS (SELECT 1 FROM estudiantes e WHERE e.carrera_id = carreras.id)`,
        { replacements: { idsCarreras: IDS_CARRERAS }, transaction }
      );

      const [sobrantes] = await sequelize.query(
        'SELECT id, nombre FROM carreras WHERE id NOT IN (:idsCarreras)',
        { replacements: { idsCarreras: IDS_CARRERAS }, transaction }
      );

      if (sobrantes.length > 0) {
        const nombres = sobrantes.map((carrera) => `"${carrera.nombre}"`).join(', ');
        throw new Error(
          `Existen carreras fuera del catálogo UNEFA con trabajos o estudiantes asociados: ${nombres}. ` +
          'Reasigna esas referencias antes de volver a ejecutar la migración.'
        );
      }
    });
  },

  down: async (queryInterface) => {
    const { sequelize } = queryInterface;

    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        'ALTER TABLE trabajos ALTER COLUMN carrera_id DROP NOT NULL',
        { transaction }
      );

      await sequelize.query('UPDATE trabajos SET carrera_id = NULL', { transaction });

      await sequelize.query(
        'DELETE FROM carreras WHERE id IN (:idsCarreras)',
        { replacements: { idsCarreras: IDS_CARRERAS }, transaction }
      );

      await sequelize.query(
        'DELETE FROM categorias WHERE id IN (:idsCategorias)',
        { replacements: { idsCategorias: CATEGORIAS_NUEVAS.map((categoria) => categoria.id) }, transaction }
      );

      const originales = [
        { id: 'ee37b974-2e5c-4955-9381-c0ec91475474', nombre: 'Administración de Empresas', slug: 'administracion-de-empresas' },
        { id: '721e96ea-d4b1-4267-a3a3-27ef767a4243', nombre: 'Contaduría Pública', slug: 'contaduria-publica' },
        { id: 'b5a8b06f-7aae-4cbe-a3c2-a6406abe0552', nombre: 'Educación', slug: 'educacion' },
        { id: '53fb5fad-fa55-4000-a5af-f89efe6f8f92', nombre: 'Ingeniería Civil', slug: 'ingenieria-civil' },
        { id: 'adc2de6b-25f2-4056-af26-9654a4c62361', nombre: 'Ingeniería de Sistemas', slug: 'ingenieria-de-sistemas' }
      ];

      for (const categoria of originales) {
        await sequelize.query(
          `UPDATE categorias
              SET nombre = :nombre,
                  slug = :slug,
                  "updatedAt" = NOW()
            WHERE id = :id`,
          { replacements: categoria, transaction }
        );
      }
    });
  }
};
