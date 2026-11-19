# Evidencias y reproducibilidad

Este documento registra **qué se ejecutó, con qué comando, qué resultado se obtuvo y dónde está el artefacto**. No incluye resultados estimados ni pruebas que no se hayan ejecutado.

**Snapshot:** commit `2f8b0a9` · 11 de noviembre de 2026, más la actualización del catálogo académico del 18 de noviembre de 2026.
**Entorno de ejecución:** Windows, Node.js `v24.13.0`, npm `11.14.0`.

---

## 1. Resumen de evidencias

| ID | Verificación | Resultado | Artefacto / ubicación |
|---|---|---|---|
| E-01 | Pruebas backend | 198/198 en 19 suites | Salida de consola; `backend/src/**/*.test.js` |
| E-02 | Pruebas frontend | 22/22 en 6 archivos | Salida de consola; `frontend/src/**/*.test.{ts,tsx}` |
| E-03 | TypeScript | Sin errores | Salida de `npx tsc --noEmit` |
| E-04 | Build de producción | Correcto, con aviso de chunk | `frontend/dist/` |
| E-05 | Lint | 0 errores, 18 advertencias | Salida de `npm run lint` |
| E-06 | Prueba de humo de seguridad | 25/25 | `.local/security-smoke.json` |
| E-07 | Carga k6 | 4.295 peticiones, 119,36 req/s, p95 83,79 ms, 0 fallos | `.local/k6-summary.json` |
| E-08 | Carga Artillery | 2.492 peticiones, 0 fallidos, p95 92,8 ms | `.local/artillery-report.json` |
| E-09 | Carga autocannon | Búsqueda: 96 req/s, p50 192 ms, p99 354 ms | `.local/autocannon.json` |
| E-10 | Auditoría de dependencias | 13 backend, 8 frontend | `.local/audit-backend.json`, `.local/audit-frontend.json` |
| E-11 | Informe consolidado | Informe de carga y seguridad | `docs/informe-pruebas-carga-seguridad.md` |
| E-12 | Historial de cambios | 22 commits al cierre: 21 de código + 1 de documentación | `git log` |
| E-13 | Migración del catálogo académico | 6 carreras, 7 categorías, 18/18 trabajos con `carrera_id`, 0 con `metadatos.carrera` | Consulta de verificación sobre Neon; migración `2026111801-carreras-unefa-y-categorias-tematicas.js` |
| E-14 | Limpieza del esquema legacy | 12 tablas, 0 secuencias, datos de la app intactos; backend 193/193 y frontend 15/15 (snapshot previo al posgrado) | `.local/backup-legacy-2026-11-18.sql`; `CHANGELOG.md` |
| E-15 | Integración del posgrado | 3 niveles, 11 programas, `GET /niveles-academicos` y `GET /carreras?nivel=` | `backend/database/catalogo-academico.js`; migración `2026111802-crear-niveles-academicos-y-posgrado.js`; `backend/src/routes/api.test.js` |
| E-16 | Vistas de posgrado en el catálogo | 4 pruebas: postgrado, maestrías, doctorados y filtro por programa | `frontend/src/test/Catalog.test.tsx` |

---

## 2. Detalle de las evidencias ejecutadas

### E-01 — Pruebas backend

**Comando:**

```bash
cd backend
npm test -- --runInBand
```

**Resultado:**

```text
Test Suites: 19 passed, 19 total
Tests:       193 passed, 193 total
Snapshots:   0 total
Time:        4.251 s
```

**Interpretación:** las 19 suites de servicios, middlewares y API pasan. La duración depende de la máquina. La ejecución no requirió un PostgreSQL local activo en el puerto `55432`; la suite de API usa configuración de test y mocks. La prueba de humo de seguridad sí requiere base de datos y servidor.

**Cobertura de archivos:** `backend/src/middlewares/error.middleware.test.js`, `role.middleware.test.js`, `upload.middleware.test.js`, `backend/src/routes/api.test.js`, `backend/src/services/auth.service.test.js`, `carrera.service.test.js`, `categoria.service.test.js`, `cloudinary.service.test.js`, `comentario.service.test.js`, `estadistica.service.test.js`, `notificacion.service.test.js`, `pdf.service.test.js`, `revision.service.test.js`, `trabajo.service.test.js`, `usuario.service.test.js`.

### E-02 — Pruebas frontend

**Comando:**

```bash
cd frontend
npm test
```

**Resultado:**

```text
Test Files  4 passed (4)
Tests       15 passed (15)
Duration    23.29s
```

**Archivos de prueba:** `frontend/src/components/ui/PDFViewer.test.tsx`, `frontend/src/services/api.test.ts`, `frontend/src/test/ProtectedRoute.test.tsx`, `frontend/src/utils/pdfValidation.test.ts`.

### E-03 — TypeScript

**Comando:**

```bash
cd frontend
npx tsc --noEmit
```

**Resultado:** sin salida, código de salida 0.

**Interpretación:** no hay errores de tipado en el frontend.

### E-04 — Build de producción

**Comando:**

```bash
cd frontend
npm run build
```

**Resultado relevante:**

```text
✓ 849 modules transformed.
dist/index.html                 0.72 kB │ gzip:   0.39 kB
dist/assets/index-Ckv_A-3f.css  58.35 kB │ gzip:  10.21 kB
dist/assets/index-CWoAaHVy.js  1,354.66 kB │ gzip: 397.90 kB
✓ built in 10.88s
```

**Advertencia:** Vite reporta un chunk mayor a 500 kB. No es un fallo de build; es deuda de rendimiento (G-05). La duración varía según la máquina. El artefacto queda en `frontend/dist/`.

### E-05 — Lint

**Comando:**

```bash
cd frontend
npm run lint
```

**Resultado:**

```text
18 problems (0 errors, 18 warnings)
```

**Interpretación:** no hay errores bloqueantes. Las advertencias son deuda de calidad; no se corrigieron en esta auditoría para no alterar el comportamiento.

### E-06 — Prueba de humo de seguridad

**Comando (con PostgreSQL y servidor de pruebas en ejecución):**

```powershell
node backend/scripts/security-smoke.js
# o, desde backend:
npm run test:security
```

**Resultado registrado en el artefacto:**

```json
{
  "fecha": "2026-11-11T03:15:32.467Z",
  "base": "http://localhost:5001",
  "total": 25,
  "correctos": 25,
  "fallos": 0
}
```

**Interpretación:** las 25 comprobaciones de seguridad pasan en el entorno local aislado. **No se repitió esta prueba en la sesión de documentación**; se cita el artefacto existente. Para la entrega final debe repetirse sobre el commit definitivo.

**Comprobaciones incluidas:** login admin, bloqueo de usuario inactivo, rechazo de token de usuario desactivado, protección de estudiantes, tutores sin PII, catálogo anónimo solo con publicados, bloqueo de filtro de borradores, detalle anónimo de borrador oculto, subrecursos de borrador ocultos, edición/borrado/cambio de estado de trabajo ajeno bloqueado, búsqueda resistente a inyección SQL, cabeceras de rate limit, cuerpo JSON demasiado grande rechazado, archivo con cabecera PDF falsa rechazado, límite de paginación, OAI sin borradores, entre otras.

### E-07 — Carga con k6

**Comando:**

```bash
npm run test:load:k6
# equivale a:
k6 run --summary-export=.local/k6-summary.json tests/load/k6/carga.js
```

**Resultado final del informe:**

| Métrica | Valor |
|---|---|
| Peticiones HTTP | 4.295 |
| Throughput | 119,36 req/s |
| p95 | 83,79 ms |
| p99 | 241,54 ms |
| Fallos HTTP | 0 |
| Iteraciones | 2.166 |
| Checks correctos | 5.397/5.397 |

**Artefacto:** `.local/k6-summary.json`.

### E-08 — Carga con Artillery

**Comando:**

```bash
npm run test:load:artillery
# equivale a:
node tests/load/artillery/run.js
```

**Resultado final del informe (pool 20 + tokens reutilizados + búsqueda optimizada):**

| Métrica | Valor |
|---|---|
| Peticiones | 2.492 |
| HTTP 200 | 2.492 |
| Usuarios fallidos | 0 |
| p95 | 92,8 ms |
| p99 | 159,2 ms |

**Artefacto:** `.local/artillery-report.json`.

**Nota:** las ejecuciones anteriores con login por usuario virtual tuvieron fallos (569 y 620) por el coste de bcrypt. El escenario final reutiliza tokens y es el que se reporta como válido.

### E-09 — Carga con autocannon

**Comando:**

```bash
npm run test:load:autocannon
# equivale a:
node tests/load/autocannon/run.js
```

**Resultado final por endpoint:**

| Endpoint | req/s | p50 | p99 |
|---|---:|---:|---:|
| Catálogo público | 125 | 147 ms | 296 ms |
| Búsqueda pública | 96 | 192 ms | 354 ms |
| Detalle público | 276 | 69 ms | 145 ms |
| Comentarios públicos | 245 | 77 ms | 183 ms |
| Borradores del autor | 147 | 130 ms | 256 ms |
| Estudiantes (admin) | 365 | 52 ms | 117 ms |

**Artefacto:** `.local/autocannon.json`. La comparación antes/después de la optimización de búsqueda está en `.local/autocannon-before-search-optimization.json` y `.local/autocannon-search-after.json`.

### E-10 — Auditoría de dependencias

**Comando:**

```bash
cd backend && npm audit --json > ../.local/audit-backend.json
cd ../frontend && npm audit --json > ../.local/audit-frontend.json
```

**Resultado del informe:**

| Proyecto | Total | Críticas | Altas | Moderadas | Bajas |
|---|---:|---:|---:|---:|---:|
| Backend | 13 | 1 | 5 | 6 | 1 |
| Frontend | 8 | 0 | 5 | 3 | 0 |

**Interpretación:** no se aplicaron actualizaciones mayores para evitar regresiones en Express 5, React Router o la integración de PDFs. Es deuda pendiente (G-03).

### E-11 — Informe consolidado

`docs/informe-pruebas-carga-seguridad.md` contiene el detalle de entorno, hallazgos, correcciones, escenarios de carga, regresiones y riesgos pendientes. Es la fuente principal de E-06 a E-10.

### E-12 — Historial de cambios

**Comando:**

```bash
git log --pretty=format:"%h|%ad|%s" --date=short
```

**Resultado:** 22 commits al cierre documental: 21 de código entre el 10 de junio y el 11 de noviembre de 2026, más el commit de documentación de esta misma fecha. La reconstrucción por hitos está en [`CHANGELOG.md`](../CHANGELOG.md).

### E-13 — Migración del catálogo académico

**Comando:**

```powershell
cd backend
npm run db:migrate
```

**Verificación sobre la base actual (Neon, 2026-11-18):**

| Comprobación | Resultado |
|---|---|
| Carreras en el catálogo | 6 |
| Categorías temáticas | 7 |
| Trabajos con `carrera_id` | 18/18 |
| Trabajos con `metadatos.carrera` | 0 |
| Trabajos sin carrera | 0 |

La migración `2026111801-carreras-unefa-y-categorias-tematicas.js` reutiliza los IDs de las cinco categorías existentes, agrega las dos categorías temáticas faltantes, crea las seis carreras y rellena `carrera_id` antes de aplicar `SET NOT NULL`. Las categorías temáticas y el catálogo de carreras quedan separados.

### E-14 — Limpieza del esquema legacy

**Respaldo:** `pg_dump` sobre las 10 tablas legacy con el `DATABASE_URL` de `backend/.env`, opciones `--table=… --column-inserts --no-owner --no-privileges`. Salida: `.local/backup-legacy-2026-11-18.sql` (21 868 bytes; 10 `CREATE TABLE` y 7 `INSERT`). Archivo ignorado por Git.

**Borrado:** `DROP TABLE IF EXISTS public.<tabla>` en una sola transacción, sin `CASCADE`, en orden de dependencias: `access_logs`, `files`, `normatives_manuals`, `statistics_reports`, `work_identifiers`, `submissions`, `works`, `collections`, `communities`, `users`.

**Verificación sobre Neon (2026-11-18):**

| Comprobación | Resultado |
|---|---|
| Tablas en `public` | 12: solo el esquema Sequelize |
| Secuencias en `public` | 0 |
| Datos de la app | `usuarios` 4, `trabajos` 18, `carreras` 6, `categorias` 7, `comentarios` 5, `notificaciones` 7, `revisiones` 5, `versiones` 5, `visitas` 252 |
| Backend | 193/193 en 19 suites |
| Frontend | 15/15 en 4 archivos |
| Smoke de seguridad | No repetido: PostgreSQL local en `55432` no disponible. Último resultado 25/25 en `.local/security-smoke.json` |

> **Tras la integración del posgrado (2026-11-19):** la migración `2026111802-crear-niveles-academicos-y-posgrado.js` **ya se ejecutó en Neon** (`db:migrate:status` → `up`). El catálogo quedó con 3 niveles y 11 programas (6 pregrado, 3 maestría, 2 doctorado) y los 18 trabajos originales siguen intactos. `GET /trabajos`, `GET /carreras` y `GET /niveles-academicos` responden 200. Las suites vigentes son **198/198** en backend (E-01) y **22/22** en 6 archivos de frontend (E-02).

---

## 3. Cómo reproducir el entorno de pruebas

### 3.1 PostgreSQL local aislado

```powershell
# Crear el clúster (solo la primera vez)
& 'C:\Program Files\PostgreSQL\18\bin\initdb.exe' -D .local/pgdata -U postgres -A trust -E UTF8

# Arrancar en el puerto 55432
& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' -D .local/pgdata -o "-p 55432" -l .local/postgres.log start

# Crear la base
& 'C:\Program Files\PostgreSQL\18\bin\createdb.exe' -h localhost -p 55432 -U postgres unefa_test
```

### 3.2 Migraciones, datos y servidor

```powershell
cd backend
$env:NODE_ENV = 'test'
npx sequelize-cli db:migrate
node scripts/seed-test-data.js
node scripts/start-test-server.js
```

El servidor de pruebas queda en `http://localhost:5001`.

### 3.3 Seguridad

```powershell
# Desde la raíz, con el servidor anterior corriendo
node backend/scripts/security-smoke.js

# O desde backend
cd backend
npm run test:security
```

### 3.4 Carga

```powershell
# k6 (requiere k6 en PATH)
$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
k6 run --summary-export=.local/k6-summary.json tests/load/k6/carga.js

# Artillery
node tests/load/artillery/run.js

# autocannon
node tests/load/autocannon/run.js
```

---

## 4. Ubicación y conservación de las evidencias

`.local/` está incluido en `.gitignore`. Por lo tanto:

- Los artefactos **no viajan con un clon del repositorio**.
- El informe `docs/informe-pruebas-carga-seguridad.md` sí está versionado y resume los resultados.
- Para una entrega formal, se recomienda adjuntar los archivos `.local/security-smoke.json`, `.local/k6-summary.json`, `.local/artillery-report.json`, `.local/autocannon.json` y `.local/audit-*.json` como anexos, o copiar una versión sanitizada a una carpeta versionada.

**Advertencia de seguridad:** `.local/load-tokens.json` contiene tokens JWT de prueba. No debe publicarse ni adjuntarse sin depurarlos.

---

## 5. Qué no se verificó

Para evitar que el evaluador asuma coberturas inexistentes:

| Elemento | Estado | Motivo |
|---|---|---|
| Disponibilidad de `https://diseno-sistemas.onrender.com` | No verificada | No se accedió al despliegue durante la auditoría |
| Envío real de correo SMTP | No verificado | Requiere credenciales y proveedor configurados |
| Subida real a Cloudinary | No verificada | El entorno local usa `CLOUDINARY_MODE=local` |
| Recorrido manual completo en navegador | No ejecutado en esta sesión | Se verificaron build, tipos, pruebas y código |
| Auditoría de accesibilidad | No ejecutada | No hay herramienta ni criterio definido |
| Copias de seguridad y restauración | No verificadas | No hay procedimiento documentado |
| CI/CD | No existe | No hay pipeline en el repositorio |
| Prueba de humo de seguridad sobre el commit final | No repetida | El backend no cambió desde `b807b68`; el artefacto existente sigue siendo la referencia |

---

## 6. Integridad de este documento

- Los resultados de E-01 a E-05 se obtuvieron el 11 de noviembre de 2026 en el entorno indicado.
- E-06 a E-10 se citan del informe y de los artefactos locales existentes; no se reejecutaron en la sesión de documentación.
- No se incluyen credenciales reales, tokens ni secretos.
- Las credenciales de prueba del informe son datos sintéticos de un entorno local aislado.
- Si cambia el commit o el árbol de trabajo, este documento debe actualizarse y las pruebas deben repetirse.
