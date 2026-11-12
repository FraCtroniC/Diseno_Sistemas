# Backend — Repositorio Digital UNEFA Táchira

API REST del Repositorio Digital UNEFA Táchira. Gestiona autenticación, usuarios, trabajos académicos, revisión, comentarios, versiones, citas, estadísticas, notificaciones e interoperabilidad.

**Stack:** Node.js · Express 5 · Sequelize · PostgreSQL · Joi · express-validator · JWT · Cloudinary · Nodemailer.

**Estado verificado:** 156/156 pruebas en 14 suites. Ver [`../docs/ESTADO.md`](../docs/ESTADO.md) y [`../docs/EVIDENCIAS.md`](../docs/EVIDENCIAS.md).

---

## 1. Requisitos

- Node.js `>=20.16 <21` o `>=22.3` (declarado en `package.json`).
- npm 9 o superior.
- PostgreSQL. El informe de pruebas usó PostgreSQL 18.
- Cloudinary solo si se usa `CLOUDINARY_MODE=cloudinary`.

## 2. Instalación

```bash
cd backend
npm install
Copy-Item .env.example .env
```

Editar `.env` con la conexión real y el secreto JWT. Luego:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

El servidor escucha por defecto en `http://localhost:5000`. Verificación: `GET /health`.

## 3. Variables de entorno

### 3.1 Obligatorias

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `JWT_SECRET` | Secreto de firma del JWT; el servidor no arranca sin él |

### 3.2 Servidor y base de datos

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `PORT` | `5000` | Puerto HTTP |
| `NODE_ENV` | `development` | `development`, `test` o `production` |
| `FRONTEND_URL` | `http://localhost:5173` | Origen permitido por CORS |
| `BACKEND_URL` | `http://localhost:5000` | URL pública del backend |
| `DB_SSL` | `true` | `false` para PostgreSQL local sin SSL |
| `DB_LOGGING` | activo | `false` para desactivar el log SQL |
| `TRUST_PROXY_HOPS` | — | Saltos de proxy confiables; en producción se asume 1 si no se define |
| `DB_POOL_MAX` / `DB_POOL_MIN` | `5` / `0` | Solo se aplican en `NODE_ENV=test`. En desarrollo el pool es fijo 10/2 y en producción 20/5 |

### 3.3 Seguridad y límites

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `GLOBAL_RATE_LIMIT_WINDOW_MS` | `60000` | Ventana del limitador global |
| `GLOBAL_RATE_LIMIT_MAX` | `300` | Solicitudes por ventana |
| `AUTH_RATE_LIMIT_MAX` | `5` | Intentos de login/recuperación por ventana fija de 15 minutos |
| `AUTH_GENERAL_RATE_LIMIT_MAX` | `20` | Registro y rutas generales de autenticación por ventana fija de 15 minutos |
| `JSON_BODY_LIMIT` | `1mb` | Tamaño máximo del cuerpo JSON |
| `URLENCODED_BODY_LIMIT` | `1mb` | Tamaño máximo del cuerpo urlencoded |
| `REQUEST_TIMEOUT_MS` | `30000` | Timeout de solicitud |
| `HEADERS_TIMEOUT_MS` | `35000` | Timeout de cabeceras |
| `KEEP_ALIVE_TIMEOUT_MS` | `65000` | Keep-alive |
| `SOCKET_TIMEOUT_MS` | `120000` | Timeout de socket |
| `HTTP_LOGGING` | activo | `false` para desactivar Morgan |

### 3.4 Almacenamiento de PDFs

| Variable | Descripción |
|---|---|
| `CLOUDINARY_MODE` | `cloudinary` (producción) o `local` (pruebas) |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud |
| `CLOUDINARY_API_KEY` | API key |
| `CLOUDINARY_API_SECRET` | API secret |
| `LOCAL_UPLOAD_DIR` | Carpeta local; por defecto `.local/uploads` |

En modo `local`, los archivos se sirven en `/local-files`.

### 3.5 Correo

| Variable | Descripción |
|---|---|
| `SMTP_HOST` | Servidor SMTP |
| `SMTP_PORT` | Puerto; `465` usa TLS |
| `SMTP_USER` | Usuario |
| `SMTP_PASS` | Contraseña |
| `SMTP_FROM` | Remitente |

El correo se usa **solo** para recuperación de contraseña. En desarrollo, si el correo no se puede enviar, la respuesta incluye un enlace de restablecimiento; en producción se mantiene el mensaje genérico.

### 3.6 Seeder y OAI-PMH

| Variable | Descripción |
|---|---|
| `ADMIN_PASSWORD` | Contraseña del admin sembrado; si falta, se genera una aleatoria y se imprime en consola |
| `OAI_BASE_URL` | URL base usada en la respuesta OAI-PMH |
| `ADMIN_EMAIL` | Correo de administración en OAI-PMH |

### 3.7 Entorno de test

`NODE_ENV=test` carga únicamente `backend/.env.test` y fuerza la sobrescritura, para que las credenciales de `.env` no se filtren a las pruebas. `.env.test` está ignorado por Git.

## 4. Scripts

| Script | Qué hace |
|---|---|
| `npm start` | Inicia el servidor |
| `npm run dev` | Inicia con nodemon |
| `npm run db:migrate` | Ejecuta migraciones Sequelize |
| `npm run db:seed` | Ejecuta seeders |
| `npm run seed:test` | Siembra datos sintéticos en la base de test |
| `npm run start:test` | Inicia el servidor con `NODE_ENV=test` |
| `npm test` | Ejecuta Jest |
| `npm run test:watch` | Jest en modo watch |
| `npm run test:security` | Prueba de humo de seguridad |
| `npm run test:load:k6` | Carga con k6 |
| `npm run test:load:artillery` | Carga con Artillery |
| `npm run test:load:autocannon` | Carga con autocannon |

## 5. Estructura

```text
backend/
├── config/
│   ├── database.js          # Configuración Sequelize por entorno
│   ├── environment.js       # Variables de entorno centralizadas
│   └── load-env.js          # Carga .env o .env.test
├── database/
│   ├── migrations/          # 18 migraciones
│   └── seeders/             # Admin, categorías y trabajos de ejemplo
├── scripts/
│   ├── seed-test-data.js    # Datos sintéticos para pruebas
│   ├── start-test-server.js # Servidor de test
│   └── security-smoke.js    # 25 comprobaciones de seguridad
├── src/
│   ├── app.js               # Express, CORS, Helmet, límites, rutas
│   ├── server.js            # Arranque y timeouts
│   ├── controllers/         # Adaptadores HTTP
│   ├── middlewares/         # Auth, roles, errores, upload, validación
│   ├── models/              # Modelos Sequelize
│   ├── routes/              # Rutas y validadores de entrada
│   ├── services/            # Lógica de negocio
│   └── validators/          # express-validator y Joi
└── package.json
```

## 6. Modelo de datos

| Tabla | Propósito | Campos principales |
|---|---|---|
| `usuarios` | Cuentas y roles | `nombre`, `username`, `email`, `password_hash`, `cedula`, `telefono`, `rol`, `activo`, `reset_token`, `reset_token_expires` |
| `categorias` | Clasificación temática | `nombre`, `slug`, `descripcion` |
| `trabajos` | Documentos del repositorio | `titulo`, `autor`, `tutor`, `anio`, `resumen`, `palabras_clave`, `categoria_id`, `archivo_url`, `metadatos` (JSONB), `identificador`, `texto_completo`, `estado`, `usuario_id` |

**Brecha G-15 (modelo `Trabajo`):** las columnas `carrera_id`, `tutor_id` y `estudiante_id` existen en la migración `2026062803-create-entidades-academicas.js` y en las asociaciones de lectura (`carrera`, `tutorAsignado`, `estudiante`), pero **no están declaradas como atributos del modelo** ni se escriben desde la API. Las lecturas pueden incluir las entidades asociadas si los valores se insertaron directamente en la base; la API no permite asignarlas al crear o editar un trabajo.
| `revisiones` | Historial de cambios de estado | `trabajo_id`, `revisor_id`, `estado_anterior`, `estado_nuevo`, `comentario` |
| `carreras` | Catálogo de carreras | `nombre`, `slug`, `descripcion` |
| `tutores` | Tutores académicos/industriales | `nombre`, `email`, `cedula` |
| `estudiantes` | Datos académicos del autor | `nombre`, `email`, `cedula`, `telefono`, `carrera_id` |
| `visitas` | Vistas y descargas | `trabajo_id`, `tipo` (`vista`/`descarga`) |
| `notificaciones` | Avisos in-app | `usuario_id`, `tipo`, `mensaje`, `trabajo_id`, `leida` |
| `comentarios` | Retroalimentación | `trabajo_id`, `usuario_id`, `comentario`, `calificacion` (1–5) |
| `versiones` | Historial de versiones | `trabajo_id`, `version`, `datos` (JSONB), `archivo_url`, `created_by` |

**Estados de un trabajo:** `borrador`, `en_revision`, `publicado`, `archivado`.

**Roles:** `admin`, `repositor`, `bibliotecario`. El registro público crea `repositor`.

## 7. API

Base: `/api/v1`. Formato general: `{ "success": true, "data": ... }` o `{ "success": false, "error": "..." }`.

### 7.1 Autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/login` | Público | Login por correo, usuario o prefijo de correo |
| POST | `/auth/register` | Público | Registro; rol `repositor` por defecto |
| POST | `/auth/forgot-password` | Público | Solicita enlace de recuperación |
| POST | `/auth/reset-password` | Público | Restablece contraseña con token |
| POST | `/auth/logout` | Público | Limpia la cookie |
| PUT | `/auth/change-password` | Autenticado | Cambia la contraseña |
| GET | `/auth/perfil` | Autenticado | Perfil del usuario |
| PUT | `/auth/perfil` | Autenticado | Actualiza perfil |

La autenticación acepta JWT en cookie `httpOnly` o en `Authorization: Bearer <token>`.

### 7.2 Usuarios, carreras, tutores y estudiantes

| Método | Ruta | Acceso |
|---|---|---|
| GET/POST | `/usuarios`, `/usuarios/:id` | Admin |
| PUT/DELETE | `/usuarios/:id` | Admin |
| PATCH | `/usuarios/:id/estado` | Admin |
| GET | `/carreras`, `/carreras/:id` | Público |
| POST/PUT/DELETE | `/carreras`, `/carreras/:id` | Admin |
| GET | `/tutores`, `/tutores/:id` | Público; solo `id` y `nombre` |
| POST/PUT/DELETE | `/tutores`, `/tutores/:id` | Admin |
| GET | `/estudiantes`, `/estudiantes/:id` | Admin o bibliotecario |
| POST/PUT/DELETE | `/estudiantes`, `/estudiantes/:id` | Admin |

### 7.3 Trabajos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/trabajos` | Público/opcional | Lista con paginación y filtros por estado y autor |
| GET | `/trabajos/buscar` | Público/opcional | Búsqueda full-text |
| GET | `/trabajos/:id` | Público/opcional | Detalle; borradores solo para autor/admin/bibliotecario |
| GET | `/trabajos/:id/archivo` | Público/opcional | Descarga con control de acceso |
| GET | `/trabajos/:id/cita` | Público/opcional | Cita en `apa`, `bibtex` o `ris` |
| GET | `/trabajos/:id/estadisticas` | Público/opcional | Vistas y descargas |
| GET | `/trabajos/:id/comentarios` | Público/opcional | Comentarios |
| GET | `/trabajos/:id/versiones` | Público/opcional | Historial de versiones |
| POST | `/trabajos` | Admin, repositor, bibliotecario | Crea con PDF opcional |
| PUT | `/trabajos/:id` | Admin, repositor, bibliotecario | Actualiza con control de propiedad |
| DELETE | `/trabajos/:id` | Admin, repositor | Elimina con control de propiedad |
| PATCH | `/trabajos/:id/estado` | Autenticado | Cambia estado según rol |
| POST | `/trabajos/:id/comentarios` | Autenticado | Crea comentario |
| PUT/DELETE | `/trabajos/:id/comentarios/:comentarioId` | Autor del comentario | Edita/elimina |
| POST | `/trabajos/:id/versiones/:versionId/restaurar` | Admin, repositor | Restaura versión |

### 7.4 Revisión y notificaciones

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/revisiones/pendientes` | Admin, bibliotecario | Cola por estado |
| GET | `/revisiones/:id` | Autenticado | Historial del trabajo |
| PATCH | `/revisiones/:id/estado` | Autenticado | Cambia estado según rol |
| GET | `/notificaciones` | Autenticado | Lista |
| GET | `/notificaciones/stream` | Autenticado | Stream SSE |
| GET | `/notificaciones/contar` | Autenticado | No leídas |
| PATCH | `/notificaciones/:id/leer` | Autenticado | Marca una |
| POST | `/notificaciones/leer-todas` | Autenticado | Marca todas |

### 7.5 Administración e interoperabilidad

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/admin/stats` | Admin | Estadísticas globales |
| GET | `/oai?verb=...` | Público | OAI-PMH: `Identify`, `ListMetadataFormats`, `ListSets`, `GetRecord`, `ListIdentifiers`, `ListRecords` |
| GET | `/feed/rss` | Público | RSS 2.0 |
| GET | `/feed/atom` | Público | Atom |
| GET | `/health` | Público | Estado del servicio |

## 8. Flujo de revisión

| Rol | Desde | Hacia |
|---|---|---|
| `repositor` | `borrador` | `en_revision` |
| `bibliotecario` | `borrador` | `en_revision` |
| `bibliotecario` | `en_revision` | `publicado`, `borrador` |
| `admin` | `borrador` | `publicado`, `en_revision`, `archivado` |
| `admin` | `en_revision` | `publicado`, `borrador`, `archivado` |
| `admin` | `publicado` | `archivado` |
| `admin` | `archivado` | `publicado`, `borrador` |

Cada transición crea un registro en `revisiones` y notificaciones in-app. El estado se persiste antes del registro y la notificación; si estos fallan, el cambio no se revierte. El identificador público se genera al publicar.

## 9. Almacenamiento y validación de PDFs

- Límite: **10 MB**.
- MIME requerido: `application/pdf`.
- Cabecera verificada en el controlador: `%PDF-`.
- `CLOUDINARY_MODE=cloudinary`: sube a Cloudinary y guarda `archivo_url`.
- `CLOUDINARY_MODE=local`: guarda en `LOCAL_UPLOAD_DIR` y sirve en `/local-files`.

## 10. Seguridad

Implementado:

- Helmet con CSP, `frameAncestors: none` y `objectSrc: none`.
- CORS restringido a `FRONTEND_URL` con credenciales.
- Rate limiting global y específico para autenticación.
- Límites de cuerpo JSON/urlencoded y timeouts de servidor.
- JWT con expiración de 2 horas, cookie `httpOnly` y `sameSite: strict`.
- Revalidación de usuario, rol y estado `activo` en cada solicitud.
- bcrypt para contraseñas.
- Control de propiedad en edición, borrado, cambio de estado y restauración.
- Protección de PII de estudiantes y tutores.
- Búsqueda con `sequelize.escape` y `plainto_tsquery`.
- Validación de PDF por cabecera, no solo MIME.
- Paginación con límite superior.
- OAI-PMH filtra borradores.

Pendiente:

- 13 vulnerabilidades de dependencias.
- Rate limiting en memoria (no distribuido).
- Sin auditoría de accesos por usuario.
- Sin CI.

## 11. Pruebas

```bash
cd backend
npm test -- --runInBand
```

Resultado esperado: **156/156** en 14 suites.

```bash
npm run test:security
```

Requiere PostgreSQL, datos sembrados y servidor en `http://localhost:5001`. Resultado registrado: **25/25**.

Pruebas de carga:

```bash
npm run test:load:k6
npm run test:load:artillery
npm run test:load:autocannon
```

Requieren las herramientas externas y un entorno aislado. Ver [`../tests/load/`](../tests/load/) y [`../docs/EVIDENCIAS.md`](../docs/EVIDENCIAS.md).

## 12. Limitaciones conocidas

- El correo solo se usa para recuperación de contraseña; no hay correo en cambios de revisión.
- No hay bitácora de accesos por usuario.
- `backend/AGENT.md` está incompleto (solo Fase 1.3).
- El rate limiting no es distribuido.
- Las dependencias tienen vulnerabilidades conocidas.
- No hay CI/CD ni etiquetas de versión.

## 13. Documentación relacionada

- [`../README.md`](../README.md) — entrada principal
- [`../docs/PROYECTO.md`](../docs/PROYECTO.md) — alcance y objetivos
- [`../docs/ESTADO.md`](../docs/ESTADO.md) — estado real
- [`../docs/TRAZABILIDAD.md`](../docs/TRAZABILIDAD.md) — requisitos y evidencias
- [`../docs/EVIDENCIAS.md`](../docs/EVIDENCIAS.md) — comandos y resultados
- [`../docs/DEMO.md`](../docs/DEMO.md) — guion de demostración
- [`../docs/informe-pruebas-carga-seguridad.md`](../docs/informe-pruebas-carga-seguridad.md) — informe de carga y seguridad
