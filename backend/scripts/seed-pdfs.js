require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { Op } = require('sequelize');
const { sequelize, Trabajo } = require('../src/models');
const cloudinaryService = require('../src/services/cloudinary.service');
const { extractTextFromPdf } = require('../src/services/pdf.service');

/**
 * Uso:
 *   node scripts/seed-pdfs.js              -> sube PDFs a los trabajos sin archivo.
 *   node scripts/seed-pdfs.js --reset      -> además limpia URLs que apuntan a otra cuenta Cloudinary.
 *   node scripts/seed-pdfs.js --backfill   -> además extrae el texto de PDFs ya subidos a la cuenta actual.
 *   node scripts/seed-pdfs.js --reseed     -> reemplaza los PDFs existentes de la cuenta actual (uso de desarrollo).
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const RESET = process.argv.includes('--reset');
const BACKFILL = process.argv.includes('--backfill');
const RESEED = process.argv.includes('--reseed');

/** Escapa caracteres especiales dentro de un literal de texto PDF. */
function escapePdfText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/** Construye un PDF de una página con una tabla xref válida. */
function generatePDFBuffer(title, author, year) {
  const lineas = [
    { tamano: 18, y: 700, texto: title },
    { tamano: 12, y: 650, texto: `Autor: ${author}` },
    { tamano: 12, y: 630, texto: `Ano: ${year}` },
    { tamano: 12, y: 590, texto: 'Documento generado por el Repositorio Digital UNEFA' },
    { tamano: 12, y: 570, texto: 'Nucleo Tachira' }
  ];

  const stream = [
    'BT',
    ...lineas.flatMap(({ tamano, y, texto }) => [
      `/F1 ${tamano} Tf`,
      `1 0 0 1 50 ${y} Tm`,
      `(${escapePdfText(texto)}) Tj`
    ]),
    'ET',
    ''
  ].join('\n');

  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];

  objetos.forEach((cuerpo, indice) => {
    offsets.push(pdf.length);
    pdf += `${indice + 1} 0 obj\n${cuerpo}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
}

/** Quita de la BD las URLs que apuntan a una cuenta de Cloudinary distinta de la actual. */
async function resetearUrlsDeOtrasCuentas() {
  if (!CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME no está definido en el .env');
  }

  const afectados = await Trabajo.findAll({
    attributes: ['id'],
    where: {
      [Op.and]: [
        { archivo_url: { [Op.ne]: null } },
        { archivo_url: { [Op.notILike]: `%res.cloudinary.com/${CLOUD_NAME}/%` } }
      ]
    }
  });
  const ids = afectados.map((trabajo) => trabajo.id);

  if (ids.length === 0) {
    console.log('Reset: no hay URLs de otras cuentas de Cloudinary.\n');
    return ids;
  }

  await Trabajo.update(
    { archivo_url: null, texto_completo: null },
    { where: { id: { [Op.in]: ids } } }
  );

  console.log(`Reset: ${ids.length} trabajo(s) apuntaban a otra cuenta de Cloudinary y se limpiaron.\n`);
  return ids;
}

/** Elimina los PDFs actuales y deja sus trabajos listos para regenerarse. */
async function prepararReseed() {
  if (!CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME no está definido en el .env');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('--reseed está deshabilitado en producción');
  }

  const trabajos = await Trabajo.findAll({
    attributes: ['id', 'titulo', 'archivo_url'],
    where: { archivo_url: { [Op.iLike]: `%res.cloudinary.com/${CLOUD_NAME}/%` } },
    order: [['createdAt', 'ASC']]
  });

  if (trabajos.length === 0) {
    console.log('Reseed: no hay PDFs de la cuenta actual para reemplazar.\n');
    return [];
  }

  console.log(`Reseed: se reemplazarán ${trabajos.length} PDF(s) de la cuenta actual...`);

  for (const trabajo of trabajos) {
    const publicId = cloudinaryService.extraerPublicId(trabajo.archivo_url);
    if (!publicId) {
      console.warn(`  SIN PUBLIC_ID -> "${trabajo.titulo}"`);
      continue;
    }
    try {
      await cloudinaryService.eliminarArchivo(publicId);
      console.log(`  Asset eliminado: ${publicId}`);
    } catch (error) {
      console.error(`  ERROR eliminando ${publicId}: ${error.message}`);
    }
  }

  const ids = trabajos.map((trabajo) => trabajo.id);
  await Trabajo.update(
    { archivo_url: null, texto_completo: null },
    { where: { id: { [Op.in]: ids } } }
  );

  console.log(`Reseed: ${ids.length} trabajo(s) listos para regenerar.\n`);
  return ids;
}

/** Extrae y guarda el texto de PDFs que ya están en la cuenta actual pero no tienen texto_completo. */
async function backfillTexto() {
  if (!CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME no está definido en el .env');
  }

  const pendientes = await Trabajo.findAll({
    where: {
      texto_completo: null,
      archivo_url: { [Op.iLike]: `%res.cloudinary.com/${CLOUD_NAME}/%` }
    },
    order: [['createdAt', 'ASC']]
  });

  console.log(`Backfill: ${pendientes.length} trabajo(s) con PDF en la cuenta actual y sin texto.\n`);

  for (const trabajo of pendientes) {
    try {
      const respuesta = await fetch(trabajo.archivo_url);
      if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status} al descargar el PDF`);
      }
      const buffer = Buffer.from(await respuesta.arrayBuffer());
      const texto = await extractTextFromPdf(buffer);

      if (!texto) {
        console.warn(`  SIN TEXTO -> "${trabajo.titulo}" (el PDF no contiene texto extraíble)\n`);
        continue;
      }

      trabajo.texto_completo = texto;
      await trabajo.save();
      console.log(`  OK -> "${trabajo.titulo}" (${texto.length} caracteres)\n`);
    } catch (error) {
      console.error(`  ERROR -> "${trabajo.titulo}": ${error.message}\n`);
    }
  }
}

/** Genera y sube un PDF para cada trabajo que no tenga archivo. */
async function sembrarPdfsFaltantes(idsFiltro = null) {
  const where = { archivo_url: null };
  if (idsFiltro !== null) {
    where.id = { [Op.in]: idsFiltro };
  }

  const trabajos = await Trabajo.findAll({
    where,
    order: [['createdAt', 'ASC']]
  });
  console.log(`Seed: ${trabajos.length} trabajo(s) sin archivo PDF.\n`);

  for (const trabajo of trabajos) {
    const title = trabajo.titulo || 'Sin titulo';
    const author = trabajo.autor || 'Sin autor';
    const year = trabajo.anio || new Date().getFullYear();
    const pdfBuffer = generatePDFBuffer(title, author, year);

    try {
      console.log(`Subiendo PDF para: "${title}"...`);
      const result = await cloudinaryService.subirArchivo(
        pdfBuffer,
        `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      );

      const texto = await extractTextFromPdf(pdfBuffer);
      trabajo.archivo_url = result.url;
      trabajo.texto_completo = texto;
      await trabajo.save();

      console.log(`  OK -> ${result.url}`);
      console.log(`  Texto extraído: ${texto ? `${texto.length} caracteres` : 'no disponible'}\n`);
    } catch (uploadErr) {
      console.error(`  ERROR al subir "${title}": ${uploadErr.message}\n`);
    }
  }
}

async function main() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conectado!\n');
    console.log(`Cuenta Cloudinary actual: ${CLOUD_NAME || '(sin definir)'}\n`);

    let idsObjetivo = null;
    if (RESEED) {
      idsObjetivo = await prepararReseed();
    } else if (RESET) {
      idsObjetivo = await resetearUrlsDeOtrasCuentas();
    }

    if (BACKFILL) {
      await backfillTexto();
    }

    await sembrarPdfsFaltantes(idsObjetivo);

    const total = await Trabajo.count();
    const conArchivo = await Trabajo.count({ where: { archivo_url: { [Op.ne]: null } } });
    const conTexto = await Trabajo.count({ where: { texto_completo: { [Op.ne]: null } } });
    console.log(`Resumen: ${conArchivo}/${total} trabajos con PDF y ${conTexto}/${total} con texto extraído.`);
  } catch (err) {
    console.error('Error general:', err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { generatePDFBuffer, escapePdfText };
