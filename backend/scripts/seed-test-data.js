process.env.NODE_ENV = 'test';
require('../config/load-env');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const environment = require('../config/environment');
const {
  sequelize,
  Usuario,
  Categoria,
  Carrera,
  Tutor,
  Estudiante,
  Trabajo,
  Comentario,
  Notificacion
} = require('../src/models');

const PASSWORD = 'Test1234!';

const USERS = [
  { id: '11111111-1111-4111-8111-111111111111', nombre: 'Admin QA', email: 'admin@test.local', username: 'adminqa', rol: 'admin', password: 'Admin123!' },
  { id: '22222222-2222-4222-8222-222222222222', nombre: 'Repositor QA', email: 'repositor@test.local', username: 'repositorqa', rol: 'repositor', password: 'Repos123!' },
  { id: '33333333-3333-4333-8333-333333333333', nombre: 'Bibliotecario QA', email: 'bibliotecario@test.local', username: 'biblioqa', rol: 'bibliotecario', password: 'Biblio123!' },
  { id: '44444444-4444-4444-8444-444444444444', nombre: 'Autor Uno QA', email: 'autor1@test.local', username: 'autor1qa', rol: 'repositor', password: 'Autor123!' },
  { id: '55555555-5555-4555-8555-555555555555', nombre: 'Autor Dos QA', email: 'autor2@test.local', username: 'autor2qa', rol: 'repositor', password: 'Autor123!' },
  { id: '66666666-6666-4666-8666-666666666666', nombre: 'Usuario Inactivo QA', email: 'inactivo@test.local', username: 'inactivoqa', rol: 'repositor', password: 'Inactivo123!', activo: false }
];

const CATEGORIAS = [
  { id: 'adc2de6b-25f2-4056-af26-9654a4c62361', nombre: 'Ingeniería de Sistemas', slug: 'ingenieria-de-sistemas', descripcion: 'Sistemas, software y tecnología.' },
  { id: '53fb5fad-fa55-4000-a5af-f89efe6f8f92', nombre: 'Ingeniería Civil', slug: 'ingenieria-civil', descripcion: 'Obras, estructuras y construcción.' },
  { id: 'ee37b974-2e5c-4955-9381-c0ec91475474', nombre: 'Administración de Empresas', slug: 'administracion-de-empresas', descripcion: 'Gestión y organización.' },
  { id: '721e96ea-d4b1-4267-a3a3-27ef767a4243', nombre: 'Contaduría Pública', slug: 'contaduria-publica', descripcion: 'Contabilidad y finanzas.' },
  { id: 'b5a8b06f-7aae-4cbe-a3c2-a6406abe0552', nombre: 'Educación', slug: 'educacion', descripcion: 'Docencia, currículo y pedagogía.' }
];

const CARRERAS = CATEGORIAS.map((categoria, indice) => ({
  id: `c000000${indice + 1}-0000-4000-8000-00000000000${indice + 1}`,
  nombre: categoria.nombre,
  slug: categoria.slug,
  descripcion: `Carrera de ${categoria.nombre}`
}));

const TUTORES = [
  { id: 'd0000001-0000-4000-8000-000000000001', nombre: 'Dra. Ana Rodríguez', email: 'ana.rodriguez@test.local', cedula: 'V-30000001' },
  { id: 'd0000002-0000-4000-8000-000000000002', nombre: 'MSc. Luis Castillo', email: 'luis.castillo@test.local', cedula: 'V-30000002' },
  { id: 'd0000003-0000-4000-8000-000000000003', nombre: 'PhD. Marta Contreras', email: 'marta.contreras@test.local', cedula: 'V-30000003' }
];

const ESTUDIANTES = Array.from({ length: 12 }, (_, indice) => ({
  id: `e0000001-0000-4000-8000-${String(indice + 1).padStart(12, '0')}`,
  nombre: `Estudiante QA ${indice + 1}`,
  email: `estudiante${indice + 1}@test.local`,
  cedula: `V-20${String(indice + 1).padStart(6, '0')}`,
  telefono: `0414-${String(1000000 + indice).slice(-7)}`,
  carrera_id: CARRERAS[indice % CARRERAS.length].id
}));

const TEMAS = [
  'sistema de gestión académica',
  'optimización de procesos administrativos',
  'plataforma de aprendizaje virtual',
  'análisis estructural de edificaciones',
  'modelo de gestión financiera',
  'estrategias pedagógicas innovadoras',
  'seguridad informática institucional',
  'automatización de inventarios',
  'evaluación de la calidad educativa',
  'gestión de proyectos comunitarios'
];

const TIPOS = ['pregrado', 'postgrado', 'tesis', 'tfg', 'articulo', 'monografia', 'institucional', 'editorial'];

function pdfFixture(title, author, year) {
  const esc = (value) => String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const lineas = [
    { tamano: 18, y: 700, texto: title },
    { tamano: 12, y: 650, texto: `Autor: ${author}` },
    { tamano: 12, y: 630, texto: `Ano: ${year}` },
    { tamano: 12, y: 590, texto: 'Documento generado por el Repositorio Digital UNEFA' },
    { tamano: 12, y: 570, texto: 'Nucleo Tachira - Entorno local de pruebas' }
  ];
  const stream = [
    'BT',
    ...lineas.flatMap(({ tamano, y, texto }) => [
      `/F1 ${tamano} Tf`,
      `1 0 0 1 50 ${y} Tm`,
      `(${esc(texto)}) Tj`
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

function assertSafeDatabase() {
  const url = process.env.DATABASE_URL || '';
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Este seeder solo puede ejecutarse con NODE_ENV=test.');
  }
  if (!/localhost|127\.0\.0\.1/.test(url) || !/test/i.test(url)) {
    throw new Error('El seeder solo puede ejecutarse contra una base local que contenga "test" en el nombre.');
  }
}

async function resetTables() {
  await sequelize.query(`
    TRUNCATE TABLE
      versiones, comentarios, notificaciones, visitas, revisiones,
      trabajos, estudiantes, tutores, carreras, usuarios, categorias
    RESTART IDENTITY CASCADE;
  `);
}

async function seed() {
  assertSafeDatabase();
  await sequelize.authenticate();
  await resetTables();

  await Categoria.bulkCreate(CATEGORIAS, { validate: false });
  await Carrera.bulkCreate(CARRERAS, { validate: false });
  await Tutor.bulkCreate(TUTORES, { validate: false });
  await Estudiante.bulkCreate(ESTUDIANTES, { validate: false });

  const usuarios = [];
  for (const user of USERS) {
    usuarios.push({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      username: user.username,
      password_hash: await bcrypt.hash(user.password || PASSWORD, 10),
      rol: user.rol,
      activo: user.activo !== false,
      cedula: `V-10${user.id.slice(0, 6)}`,
      telefono: '0414-0000000'
    });
  }
  await Usuario.bulkCreate(usuarios, { validate: false });

  const uploadDir = environment.localUploadDir;
  fs.mkdirSync(uploadDir, { recursive: true });
  const samplePdf = pdfFixture('Documento de prueba de carga', 'Equipo QA', 2026);
  fs.writeFileSync(path.join(uploadDir, 'sample.pdf'), samplePdf);
  const sampleUrl = `${environment.backendUrl}/local-files/sample.pdf`;

  const owners = ['44444444-4444-4444-8444-444444444444', '55555555-5555-4555-8555-555555555555', '22222222-2222-4222-8222-222222222222'];
  const estados = [
    ...Array(400).fill('publicado'),
    ...Array(40).fill('borrador'),
    ...Array(40).fill('en_revision'),
    ...Array(20).fill('archivado')
  ];

  const trabajos = estados.map((estado, indice) => {
    const categoria = CATEGORIAS[indice % CATEGORIAS.length];
    const carrera = CARRERAS[indice % CARRERAS.length];
    const tema = TEMAS[indice % TEMAS.length];
    const year = 2020 + (indice % 7);
    const publicado = estado === 'publicado';
    return {
      id: `a0000000-0000-4000-8000-${String(indice + 1).padStart(12, '0')}`,
      titulo: `Trabajo de prueba ${String(indice + 1).padStart(4, '0')} sobre ${tema}`,
      autor: `Autor QA ${indice + 1}`,
      tutor: TUTORES[indice % TUTORES.length].nombre,
      anio: year,
      resumen: `Resumen sintético del trabajo ${indice + 1}. Estudio sobre ${tema} en el contexto universitario.`,
      palabras_clave: [tema.split(' ')[0], 'prueba', 'unefa', `linea-${indice % 7}`],
      categoria_id: categoria.id,
      archivo_url: publicado && indice % 5 === 0 ? sampleUrl : null,
      metadatos: {
        tipo_documento: TIPOS[indice % TIPOS.length],
        idioma: 'es',
        paginas: 20 + (indice % 300),
        carrera: carrera.nombre,
        institucion: 'UNEFA Núcleo Táchira'
      },
      identificador: publicado ? `UNEFA-TCH-${year}-${String(indice + 1).padStart(4, '0')}` : null,
      texto_completo: `Documento de prueba sobre ${tema}. Este texto alimenta la búsqueda de texto completo del repositorio. Incluye términos como sistema, gestión, educación, investigación y tecnología. Registro número ${indice + 1}.`,
      estado,
      usuario_id: owners[indice % owners.length],
      carrera_id: carrera.id,
      tutor_id: TUTORES[indice % TUTORES.length].id,
      estudiante_id: ESTUDIANTES[indice % ESTUDIANTES.length].id,
      createdAt: new Date(Date.now() - indice * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - indice * 60 * 60 * 1000)
    };
  });

  await Trabajo.bulkCreate(trabajos, { validate: false });

  const publicados = trabajos.filter((trabajo) => trabajo.estado === 'publicado');
  const comentarios = Array.from({ length: 300 }, (_, indice) => {
    const trabajo = publicados[indice % publicados.length];
    return {
      id: crypto.randomUUID(),
      trabajo_id: trabajo.id,
      usuario_id: owners[indice % owners.length],
      comentario: `Comentario de prueba ${indice + 1}: aporte relacionado con ${trabajo.titulo}.`,
      calificacion: (indice % 5) + 1,
      createdAt: new Date(Date.now() - indice * 120 * 1000),
      updatedAt: new Date(Date.now() - indice * 120 * 1000)
    };
  });
  await Comentario.bulkCreate(comentarios, { validate: false });

  const notificaciones = Array.from({ length: 60 }, (_, indice) => ({
    id: crypto.randomUUID(),
    usuario_id: owners[indice % owners.length],
    tipo: indice % 2 === 0 ? 'comentario' : 'publicado',
    mensaje: `Notificación sintética ${indice + 1} para pruebas de carga.`,
    trabajo_id: publicados[indice % publicados.length].id,
    leida: indice % 3 === 0,
    createdAt: new Date(Date.now() - indice * 300 * 1000),
    updatedAt: new Date(Date.now() - indice * 300 * 1000)
  }));
  await Notificacion.bulkCreate(notificaciones, { validate: false });

  const counts = {
    usuarios: await Usuario.count(),
    categorias: await Categoria.count(),
    carreras: await Carrera.count(),
    tutores: await Tutor.count(),
    estudiantes: await Estudiante.count(),
    trabajos: await Trabajo.count(),
    publicados: await Trabajo.count({ where: { estado: 'publicado' } }),
    comentarios: await Comentario.count(),
    notificaciones: await Notificacion.count()
  };

  console.log('Datos de prueba creados:', counts);
  console.log('Usuarios: admin@test.local / Admin123! | repositor@test.local / Repos123! | bibliotecario@test.local / Biblio123!');
  console.log('Autores: autor1@test.local y autor2@test.local / Autor123!');
}

seed()
  .catch((error) => {
    console.error('No se pudieron crear los datos de prueba:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
