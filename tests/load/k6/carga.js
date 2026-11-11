import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:5001';
const API = `${BASE}/api/v1`;
const AUTOR1_ID = '44444444-4444-4444-8444-444444444444';
const TRABAJO_PUBLICADO = 'a0000000-0000-4000-8000-000000000001';

function login(email, password) {
  const res = http.post(`${API}/auth/login`, JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'login' }
  });
  check(res, { 'login exitoso': (r) => r.status === 200 });
  return res.json('data.token');
}

export function setup() {
  const admin = login('admin@test.local', 'Admin123!');
  const autor = login('autor1@test.local', 'Autor123!');

  const borradores = http.get(
    `${API}/trabajos?estado=borrador&usuario_id=${AUTOR1_ID}&limite=10`,
    { headers: { Authorization: `Bearer ${autor}` } }
  );
  const cuerpo = borradores.json();
  const draftId = cuerpo && cuerpo.datos && cuerpo.datos[0] ? cuerpo.datos[0].id : null;

  return { admin, autor, draftId };
}

export const options = {
  scenarios: {
    catalogo_publico: {
      executor: 'ramping-vus',
      exec: 'catalogo',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 20 },
        { duration: '5s', target: 0 }
      ],
      gracefulRampDown: '5s',
      tags: { escenario: 'catalogo' }
    },
    busqueda: {
      executor: 'ramping-vus',
      exec: 'busqueda',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 8 },
        { duration: '20s', target: 15 },
        { duration: '5s', target: 0 }
      ],
      gracefulRampDown: '5s',
      tags: { escenario: 'busqueda' }
    },
    detalle: {
      executor: 'constant-vus',
      exec: 'detalle',
      vus: 8,
      duration: '35s',
      tags: { escenario: 'detalle' }
    },
    autor: {
      executor: 'constant-vus',
      exec: 'autor',
      vus: 6,
      duration: '35s',
      tags: { escenario: 'autor' }
    },
    admin: {
      executor: 'constant-vus',
      exec: 'admin',
      vus: 4,
      duration: '35s',
      tags: { escenario: 'admin' }
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    checks: ['rate>0.98']
  }
};

export function catalogo() {
  const res = http.get(`${API}/trabajos?limite=10&pagina=1`, {
    tags: { name: 'catalogo' }
  });
  check(res, {
    'catálogo 200': (r) => r.status === 200,
    'catálogo solo publicados': (r) => {
      try {
        return r.json().datos.every((t) => t.estado === 'publicado');
      } catch {
        return false;
      }
    }
  });
  sleep(0.3 + Math.random() * 0.5);
}

export function busqueda() {
  const terminos = ['sistema', 'gestión', 'educación', 'tesis', 'seguridad', 'proyecto'];
  const q = terminos[Math.floor(Math.random() * terminos.length)];
  const res = http.get(`${API}/trabajos/buscar?q=${encodeURIComponent(q)}&limite=10`, {
    tags: { name: 'busqueda' }
  });
  check(res, {
    'búsqueda 200': (r) => r.status === 200,
    'búsqueda solo publicados': (r) => {
      try {
        return r.json().datos.every((t) => t.estado === 'publicado');
      } catch {
        return false;
      }
    }
  });
  sleep(0.3 + Math.random() * 0.7);
}

export function detalle() {
  const trabajo = http.get(`${API}/trabajos/${TRABAJO_PUBLICADO}`, {
    tags: { name: 'detalle' }
  });
  check(trabajo, { 'detalle 200': (r) => r.status === 200 });

  const comentarios = http.get(`${API}/trabajos/${TRABAJO_PUBLICADO}/comentarios`, {
    tags: { name: 'comentarios' }
  });
  check(comentarios, { 'comentarios 200': (r) => r.status === 200 });

  const cita = http.get(`${API}/trabajos/${TRABAJO_PUBLICADO}/cita?formato=apa`, {
    tags: { name: 'cita' }
  });
  check(cita, { 'cita 200': (r) => r.status === 200 });

  sleep(0.2 + Math.random() * 0.5);
}

export function autor(data) {
  const headers = { Authorization: `Bearer ${data.autor}` };
  const propios = http.get(
    `${API}/trabajos?estado=borrador&usuario_id=${AUTOR1_ID}&limite=10`,
    { headers, tags: { name: 'autor_borradores' } }
  );
  check(propios, { 'borradores propios 200': (r) => r.status === 200 });

  const notificaciones = http.get(`${API}/notificaciones?limite=10`, {
    headers,
    tags: { name: 'notificaciones' }
  });
  check(notificaciones, { 'notificaciones 200': (r) => r.status === 200 });

  if (data.draftId) {
    const detalle = http.get(`${API}/trabajos/${data.draftId}`, {
      headers,
      tags: { name: 'autor_detalle' }
    });
    check(detalle, { 'detalle propio 200': (r) => r.status === 200 });
  }

  sleep(0.3 + Math.random() * 0.6);
}

export function admin(data) {
  const headers = { Authorization: `Bearer ${data.admin}` };

  const borradores = http.get(`${API}/trabajos?estado=borrador&limite=10`, {
    headers,
    tags: { name: 'admin_borradores' }
  });
  check(borradores, { 'admin borradores 200': (r) => r.status === 200 });

  const estudiantes = http.get(`${API}/estudiantes?limite=10`, {
    headers,
    tags: { name: 'admin_estudiantes' }
  });
  check(estudiantes, { 'admin estudiantes 200': (r) => r.status === 200 });

  const tutores = http.get(`${API}/tutores?limite=10`, {
    tags: { name: 'admin_tutores' }
  });
  check(tutores, { 'tutores 200': (r) => r.status === 200 });

  sleep(0.3 + Math.random() * 0.6);
}
