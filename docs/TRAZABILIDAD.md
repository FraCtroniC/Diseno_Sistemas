# Trazabilidad de requisitos

Este documento responde: **¿cada requisito tiene implementación, evidencia y estado?** También registra lo que se añadió sin estar en la especificación original, para que no aparezca como “funcionalidad suelta”.

**Snapshot:** commit `2f8b0a9` · 11 de noviembre de 2026.
**Árbol de trabajo:** limpio. Los cambios de frontend se confirmaron en `2f8b0a9`; la documentación se confirma en el commit de cierre.

---

## 1. Método

### 1.1 Fuentes de la línea base

| Prioridad | Fuente | Uso |
|---|---|---|
| 1 | `frontend/AGENT.md` | Requisitos funcionales, stack, convenciones y prioridades |
| 2 | `backend/AGENT.md` | Reglas de desarrollo y configuración base |
| 3 | `docs/informe-pruebas-carga-seguridad.md` | Controles de seguridad, pruebas de carga y riesgos |
| 4 | `README.md` original | Funcionalidad declarada y stack |
| 5 | Código, rutas, modelos y pruebas | Verificación de lo realmente implementado |

### 1.2 Limitaciones de la línea base

1. **`backend/AGENT.md` está incompleto:** solo llega a la Fase 1.3. No especifica módulos, endpoints ni criterios de aceptación posteriores. Los requisitos backend se limitan a las reglas y a la configuración base que sí están escritas.
2. **No hay rúbrica formal del curso:** los criterios de éxito son los de [`PROYECTO.md`](PROYECTO.md), no una rúbrica externa.
3. **El `README.md` original está desactualizado:** afirma que el proyecto usa mocks y que el backend está pendiente. Se usa solo como fuente de funcionalidad declarada, no como estado.
4. **Algunas funciones añadidas no tienen prueba dedicada:** OAI-PMH, RSS/Atom, citas y versiones se verifican por código y, cuando aplica, por la prueba de humo. Se indica en cada fila.
5. **Los resultados de pruebas reflejan el código confirmado en `2f8b0a9`.**

### 1.3 Leyenda

| Símbolo | Significado |
|---|---|
| ✅ Cumplido | Implementado y verificado con evidencia |
| 🟡 Parcial | Implementado con brechas o cobertura incompleta |
| 🔴 Pendiente | No implementado |
| ⚪ Fuera de alcance | Excluido explícitamente de la entrega |
| ➕ Añadido | Implementado sin estar en la especificación original |

---

## 2. Requisitos funcionales

Fuente principal: `frontend/AGENT.md` y `README.md` original.

| ID | Requisito y fuente | Implementación | Evidencia | Estado | Observaciones |
|---|---|---|---|---|---|
| RF-01 | Control de perfiles: Administrador, Docente, Estudiante (`frontend/AGENT.md` §3.A) | Roles `admin`, `repositor`, `bibliotecario`; JWT en cookie; `ProtectedRoute` | `backend/src/models/Usuario.js`, `backend/src/middlewares/role.middleware.js`, `frontend/src/components/ProtectedRoute.tsx`, `frontend/src/types.ts`, `backend/src/middlewares/role.middleware.test.js` | 🟡 Parcial | Docente y Estudiante son entidades de datos, no roles de login. Brecha G-01 |
| RF-02 | Registro de accesos y logs de actividad (`frontend/AGENT.md` §3.A) | Morgan registra solicitudes HTTP; `Visita` registra vistas/descargas | `backend/src/app.js`, `backend/src/models/Visita.js`, `backend/src/services/estadistica.service.js` | 🟡 Parcial | No hay bitácora por usuario de login, cambios de rol o cambios de estado. Brecha G-07 |
| RF-03 | Categorización: Pregrado, Postgrado, Maestría, Tesis Doctorales y Trabajos de Ascenso (`frontend/AGENT.md` §3.B) | Tipos `pregrado`, `postgrado`, `tesis`, `tfg`, `articulo`, `monografia`, `pasantia`, `trabajo`, `normativas`, `institucional`, `editorial`, `divulgacion` | `frontend/src/types.ts`, `backend/src/validators/metadatos.schema.js` | 🟡 Parcial | El frontend ofrece 6 tipos; el backend acepta además `tesis`, `tfg`, `articulo`, `monografia`, `pasantia` y `trabajo`. No hay tipos separados para maestría, tesis doctoral ni trabajo de ascenso |
| RF-04 | Registro de metadatos, carga de archivos digitales y visualización por jerarquía (`frontend/AGENT.md` §3.B) | Formulario de dos pasos, `POST /api/v1/trabajos`, PDF, catálogo y detalle | `frontend/src/pages/Submission.tsx`, `backend/src/controllers/trabajo.controller.js`, `backend/src/services/trabajo.service.js`, `backend/src/services/trabajo.service.test.js`, `frontend/src/pages/Catalog.tsx` | ✅ Cumplido | La “jerarquía” se resuelve por tipo de documento y categoría, no por árbol jerárquico |
| RF-05 | Gestión de Reglamentos y Resoluciones (`frontend/AGENT.md` §3.C) | Tipo `normativas` dentro del flujo general; conteo de normativas publicadas | `frontend/src/types.ts`, `backend/src/validators/metadatos.schema.js`, `backend/src/services/admin.service.js` | 🟡 Parcial | Sin módulo dedicado de vigencia, derogación o versionado normativo. Brecha G-08 |
| RF-06 | Consultas de manuales de normas y procedimientos (`frontend/AGENT.md` §3.C) | Búsqueda y catálogo con filtro por tipo `normativas` | `frontend/src/pages/Search.tsx`, `frontend/src/pages/Catalog.tsx`, `backend/src/services/trabajo.service.js` | 🟡 Parcial | No hay colección separada de manuales ni visor específico. Brecha G-08 |
| RF-07 | Generación y visualización de Boletines Estadísticos de producción académica (`frontend/AGENT.md` §3.C) | Panel con gráficos, totales y exportación CSV | `frontend/src/pages/Admin.tsx`, `backend/src/services/admin.service.js`, `backend/src/services/estadistica.service.js`, `backend/src/services/estadistica.service.test.js` | 🟡 Parcial | Hay visualización y exportación CSV, pero no generación programada de boletines. Brecha G-08 |
| RF-08 | Publicación de Libros Digitales, Memorias y Recursos Educativos (`frontend/AGENT.md` §3.D) | Tipos `editorial` y `divulgacion` dentro del flujo general | `frontend/src/types.ts`, `frontend/src/pages/Submission.tsx`, `backend/src/validators/metadatos.schema.js` | 🟡 Parcial | Sin flujo editorial dedicado ni ISBN/ISSN obligatorio. Brecha G-08 |
| RF-09 | Gestión de estados de publicación: Borrador, Validado, Publicado (`frontend/AGENT.md` §3.D) | Estados `borrador`, `en_revision`, `publicado`, `archivado`; transiciones por rol | `backend/src/models/Trabajo.js`, `backend/src/services/revision.service.js`, `backend/src/services/revision.service.test.js`, `frontend/src/pages/Revisiones.tsx` | ✅ Cumplido | “Validado” se representa con el paso por `en_revision` antes de `publicado` |
| RF-10 | Búsqueda de documentos con filtros por término y año (`README.md` original; prioridad 1 en `frontend/AGENT.md`) | `GET /api/v1/trabajos/buscar`; filtros por texto, año, categoría y tipo | `backend/src/services/trabajo.service.js`, `backend/src/routes/trabajo.routes.js`, `frontend/src/pages/Search.tsx`, `backend/src/routes/api.test.js` | ✅ Cumplido | Búsqueda full-text con `search_vector` |
| RF-11 | Flujo de envío de documentos en dos pasos (`README.md` original) | Formulario por etapas en `Submission.tsx` | `frontend/src/pages/Submission.tsx` | ✅ Cumplido | Validación por etapa y foco en el primer error |
| RF-12 | Autenticación JWT y roles de acceso (`frontend/AGENT.md` §5) | JWT firmado, cookie `httpOnly`, expiración 2 h, revalidación en BD | `backend/src/services/auth.service.js`, `backend/src/controllers/auth.controller.js`, `backend/src/middlewares/auth.middleware.js`, `backend/src/services/auth.service.test.js` | ✅ Cumplido | Cookie `sameSite: strict`; `secure` en producción |
| RF-13 | Lazy loading de documentos y optimización de consultas (`frontend/AGENT.md` §5) | Índices y `search_vector`; visor PDF; build único | `backend/database/migrations/2026111001-add-performance-indexes.js`, `backend/database/migrations/2026111002-add-search-vector.js`, `frontend/src/components/ui/PDFViewer.tsx`, salida de `npm run build` | 🟡 Parcial | No hay lazy loading de rutas ni del visor: `PDFViewer` se importa estáticamente. El build genera un chunk de ~1,35 MB. Brecha G-05 |
| RF-14 | Interfaz intuitiva con filtros avanzados y visualización clara de jerarquías (`frontend/AGENT.md` §5) | Filtros por texto, año, categoría y tipo; catálogo por categoría | `frontend/src/pages/Search.tsx`, `frontend/src/pages/Catalog.tsx`, `frontend/src/components/Layout.tsx` | 🟡 Parcial | No hay árbol jerárquico explícito; la navegación es por tipo/categoría |
| RF-15 | Estructura modular para facilitar futuras expansiones (`frontend/AGENT.md` §5) | Separación por capas: pages, components, services, stores, utils | `frontend/src/`, `backend/src/` | 🟡 Parcial | La estructura real es por capas, no feature-based. Brecha menor |
| RF-16 | Comprobar tipos de archivo y peso máximo antes de la subida (`frontend/AGENT.md` §6) | Validación en frontend (tipo/tamaño) y backend (MIME, tamaño, cabecera `%PDF-`) | `frontend/src/utils/pdfValidation.ts`, `frontend/src/utils/pdfValidation.test.ts`, `backend/src/middlewares/upload.middleware.js`, `backend/src/middlewares/upload.middleware.test.js`, `backend/src/controllers/trabajo.controller.js` | ✅ Cumplido | Mismo límite de 10 MB en ambos lados |
| RF-17 | TypeScript: prohibido el uso de `any` (`frontend/AGENT.md` §6) | Tipado estricto en la mayor parte del frontend | `frontend/tsconfig.json`, búsqueda de `any` en `frontend/src` | 🟡 Parcial | 9 usos de `any` en 8 archivos. Brecha G-06 |
| RF-18 | Usar exclusivamente Tailwind CSS y paleta institucional azul/amarillo/blanco (`frontend/AGENT.md` §6) | Tailwind con colores `unefa` y modo oscuro | `frontend/tailwind.config.cjs`, `frontend/src/styles/index.css` | ✅ Cumplido | Paleta `#0b57a4`, `#073a6a`, `#ffd200` |
| RF-19 | Estructura de carpetas feature-based (`frontend/AGENT.md` §4) | Estructura por capas: `pages`, `components`, `services`, `stores`, `utils` | `frontend/src/` | 🟡 Parcial | No se siguió la estructura `features/` propuesta; funcionalmente equivalente |

---

## 3. Requisitos técnicos del backend

Fuente: `backend/AGENT.md` (reglas y Fase 1).

| ID | Requisito y fuente | Implementación | Evidencia | Estado | Observaciones |
|---|---|---|---|---|---|
| RB-01 | Express 5 nativo async, sin wrappers redundantes (`backend/AGENT.md` Reglas 1) | Express 5; controladores y servicios con `async/await` | `backend/package.json`, `backend/src/app.js`, `backend/src/routes/*.js` | ✅ Cumplido | Los errores llegan al middleware global |
| RB-02 | Prohibidas las consultas SQL crudas en strings; todo vía modelos y transacciones Sequelize (`backend/AGENT.md` Reglas 2) | Modelos Sequelize; búsqueda full-text con `literal` y `sequelize.escape` | `backend/src/models/`, `backend/src/services/trabajo.service.js` | 🟡 Parcial | Se usa `literal` para `search_vector` y `ts_headline`; el término se escapa, pero es SQL embebido |
| RB-03 | `express-validator` en la capa router (`backend/AGENT.md` Reglas 3) | Reglas en `validators/` y middleware `validate` | `backend/src/validators/`, `backend/src/middlewares/validation.middleware.js`, `backend/src/routes/*.js` | ✅ Cumplido | Login, registro, trabajos, usuarios, categorías y entidades |
| RB-04 | Joi para validación profunda de metadatos JSONB (`backend/AGENT.md` Reglas 3) | Esquema Joi con campos y límites | `backend/src/validators/metadatos.schema.js` | ✅ Cumplido | `unknown(false)` rechaza campos no declarados |
| RB-05 | Respuestas de error unificadas mediante middleware global (`backend/AGENT.md` Reglas 4) | `error.middleware.js` con `success:false`, `error`, `details` | `backend/src/middlewares/error.middleware.js`, `backend/src/middlewares/error.middleware.test.js` | ✅ Cumplido | Mapea Multer y límites de archivo |
| RB-06 | Estructura de carpetas `config/`, `src/controllers`, `middlewares`, `models`, `routes`, `services`, `validators`, `database/` (`backend/AGENT.md` §1.2) | Estructura creada y en uso | `backend/config/`, `backend/src/`, `backend/database/` | ✅ Cumplido | Incluye `scripts/` para pruebas |
| RB-07 | `config/database.js` con Sequelize/PostgreSQL y variables de entorno (`backend/AGENT.md` §1.3) | Configuración por `DATABASE_URL`, `DB_SSL`, pool y logging | `backend/config/database.js`, `backend/config/environment.js` | ✅ Cumplido | Pool distinto por entorno |
| RB-08 | Migraciones y seeders en `database/` (`backend/AGENT.md` §1.2) | 18 migraciones y 3 seeders | `backend/database/migrations/`, `backend/database/seeders/` | ✅ Cumplido | Incluye entidades académicas, workflow, notificaciones, comentarios, versiones e índices |

**Limitación:** `backend/AGENT.md` no especifica fases posteriores a la 1.3. No se inventan requisitos de módulos, endpoints o criterios de aceptación que el documento no contiene.

---

## 4. Requisitos no funcionales y controles de seguridad

Fuente: `docs/informe-pruebas-carga-seguridad.md`.

| ID | Requisito y fuente | Implementación | Evidencia | Estado | Observaciones |
|---|---|---|---|---|---|
| RNF-01 | IDOR: un repositor no puede editar, borrar ni cambiar el estado de trabajos ajenos (informe §3.1 #1) | `puedeGestionarTrabajo()` y validación de propiedad en revisión/versión | `backend/src/services/trabajo.service.js`, `backend/src/services/revision.service.js`, `backend/src/services/version.service.js`, `.local/security-smoke.json` | ✅ Cumplido | Comprobación “Edición/Borrado/Cambio de estado de trabajo ajeno bloqueado” |
| RNF-02 | Borradores y subrecursos no visibles sin autenticación (informe §3.1 #2) | Visibilidad por estado y rol en detalle, comentarios, versiones, cita, estadísticas y archivo | `backend/src/services/trabajo.service.js`, `backend/src/controllers/trabajo.controller.js`, `.local/security-smoke.json` | ✅ Cumplido | Comprobaciones “Detalle anónimo de borrador oculto” y “Subrecursos de borrador ocultos” |
| RNF-03 | PII de estudiantes y tutores no expuesta en endpoints públicos (informe §3.1 #3) | Estudiantes requieren admin/bibliotecario; tutores exponen solo `id` y `nombre` | `backend/src/routes/estudiante.routes.js`, `backend/src/routes/tutor.routes.js`, `.local/security-smoke.json` | ✅ Cumplido | Comprobaciones “Estudiantes sin autenticación bloqueado” y “Tutores públicos sin PII” |
| RNF-04 | Búsqueda resistente a inyección SQL (informe §3.1 #4) | `sequelize.escape` para el término; `plainto_tsquery` | `backend/src/services/trabajo.service.js`, `.local/security-smoke.json` | ✅ Cumplido | Comprobación “Búsqueda resiste inyección SQL” |
| RNF-05 | JWT revalida usuario, rol y estado activo en cada request (informe §3.1 #5) | `auth.middleware.js` consulta la BD y rechaza inactivos | `backend/src/middlewares/auth.middleware.js`, `.local/security-smoke.json` | ✅ Cumplido | Comprobaciones “Token de usuario desactivado rechazado” y “Login de usuario inactivo bloqueado” |
| RNF-06 | Rate limiting global, límites de cuerpo y timeouts (informe §3.1 #6) | `express-rate-limit`, límites JSON/urlencoded y timeouts del servidor | `backend/src/app.js`, `backend/src/server.js`, `backend/src/routes/auth.routes.js`, `.local/security-smoke.json` | ✅ Cumplido | Comprobaciones “Cabeceras de rate limit presentes” y “Cuerpo JSON demasiado grande rechazado”. Limitador en memoria: G-09 |
| RNF-07 | Validación de PDF por contenido, no solo MIME (informe §3.1 #7) | Verificación de cabecera `%PDF-` en el controlador | `backend/src/controllers/trabajo.controller.js`, `backend/src/middlewares/upload.middleware.js`, `.local/security-smoke.json` | ✅ Cumplido | Comprobación “Archivo con cabecera PDF falsa rechazado” |
| RNF-08 | Paginación y listados con límite superior (informe §3.1 #8) | Normalización de `pagina`/`limite` y validadores | `backend/src/services/trabajo.service.js`, `backend/src/validators/`, `.local/security-smoke.json` | ✅ Cumplido | Comprobación “Límite de paginación validado” |
| RNF-09 | OAI-PMH no revela la existencia de borradores (informe §3.1 #9) | `oai.service.js` filtra por estado publicado | `backend/src/services/oai.service.js`, `.local/security-smoke.json` | ✅ Cumplido | Comprobación “OAI no revela la existencia de borradores” |
| RNF-10 | Dependencias sin vulnerabilidades conocidas (informe §3.1 #10 y §7.1) | No aplicado | `.local/audit-backend.json`, `.local/audit-frontend.json` | 🔴 Pendiente | 13 backend y 8 frontend; varias requieren actualizaciones mayores. Brecha G-03 |
| RNF-11 | 156 pruebas backend en 14 suites (informe §5) | Jest + Supertest | `cd backend && npm test -- --runInBand` | ✅ Cumplido | Resultado del 2026-11-11: 156/156 |
| RNF-12 | 15 pruebas frontend en 4 archivos (informe §5) | Vitest + Testing Library | `cd frontend && npm test` | ✅ Cumplido | Resultado del 2026-11-11: 15/15 |
| RNF-13 | TypeScript sin errores y build correcto (informe §5) | `tsc --noEmit` y `vite build` | `cd frontend && npx tsc --noEmit`, `cd frontend && npm run build` | ✅ Cumplido | Build con aviso de chunk > 500 kB |
| RNF-14 | 25/25 comprobaciones de seguridad (informe §3.1 y §5) | Script `security-smoke.js` | `.local/security-smoke.json`, `backend/scripts/security-smoke.js` | ✅ Cumplido | Ejecutado el 2026-11-11T03:15:32Z |
| RNF-15 | Carga sin fallos: k6, Artillery y autocannon (informe §4 y §5) | Scripts en `tests/load/` | `.local/k6-summary.json`, `.local/artillery-report.json`, `.local/autocannon.json`, `tests/load/` | ✅ Cumplido | k6 119,36 req/s p95 83,79 ms; Artillery 0 fallidos p95 92,8 ms; autocannon búsqueda 96 req/s |
| RNF-16 | Automatización de calidad (CI) | No existe pipeline | `git tag`, inventario del repositorio | 🔴 Pendiente | No estaba en la especificación; se registra como deuda de mantenibilidad. Brecha G-04 |

---

## 5. Trazabilidad inversa: funciones añadidas no previstas

Estas funciones **no aparecen en los `AGENT.md`**. Se documentan como alcance añadido que aporta valor, con su justificación y evidencia.

| ID | Función añadida | Justificación | Implementación | Evidencia | Estado |
|---|---|---|---|---|---|
| RA-01 | OAI-PMH 2.0 | Interoperabilidad con cosechadores y repositorios externos | `backend/src/routes/oai.routes.js`, `backend/src/services/oai.service.js` | Código; comprobación de seguridad “OAI no revela borradores” | ➕ Añadido |
| RA-02 | RSS 2.0 y Atom | Difusión de publicaciones sin depender de la interfaz | `backend/src/routes/feed.routes.js`, `backend/src/services/rss.service.js` | Código; sin prueba dedicada | ➕ Añadido |
| RA-03 | Comentarios con calificación | Retroalimentación sobre documentos publicados | `backend/src/models/Comentario.js`, `backend/src/services/comentario.service.js`, `frontend/src/components/ComentariosSection.tsx` | `backend/src/services/comentario.service.test.js` | ➕ Añadido |
| RA-04 | Historial de versiones y restauración | Trazabilidad de cambios y recuperación de estados anteriores | `backend/src/models/Version.js`, `backend/src/services/version.service.js`, `frontend/src/components/HistorialVersiones.tsx` | Código; sin prueba dedicada | ➕ Añadido |
| RA-05 | Citas APA, BibTeX y RIS | Uso académico y referencia bibliográfica | `backend/src/services/cita.service.js`, `frontend/src/pages/TrabajoDetalle.tsx` | Código; sin prueba dedicada | ➕ Añadido |
| RA-06 | Estadísticas de vistas/descargas y panel | Medir uso y producción institucional | `backend/src/models/Visita.js`, `backend/src/services/estadistica.service.js`, `backend/src/services/admin.service.js`, `frontend/src/pages/Admin.tsx` | `backend/src/services/estadistica.service.test.js` | ➕ Añadido |
| RA-07 | Notificaciones in-app y SSE | Avisar cambios de revisión y comentarios sin recargar | `backend/src/models/Notificacion.js`, `backend/src/services/notificacion.service.js`, `backend/src/services/sse.service.js`, `frontend/src/components/NotificationBell.tsx` | `backend/src/services/notificacion.service.test.js` | ➕ Añadido |
| RA-08 | Recuperación de contraseña por correo | Autoservicio de acceso | `backend/src/services/auth.service.js`, `backend/src/services/email.service.js`, `frontend/src/pages/ForgotPassword.tsx`, `frontend/src/pages/ResetPassword.tsx` | `backend/src/services/auth.service.test.js` | ➕ Añadido |
| RA-09 | Entidades académicas: carrera, tutor, estudiante | Metadatos académicos normalizados y filtros | `backend/src/models/Carrera.js`, `backend/src/models/Tutor.js`, `backend/src/models/Estudiante.js`, rutas y migraciones | Código y migraciones; sin suite dedicada. Se administran como entidades, pero no se asignan a un trabajo desde la API (G-15) | ➕ Añadido |
| RA-10 | Tema claro/oscuro | Accesibilidad visual y preferencia del usuario | `frontend/src/components/ThemeToggle.tsx`, `frontend/tailwind.config.cjs` | Código; sin prueba automatizada | ➕ Añadido |

---

## 6. Mejoras de expectativas incorporadas

Estos cambios se confirmaron en el commit `2f8b0a9` y forman parte del código evaluado.

| ID | Mejora | Archivo | Estado | Observación |
|---|---|---|---|---|
| ME-01 | Eliminar el botón de credenciales demo del login | `frontend/src/pages/Login.tsx` | ✅ Confirmado | Evita prometer una cuenta demo que puede no existir en la base |
| ME-02 | Evitar doble envío y mostrar “Entrando…” | `frontend/src/pages/Login.tsx` | ✅ Confirmado | Estado `submitting`, `disabled` y `aria-busy` |
| ME-03 | Sustituir jerga técnica por mensajes para el usuario y añadir estilos `disabled` | `frontend/src/pages/Submission.tsx`, `frontend/src/components/ui/Button.tsx` | ✅ Confirmado | “API real del backend” → “tu trabajo quedará guardado en el repositorio” |

---

## 7. Resumen de cobertura

| Categoría | Total | ✅ Cumplido | 🟡 Parcial | 🔴 Pendiente | ➕ Añadido |
|---|---:|---:|---:|---:|---:|
| Requisitos funcionales | 19 | 7 | 12 | 0 | 0 |
| Requisitos técnicos backend | 8 | 7 | 1 | 0 | 0 |
| Seguridad y no funcionales | 16 | 14 | 0 | 2 | 0 |
| Funciones añadidas | 10 | 0 | 0 | 0 | 10 |
| Mejoras incorporadas | 3 | 3 | 0 | 0 | 0 |
| **Total** | **56** | **31** | **13** | **2** | **10** |

No se calcula un porcentaje global porque la tabla mezcla requisitos, controles de seguridad y funciones añadidas. El conteo por categoría es el indicador válido.

**Lectura para el evaluador:**

- Los requisitos funcionales de la especificación están mayoritariamente **parcialmente cumplidos**: existen los flujos, pero faltan módulos dedicados para normativa, editorial y boletines.
- Los requisitos técnicos del backend están casi todos cumplidos; la única excepción es el uso controlado de SQL embebido para búsqueda full-text.
- Los controles de seguridad están verificados, salvo las dependencias y la ausencia de CI.
- Las funciones añadidas están identificadas y justificadas; no se presentan como requisitos originales.

---

## 8. Registro de brechas

| ID | Brecha | Requisito afectado | Prioridad | Acción recomendada |
|---|---|---|---|---|
| G-01 | Roles Docente/Estudiante no implementados | RF-01 | Alta | Implementar o corregir la especificación |
| G-02 | Sin correo en cambios de revisión | Expectativa de usuario | Alta | Implementar notificación por correo si se confirma en alcance |
| G-03 | 21 vulnerabilidades de dependencias | RNF-10 | Alta | Actualizar por lotes con regresión |
| G-04 | Sin CI/CD ni etiquetas | RNF-16 | Media | Añadir GitHub Actions y versionado |
| G-05 | Bundle único de ~1,35 MB | RF-13 | Baja/Media | Code splitting y carga diferida |
| G-06 | 9 usos de `any` en 8 archivos | RF-17 | Baja | Reemplazar por tipos concretos |
| G-07 | Sin auditoría de accesos por usuario | RF-02 | Media | Registrar login, rol y cambios de estado |
| G-08 | Módulos normativo/editorial parciales | RF-05, RF-06, RF-07, RF-08 | Media | Diseñar ciclos de vida dedicados |
| G-09 | Rate limiting en memoria | RNF-06 | Media | Redis o límite en proxy/CDN |
| G-10 | `backend/AGENT.md` incompleto | Línea base | Media | Completar la especificación o mantener la reconstrucción declarada |
| G-11 | Metadatos académicos sin confirmar | Entrega | Alta | Completar `docs/PROYECTO.md` |
| G-13 | URL de demo no verificada | Demo | Media | Verificar o demostrar en local |
| G-14 | Sin licencia, términos ni privacidad | Legal | Baja/Media | Añadir documentos antes de publicar |
| G-15 | Relaciones académicas del trabajo no declaradas en el modelo ni asignables por API | RF-04, RA-09 | Media | Declarar `carrera_id`, `tutor_id` y `estudiante_id` en `Trabajo` y exponerlos en creación/edición |
| G-16 | Versión creada antes de una actualización que puede fallar | RA-04 | Baja | Crear la versión dentro de una transacción o después de validar la actualización |

### 8.1 Brechas resueltas

| ID | Brecha | Resolución | Evidencia |
|---|---|---|---|
| G-12 | Tres archivos sin confirmar | Confirmados el 2026-11-11 | Commit `2f8b0a9` |

---

## 9. Mantenimiento de la matriz

1. Cada requisito nuevo debe tener ID, fuente, implementación, evidencia y estado.
2. Un requisito solo pasa a ✅ si existe una prueba, comando o artefacto verificable.
3. Si una función se añade sin estar en la especificación, se registra en la sección 5.
4. Si una brecha se resuelve, se mueve a una sección de “resueltas” con fecha y evidencia; no se borra.
5. Si cambia el commit, se actualiza el encabezado y se repiten las verificaciones.
