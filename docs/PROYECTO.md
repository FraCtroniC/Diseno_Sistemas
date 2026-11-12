# Proyecto: Repositorio Digital UNEFA Táchira

Documento de definición del proyecto para evaluación académica. Describe el problema, los objetivos, los actores, el alcance comprometido y lo que queda explícitamente fuera de alcance.

> **Regla de este documento:** ninguna afirmación se da por confirmada si no tiene una fuente verificable. Los campos que dependen de información académica no disponible se marcan como **pendientes**, no se completan por suposición.

---

## 1. Ficha de identificación

| Campo | Valor | Estado |
|---|---|---|
| Nombre del sistema | Repositorio Digital UNEFA Táchira | Confirmado |
| Institución | UNEFA Núcleo Táchira | Confirmado |
| Tipo de proyecto | Proyecto académico de desarrollo de software | Inferido; confirmar con la asignatura |
| Repositorio de código | `https://github.com/FraCtroniC/Dise-o_Sistemas.git` | Confirmado |
| Versión evaluada | Commit `2f8b0a9` (código) + commit de cierre documental | Confirmado |
| Fecha de última actualización | 11 de noviembre de 2026 | Confirmado en Git |
| Autor registrado en Git | `Fabián <elbowe277@gmail.com>` | Confirmado |
| Lista completa de autores | — | **Pendiente de confirmar** |
| Profesor / evaluador | — | **Pendiente de confirmar** |
| Asignatura | — | **Pendiente de confirmar** |
| Fecha de entrega | — | **Pendiente de confirmar** |

**Nota:** el repositorio no contiene un documento formal de rúbrica, carta de alcance ni acta de entrega. La línea base de requisitos se reconstruyó desde `frontend/AGENT.md`, `backend/AGENT.md`, el `README.md` original y el informe de pruebas de carga y seguridad. Esta reconstrucción se declara en la sección 8.

## 2. Problema que resuelve

La producción académica e institucional de la UNEFA Núcleo Táchira (trabajos de grado, tesis, normativas, boletines, libros y recursos educativos) tiende a dispersarse en archivos locales, correos y carpetas sin un ciclo de vida común. Esa dispersión produce cuatro problemas:

1. **Consulta difícil:** no existe un catálogo único con búsqueda por texto, año, carrera, tipo de documento y categoría.
2. **Publicación sin control:** no hay un flujo explícito que distinga borrador, revisión y publicación, ni roles que autoricen cada transición.
3. **Pérdida de trazabilidad:** no queda registro de quién revisó, cuándo cambió el estado o qué versión se publicó.
4. **Exposición de información:** sin controles de acceso, los borradores y los datos personales de estudiantes y tutores pueden quedar visibles públicamente.

El sistema aborda esos problemas con un repositorio full-stack que centraliza el registro, la revisión, la publicación y la consulta, con autenticación, roles, historial de versiones y controles de seguridad.

## 3. Objetivos

### 3.1 Objetivo general

Implementar un repositorio digital full-stack que permita registrar, revisar, publicar y consultar la producción académica e institucional de la UNEFA Núcleo Táchira, con roles diferenciados, trazabilidad de estados y acceso controlado.

### 3.2 Objetivos específicos

1. Autenticar usuarios y autorizar operaciones según rol.
2. Registrar trabajos con metadatos descriptivos, palabras clave y archivo PDF.
3. Catalogar y buscar trabajos por texto, año, categoría, carrera y tipo de documento.
4. Gestionar el ciclo de vida del trabajo: borrador, en revisión, publicado y archivado.
5. Administrar usuarios, carreras, tutores, estudiantes, categorías y documentos institucionales.
6. Generar estadísticas de producción, visitas y descargas.
7. Permitir la citación de documentos en formatos APA, BibTeX y RIS.
8. Exponer los metadatos publicados mediante OAI-PMH, RSS y Atom.
9. Proteger borradores, datos personales y operaciones sensibles.
10. Documentar el estado real, las evidencias y las brechas del proyecto.

## 4. Actores y roles

| Actor | Tipo | Qué puede hacer |
|---|---|---|
| Visitante anónimo | Usuario no autenticado | Consultar catálogo y detalle de trabajos publicados, buscar, leer comentarios, descargar archivos publicados, consultar citas y estadísticas públicas |
| `repositor` | Rol de acceso | Crear, editar y eliminar sus propios trabajos, enviarlos a revisión, gestionar sus borradores, comentar y consultar versiones |
| `bibliotecario` | Rol de acceso | Ver la cola de revisión, editar trabajos, publicar trabajos o devolverlos a borrador; consultar estudiantes y tutores |
| `admin` | Rol de acceso | Gestionar usuarios, carreras, tutores, estudiantes y categorías; editar, eliminar, publicar, devolver o archivar trabajos; ver estadísticas globales |
| Estudiante | Entidad de datos | Autor o coautor registrado en un trabajo. **No es un rol de inicio de sesión** |
| Docente / Tutor | Entidad de datos | Tutor académico o industrial registrado en un trabajo. **No es un rol de inicio de sesión** |

**Brecha declarada:** `frontend/AGENT.md` menciona perfiles “Administrador, Docente, Estudiante”. La implementación usa roles de repositorio (`admin`, `repositor`, `bibliotecario`) y trata a docentes y estudiantes como entidades de datos. La diferencia es real y se registra en [`TRAZABILIDAD.md`](TRAZABILIDAD.md#2-requisitos-funcionales).

## 5. Alcance

### 5.1 Alcance incluido y entregado

| Módulo | Qué incluye | Estado |
|---|---|---|
| Acceso y usuarios | Registro, login, logout, perfil, recuperación de contraseña, roles y estado activo | ✅ Implementado |
| Producción académica | Registro de metadatos, carga de PDF, catálogo, búsqueda y detalle | ✅ Implementado |
| Flujo de revisión | Transiciones de estado, comentario de revisión, historial y notificaciones in-app | ✅ Implementado |
| Documentación institucional y normativa | Tipo de documento `normativas`, catálogo y conteo de normativas publicadas | 🟡 Parcial: sin módulo dedicado de vigencia/versionado normativo |
| Editorial y divulgación | Tipos `editorial` y `divulgacion` dentro del flujo general | 🟡 Parcial: sin flujo editorial dedicado con ISBN/ISSN obligatorio |
| Comentarios | Comentarios con calificación; edición y eliminación solo por su autor | ✅ Implementado |
| Versiones | Historial de versiones y restauración por admin/repositor | ✅ Implementado |
| Citas | APA, BibTeX y RIS | ✅ Implementado |
| Estadísticas | Vistas, descargas, producción por categoría, usuarios y top de trabajos | ✅ Implementado |
| Interoperabilidad | OAI-PMH 2.0, RSS 2.0 y Atom | ✅ Implementado |
| Seguridad | IDOR, PII, inyección SQL, JWT, rate limiting, validación de PDF y paginación | ✅ Verificado con 25/25 comprobaciones |
| Documentación | README, estado, trazabilidad, evidencias, demo y changelog | ✅ Este paquete |

### 5.2 Fuera de alcance o no comprometido

Estos elementos **no forman parte de la entrega actual**. No deben presentarse como implementados:

| Elemento | Motivo |
|---|---|
| Aplicación móvil nativa | No estaba en la especificación original |
| SSO / LDAP / directorio institucional | No estaba en la especificación original |
| Correo transaccional en cada cambio de revisión | Solo existe correo para recuperación de contraseña; las notificaciones de revisión son in-app |
| Firma digital o verificación de integridad del PDF | No estaba en la especificación original |
| OCR o búsqueda dentro de PDF escaneados | La búsqueda usa el texto extraíble del PDF, no OCR |
| Multi-sede o multi-institución | El modelo está pensado para UNEFA Núcleo Táchira |
| Integración con repositorios externos más allá de OAI-PMH | No estaba en la especificación original |
| Roles de acceso “Docente” y “Estudiante” | La implementación usa `admin`, `repositor`, `bibliotecario` |
| Módulo normativo con control de vigencia y derogación | Solo existe el tipo de documento y una estadística |
| Flujo editorial con ISBN/ISSN obligatorio | Los campos existen en metadatos, pero no hay flujo dedicado |
| Términos y condiciones, política de privacidad formal | No hay documentos legales en el repositorio |
| Licencia de uso | No hay archivo `LICENSE`; `backend/package.json` declara ISC. Confirmar antes de reutilizar |

## 6. Criterios de éxito

Se considera que la entrega cumple si un evaluador puede verificar todo lo siguiente:

1. Levantar backend y frontend siguiendo únicamente el `README.md`.
2. Ejecutar las suites y obtener **156/156** pruebas backend y **15/15** frontend.
3. Ejecutar `npx tsc --noEmit` sin errores.
4. Ejecutar la prueba de humo de seguridad y obtener **25/25**.
5. Encontrar cada requisito de la línea base en `docs/TRAZABILIDAD.md`, con implementación, evidencia y estado.
6. Identificar sin ambigüedad lo que está pendiente o fuera de alcance.
7. Ejecutar la demo de 10 minutos con datos sembrados.
8. No encontrar contradicciones entre README, estado, trazabilidad y evidencias.
9. No encontrar secretos reales en el repositorio.

## 7. Supuestos y restricciones

1. **Línea base reconstruida:** `backend/AGENT.md` está incompleto (solo llega a la Fase 1.3). Los requisitos backend posteriores se derivaron del código, las rutas, las pruebas y el informe de seguridad.
2. **Sin rúbrica formal:** no se proporcionó el documento de evaluación del curso. Los criterios de éxito son los de este documento, no una rúbrica externa.
3. **Roles:** “Docente” y “Estudiante” se interpretaron como entidades académicas, no como roles de autenticación. La decisión se documenta como brecha, no como cumplimiento.
4. **Estado “Validado”:** la especificación frontend menciona “Borrador, Validado, Publicado”. La implementación usa `borrador`, `en_revision`, `publicado`, `archivado`. “Validado” se corresponde con el paso por revisión antes de `publicado`.
5. **Cronología:** las fechas provienen de Git. No existen etiquetas ni versiones semánticas.
6. **Snapshot:** las pruebas se ejecutaron el 11 de noviembre de 2026 sobre el código confirmado en `2f8b0a9`, que incluye los tres cambios de frontend. Los resultados reflejan ese commit.
7. **Demo desplegada:** `frontend/vercel.json` apunta a `https://diseno-sistemas.onrender.com`, pero no se verificó su disponibilidad ni sus tiempos de arranque en frío.
8. **Datos académicos:** autores, profesor, asignatura y fecha de entrega no están confirmados y no se inventan.

## 8. Riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| R-01 | Dependencias con vulnerabilidades conocidas (13 backend, 8 frontend) | Alta | Alto | Actualizar por lotes con las suites como red de seguridad; revisar `npm audit` antes de producción |
| R-02 | Ausencia de CI/CD | Alta | Medio | Añadir GitHub Actions con tests, tipo, build y lint |
| R-03 | Rate limiting en memoria en múltiples instancias | Media | Medio | Usar Redis o limitar en el proxy/CDN |
| R-04 | Arranque en frío de Render durante la demo | Media | Medio | Demo local; warm-up previo; plan de contingencia |
| R-05 | SMTP no configurado | Media | Bajo | Solo afecta recuperación de contraseña; documentar y probar con anticipación |
| R-06 | Metadatos académicos incompletos | Alta | Alto | Completar la ficha antes de la entrega |
| R-07 | Cambios locales sin confirmar en futuras entregas | Media | Medio | Revisar `git status` y confirmar antes de etiquetar la entrega |
| R-08 | Especificación backend incompleta | Alta | Medio | Línea base reconstruida y supuestos declarados |
| R-09 | Brecha entre roles especificados e implementados | Media | Alto | Documentar; decidir si se implementan “Docente” y “Estudiante” |
| R-10 | Bundle único de ~1,35 MB | Media | Bajo | Code splitting y carga diferida |
| R-11 | Sin auditoría de accesos por usuario | Media | Medio | Registrar login, cambios de rol y cambios de estado |
| R-12 | Dependencia de Cloudinary en producción | Media | Medio | Modo local para pruebas; respaldo de archivos y configuración |
| R-13 | Las relaciones académicas (`carrera_id`, `tutor_id`, `estudiante_id`) no se asignan desde la API | Alta | Medio | Declararlas en el modelo `Trabajo` y exponerlas en creación/edición (G-15) |

## 9. Glosario

| Término | Definición |
|---|---|
| **Repositorio digital** | Sistema que almacena, describe, preserva y da acceso a documentos digitales |
| **OAI-PMH** | Protocolo de interoperabilidad para cosechar metadatos de repositorios |
| **SSE** | Server-Sent Events; canal unidireccional servidor → navegador usado para notificaciones |
| **JWT** | JSON Web Token; credencial firmada usada para autenticar solicitudes |
| **PII** | Información personal identificable (cédula, teléfono, correo) |
| **Seed** | Datos iniciales insertados en la base de datos para desarrollo o demo |
| **Snapshot** | Estado del repositorio en un commit y fecha determinados |
| **Borrador** | Trabajo no visible públicamente, editable por su autor |
| **En revisión** | Trabajo enviado a la cola de revisión |
| **Publicado** | Trabajo visible en el catálogo público |
| **Archivado** | Trabajo retirado del catálogo público por administración |

## 10. Fuentes de la línea base

| Fuente | Uso |
|---|---|
| `frontend/AGENT.md` | Requisitos funcionales, stack, convenciones y prioridades del frontend |
| `backend/AGENT.md` | Reglas de desarrollo y configuración base del backend (incompleto) |
| `README.md` original | Funcionalidad declarada y stack (desactualizado) |
| `docs/informe-pruebas-carga-seguridad.md` | Hallazgos de seguridad, pruebas de carga y riesgos pendientes |
| `backend/package.json`, `frontend/package.json` | Versiones, scripts y rango de Node |
| `git log` | Cronología y autores |
| Código, rutas y pruebas | Verificación de lo realmente implementado |
