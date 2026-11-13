# Informe de pruebas de carga y seguridad

**Proyecto:** Repositorio Digital UNEFA  
**Fecha:** 10 de noviembre de 2026  
**Actualizado:** 13 de noviembre de 2026 (actualización de dependencias)
**Ámbito:** entorno local aislado (sin Render, sin Neon y sin credenciales reales)  
**Objetivo:** simular tráfico alto, detectar vulnerabilidades y corregir los hallazgos de mayor impacto, dejando evidencia reproducible.

---

## 1. Resumen ejecutivo

Se montó un entorno local completo con PostgreSQL 18 aislado, datos sintéticos y el backend Express/Sequelize ejecutándose en `http://localhost:5001`. Sobre ese entorno se ejecutaron tres herramientas de carga (k6, Artillery y autocannon), una prueba de humo de seguridad con 25 comprobaciones reales y las suites de pruebas existentes.

Resultados principales:

- **Seguridad:** 25/25 comprobaciones correctas. Se corrigieron fugas de borradores, PII sin autenticación, IDOR en edición/borrado/cambio de estado, JWT no revalidados, inyección en la búsqueda, ausencia de rate limiting, límites de cuerpo/timeouts y validación débil de PDFs.
- **Backend:** 156 pruebas en 14 suites, todas correctas.
- **Frontend:** 15 pruebas en 4 archivos, todas correctas; `tsc --noEmit` sin errores.
- **k6:** 4.295 peticiones, 119,36 req/s, p95 83,79 ms, 0 fallos. Frente a la primera ejecución, el p95 bajó un 49,9 % y el throughput subió un 9,6 %.
- **Artillery:** 2.492 peticiones, 0 usuarios fallidos, p95 92,8 ms. Antes de reutilizar tokens y optimizar la búsqueda, el mismo escenario acumulaba 569–620 usuarios fallidos y p95 de 13–14 segundos.
- **autocannon:** la búsqueda pasó de 27 req/s (p50 696 ms) a 96 req/s (p50 192 ms), un 3,5× más de throughput y 3,6× menos latencia mediana. El resto de endpoints se mantuvo estable.
- **Cuello de botella principal:** la búsqueda full-text calculaba `to_tsvector()` dos veces por fila. Se reemplazó por una columna `search_vector` generada y almacenada, con índice GIN.
- **Dependencias:** se actualizaron las librerías afectadas. El frontend quedó en **0 vulnerabilidades** y el backend en **5 avisos bajos**, todos de Jest (solo desarrollo). El runtime de backend no tiene vulnerabilidades altas, críticas ni moderadas. Validado con 171 pruebas, smoke de seguridad, migraciones, build de producción y una comprobación de carga.

---

## 2. Entorno local aislado

### 2.1 Componentes

| Componente | Configuración |
|---|---|
| PostgreSQL | 18, clúster en `.local/pgdata`, puerto `55432`, autenticación `trust` |
| Base de datos | `unefa_test` |
| Backend | Express 5 + Sequelize, `http://localhost:5001` |
| Archivos PDF | `CLOUDINARY_MODE=local`, guardados en `.local/uploads` y servidos por `/local-files` |
| Configuración | `backend/.env.test` (ignorado por Git) |
| Datos | `backend/scripts/seed-test-data.js` |
| Servidor de pruebas | `backend/scripts/start-test-server.js` |

### 2.2 Aislamiento

- No se usaron credenciales de Neon, Cloudinary ni SMTP reales.
- `NODE_ENV=test` carga exclusivamente `backend/.env.test` y fuerza la sobrescritura de variables, de modo que un `.env` de desarrollo no puede filtrar secretos a las pruebas.
- `.local/` y `backend/.env.test` están incluidos en `.gitignore`.
- El pool de pruebas se elevó a 20 conexiones (`DB_POOL_MAX=20`, `DB_POOL_MIN=2`) y se desactivó el logging HTTP (`HTTP_LOGGING=false`) para que las mediciones reflejen el comportamiento del servidor y no el costo de escribir logs.

### 2.3 Datos sintéticos

El seed genera:

- 6 usuarios: admin, repositor, bibliotecario, dos autores y un usuario inactivo.
- 5 categorías y 5 carreras.
- 3 tutores y 12 estudiantes.
- 500 trabajos: 400 publicados, 40 borradores y 60 en otros estados.
- 300 comentarios y 60 notificaciones.

Credenciales de prueba (solo local):

| Usuario | Email | Contraseña |
|---|---|---|
| Admin | `admin@test.local` | `Admin123!` |
| Repositor | `repositor@test.local` | `Repos123!` |
| Bibliotecario | `bibliotecario@test.local` | `Biblio123!` |
| Autor 1 | `autor1@test.local` | `Autor123!` |
| Autor 2 | `autor2@test.local` | `Autor123!` |
| Inactivo | `inactivo@test.local` | `Inactivo123!` |

---

## 3. Hallazgos de seguridad y correcciones

La prueba de humo real está en `backend/scripts/security-smoke.js` y su evidencia en `.local/security-smoke.json`. Cubre autenticación, autorización por rol, visibilidad de borradores, IDOR, PII, inyección, paginación, PDFs, JSON inválido, cuerpos grandes y cabeceras de rate limiting.

### 3.1 Tabla resumen

| # | Hallazgo | Severidad | Estado | Verificación |
|---|---|---|---|---|
| 1 | IDOR: un repositor podía editar, borrar o cambiar el estado de trabajos de otro autor | Crítica | Corregido | `Edición/Borrado/Cambio de estado de trabajo ajeno bloqueado` |
| 2 | Borradores y subrecursos (comentarios, versiones, cita, estadísticas, archivo) visibles sin autenticación | Alta | Corregido | `Detalle anónimo de borrador oculto`, `Subrecursos de borrador ocultos` |
| 3 | PII de estudiantes y tutores expuesta en endpoints públicos | Alta | Corregido | `Estudiantes sin autenticación bloqueado`, `Tutores públicos sin PII` |
| 4 | Búsqueda full-text construida por interpolación manual de SQL | Alta | Corregido | `Búsqueda resiste inyección SQL` |
| 5 | JWT no revalidaba usuario, rol ni estado `activo` en base de datos | Alta | Corregido | `Token de usuario desactivado rechazado`, `Login de usuario inactivo bloqueado` |
| 6 | Ausencia de rate limiting global, cuerpos JSON de 10 MB y sin timeouts de servidor | Media | Corregido | `Cabeceras de rate limit presentes`, `Cuerpo JSON demasiado grande rechazado` |
| 7 | Validación de PDF basada solo en el MIME declarado por el cliente | Media | Corregido | `Archivo con cabecera PDF falsa rechazado` |
| 8 | Paginación y listados sin límite superior (riesgo de agotamiento de memoria/CPU) | Media | Corregido | `Límite de paginación validado` |
| 9 | OAI-PMH revelaba la existencia de borradores en `ListMetadataFormats` | Baja | Corregido | `OAI no revela la existencia de borradores` |
| 10 | Dependencias con vulnerabilidades conocidas | Variable | Corregido | `npm audit`: frontend 0, backend 5 bajas (solo Jest) |

### 3.2 Detalle de las correcciones

#### 3.2.1 Revalidación de identidad y rol

**Antes:** `auth.middleware.js` verificaba la firma del JWT y confiaba en el `rol` incluido en el token. Un usuario desactivado o degradado conservaba acceso hasta que expirara el token (2 horas).

**Después:** el middleware consulta `Usuario.findByPk(decoded.id)` en cada petición autenticada, comprueba `activo` y usa el rol actual de la base de datos. Se añadió `optional-auth.middleware.js` para endpoints públicos que necesitan distinguir anónimo vs. autenticado sin bloquear al anónimo.

**Archivos:** `backend/src/middlewares/auth.middleware.js`, `backend/src/middlewares/optional-auth.middleware.js`.

#### 3.2.2 Visibilidad de trabajos y subrecursos

**Antes:** `GET /trabajos`, `GET /trabajos/buscar` y `GET /trabajos/:id` devolvían borradores a cualquiera. Los endpoints de comentarios, versiones, cita, estadísticas y archivo no comprobaban la visibilidad del trabajo.

**Después:**

- `aplicarVisibilidad()` fuerza `estado=publicado` para anónimos y limita a un repositor a sus propios trabajos no publicados.
- `puedeVerTrabajo()` oculta borradores ajenos con 404 (no 403, para no revelar su existencia).
- Los controladores de comentarios, versiones, revisiones, cita, estadísticas y descarga validan primero la visibilidad del trabajo.
- `GET /trabajos?estado=borrador` sin autenticación responde 403.
- `GET /trabajos/:id` de un borrador ajeno responde 404.

**Archivos:** `backend/src/services/trabajo.service.js`, `backend/src/controllers/trabajo.controller.js`, `backend/src/controllers/comentario.controller.js`, `backend/src/controllers/version.controller.js`, `backend/src/controllers/revision.controller.js`.

#### 3.2.3 IDOR en actualización, borrado y flujo de revisión

**Antes:** cualquier repositor podía modificar o eliminar cualquier trabajo conociendo su UUID. En revisiones, un repositor podía enviar a revisión trabajos de otro autor.

**Después:**

- `puedeGestionarTrabajo()` permite administrar solo si el rol es `admin`, `bibliotecario` o si el usuario es el propietario.
- `actualizar()` y `eliminar()` aplican esa comprobación.
- `revision.service.cambiarEstado()` exige que un repositor sea el propietario del trabajo.
- `version.service.restaurar()` aplica la misma regla.

**Archivos:** `backend/src/services/trabajo.service.js`, `backend/src/services/revision.service.js`, `backend/src/services/version.service.js`, `backend/src/controllers/trabajo.controller.js`.

#### 3.2.4 Protección de datos personales

**Antes:**

- `GET /estudiantes` era público y devolvía cédula y teléfono.
- `GET /tutores` y `GET /tutores/:id` devolvían email, cédula y teléfono.
- El detalle de un trabajo incluía la cédula del estudiante.

**Después:**

- `GET /estudiantes` y `GET /estudiantes/:id` requieren autenticación y rol `admin` o `bibliotecario`.
- `GET /tutores` y `GET /tutores/:id` exponen únicamente `id` y `nombre`.
- El include de estudiante en trabajos expone únicamente `id` y `nombre`.
- Se añadieron validadores de paginación y `q` para estos listados.

**Archivos:** `backend/src/routes/estudiante.routes.js`, `backend/src/routes/tutor.routes.js`, `backend/src/services/estudiante.service.js`, `backend/src/services/tutor.service.js`, `backend/src/validators/entidad.validator.js`, `frontend/src/services/trabajoService.ts` (tipo `cedula` opcional).

#### 3.2.5 Búsqueda full-text segura

**Antes:** el término `q` se escapaba manualmente con `replace(/'/g, "''")` y se interpolaba en `plainto_tsquery`, `ts_headline` y `ts_rank`.

**Después:**

- Se usa `sequelize.escape(q)` para generar un literal SQL seguro.
- Se valida `q` como texto, se recorta y se limita a 200 caracteres.
- Se añadieron índices GIN para título, autor, palabras clave y metadatos, y se reemplazó el índice de texto completo por una columna `search_vector` generada y almacenada para evitar recalcular `to_tsvector()` en cada consulta.

**Archivos:** `backend/src/services/trabajo.service.js`, `backend/src/validators/trabajo.validator.js`, `backend/database/migrations/2026111001-add-performance-indexes.js`, `backend/database/migrations/2026111002-add-search-vector.js`.

#### 3.2.6 Límites de entrada y disponibilidad

**Antes:** JSON y URL-encoded aceptaban 10 MB, no había rate limiting global, multer solo limitaba el tamaño del archivo y el servidor no configuraba timeouts.

**Después:**

- Rate limit global configurable (300 req/min por defecto) y rate limit de autenticación (5 intentos/15 min por defecto).
- `trust proxy` configurable para que el rate limit funcione detrás de Render.
- Cuerpos JSON/URL-encoded limitados a 1 MB y 1.000 parámetros.
- Multer limita 1 archivo, 20 campos, 30 partes y 100 KB por campo, además de 10 MB por PDF.
- Timeouts de request, headers, keep-alive y socket configurables.
- Errores específicos para JSON inválido (400), cuerpo demasiado grande (413) y PDF demasiado grande (413).
- `x-powered-by` deshabilitado.

**Archivos:** `backend/src/app.js`, `backend/src/server.js`, `backend/src/middlewares/upload.middleware.js`, `backend/src/middlewares/error.middleware.js`, `backend/src/routes/auth.routes.js`.

#### 3.2.7 Validación real de PDFs

**Antes:** se aceptaba cualquier archivo cuyo MIME declarado fuera `application/pdf`.

**Después:** se comprueba que el buffer empiece por la cabecera `%PDF-` antes de subirlo. La prueba de humo envía un archivo con MIME `application/pdf` pero contenido de texto y recibe 400.

**Archivo:** `backend/src/controllers/trabajo.controller.js`.

#### 3.2.8 OAI-PMH

`ListMetadataFormats` comprobaba la existencia de cualquier trabajo, incluidos borradores. Ahora solo busca trabajos en estado `publicado`.

**Archivo:** `backend/src/services/oai.service.js`.

---

## 4. Pruebas de carga

### 4.1 Escenarios

Los tres enfoques cubren los roles principales y los endpoints de mayor tráfico:

| Rol | Endpoints |
|---|---|
| Anónimo | catálogo, búsqueda, detalle, comentarios, cita, estadísticas, tutores |
| Repositor/autor | login, borradores propios, notificaciones, perfil, detalle propio |
| Bibliotecario/admin | borradores globales, estudiantes, tutores, cola de revisión, login |
| Flujo de login | bcrypt, limitado a una pequeña proporción del tráfico |

### 4.2 k6

**Escenario:** 5 escenarios simultáneos, hasta 53 VUs, 35 segundos de carga y 5 segundos de rampa de bajada.

| Métrica | Primera ejecución (antes de optimizar búsqueda) | Ejecución final |
|---|---:|---:|
| Peticiones HTTP | 3.949 | 4.295 |
| Throughput | 108,86 req/s | **119,36 req/s** |
| p95 | 167,18 ms | **83,79 ms** |
| p99 | 243,50 ms | 241,54 ms |
| Fallos HTTP | 0 | **0** |
| Iteraciones | 1.986 | 2.166 |
| Checks correctos | — | **5.397/5.397** |

Umbrales configurados y cumplidos: `http_req_failed < 5 %`, `p95 < 1.000 ms`, `p99 < 2.000 ms`, `checks > 98 %`.

**Lectura:** la optimización de búsqueda redujo casi a la mitad el p95 y aumentó el throughput sin tocar los umbrales de error. El p99 se mantiene alrededor de 240 ms, dominado por las consultas más pesadas y la contención de CPU/DB en un único proceso Node.

**Evidencia:** `.local/k6-summary.json`.

### 4.3 Artillery

**Escenario:** 3 fases (calentamiento 3 req/s, carga sostenida 15 req/s, pico 30 req/s), 4 escenarios ponderados y login limitado al 2 % del tráfico.

| Ejecución | Peticiones | HTTP 200 | Usuarios fallidos | p95 | p99 |
|---|---:|---:|---:|---:|---:|
| Pool 5 + login por VU | 1.676 | 1.107 | 569 | 14.048 ms | 14.917 ms |
| Pool 20 + login por VU | 1.431 | 811 | 620 | 12.968 ms | 14.622 ms |
| Pool 20 + tokens reutilizados (antes de búsqueda) | 2.529 | 2.529 | 0 | 1.176 ms | 1.526 ms |
| Pool 20 + tokens reutilizados + búsqueda optimizada | 2.492 | 2.492 | **0** | **92,8 ms** | **159,2 ms** |

**Lectura:**

1. Aumentar el pool de 5 a 20 no resolvió los timeouts porque cada VU ejecutaba un login bcrypt; el costo de CPU de bcrypt era el limitante.
2. Al reutilizar tokens, desaparecieron los usuarios fallidos y el p95 cayó de ~13 s a ~1,2 s.
3. Al optimizar la búsqueda, el p95 cayó otros 12,7× hasta 92,8 ms.

**Evidencia:** `.local/artillery-report.json`, `.local/artillery-report-pool5.json`, `.local/artillery-report-pool20-login.json`, `.local/artillery-report-pool20-tokens.json`.

### 4.4 autocannon

**Escenario:** 20 conexiones concurrentes, 15 segundos por endpoint, ejecución secuencial para no mezclar la contención.

| Endpoint | Antes req/s | Antes p50 | Antes p99 | Después req/s | Después p50 | Después p99 |
|---|---:|---:|---:|---:|---:|---:|
| Catálogo público | 141 | 136 ms | 260 ms | 125 | 147 ms | 296 ms |
| **Búsqueda pública** | **27** | **696 ms** | **1.145 ms** | **96** | **192 ms** | **354 ms** |
| Detalle público | 276 | 68 ms | 177 ms | 276 | 69 ms | 145 ms |
| Comentarios públicos | 260 | 74 ms | 166 ms | 245 | 77 ms | 183 ms |
| Borradores del autor | 154 | 123 ms | 268 ms | 147 | 130 ms | 256 ms |
| Estudiantes (admin) | 379 | 47 ms | 123 ms | 365 | 52 ms | 117 ms |

**Lectura:** la búsqueda era el outlier evidente. Tras la columna generada, su throughput se multiplicó por 3,5 y su latencia mediana se redujo 3,6×. Los demás endpoints se mantuvieron dentro de la variación normal de la máquina local (diferencias de ±10 %).

**Evidencia:** `.local/autocannon.json` (final) y `.local/autocannon-before-search-optimization.json` (antes).

### 4.5 Análisis del cuello de botella

El plan de ejecución de PostgreSQL mostraba que la búsqueda recorría los 400 trabajos publicados y calculaba `to_tsvector('spanish', texto_completo)` dos veces por fila: una para el filtro `@@` y otra para `ts_rank`. Con 500 filas el costo por consulta era de ~44 ms solo en base de datos; con 20 conexiones, la CPU de PostgreSQL se saturaba y el throughput caía a 27 req/s.

La migración `2026111002-add-search-vector.js` añade:

```sql
ALTER TABLE trabajos
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (to_tsvector('spanish', coalesce(texto_completo, ''))) STORED;

CREATE INDEX idx_trabajos_search_vector_gin
ON trabajos USING gin (search_vector);
```

La consulta ahora filtra y ordena usando `search_vector`, y `ts_headline` se calcula solo para las filas devueltas. El índice de expresión anterior se elimina para no duplicar el costo de escritura.

Otros factores identificados:

- **bcrypt en el camino caliente:** un login cuesta ~100 ms de CPU. En pruebas con login por VU, el servidor no podía sostener la tasa de llegada. En producción el login debe ser poco frecuente y estar rate-limited.
- **Pool de conexiones:** con 20 conexiones y consultas lentas, las peticiones se encolan. El pool de 20 es razonable para una instancia pequeña; si se escala horizontalmente, hay que dimensionar también PostgreSQL o usar PgBouncer.
- **Logging HTTP:** morgan agrega overhead por petición; se desactiva en pruebas con `HTTP_LOGGING=false`.
- **Revalidación de JWT:** cada petición autenticada hace una consulta a `usuarios`. Es el precio de invalidar usuarios/roles de inmediato; si el tráfico autenticado crece, se puede cachear con TTL corto.

---

## 5. Regresiones y calidad

| Verificación | Resultado |
|---|---|
| Backend (`npm test -- --runInBand`) | **156/156** pruebas, 14 suites |
| Frontend (`npm test`) | **15/15** pruebas, 4 archivos |
| TypeScript (`npx tsc --noEmit`) | Sin errores |
| Prueba de humo de seguridad | **25/25** comprobaciones |
| k6 | Umbrales cumplidos, 0 fallos |
| Artillery | 0 usuarios fallidos, 0 timeouts |
| autocannon | 0 errores, 0 respuestas non-2xx |

Se añadieron pruebas de regresión para:

- Visibilidad de borradores por rol y propietario.
- Listado y búsqueda que fuerzan `publicado` para anónimos.
- Límite de paginación a 100.
- Edición y borrado por propietario vs. otro autor.
- Cambio de estado por repositor propietario vs. otro autor.
- Escape del término de búsqueda.

**Archivos:** `backend/src/services/trabajo.service.test.js`, `backend/src/services/revision.service.test.js`.

---

## 6. Cómo reproducir

### 6.1 PostgreSQL local

```powershell
# Crear el clúster (solo la primera vez)
& 'C:\Program Files\PostgreSQL\18\bin\initdb.exe' -D .local/pgdata -U postgres -A trust -E UTF8

# Arrancar
& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' -D .local/pgdata -o "-p 55432" -l .local/postgres.log start

# Crear la base
& 'C:\Program Files\PostgreSQL\18\bin\createdb.exe' -h localhost -p 55432 -U postgres unefa_test
```

### 6.2 Migraciones, datos y servidor

```powershell
cd backend
$env:NODE_ENV = 'test'
npx sequelize-cli db:migrate
node scripts/seed-test-data.js
node scripts/start-test-server.js
```

El servidor queda en `http://localhost:5001`. El PID se puede guardar en `.local/server.pid` si se usa el arranque en segundo plano descrito en el repositorio.

### 6.3 Seguridad

```powershell
# Con el servidor local corriendo
node backend/scripts/security-smoke.js
# o, desde backend:
npm run test:security
```

### 6.4 Carga

```powershell
# k6 (requiere k6 en PATH)
$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
k6 run --summary-export=.local/k6-summary.json tests/load/k6/carga.js

# Artillery (obtiene tokens y los inyecta por variables de entorno)
node tests/load/artillery/run.js

# autocannon (6 escenarios secuenciales)
node tests/load/autocannon/run.js
```

Scripts npm añadidos en `backend/package.json`:

```text
npm run seed:test
npm run start:test
npm run test:security
npm run test:load:k6
npm run test:load:artillery
npm run test:load:autocannon
```

---

## 7. Riesgos pendientes y recomendaciones

### 7.1 Dependencias

Se aplicaron actualizaciones dentro del rango y actualizaciones mayores controladas. Estado final de `npm audit`:

| Proyecto | Total | Críticas | Altas | Moderadas | Bajas |
|---|---:|---:|---:|---:|---:|
| Backend | 5 | 0 | 0 | 0 | 5 |
| Frontend | **0** | 0 | 0 | 0 | 0 |

**Backend.** Las 5 bajas restantes son `deepmerge` (prototype poisoning) arrastradas por `jest-config`; afectan únicamente a Jest, no al servidor en ejecución, y no existe versión corregida publicada. Se actualizaron:

- `nodemailer` 8 → 10.5.0 (corrige las vulnerabilidades altas de lectura arbitraria de archivos, SSRF y DoS).
- `uuid` forzado a 11.1.1 mediante `overrides` (Sequelize 6 lo usa para generar UUIDs; verificado con creación real de registros).
- `jest` 30.4.2 → 30.5.2 y `overrides` de `minimatch` 11.0.8 y `glob` 14.0.6 para el tooling de desarrollo.
- `npm audit fix` actualizó además `express`, `body-parser`, `proxy-addr`, `multer`, `joi`, `express-rate-limit` y `axios` dentro de sus rangos, eliminando la crítica de `proxy-addr` y las altas de `multer`, `joi`, `axios`, `follow-redirects` y `form-data`.

**Frontend.** Se actualizaron:

- `zod` 3.25 → 4.6.7 (corrige la alta de agotamiento de memoria).
- `react-router-dom` 6.30 → 7.18.5 (corrige las moderadas de open redirect e inyección en hidratación SSR).
- `vite` 5 → 7.3.8 y `@vitejs/plugin-react` 4 → 5.2.0 (corrigen la alta de `esbuild` y la moderada de `vite`).
- `@hookform/resolvers` 3 → 7.0.6 por compatibilidad con Zod 4.
- `overrides` de `minimatch` 11.0.8 para `@typescript-eslint/typescript-estree` (dev).

**Validación tras las actualizaciones:**

| Verificación | Resultado |
|---|---|
| Backend `npm test -- --runInBand` | 156/156 |
| Frontend `npm test` | 15/15 |
| Frontend `npx tsc --noEmit` | Sin errores |
| Frontend `npm run build` | Correcto (Vite 7.3.8) |
| Frontend `npm run lint` | 0 errores (19 warnings preexistentes) |
| `npx sequelize-cli db:migrate` y `db:migrate:status` | Correctos |
| Smoke de seguridad | 25/25 |
| autocannon (10 s) | catálogo 124 req/s, búsqueda 103 req/s, 0 non-2xx |

No se usó `npm audit fix --force`: las actualizaciones mayores se hicieron una por una y se validaron con las suites, el build y el smoke.

### 7.2 Rate limiting en múltiples instancias

El limitador usa el almacén en memoria por defecto. Si Render ejecuta más de una instancia, cada una tendrá su propio contador. Para producción horizontal se recomienda un almacén compartido (Redis) o limitar en el proxy/CDN.

### 7.3 `trust proxy`

`TRUST_PROXY_HOPS` debe coincidir con la topología real. Si se configura mal:

- En un valor demasiado bajo, todos los clientes parecen venir del proxy y comparten el rate limit.
- En un valor demasiado alto, un cliente podría falsificar `X-Forwarded-For`.

En local se deja desactivado; en producción Render usa un salto.

### 7.4 Cookies y CSRF

El token se guarda en cookie `httpOnly`, `sameSite=strict` y `secure` en producción. Eso mitiga CSRF en navegación same-site. Si en el futuro se sirve el frontend en otro dominio, hará falta un token CSRF explícito o mantener el uso de `Authorization: Bearer`.

### 7.5 Archivos locales

`/local-files` solo se monta cuando `CLOUDINARY_MODE=local`. Asegurar que producción use `CLOUDINARY_MODE=cloudinary`; de lo contrario, los PDFs quedarían en el disco efímero de Render y serían públicos sin control adicional.

### 7.6 SSE y conexiones largas

Las notificaciones usan Server-Sent Events. Cada cliente mantiene una conexión abierta; los timeouts de proxy y el número máximo de conexiones deben dimensionarse. Se recomienda enviar heartbeats periódicos y limitar conexiones por usuario si el tráfico crece.

### 7.7 Búsqueda y crecimiento de datos

La columna generada mantiene el costo de escritura (se recalcula al insertar/actualizar `texto_completo`) pero elimina el costo de lectura. Con millones de documentos, evaluar:

- Índice GIN con `fastupdate` y monitoreo de bloat.
- Búsqueda con `websearch_to_tsquery` o un motor dedicado (OpenSearch/Meilisearch) si se requieren sinónimos, tolerancia a errores o facetas complejas.
- Particionado por año o estado si el catálogo crece mucho.

### 7.8 Revalidación de JWT

La consulta a `usuarios` por petición autenticada es intencional para revocar accesos de inmediato. Si se vuelve un cuello de botella, cachear el usuario/rol con TTL de 30–60 segundos y invalidar explícitamente al desactivar un usuario.

---

## 8. Índice de evidencia

| Archivo | Contenido |
|---|---|
| `.local/security-smoke.json` | 25 comprobaciones de seguridad con estado y detalle |
| `.local/k6-summary.json` | Métricas finales de k6 |
| `.local/artillery-report.json` | Reporte final de Artillery |
| `.local/artillery-report-pool5.json` | Artillery con pool 5 y login por VU (569 fallos) |
| `.local/artillery-report-pool20-login.json` | Artillery con pool 20 y login por VU (620 fallos) |
| `.local/artillery-report-pool20-tokens.json` | Artillery con tokens reutilizados, antes de optimizar búsqueda |
| `.local/autocannon.json` | autocannon final por endpoint |
| `.local/autocannon-before-search-optimization.json` | autocannon antes de la columna `search_vector` |
| `.local/audit-backend.json` | `npm audit` del backend (estado inicial) |
| `.local/audit-frontend.json` | `npm audit` del frontend (estado inicial) |
| `.local/audit-backend-final.json` | `npm audit` final del backend: 5 bajas (Jest) |
| `.local/audit-frontend-final.json` | `npm audit` final del frontend: 0 |
| `.local/server.out.log`, `.local/server.err.log` | Logs del servidor local |
| `.local/postgres.log` | Log del clúster PostgreSQL |

---

## 9. Conclusión

El entorno local permitió reproducir los problemas de seguridad y los cuellos de botella de carga sin tocar producción. Las correcciones de autorización, visibilidad y PII cierran los riesgos más graves; la prueba de humo de 25 comprobaciones y las 171 pruebas automatizadas (156 backend + 15 frontend) dan una red de seguridad para seguir iterando.

En rendimiento, el cambio de mayor impacto fue identificar que la búsqueda full-text era CPU-bound en PostgreSQL y reemplazar el cálculo repetido de `to_tsvector()` por una columna generada. Con eso, el p95 de Artillery bajó de 1.176 ms a 92,8 ms y la búsqueda de autocannon pasó de 27 a 96 req/s. Las dependencias quedaron saneadas: 0 vulnerabilidades en frontend y 5 avisos bajos de Jest en backend, sin afectar al runtime. Si el despliegue escala horizontalmente, el siguiente paso es mover el rate limiting a un almacén compartido.
