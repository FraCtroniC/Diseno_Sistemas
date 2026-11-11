process.env.NODE_ENV = 'test';
require('../config/load-env');

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const environment = require('../config/environment');

const BASE = process.env.SMOKE_BASE_URL || `http://localhost:${environment.port}`;
const API = `${BASE}/api/v1`;
const resultados = [];

function registrar(nombre, ok, detalle) {
  resultados.push({ nombre, ok, detalle });
  const marca = ok ? 'OK ' : 'FALLO';
  console.log(`[${marca}] ${nombre}${detalle ? ` -> ${detalle}` : ''}`);
}

async function request(method, ruta, { token, body, headers } = {}) {
  const opciones = { method, headers: { ...(headers || {}) } };
  if (token) opciones.headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(body);
  }

  const respuesta = await fetch(`${API}${ruta}`, opciones);
  let json = null;
  const texto = await respuesta.text();
  try {
    json = texto ? JSON.parse(texto) : null;
  } catch {
    json = { raw: texto };
  }
  return { status: respuesta.status, headers: respuesta.headers, json };
}

async function login(email, password) {
  const respuesta = await request('POST', '/auth/login', { body: { email, password } });
  return respuesta;
}

async function main() {
  const admin = await login('admin@test.local', 'Admin123!');
  registrar('Login admin', admin.status === 200 && Boolean(admin.json?.data?.token), `HTTP ${admin.status}`);
  const adminToken = admin.json?.data?.token;

  const repositor = await login('repositor@test.local', 'Repos123!');
  const repositorToken = repositor.json?.data?.token;
  const autor1 = await login('autor1@test.local', 'Autor123!');
  const autor1Token = autor1.json?.data?.token;
  const autor2 = await login('autor2@test.local', 'Autor123!');
  const autor2Token = autor2.json?.data?.token;

  const inactivo = await login('inactivo@test.local', 'Inactivo123!');
  registrar('Login de usuario inactivo bloqueado', inactivo.status === 403, `HTTP ${inactivo.status}`);

  const tokenInactivo = jwt.sign(
    { id: '66666666-6666-4666-8666-666666666666', rol: 'repositor' },
    environment.jwtSecret,
    { expiresIn: '5m' }
  );
  const perfilInactivo = await request('GET', '/auth/perfil', { token: tokenInactivo });
  registrar('Token de usuario desactivado rechazado', perfilInactivo.status === 401, `HTTP ${perfilInactivo.status}`);

  const estudiantesAnon = await request('GET', '/estudiantes');
  registrar('Estudiantes sin autenticación bloqueado', estudiantesAnon.status === 401, `HTTP ${estudiantesAnon.status}`);

  const estudiantesRepositor = await request('GET', '/estudiantes', { token: repositorToken });
  registrar('Estudiantes con rol repositor bloqueado', estudiantesRepositor.status === 403, `HTTP ${estudiantesRepositor.status}`);

  const estudiantesAdmin = await request('GET', '/estudiantes', { token: adminToken });
  const primerEstudiante = estudiantesAdmin.json?.data?.[0];
  registrar(
    'Estudiantes con rol admin permitido',
    estudiantesAdmin.status === 200 && Boolean(primerEstudiante?.cedula),
    `HTTP ${estudiantesAdmin.status}, ${estudiantesAdmin.json?.data?.length || 0} registros`
  );

  const tutoresAnon = await request('GET', '/tutores');
  const primerTutor = tutoresAnon.json?.data?.[0];
  const tutorSinPii = primerTutor
    && !('email' in primerTutor)
    && !('cedula' in primerTutor)
    && !('telefono' in primerTutor);
  registrar('Tutores públicos sin PII', tutoresAnon.status === 200 && tutorSinPii, JSON.stringify(primerTutor || {}));

  const tutoresDetalle = await request('GET', `/tutores/${primerTutor?.id}`);
  const detalleSinPii = tutoresDetalle.json?.data
    && !('email' in tutoresDetalle.json.data)
    && !('cedula' in tutoresDetalle.json.data)
    && !('telefono' in tutoresDetalle.json.data);
  registrar('Detalle público de tutor sin PII', tutoresDetalle.status === 200 && detalleSinPii, `HTTP ${tutoresDetalle.status}`);

  const trabajosAnon = await request('GET', '/trabajos?limite=100');
  const estadosAnon = new Set((trabajosAnon.json?.datos || []).map((t) => t.estado));
  registrar(
    'Catálogo anónimo solo muestra publicados',
    trabajosAnon.status === 200 && estadosAnon.size === 1 && estadosAnon.has('publicado'),
    `HTTP ${trabajosAnon.status}, total=${trabajosAnon.json?.total}, estados=${[...estadosAnon].join(',')}`
  );

  const borradoresAnon = await request('GET', '/trabajos?estado=borrador');
  registrar('Filtro anónimo de borradores bloqueado', borradoresAnon.status === 403, `HTTP ${borradoresAnon.status}`);

  const borradoresAdmin = await request('GET', '/trabajos?estado=borrador&limite=100', { token: adminToken });
  const borrador = (borradoresAdmin.json?.datos || []).find((t) => t.usuario_id === '44444444-4444-4444-8444-444444444444')
    || (borradoresAdmin.json?.datos || [])[0];
  registrar(
    'Admin puede listar borradores',
    borradoresAdmin.status === 200 && (borradoresAdmin.json?.total || 0) > 0,
    `HTTP ${borradoresAdmin.status}, total=${borradoresAdmin.json?.total}`
  );

  const borradorAnon = await request('GET', `/trabajos/${borrador.id}`);
  registrar('Detalle anónimo de borrador oculto', borradorAnon.status === 404, `HTTP ${borradorAnon.status}`);

  const borradorOtroAutor = borrador.usuario_id === '44444444-4444-4444-8444-444444444444'
    ? await request('GET', `/trabajos/${borrador.id}`, { token: autor2Token })
    : await request('GET', `/trabajos/${borrador.id}`, { token: autor1Token });
  registrar('Borrador ajeno oculto para otro autor', borradorOtroAutor.status === 404, `HTTP ${borradorOtroAutor.status}`);

  const borradorPropio = await request('GET', `/trabajos/${borrador.id}`, { token: autor1Token });
  registrar(
    'Autor puede ver su propio borrador',
    borrador.usuario_id === '44444444-4444-4444-8444-444444444444' && borradorPropio.status === 200,
    `HTTP ${borradorPropio.status}`
  );

  const tokenOtroAutor = borrador.usuario_id === '44444444-4444-4444-8444-444444444444'
    ? autor2Token
    : autor1Token;

  const edicionAjena = await request('PUT', `/trabajos/${borrador.id}`, {
    token: tokenOtroAutor,
    body: { titulo: 'Intento de edición ajena' }
  });
  registrar(
    'Edición de trabajo ajeno bloqueada',
    [403, 404].includes(edicionAjena.status),
    `HTTP ${edicionAjena.status}`
  );

  const borradoAjeno = await request('DELETE', `/trabajos/${borrador.id}`, {
    token: tokenOtroAutor
  });
  registrar(
    'Borrado de trabajo ajeno bloqueado',
    [403, 404].includes(borradoAjeno.status),
    `HTTP ${borradoAjeno.status}`
  );

  const revisionAjena = await request('PATCH', `/revisiones/${borrador.id}/estado`, {
    token: tokenOtroAutor,
    body: { estado: 'en_revision' }
  });
  registrar(
    'Cambio de estado de trabajo ajeno bloqueado',
    revisionAjena.status === 403,
    `HTTP ${revisionAjena.status}`
  );

  const comentariosBorrador = await request('GET', `/trabajos/${borrador.id}/comentarios`);
  const versionesBorrador = await request('GET', `/trabajos/${borrador.id}/versiones`);
  const citaBorrador = await request('GET', `/trabajos/${borrador.id}/cita`);
  const statsBorrador = await request('GET', `/trabajos/${borrador.id}/estadisticas`);
  const archivoBorrador = await request('GET', `/trabajos/${borrador.id}/archivo`);
  registrar(
    'Subrecursos de borrador ocultos para anónimos',
    [comentariosBorrador, versionesBorrador, citaBorrador, statsBorrador, archivoBorrador]
      .every((r) => r.status === 404),
    `comentarios=${comentariosBorrador.status}, versiones=${versionesBorrador.status}, ` +
      `cita=${citaBorrador.status}, stats=${statsBorrador.status}, archivo=${archivoBorrador.status}`
  );

  const oaiBorrador = await fetch(`${BASE}/oai?verb=ListMetadataFormats&identifier=${borrador.id}`);
  const oaiTexto = await oaiBorrador.text();
  registrar(
    'OAI no revela la existencia de borradores',
    oaiBorrador.status === 400 && oaiTexto.includes('idDoesNotExist'),
    `HTTP ${oaiBorrador.status}`
  );

  const inyeccion = await request('GET', `/trabajos/buscar?q=${encodeURIComponent("' OR 1=1 --")}`);
  const estadosInyeccion = new Set((inyeccion.json?.datos || []).map((t) => t.estado));
  registrar(
    'Búsqueda resiste inyección SQL',
    inyeccion.status === 200 && [...estadosInyeccion].every((e) => e === 'publicado'),
    `HTTP ${inyeccion.status}, total=${inyeccion.json?.total}`
  );

  const limiteInvalido = await request('GET', '/trabajos?limite=999');
  registrar('Límite de paginación validado', limiteInvalido.status === 400, `HTTP ${limiteInvalido.status}`);

  const formulario = new FormData();
  formulario.append('titulo', 'Intento de archivo falso');
  formulario.append('autor', 'QA');
  formulario.append('anio', '2026');
  formulario.append('categoria_id', 'adc2de6b-25f2-4056-af26-9654a4c62361');
  formulario.append('metadatos', JSON.stringify({ tipo_documento: 'pregrado', idioma: 'es' }));
  formulario.append('archivo', new Blob(['esto no es un pdf'], { type: 'application/pdf' }), 'falso.pdf');
  const subida = await fetch(`${API}/trabajos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${autor1Token}` },
    body: formulario
  });
  registrar('Archivo con cabecera PDF falsa rechazado', subida.status === 400, `HTTP ${subida.status}`);

  const jsonInvalido = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"email":'
  });
  registrar('JSON inválido responde 400', jsonInvalido.status === 400, `HTTP ${jsonInvalido.status}`);

  const cuerpoGrande = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'a@a.com', password: 'x'.repeat(1024 * 1024 + 100) })
  });
  registrar('Cuerpo JSON demasiado grande rechazado', cuerpoGrande.status === 413, `HTTP ${cuerpoGrande.status}`);

  const rateHeaders = await request('GET', '/trabajos?limite=1');
  const tieneRateLimit = Boolean(rateHeaders.headers.get('ratelimit') || rateHeaders.headers.get('ratelimit-policy'));
  registrar('Cabeceras de rate limit presentes', tieneRateLimit, rateHeaders.headers.get('ratelimit') || 'sin cabecera');

  const fallos = resultados.filter((r) => !r.ok);
  const salida = {
    fecha: new Date().toISOString(),
    base: BASE,
    total: resultados.length,
    correctos: resultados.length - fallos.length,
    fallos: fallos.length,
    resultados
  };
  const archivo = path.resolve(__dirname, '../../.local/security-smoke.json');
  fs.writeFileSync(archivo, JSON.stringify(salida, null, 2));
  console.log(`\nResultado: ${salida.correctos}/${salida.total} comprobaciones correctas. Evidencia: ${archivo}`);

  if (fallos.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error('La prueba de humo falló inesperadamente:', error);
  process.exitCode = 1;
});
