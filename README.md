# Repositorio Digital UNEFA Táchira

Sistema full-stack para registrar, revisar, publicar y consultar la producción académica e institucional de la UNEFA Núcleo Táchira.

**Snapshot documentado:** commit `2f8b0a9` del 11 de noviembre de 2026 (código) y el commit de cierre de la documentación de la misma fecha. Este README describe lo que el repositorio hace hoy, no lo que se planeó originalmente. El estado detallado y las brechas conocidas están en [`docs/ESTADO.md`](docs/ESTADO.md); la correspondencia requisito → implementación → prueba está en [`docs/TRAZABILIDAD.md`](docs/TRAZABILIDAD.md).

---

## Lo que el sistema hace hoy

- Autenticación con JWT en cookie `httpOnly` y tres roles: `admin`, `repositor` y `bibliotecario`.
- Catálogo público con búsqueda full-text, filtros y detalle de trabajos.
- Carga de trabajos con metadatos, palabras clave y PDF de hasta 10 MB.
- Flujo de revisión: `borrador` → `en_revision` → `publicado` o devolución a `borrador`; `archivado` para administración.
- Notificaciones in-app y por SSE; comentarios con calificación; historial de versiones; citas en APA, BibTeX y RIS.
- Panel administrativo con estadísticas de producción y visitas.
- Interoperabilidad: OAI-PMH, RSS y Atom.
- Endurecimiento de seguridad verificado con 25 comprobaciones.

## Estado verificado

| Verificación | Resultado | Comando / evidencia |
|---|---|---|
| Pruebas backend | **156/156** en 14 suites | `cd backend && npm test -- --runInBand` |
| Pruebas frontend | **15/15** en 4 archivos | `cd frontend && npm test` |
| TypeScript | Sin errores | `cd frontend && npx tsc --noEmit` |
| Build de producción | Correcto, con advertencia de tamaño | `cd frontend && npm run build` |
| Lint | 0 errores, 19 advertencias | `cd frontend && npm run lint` |
| Prueba de humo de seguridad | **25/25** | `.local/security-smoke.json`, 2026-11-11T03:15:32Z |

> Las evidencias de `.local/` son locales y están ignoradas por Git. El informe consolidado y reproducible está en [`docs/informe-pruebas-carga-seguridad.md`](docs/informe-pruebas-carga-seguridad.md). Ver [`docs/EVIDENCIAS.md`](docs/EVIDENCIAS.md).

## Arquitectura

```text
Navegador
   │
   ├── frontend/   React 18 + Vite + TypeScript + Tailwind CSS
   │      │  /api/v1  (proxy en desarrollo; rewrite en Vercel)
   │      ▼
   └── backend/    Express 5 + Sequelize
          ├── PostgreSQL
          ├── Cloudinary (producción) o .local/uploads (pruebas locales)
          ├── SMTP (solo recuperación de contraseña)
          └── OAI-PMH · RSS/Atom · SSE (notificaciones)
```

El frontend consume la API mediante `axios` con `baseURL: '/api/v1'` y `withCredentials: true`. El backend monta la API versionada en `/api/v1` y expone además `/oai`, `/feed` y `/health`.

## Stack

| Capa | Tecnologías principales |
|---|---|
| Frontend | React 18, Vite 5, TypeScript, Tailwind CSS 3, React Router 6, Zustand 4, React Hook Form 7 + Zod 3, Recharts, react-pdf |
| Backend | Node.js, Express 5, Sequelize, PostgreSQL, Joi, express-validator, JWT, bcryptjs, multer, Cloudinary, Nodemailer |
| Calidad | Jest + Supertest (backend), Vitest + Testing Library (frontend), ESLint, TypeScript estricto |
| Interoperabilidad | OAI-PMH 2.0, RSS 2.0, Atom |

## Requisitos

- **Node.js `>=20.16 <21` o `>=22.3`**. Es el rango declarado en `backend/package.json`. Node 21 y Node 22.0–22.2 no están soportados. La verificación de este documento se ejecutó con Node 24.13.0.
- **npm 9 o superior**.
- **PostgreSQL**. El informe de pruebas usó PostgreSQL 18; otras versiones compatibles con Sequelize no fueron verificadas.
- **Cloudinary es opcional**. Para desarrollo local se puede usar `CLOUDINARY_MODE=local`.

## Puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/FraCtroniC/Dise-o_Sistemas.git
cd Dise-o_Sistemas
```

### 2. Backend

```bash
cd backend
npm install
Copy-Item .env.example .env
```

Editar `backend/.env` con los valores reales:

- `DATABASE_URL`: cadena de conexión PostgreSQL.
- `JWT_SECRET`: secreto de firma.
- `CLOUDINARY_*`: solo si se usa `CLOUDINARY_MODE=cloudinary`.
- `SMTP_*`: solo si se probará la recuperación de contraseña por correo.

Luego:

```bash
npm run db:migrate
# Opcional pero recomendado: definir ADMIN_PASSWORD en .env antes de sembrar
npm run db:seed
npm run dev
```

El seeder del administrador crea `admin@unefa.edu.ve`. Si `ADMIN_PASSWORD` no está definido, genera una contraseña aleatoria y la imprime en consola. Los seeders también crean categorías y trabajos de ejemplo.

Backend disponible en `http://localhost:5000`. Verificación rápida: `http://localhost:5000/health`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en `http://localhost:5173`. Vite redirige `/api` a `http://localhost:5000`.

## Comandos de verificación

| Comando | Qué comprueba |
|---|---|
| `cd backend && npm test -- --runInBand` | Suites Jest de servicios, middlewares y API |
| `cd frontend && npm test` | Suites Vitest de componentes, servicios y utilidades |
| `cd frontend && npx tsc --noEmit` | Tipado estricto sin emitir archivos |
| `cd frontend && npm run build` | Build de producción |
| `cd frontend && npm run lint` | Reglas ESLint |
| `cd backend && npm run test:security` | Prueba de humo de seguridad (requiere PostgreSQL y servidor en ejecución) |

Los comandos de carga (`test:load:k6`, `test:load:artillery`, `test:load:autocannon`) requieren las herramientas externas correspondientes y un entorno aislado. Ver [`docs/EVIDENCIAS.md`](docs/EVIDENCIAS.md).

## Documentación

| Documento | Para qué sirve |
|---|---|
| [`docs/PROYECTO.md`](docs/PROYECTO.md) | Ficha académica: problema, objetivos, actores, alcance, supuestos y riesgos |
| [`docs/ESTADO.md`](docs/ESTADO.md) | Verdad operativa: qué funciona, con qué evidencia y qué falta |
| [`docs/TRAZABILIDAD.md`](docs/TRAZABILIDAD.md) | Matriz requisito → implementación → prueba → estado, incluida la trazabilidad inversa |
| [`docs/EVIDENCIAS.md`](docs/EVIDENCIAS.md) | Comandos, resultados y ubicación de las evidencias |
| [`docs/DEMO.md`](docs/DEMO.md) | Guion de demostración de 10 minutos y plan de contingencia |
| [`CHANGELOG.md`](CHANGELOG.md) | Hitos reconstruidos desde Git, sin versiones inventadas |
| [`backend/README.md`](backend/README.md) | Documentación técnica de la API |
| [`docs/informe-pruebas-carga-seguridad.md`](docs/informe-pruebas-carga-seguridad.md) | Informe de carga, seguridad y riesgos pendientes |

Los archivos `frontend/AGENT.md` y `backend/AGENT.md` son **documentos históricos de especificación**. Se conservan como referencia, pero no describen el estado actual.

## Limitaciones conocidas

- **Dependencias:** `npm audit` reporta 13 vulnerabilidades en backend y 8 en frontend. No se aplicaron actualizaciones mayores para evitar regresiones sin una suite de regresión específica.
- **Sin CI/CD:** no existe `.github/`, pipeline ni etiquetas de versión.
- **Notificaciones de revisión:** son in-app/SSE. El correo electrónico solo se usa para recuperar contraseña.
- **Rate limiting en memoria:** si Render ejecuta más de una instancia, cada una lleva su propio contador.
- **Bundle único:** el build genera un chunk de ~1,35 MB; falta code splitting.
- **Convención TypeScript:** existen 9 usos de `any` en 8 archivos del frontend, aunque la especificación original los prohíbe.
- **Módulos normativo y editorial:** funcionan mediante el flujo general de trabajos; no hay módulos dedicados con ciclo de vida propio.
- **Metadatos académicos:** autores, asignatura, profesor y fecha de entrega no están confirmados; se marcan como pendientes en `docs/PROYECTO.md`.
- **Demo desplegada:** `frontend/vercel.json` apunta a `https://diseno-sistemas.onrender.com`, pero su disponibilidad no fue verificada en esta auditoría.

El detalle de cada brecha, su impacto y su prioridad está en [`docs/ESTADO.md`](docs/ESTADO.md#5-brechas-y-deuda-técnica).

## Contexto académico

Proyecto académico de la UNEFA Núcleo Táchira. Los datos formales de la asignatura, autores, profesor y fecha de entrega se registran en [`docs/PROYECTO.md`](docs/PROYECTO.md); los campos que no pudieron confirmarse están marcados explícitamente como pendientes.
