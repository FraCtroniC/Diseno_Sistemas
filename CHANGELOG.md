# Changelog

**Nota metodológica:** este changelog se reconstruyó desde `git log`. El repositorio **no usa versiones semánticas ni etiquetas (`tags`)**. Los hitos se agrupan por fecha y por funcionalidad, no por número de versión.

**Último commit de código confirmado:** `2f8b0a9` · 11 de noviembre de 2026.
**Documentación:** commit de cierre de la misma fecha.
**Actualizaciones funcionales posteriores:** 18 de noviembre de 2026 (catálogo académico, limpieza del esquema legacy e integración del posgrado) y 19 de noviembre de 2026 (aplicación de la migración de posgrado y correcciones de navegación), pendientes de commit al redactar estas entradas.

---

## [2026-11-19] — Aplicación de la migración de posgrado y correcciones

### Contexto

La integración del posgrado quedó **sin aplicar en base de datos**: el código ya consultaba `niveles_academicos` y `carreras.nivel_id`, pero la migración `2026111802` estaba en estado `down`. Todo el catálogo devolvía `500` (`GET /trabajos`, `GET /carreras`, `GET /niveles-academicos`) y la interfaz lo enmascaraba mostrando listas vacías.

### Corregido

- **Aplicada la migración `2026111802-crear-niveles-academicos-y-posgrado.js` en Neon** (`db:migrate:status` → `up`). Resultado: 3 niveles, 11 programas (6 pregrado, 3 maestría, 2 doctorado) y los 18 trabajos originales intactos. Los tres endpoints responden `200`.
- **Errores visibles en vez de listas vacías:** `useTrabajoStore` expone `error` (antes `catch {}` silencioso); `Home` y `Catálogo` muestran una tarjeta de error con botón **Reintentar**. `Search.tsx` hacía lo mismo con su propia búsqueda y ahora también muestra el fallo, dejando de presentar "No hay resultados" cuando la petición falló.
- **Navegación de posgrado:** Maestrías y Doctorados dejan de ser elementos de primer nivel. Se quitan del sidebar, de los accesos rápidos de cabecera y de la fila "Filtrar:" del catálogo. Permanecen como **subpestañas de Postgrado** (`Todos / Maestrías / Doctorados`) dentro de `/catalogo/postgrado`, con rutas propias `/catalogo/maestrias` y `/catalogo/doctorados` como destino de esas pestañas.

### Verificación

| Comprobación | Resultado |
|---|---|
| `GET /trabajos`, `GET /carreras`, `GET /niveles-academicos` | 200 |
| Backend | 198/198 en 19 suites |
| Frontend | 22/22 en 6 archivos (nueva suite `useTrabajoStore.test.ts`) |
| TypeScript / Build / Lint | Sin errores de tipo; build correcto; lint 0 errores, 18 advertencias |

---

## [2026-11-18] — Integración del posgrado (maestrías y doctorados)

### Contexto

El repositorio solo contemplaba pregrado: los programas se guardaban en `carreras` y el tipo de documento vivía en `metadatos.tipo_documento`. Se incorporaron tres maestrías y dos doctorados de la UNEFA Núcleo Táchira sin duplicar el nivel en cada trabajo ni mezclarlo con el tipo de documento.

### Añadido

- Tabla `niveles_academicos` con tres filas (`pregrado`, `maestria`, `doctorado`) y el campo `grupo` (`pregrado` / `postgrado`) para derivar la familia sin hardcodear listas en el frontend. Migración `2026111802-crear-niveles-academicos-y-posgrado.js` (transaccional, IDs fijos).
- `carreras.nivel_id` como FK a `niveles_academicos`. El catálogo académico pasa a 11 programas: los seis de pregrado existentes más Maestría en Recursos Humanos, Maestría en Ciencias Jurídicas, Maestría Ambiental, Doctorado en Ciencias Gerenciales y Doctorado en Innovaciones Educativas.
- Fuente única `backend/database/catalogo-academico.js` con `NIVELES`, `CARRERAS` y `nivelIdPorSlug`, usada por la migración, el seeder y el servicio de carreras.
- Endpoint público `GET /api/v1/niveles-academicos` y filtro `GET /api/v1/carreras?nivel=` (slug: `pregrado`, `maestria`, `doctorado`).
- Modelo `NivelAcademico` con asociaciones `hasMany(Carrera)` / `belongsTo(NivelAcademico)`, servicio, controlador, rutas y validadores (`nivel_id` UUID).
- `trabajo.service.js` expone el nivel anidado del programa en las tres consultas de trabajos, junto con `carrera.nivel_id`.
- Vistas `/catalogo/maestrias` y `/catalogo/doctorados` además de `/catalogo/postgrado`, con pestañas de nivel, chips por programa (`?programa=`) y badges de programa en las tarjetas.
- `Submission.tsx` filtra el selector de programas según el tipo de documento (pregrado vs. postgrado), valida la coherencia y admite trabajos sin `tipo_documento` previo infiriéndolo del nivel.
- `CarrerasManager.tsx` permite elegir el nivel al dar de alta o editar un programa y muestra su badge.
- Pruebas: cobertura del filtro por nivel y del endpoint de niveles en backend; nueva suite `frontend/src/test/Catalog.test.tsx` para las tres vistas de posgrado y el filtro por programa.

### Cambiado

- `carreras` sigue siendo la tabla de programas, `categorias` la clasificación temática y `metadatos.tipo_documento` el tipo de documento; el nivel del programa se deriva de `carrera.nivel`.
- Las altas de carrera sin `nivel_id` explícito siguen creándose como `pregrado` para no romper clientes del CRUD anterior.
- Los seeders de carreras usan la constante compartida en lugar de una lista duplicada.

### Diferido al paquete C

- Trabajos de Ascenso (quedan fuera de este paquete).
- Filtro del catálogo en backend (sigue siendo client-side sobre `limite: 50`).
- Citas APA/BibTeX que distingan maestría de doctorado.

### Verificación

| Comprobación | Resultado |
|---|---|
| Backend | 198/198 en 19 suites |
| Frontend | 22/22 en 6 archivos |
| TypeScript | Sin errores |

---

## [2026-11-18] — Limpieza del esquema legacy

### Contexto

La base de datos de Neon contenía dos generaciones de esquema: el esquema Sequelize que usa la API (`usuarios`, `trabajos`, `carreras`, …) y un esquema anterior sin referencias en código ni en migraciones (`users`, `works`, `collections`, …). El esquema viejo incluía una segunda tabla de usuarios con los roles `Administrador`, `Coordinador`, `Editor`, `Estudiante` e `Invitado`.

### Eliminado

- Sin datos: `access_logs`, `files`, `normatives_manuals`, `statistics_reports`, `submissions`, `work_identifiers`, `works`.
- Con datos semilla: `users` (1 fila), `collections` (2) y `communities` (4). Sus filas quedan únicamente en el respaldo; no se migraron al esquema actual.
- No se migró al usuario `admin_fabian`: en `usuarios` ya existe el usuario `admin` con identidad distinta.

### Respaldo

- Archivo: `.local/backup-legacy-2026-11-18.sql` (ignorado por Git; 21 868 bytes; 10 `CREATE TABLE` y 7 `INSERT`).
- Generado con `pg_dump --table=… --column-inserts --no-owner --no-privileges`.

### Verificación

| Comprobación | Resultado |
|---|---|
| Tablas en `public` | 12: `SequelizeMeta`, `carreras`, `categorias`, `comentarios`, `estudiantes`, `notificaciones`, `revisiones`, `trabajos`, `tutores`, `usuarios`, `versiones`, `visitas` |
| Secuencias en `public` | 0 |
| Datos de la app | `usuarios` 4, `trabajos` 18, `carreras` 6, `categorias` 7, `comentarios` 5, `notificaciones` 7, `revisiones` 5, `versiones` 5, `visitas` 252 |
| Backend | 193/193 en 19 suites |
| Frontend | 15/15 en 4 archivos |
| Smoke de seguridad | No repetido: requiere PostgreSQL local en el puerto `55432`, no disponible en este entorno; último resultado 25/25 del 2026-11-11 |

---

## [2026-11-18] — Catálogo académico y categorías temáticas

### Añadido

- Catálogo `carreras` con las seis carreras que se imparten: Administración y Gestión Municipal, Licenciatura en Turismo, Economía, Ingeniería de Sistemas, Ingeniería Civil e Ingeniería Eléctrica.
- CRUD de carreras en el panel de administración (`/admin`) con validación de nombre/slug únicos y bloqueo de borrado (`409`) cuando existen trabajos o estudiantes asociados.
- Migración `2026111801-carreras-unefa-y-categorias-tematicas.js` con transacción, IDs fijos, relleno de `trabajos.carrera_id`, limpieza de `metadatos.carrera`, verificación de nulos y `SET NOT NULL`.
- Seeder `20260609-carreras-base.js` y pruebas `backend/src/services/carrera.service.test.js`.

### Cambiado

- `categorias` deja de representar carreras y pasa a ser clasificación temática: Administración y Gestión, Economía y Finanzas, Turismo y Sociedad, Tecnología y Sistemas, Ingeniería y Construcción, Energía y Electricidad y Estudios Institucionales.
- `trabajos.carrera_id` es obligatorio en el modelo, la API y el formulario; `GET /trabajos/buscar` acepta el filtro `carrera`.
- El formulario de carga usa un select de carrera y un select de categoría temática independientes.
- El detalle del trabajo muestra la carrera desde `trabajo.carrera.nombre`; se elimina `metadatos.carrera` como fuente de verdad.
- La búsqueda separa los filtros “Carrera” y “Categoría temática”.
- Seeders de categorías, trabajos de ejemplo y datos de prueba actualizados al nuevo catálogo.

### Migración aplicada

- Base actual (Neon, 2026-11-18): 6 carreras, 7 categorías temáticas, 18/18 trabajos con `carrera_id` y 0 trabajos con `metadatos.carrera`.
- Los trabajos existentes se conservaron: Administración de Empresas → Administración y Gestión Municipal; Contaduría Pública → Economía; Educación → Licenciatura en Turismo.

### Verificación

| Verificación | Resultado |
|---|---|
| Backend | 193/193 en 19 suites |
| Frontend | 15/15 en 4 archivos |
| TypeScript | Sin errores |
| Build | Correcto, con aviso de chunk > 500 kB |
| Lint | 0 errores, 18 advertencias |

---

## [2026-11-11] — Documentación y verdad única

Cambios de documentación confirmados el 11 de noviembre de 2026 en el commit de cierre de esta entrega.

### Añadido

- `README.md` reescrito como puerta de entrada real: estado verificado, arquitectura, requisitos, puesta en marcha, comandos y límites.
- `docs/PROYECTO.md`: ficha académica, problema, objetivos, actores, alcance, supuestos y riesgos.
- `docs/ESTADO.md`: tablero por módulo, evidencias y deuda técnica.
- `docs/TRAZABILIDAD.md`: matriz requisito → implementación → prueba → estado, con trazabilidad inversa.
- `docs/EVIDENCIAS.md`: comandos, resultados y ubicación de artefactos.
- `docs/DEMO.md`: guion de 10 minutos y plan de contingencia.
- `CHANGELOG.md`: este archivo.
- `backend/README.md`: documentación técnica de la API.

### Cambiado

- `frontend/README.md`: reducido a setup específico del frontend y enlaces a la documentación canónica.
- `frontend/docs/architecture.md` y `frontend/docs/development.md`: reemplazados por notas de redirección; ya no describen mocks ni rutas inexistentes.
- `frontend/AGENT.md` y `backend/AGENT.md`: se añadió una banda de “documento histórico de especificación”.

### Confirmado en `2f8b0a9`

- `frontend/src/pages/Login.tsx`: eliminación del botón de credenciales demo y estado `submitting` para evitar doble envío.
- `frontend/src/components/ui/Button.tsx`: estilos `disabled`.
- `frontend/src/pages/Submission.tsx`: mensajes para el usuario sin jerga técnica.

Estos tres archivos se confirmaron en el commit `2f8b0a9`.

---

## Hitos reconstruidos

### Hito 1 — Fundación del proyecto (2026-06-10)

| Commit | Fecha | Cambio |
|---|---|---|
| `72e76db` | 2026-06-10 | Primer commit del repositorio |

**Resultado:** base inicial del proyecto.

### Hito 2 — Autenticación, registro y perfiles (2026-06-14 a 2026-06-16)

| Commit | Fecha | Cambio |
|---|---|---|
| `e38e057` | 2026-06-14 | Registro de usuarios con campos de perfil y recuperación de contraseña |
| `91036d6` | 2026-06-16 | Actualización de perfil y reglas de validación |

**Resultado:** autenticación con registro, perfil y recuperación de contraseña.

### Hito 3 — Catálogo, búsqueda y fin de los mocks (2026-06-22 a 2026-06-28)

| Commit | Fecha | Cambio |
|---|---|---|
| `656a6fd` | 2026-06-22 | Página de detalle, esqueletos de carga y búsqueda con paginación |
| `2812308` | 2026-06-22 | Eliminación de datos mock e implementación de gestión de categorías en el panel |
| `611a5da` | 2026-06-28 | Ajustes de dependencias en Catálogo, Inicio y Perfil |

**Resultado:** el frontend deja de depender de datos mock y se conecta a la API real; aparece el catálogo y la búsqueda paginada.

### Hito 4 — Revisión, feeds y interoperabilidad (2026-07-01)

| Commit | Fecha | Cambio |
|---|---|---|
| `08ab24a` | 2026-07-01 | Pruebas de revisión, feeds RSS/Atom, tutores, versiones y notificaciones |
| `59109c9` | 2026-07-01 | `frontend/vercel.json` con reescrituras de API para despliegue |
| `0138682` | 2026-07-01 | Mejoras de compatibilidad con modo oscuro |

**Resultado:** flujo de revisión, interoperabilidad RSS/Atom, versiones y primeras notificaciones. Se prepara el despliegue en Vercel.

### Hito 5 — Cloudinary, nombre de usuario y logo (2026-07-03)

| Commit | Fecha | Cambio |
|---|---|---|
| `f513a7f` | 2026-07-03 | Soporte de nombre de usuario en autenticación y registro |
| `5b468fb` | 2026-07-03 | Logo de UNEFA en el encabezado |
| `332464e` | 2026-07-03 | Integración de Cloudinary y manejo de archivos |
| `a7205c3` | 2026-07-03 | Edición/eliminación de comentarios y notificaciones |

**Resultado:** almacenamiento de PDFs en Cloudinary, login por usuario, identidad visual y comentarios editables.

### Hito 6 — Roles, revisión y edición de trabajos (2026-11-02)

| Commit | Fecha | Cambio |
|---|---|---|
| `2bf93a4` | 2026-11-02 | Mejora del servicio de comentarios y componentes del frontend |
| `e04b1bb` | 2026-11-02 | Edición y creación de trabajos con palabras clave y validaciones |
| `7e7a0bd` | 2026-11-02 | Actualización de roles y permisos; página de gestión de revisiones |

**Resultado:** roles `admin`/`repositor`/`bibliotecario`, cola de revisión y edición de trabajos.

### Hito 7 — Cédula, Cloudinary y endurecimiento (2026-11-07 a 2026-11-11)

| Commit | Fecha | Cambio |
|---|---|---|
| `0b9a2ac` | 2026-11-07 | Validación y normalización de cédula |
| `7fbc559` | 2026-11-10 | Extracción del ID público de Cloudinary y pruebas |
| `e3b4a98` | 2026-11-11 | Scripts de pruebas de carga e informe de seguridad |
| `b807b68` | 2026-11-11 | Mejora del manejo de cambios de estado en revisiones y notificaciones |
| `2f8b0a9` | 2026-11-11 | Evita doble envío en login y aclara mensajes de carga |

**Resultado:** validación de cédula, pruebas de Cloudinary, informe de carga/seguridad, mejoras en el flujo de revisión y correcciones de experiencia de usuario.

### Hito 8 — Documentación y verdad única (2026-11-11)

Paquete documental confirmado en el commit de cierre de esta fecha. Incluye la matriz de trazabilidad, el estado verificado, las evidencias, el guion de demo y la documentación técnica.

---

## Estado de pruebas del snapshot `2f8b0a9` (2026-11-11)

| Verificación | Resultado |
|---|---|
| Backend | 156/156 en 14 suites |
| Frontend | 15/15 en 4 archivos |
| TypeScript | Sin errores |
| Build | Correcto, con aviso de chunk > 500 kB |
| Lint | 0 errores, 19 advertencias |
| Seguridad | 25/25 |

Ver [`docs/EVIDENCIAS.md`](docs/EVIDENCIAS.md) para comandos y artefactos.

## Convención futura

Si el proyecto adopta versiones, se recomienda:

- `MAJOR`: cambios incompatibles de API o modelo de datos.
- `MINOR`: funcionalidad nueva compatible.
- `PATCH`: correcciones compatibles.
- Etiquetas `vX.Y.Z` y entrada de changelog por versión.

Mientras no existan etiquetas, este archivo seguirá agrupando por fecha y hito.
