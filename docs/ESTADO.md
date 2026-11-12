# Estado del proyecto

**Snapshot:** commit `2f8b0a9` · 11 de noviembre de 2026 · rama `main`
**Árbol de trabajo:** limpio. Los tres cambios de frontend se confirmaron en `2f8b0a9`; la documentación se confirma en el commit de cierre. Los resultados de este documento se obtuvieron sobre ese mismo código.
**Alcance:** estado verificado del repositorio, no del despliegue en producción.

> Este documento responde una sola pregunta: **¿qué funciona hoy y cómo se comprueba?** Si una función no tiene evidencia, no se marca como cumplida.

---

## 1. Cómo leer los estados

| Símbolo | Significado |
|---|---|
| ✅ | Implementado y verificado con al menos una prueba, comando o artefacto |
| 🟡 | Funciona parcialmente o con una brecha conocida |
| 🔴 | Pendiente; no está implementado |
| ⚪ | Fuera de alcance de la entrega actual |
| ➕ | Añadido no previsto en la especificación original |

## 2. Verificación ejecutada

| Verificación | Resultado | Comando | Fecha |
|---|---|---|---|
| Pruebas backend | **156/156** en 14 suites | `cd backend && npm test -- --runInBand` | 2026-11-11 |
| Pruebas frontend | **15/15** en 4 archivos | `cd frontend && npm test` | 2026-11-11 |
| TypeScript | Sin errores | `cd frontend && npx tsc --noEmit` | 2026-11-11 |
| Build | Correcto; aviso de chunk > 500 kB | `cd frontend && npm run build` | 2026-11-11 |
| Lint | 0 errores, 19 advertencias | `cd frontend && npm run lint` | 2026-11-11 |
| Seguridad | **25/25** comprobaciones | `cd backend && npm run test:security` | 2026-11-11T03:15:32Z |
| Carga k6 | 4.295 peticiones, 119,36 req/s, p95 83,79 ms, 0 fallos | `npm run test:load:k6` | 2026-11-10 |
| Carga Artillery | 2.492 peticiones, 0 fallidos, p95 92,8 ms | `npm run test:load:artillery` | 2026-11-10 |
| Carga autocannon (búsqueda) | 96 req/s, p50 192 ms, p99 354 ms | `npm run test:load:autocannon` | 2026-11-10 |
| Dependencias | 13 vulnerabilidades backend, 8 frontend | `npm audit` | 2026-11-10 |

**Nota sobre las pruebas backend:** se ejecutaron sin un PostgreSQL local activo en el puerto `55432`. La suite de API usa la configuración de test y mocks; la prueba de humo de seguridad sí requiere PostgreSQL, datos sembrados y servidor en ejecución. No se repitió la prueba de humo en esta sesión; se cita el artefacto `.local/security-smoke.json`.

## 3. Tablero por módulo

| Módulo | Estado | Qué funciona | Evidencia principal |
|---|---|---|---|
| Autenticación y usuarios | ✅ | Registro, login, logout, perfil, recuperación de contraseña, JWT en cookie `httpOnly`, roles y estado activo | `backend/src/services/auth.service.js`, `backend/src/controllers/auth.controller.js`, `frontend/src/stores/useAuthStore.ts`, `backend/src/services/auth.service.test.js` |
| Catálogo y búsqueda | ✅ | Catálogo público, búsqueda full-text, filtros, paginación y detalle | `backend/src/services/trabajo.service.js`, `frontend/src/pages/Search.tsx`, `frontend/src/pages/Catalog.tsx`, `backend/src/routes/api.test.js` |
| Carga y edición de trabajos | ✅ | Metadatos, palabras clave, PDF de hasta 10 MB, edición y borrado con control de propiedad | `frontend/src/pages/Submission.tsx`, `backend/src/controllers/trabajo.controller.js`, `backend/src/middlewares/upload.middleware.js`, `frontend/src/utils/pdfValidation.test.ts` |
| Flujo de revisión | ✅ | `borrador` → `en_revision` → `publicado` / `borrador`; archivado; comentario de revisión; historial | `backend/src/services/revision.service.js`, `frontend/src/pages/Revisiones.tsx`, `backend/src/services/revision.service.test.js` |
| Notificaciones | 🟡 | In-app y SSE para cambios de estado y comentarios; no hay correo en cambios de revisión | `backend/src/services/notificacion.service.js`, `backend/src/services/sse.service.js`, `frontend/src/components/NotificationBell.tsx` |
| Comentarios | ✅ | Crear, listar, editar y eliminar; calificación | `backend/src/services/comentario.service.js`, `frontend/src/components/ComentariosSection.tsx`, `backend/src/services/comentario.service.test.js` |
| Versiones | ✅ | Historial y restauración por admin/repositor | `backend/src/services/version.service.js`, `frontend/src/components/HistorialVersiones.tsx` |
| Citas | ✅ | APA, BibTeX y RIS | `backend/src/services/cita.service.js`, `frontend/src/pages/TrabajoDetalle.tsx` |
| Estadísticas | ✅ | Vistas, descargas, producción por categoría, usuarios y top de trabajos | `backend/src/services/estadistica.service.js`, `backend/src/services/admin.service.js`, `frontend/src/pages/Admin.tsx`, `backend/src/services/estadistica.service.test.js` |
| Administración | ✅ | Usuarios, carreras, tutores, estudiantes, categorías y panel de control | `backend/src/routes/usuario.routes.js`, `backend/src/routes/carrera.routes.js`, `backend/src/routes/tutor.routes.js`, `backend/src/routes/estudiante.routes.js`, `frontend/src/pages/Admin.tsx` |
| Documentos normativos | 🟡 | Tipo `normativas`, catálogo y conteo de normativas publicadas; sin control de vigencia/derogación | `frontend/src/types.ts`, `backend/src/validators/metadatos.schema.js`, `backend/src/services/admin.service.js` |
| Editorial y divulgación | 🟡 | Tipos `editorial` y `divulgacion` dentro del flujo general; sin flujo editorial dedicado | `frontend/src/types.ts`, `frontend/src/pages/Submission.tsx` |
| Interoperabilidad | ✅ | OAI-PMH 2.0, RSS 2.0 y Atom | `backend/src/routes/oai.routes.js`, `backend/src/services/oai.service.js`, `backend/src/routes/feed.routes.js`, `backend/src/services/rss.service.js` |
| Seguridad | ✅ | IDOR, PII, inyección SQL, revalidación JWT, rate limiting, validación de PDF y paginación | `.local/security-smoke.json`, `docs/informe-pruebas-carga-seguridad.md` |
| Calidad y automatización | 🟡 | Suites, tipos y build funcionan; no hay CI ni etiquetas | `backend/package.json`, `frontend/package.json`, `git log` |

## 4. Detalle de lo verificado

### 4.1 Autenticación y control de acceso

- Login por correo, usuario o prefijo de correo; contraseña con bcrypt.
- JWT firmado con expiración de 2 horas y almacenado en cookie `httpOnly`, `sameSite: strict`; en producción, `secure`.
- El middleware de autenticación revalida el usuario contra la base de datos en cada solicitud y rechaza usuarios inexistentes o inactivos.
- Roles: `admin`, `repositor`, `bibliotecario`.
- El registro público crea usuarios con rol `repositor` por defecto.
- El panel de administración permite crear usuarios y asignar rol.
- Recuperación de contraseña por token con expiración y enlace por correo. En desarrollo, si el correo no se puede enviar, la respuesta incluye un enlace de restablecimiento.

**Evidencia:** `backend/src/services/auth.service.js`, `backend/src/controllers/auth.controller.js`, `backend/src/middlewares/auth.middleware.js`, `backend/src/middlewares/role.middleware.js`, `backend/src/services/auth.service.test.js`, `backend/src/middlewares/role.middleware.test.js`, `frontend/src/components/ProtectedRoute.tsx`.

### 4.2 Catálogo, búsqueda y detalle

- `GET /api/v1/trabajos` lista con paginación y filtros por estado y autor.
- `GET /api/v1/trabajos/buscar` busca por título, autor, tutor, palabras clave y texto completo; filtra por categoría, tipo de documento y año.
- La búsqueda usa `search_vector` y `plainto_tsquery`, con `sequelize.escape` para el término.
- `GET /api/v1/trabajos/:id` devuelve el detalle; los borradores solo son visibles para su autor, admin o bibliotecario.
- El catálogo público solo muestra trabajos publicados.
- El frontend tiene páginas de inicio, búsqueda, catálogo por tipo y detalle.

**Evidencia:** `backend/src/services/trabajo.service.js`, `backend/src/controllers/trabajo.controller.js`, `backend/src/routes/api.test.js`, `frontend/src/pages/Home.tsx`, `frontend/src/pages/Search.tsx`, `frontend/src/pages/Catalog.tsx`, `frontend/src/pages/TrabajoDetalle.tsx`.

### 4.3 Carga y edición de trabajos

- Formulario de dos pasos en `Submission.tsx`.
- Metadatos: título, autor, tutor, año, tipo de documento, carrera, categoría, resumen, palabras clave.
- Validación de PDF en frontend (tipo y tamaño) y backend (MIME, tamaño y cabecera `%PDF-`).
- Límite de 10 MB aplicado tanto en frontend como en backend.
- Almacenamiento en Cloudinary o en `.local/uploads` según `CLOUDINARY_MODE`.
- Edición con control de propiedad: admin, bibliotecario o dueño del trabajo.
- Eliminación: admin o repositor dueño; la ruta excluye explícitamente al rol `bibliotecario`.

**Evidencia:** `frontend/src/pages/Submission.tsx`, `frontend/src/utils/pdfValidation.ts`, `frontend/src/utils/pdfValidation.test.ts`, `backend/src/controllers/trabajo.controller.js`, `backend/src/middlewares/upload.middleware.js`, `backend/src/middlewares/upload.middleware.test.js`, `backend/src/services/trabajo.service.js`, `backend/src/services/trabajo.service.test.js`.

### 4.4 Revisión y publicación

Transiciones permitidas:

| Rol | Desde | Hacia |
|---|---|---|
| `repositor` | `borrador` | `en_revision` |
| `bibliotecario` | `borrador` | `en_revision` |
| `bibliotecario` | `en_revision` | `publicado`, `borrador` |
| `admin` | `borrador` | `publicado`, `en_revision`, `archivado` |
| `admin` | `en_revision` | `publicado`, `borrador`, `archivado` |
| `admin` | `publicado` | `archivado` |
| `admin` | `archivado` | `publicado`, `borrador` |

- Cada cambio genera un registro en `revisiones` con estado anterior, estado nuevo, revisor y comentario.
- El estado se persiste antes de crear el registro y las notificaciones; si estas fallan, el cambio no se revierte y el error se registra en consola.
- El cambio de estado genera notificaciones para el autor y los revisores correspondientes.
- El identificador público del trabajo se genera al publicar.

**Evidencia:** `backend/src/services/revision.service.js`, `backend/src/models/Revision.js`, `backend/src/models/Trabajo.js`, `backend/src/services/revision.service.test.js`, `frontend/src/pages/Revisiones.tsx`.

### 4.5 Notificaciones, comentarios, versiones y citas

- Notificaciones persistentes en `notificaciones`, contador de no leídas, marcado como leída y stream SSE.
- Comentarios con calificación; edición y eliminación solo por su autor.
- Versiones: se crea una versión antes de actualizar un trabajo; se puede listar y restaurar. Si la actualización falla después de crear la versión, esta puede quedar registrada sin que el trabajo cambie.
- Citas: `GET /api/v1/trabajos/:id/cita?formato=apa|bibtex|ris`.

**Evidencia:** `backend/src/models/Notificacion.js`, `backend/src/models/Comentario.js`, `backend/src/models/Version.js`, `backend/src/services/notificacion.service.js`, `backend/src/services/comentario.service.js`, `backend/src/services/version.service.js`, `backend/src/services/cita.service.js`, `frontend/src/components/NotificationBell.tsx`, `frontend/src/components/ComentariosSection.tsx`, `frontend/src/components/HistorialVersiones.tsx`.

### 4.6 Estadísticas y administración

- `GET /api/v1/admin/stats` devuelve totales por estado, usuarios activos, categorías, conteo de normativas publicadas (etiquetado como “vigentes” en el panel), producción por categoría, trabajos por mes, visitas y top de trabajos.
- Vistas y descargas se registran en `visitas`.
- El panel administrativo muestra gráficos y permite exportar reportes en CSV.
- Administración de usuarios, carreras, tutores, estudiantes y categorías.

**Evidencia:** `backend/src/services/admin.service.js`, `backend/src/services/estadistica.service.js`, `backend/src/models/Visita.js`, `frontend/src/pages/Admin.tsx`, `backend/src/services/estadistica.service.test.js`.

### 4.7 Interoperabilidad

- `GET /oai?verb=...` implementa `Identify`, `ListMetadataFormats`, `ListSets`, `GetRecord`, `ListIdentifiers` y `ListRecords`.
- `GET /feed/rss` y `GET /feed/atom` generan feeds de trabajos publicados.
- OAI no revela la existencia de borradores.

**Evidencia:** `backend/src/routes/oai.routes.js`, `backend/src/services/oai.service.js`, `backend/src/routes/feed.routes.js`, `backend/src/services/rss.service.js`, `.local/security-smoke.json` (comprobación “OAI no revela la existencia de borradores”).

### 4.8 Seguridad

Hallazgos corregidos y verificados:

1. IDOR en edición, borrado y cambio de estado.
2. Borradores y subrecursos visibles sin autenticación.
3. PII de estudiantes y tutores expuesta.
4. Inyección SQL en la búsqueda.
5. JWT sin revalidación de usuario, rol y estado activo.
6. Ausencia de rate limiting, límites de cuerpo y timeouts.
7. Validación de PDF basada solo en MIME.
8. Paginación sin límite superior.
9. OAI-PMH revelaba borradores.

**Evidencia:** `docs/informe-pruebas-carga-seguridad.md`, `.local/security-smoke.json` (25/25), `backend/src/middlewares/error.middleware.js`, `backend/src/middlewares/auth.middleware.js`, `backend/src/middlewares/role.middleware.js`, `backend/src/services/trabajo.service.js`.

## 5. Brechas y deuda técnica

| ID | Brecha | Estado | Impacto | Evidencia |
|---|---|---|---|---|
| G-01 | Los roles “Docente” y “Estudiante” del `frontend/AGENT.md` no existen como roles de acceso | 🔴 | Alto: discrepancia con la especificación | `backend/src/models/Usuario.js`, `frontend/src/types.ts` |
| G-02 | No hay correo en los cambios de revisión; solo notificaciones in-app/SSE | 🔴 | Alto para expectativas del usuario | `backend/src/services/notificacion.service.js`, `backend/src/services/email.service.js` |
| G-03 | 13 vulnerabilidades backend y 8 frontend | 🔴 | Alto en producción | `.local/audit-backend.json`, `.local/audit-frontend.json`, informe §7.1 |
| G-04 | Sin CI/CD, sin `.github/`, sin etiquetas | 🔴 | Medio | `git tag`, inventario del repositorio |
| G-05 | Bundle único de ~1,35 MB; sin lazy loading de rutas ni del visor PDF | 🟡 | Bajo/medio: rendimiento de carga | Salida de `npm run build`, `frontend/src/pages/TrabajoDetalle.tsx` |
| G-06 | 9 usos de `any` en 8 archivos del frontend | 🟡 | Bajo: deuda de tipado | `Admin.tsx`, `ForgotPassword.tsx`, `Login.tsx`, `Profile.tsx`, `Register.tsx`, `ResetPassword.tsx`, `Search.tsx`, `Submission.tsx` |
| G-07 | Sin auditoría de accesos por usuario (login, cambios de rol) | 🔴 | Medio | `backend/src/app.js` (morgan), `backend/src/models/Visita.js` |
| G-08 | Módulos normativo y editorial sin ciclo de vida dedicado | 🟡 | Medio | `frontend/src/types.ts`, `frontend/src/pages/Submission.tsx` |
| G-09 | Rate limiting en memoria, no distribuido | 🟡 | Medio en múltiples instancias | `backend/src/app.js` |
| G-10 | `backend/AGENT.md` incompleto (solo Fase 1.3) | 🟡 | Medio: línea base reconstruida | `backend/AGENT.md` |
| G-11 | Metadatos académicos sin confirmar | 🔴 | Alto para la entrega | `docs/PROYECTO.md` |
| G-13 | URL de demo no verificada | 🟡 | Medio para la evaluación práctica | `frontend/vercel.json` |
| G-14 | Sin `LICENSE`, términos ni política de privacidad | 🔴 | Bajo/medio | Inventario del repositorio |
| G-15 | `carrera_id`, `tutor_id` y `estudiante_id` existen en migraciones y asociaciones, pero no como atributos del modelo `Trabajo` ni en la API de creación/edición | 🟡 | Medio: las relaciones académicas se leen, pero no se asignan desde la interfaz | `backend/src/models/Trabajo.js`, `backend/database/migrations/2026062803-create-entidades-academicas.js`, `backend/src/services/trabajo.service.js` |
| G-16 | La versión se crea antes de aplicar la actualización; si esta falla, puede quedar una versión sin cambio efectivo | 🟡 | Bajo: ruido en el historial | `backend/src/controllers/trabajo.controller.js`, `backend/src/services/version.service.js` |

### 5.1 Brechas resueltas

| ID | Brecha | Resolución | Evidencia |
|---|---|---|---|
| G-12 | Tres archivos frontend sin confirmar | Confirmados el 2026-11-11 | Commit `2f8b0a9` |

## 6. Backlog priorizado

### P0 — antes de entregar o demostrar

1. Verificar que `git status` quede limpio tras el commit de documentación.
2. Completar autores, asignatura, profesor y fecha de entrega en `docs/PROYECTO.md`.
3. Verificar la URL de demo o preparar la demo local con datos sembrados.
4. Repetir la prueba de humo de seguridad sobre el commit final.
5. Confirmar que el `README.md` y `docs/DEMO.md` funcionan en una máquina limpia.

### P1 — siguiente iteración

1. Actualizar dependencias vulnerables por lotes, con las suites como red de seguridad.
2. Añadir CI con tests, `tsc`, build y lint.
3. Implementar correo en cambios de revisión, si se confirma en el alcance.
4. Decidir si se implementan los roles “Docente” y “Estudiante” o se corrige la especificación.
5. Añadir auditoría de login y cambios de rol.
6. Declarar `carrera_id`, `tutor_id` y `estudiante_id` en el modelo `Trabajo` y permitir asignarlos desde la API y el formulario (G-15).

### P2 — mejora continua

1. Code splitting del bundle.
2. Eliminar los `any` restantes.
3. Módulos normativo y editorial con ciclo de vida propio.
4. Rate limiting distribuido.
5. Licencia, términos y política de privacidad.
6. Crear la versión después de validar la actualización, o dentro de una transacción (G-16).

## 7. Cómo actualizar este documento

1. Registrar el nuevo commit y la fecha.
2. Repetir los comandos de la sección 2.
3. Cambiar un estado solo si existe evidencia nueva.
4. Actualizar `docs/EVIDENCIAS.md` con el comando y el resultado.
5. Actualizar `docs/TRAZABILIDAD.md` si cambió un requisito o su implementación.
6. No borrar brechas: si se resuelven, moverlas a “resueltas” con fecha y evidencia.
