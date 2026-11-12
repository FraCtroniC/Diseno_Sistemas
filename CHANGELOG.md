# Changelog

**Nota metodológica:** este changelog se reconstruyó desde `git log`. El repositorio **no usa versiones semánticas ni etiquetas (`tags`)**. Los hitos se agrupan por fecha y por funcionalidad, no por número de versión.

**Último commit de código:** `2f8b0a9` · 11 de noviembre de 2026.
**Documentación:** commit de cierre de la misma fecha.

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

## Estado de pruebas en el último snapshot

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
