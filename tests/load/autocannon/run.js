const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:5001';
const API = `${BASE}/api/v1`;
const AUTOR1_ID = '44444444-4444-4444-8444-444444444444';
const PUBLICADO = 'a0000000-0000-4000-8000-000000000001';

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(`Login falló para ${email}: HTTP ${res.status}`);
  const json = await res.json();
  return json.data.token;
}

function comillas(valor) {
  return `"${String(valor).replace(/"/g, '\\"')}"`;
}

function ejecutarAutocannon(nombre, url, token) {
  const partes = ['npx', '--yes', 'autocannon', '-j', '-c', '20', '-d', '15'];
  if (token) partes.push('-H', comillas(`Authorization: Bearer ${token}`));
  partes.push(comillas(url));
  const comando = partes.join(' ');

  console.log(`\nEjecutando autocannon: ${nombre}`);
  const resultado = process.platform === 'win32'
    ? spawnSync(comando, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, shell: true })
    : spawnSync('npx', ['--yes', 'autocannon', '-j', '-c', '20', '-d', '15', ...(token ? ['-H', `Authorization: Bearer ${token}`] : []), url], {
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024
      });

  if (resultado.status !== 0) {
    throw new Error(`autocannon falló (${nombre}): ${resultado.stderr || resultado.stdout}`);
  }

  // cmd.exe puede anteponer avisos de npx; se extrae el objeto JSON.
  const inicio = resultado.stdout.indexOf('{');
  const fin = resultado.stdout.lastIndexOf('}');
  if (inicio === -1 || fin === -1) {
    throw new Error(`autocannon no devolvió JSON (${nombre}): ${resultado.stdout.slice(0, 500)}`);
  }

  const json = JSON.parse(resultado.stdout.slice(inicio, fin + 1));
  return {
    nombre,
    url,
    requests: json.requests,
    latency: json.latency,
    throughput: json.throughput,
    errors: json.errors,
    timeouts: json.timeouts,
    non2xx: json.non2xx,
    statusCodes: json.statusCodeStats || json.statusCodes || null
  };
}

async function main() {
  const admin = await login('admin@test.local', 'Admin123!');
  const autor = await login('autor1@test.local', 'Autor123!');

  const escenarios = [
    { nombre: 'Catálogo público', url: `${API}/trabajos?limite=10` },
    { nombre: 'Búsqueda pública', url: `${API}/trabajos/buscar?q=sistema&limite=10` },
    { nombre: 'Detalle público', url: `${API}/trabajos/${PUBLICADO}` },
    { nombre: 'Comentarios públicos', url: `${API}/trabajos/${PUBLICADO}/comentarios` },
    { nombre: 'Borradores del autor', url: `${API}/trabajos?estado=borrador&usuario_id=${AUTOR1_ID}&limite=10`, token: autor },
    { nombre: 'Estudiantes (admin)', url: `${API}/estudiantes?limite=10`, token: admin }
  ];

  const resultados = [];
  for (const escenario of escenarios) {
    resultados.push(ejecutarAutocannon(escenario.nombre, escenario.url, escenario.token));
  }

  const salida = {
    fecha: new Date().toISOString(),
    base: BASE,
    conexiones: 20,
    duracionSegundos: 15,
    resultados
  };

  const archivo = path.resolve(__dirname, '../../../.local/autocannon.json');
  fs.writeFileSync(archivo, JSON.stringify(salida, null, 2));

  console.log('\nResumen autocannon');
  for (const r of resultados) {
    console.log(
      `- ${r.nombre}: ${Math.round(r.requests.average)} req/s, ` +
      `p50=${r.latency.p50} ms, p99=${r.latency.p99} ms, ` +
      `errores=${r.errors}, non2xx=${r.non2xx}`
    );
  }
  console.log(`Evidencia: ${archivo}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
