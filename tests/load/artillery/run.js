const { spawnSync } = require('child_process');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:5001';

async function login(email, password) {
  const res = await fetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(`Login falló para ${email}: HTTP ${res.status}`);
  const json = await res.json();
  return json.data.token;
}

async function main() {
  const variables = {
    adminToken: await login('admin@test.local', 'Admin123!'),
    autorToken: await login('autor1@test.local', 'Autor123!')
  };

  const guion = path.resolve(__dirname, 'carga.yml');
  const salida = path.resolve(__dirname, '../../../.local/artillery-report.json');

  const env = {
    ...process.env,
    ADMIN_TOKEN: variables.adminToken,
    AUTOR_TOKEN: variables.autorToken
  };

  const resultado = process.platform === 'win32'
    ? spawnSync(
        `npx --yes artillery run "${guion}" --output "${salida}"`,
        { stdio: 'inherit', env, shell: true }
      )
    : spawnSync(
        'npx',
        ['--yes', 'artillery', 'run', guion, '--output', salida],
        { stdio: 'inherit', env }
      );

  if (resultado.status !== 0) {
    process.exitCode = resultado.status || 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
