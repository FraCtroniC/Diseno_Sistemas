# Guion de demostración

**Duración objetivo:** 10 minutos.
**Audiencia:** profesor/evaluador académico.
**Objetivo:** mostrar el flujo completo —consulta → carga → revisión → publicación— y cerrar con las evidencias verificables.

> **Regla:** la demo muestra lo que el sistema hace hoy. No se presentan como implementadas las funciones que están pendientes o fuera de alcance.

---

## 1. Qué se va a demostrar

| Minuto | Bloque | Qué prueba |
|---|---|---|
| 0:00–0:45 | Contexto | Problema, alcance y estado real |
| 0:45–2:00 | Catálogo público | Búsqueda, filtros, detalle, citas y comentarios |
| 2:00–3:45 | Rol `repositor` | Carga de metadatos y PDF; envío a revisión |
| 3:45–5:15 | Rol `bibliotecario` | Cola de revisión; aprobación y publicación |
| 5:15–6:15 | Notificación y verificación pública | Notificación in-app y trabajo visible |
| 6:15–7:45 | Rol `admin` | Panel de control, estadísticas y usuarios |
| 7:45–8:45 | Interoperabilidad | OAI-PMH y RSS |
| 8:45–10:00 | Evidencias y cierre | Pruebas, trazabilidad y límites |

## 2. Preparación previa

### 2.1 Requisitos

- Node.js `>=20.16 <21` o `>=22.3`.
- PostgreSQL en ejecución.
- Un PDF válido de menos de 10 MB para la carga.
- Navegador actualizado.

### 2.2 Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

En `backend/.env`, definir al menos:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/unefa
JWT_SECRET=una_clave_larga_y_aleatoria
ADMIN_PASSWORD=Demo1234!
```

Luego:

```powershell
npm run db:migrate
npm run db:seed
npm run dev
```

Verificar que `http://localhost:5000/health` responda.

> Si la base ya tiene datos, **no volver a sembrar**. Verificar el login del admin y crear los usuarios de demo desde el panel.

### 2.3 Frontend

```powershell
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`.

### 2.4 Usuarios de demo

| Rol | Correo | Contraseña | Cómo se crea |
|---|---|---|---|
| `admin` | `admin@unefa.edu.ve` | `Demo1234!` | Seeder, usando `ADMIN_PASSWORD` |
| `repositor` | `autor.demo@unefa.edu.ve` | `Demo1234!` | Panel de admin o registro público |
| `bibliotecario` | `revisor.demo@unefa.edu.ve` | `Demo1234!` | Panel de admin |

**Crear los usuarios antes de la demo:**

1. Entrar como admin.
2. Ir a `/admin`.
3. En “Cuentas con acceso”, pulsar “+ Nuevo usuario”.
4. Crear “Autor Demo” con rol **Repositor**.
5. Crear “Revisor Demo” con rol **Bibliotecario**.

**Comprobación previa:** iniciar sesión con los tres usuarios y confirmar que cada uno llega a su pantalla. No hacerlo por primera vez delante del evaluador.

## 3. Guion paso a paso

### 0:00–0:45 — Contexto

Sin hacer clics. Decir:

> “El Repositorio Digital UNEFA Táchira centraliza la producción académica e institucional. Permite cargar trabajos con metadatos y PDF, revisarlos, publicarlos y consultarlos. Hoy voy a mostrar el flujo completo y, al final, las pruebas que respaldan cada afirmación.”

Aclarar de entrada:

- Hay tres roles de acceso: `admin`, `repositor`, `bibliotecario`.
- “Docente” y “Estudiante” son entidades de datos, no roles de login.
- Las notificaciones de revisión son in-app; el correo solo se usa para recuperar contraseña.

### 0:45–2:00 — Catálogo público

1. Abrir `/`.
2. Mostrar la portada y los trabajos publicados.
3. Ir a `/search`.
4. Buscar `gestión`.
5. Filtrar por año `2026`.
6. Abrir un resultado.
7. En el detalle, mostrar:
   - Metadatos: título, autor, año, categoría, resumen y palabras clave.
   - Botones de cita: APA, BibTeX, RIS.
   - Comentarios.
   - Historial de versiones.

**Resultado esperado:** el catálogo muestra solo trabajos publicados; la búsqueda responde y el detalle es accesible sin iniciar sesión.

**Nota:** los trabajos sembrados no tienen PDF adjunto. El visor PDF se mostrará con el trabajo que se suba en el siguiente bloque.

### 2:00–3:45 — Rol `repositor`: cargar y enviar a revisión

1. Cerrar sesión.
2. Entrar con `autor.demo@unefa.edu.ve` / `Demo1234!`.
3. Ir a `/submission` (o “Subir documento” en el menú).
4. Completar la etapa 1:
   - Título: `Prototipo de gestión documental para la UNEFA`.
   - Autor: `Autor Demo`.
   - Año: `2026`.
   - Tipo: `Pregrado`.
   - Categoría: una disponible.
   - Resumen y palabras clave.
5. Pulsar “Siguiente”.
6. Adjuntar el PDF.
7. Pulsar “Enviar” o “Guardar”.
8. Ir a `/student`.
9. Abrir el borrador recién creado.
10. Pulsar “Solicitar revisión”.

**Resultado esperado:** el trabajo pasa a `en_revision`; el autor ve el estado y el sistema registra la transición.

**Si el botón “Solicitar revisión” no aparece:** confirmar que se abrió el detalle del borrador propio y que la sesión es del autor, no del admin.

### 3:45–5:15 — Rol `bibliotecario`: revisar y publicar

1. Cerrar sesión.
2. Entrar con `revisor.demo@unefa.edu.ve` / `Demo1234!`.
3. Ir a `/revisiones`.
4. En “Pendientes de revisión”, localizar el trabajo.
5. Pulsar “Aprobar”.
6. Confirmar “Aprobar y publicar”.

**Resultado esperado:** el trabajo pasa a `publicado`; desaparece de la cola de pendientes; se genera una notificación para el autor.

**Alternativa para mostrar el rechazo:** en lugar de aprobar, pulsar “Rechazar”, escribir un motivo y confirmar. El trabajo vuelve a `borrador` y el autor recibe una notificación. Hacer solo una de las dos acciones para no alargar la demo.

### 5:15–6:15 — Notificación y verificación pública

1. Cerrar sesión.
2. Entrar como `autor.demo@unefa.edu.ve`.
3. Abrir la campana de notificaciones.
4. Mostrar la notificación de publicación.
5. Abrir el trabajo.
6. Verificar el estado “Publicado” y el PDF adjunto.
7. Cerrar sesión.
8. Ir a `/search` y buscar el título del trabajo.
9. Abrir el detalle como visitante anónimo.

**Resultado esperado:** el trabajo publicado es visible públicamente y el autor recibió la notificación in-app.

### 6:15–7:45 — Rol `admin`: panel de control

1. Entrar como `admin@unefa.edu.ve` / `Demo1234!`.
2. Ir a `/admin`.
3. Mostrar:
   - Totales por estado.
   - Producción por categoría.
   - Trabajos por mes.
   - Visitas y descargas.
   - Top de trabajos.
   - “Cuentas con acceso”.
4. Mencionar que desde aquí se crean usuarios y se asignan roles.

**Resultado esperado:** el panel carga estadísticas reales de la base de datos.

### 7:45–8:45 — Interoperabilidad

Abrir en el navegador:

- `http://localhost:5000/oai?verb=Identify`
- `http://localhost:5000/feed/rss`

**Resultado esperado:** XML válido de OAI-PMH y RSS con trabajos publicados. Mencionar que OAI no revela borradores.

### 8:45–10:00 — Evidencias y cierre

Mostrar, sin ejecutar todo en vivo:

1. `README.md`: estado y comandos.
2. `docs/ESTADO.md`: tablero por módulo.
3. `docs/TRAZABILIDAD.md`: requisito → implementación → prueba → estado.
4. `docs/EVIDENCIAS.md`: comandos y resultados.

Cerrar con:

> “Las suites reportan 156/156 pruebas backend y 15/15 frontend; TypeScript compila sin errores; la prueba de humo de seguridad dio 25/25. Lo que no está implementado está marcado como pendiente o fuera de alcance en la trazabilidad.”

## 4. Demo corta (3 minutos)

Si el tiempo se reduce:

1. **1 min:** catálogo y búsqueda (`/` y `/search`).
2. **1 min:** abrir el trabajo ya publicado y mostrar detalle, cita y PDF.
3. **1 min:** panel de admin (`/admin`) y diapositiva de evidencias.

No intentar cargar y revisar un trabajo en 3 minutos: el flujo completo requiere dos inicios de sesión y una carga de archivo.

## 5. Plan de contingencia

| Problema | Síntoma | Acción |
|---|---|---|
| Backend no arranca | Error de conexión o `JWT_SECRET no está definido` | Revisar `backend/.env`, PostgreSQL y `JWT_SECRET` |
| Login del admin falla | 401 | Verificar la contraseña usada al sembrar; si se perdió, recrear la base local (destructivo) o crear otro admin |
| `/revisiones` vacío | No hay pendientes | Confirmar que el trabajo se envió a revisión desde el detalle del borrador |
| Error al subir PDF | 400 o 413 | Verificar que sea PDF válido, con cabecera `%PDF-`, y menor a 10 MB |
| PDF no se ve | Visor vacío | Usar un PDF con contenido real, no un archivo renombrado |
| El frontend no conecta | Error de red en `/api` | Confirmar que Vite corre en 5173 y el backend en 5000 |
| Render no responde | Timeout o arranque en frío | Usar la demo local; no depender de Render |
| Se cae la base de datos | Errores 500 | Mostrar `docs/ESTADO.md` y `docs/EVIDENCIAS.md`; ejecutar las suites backend, que no requieren PostgreSQL local |

### 5.1 Reinicio local de la demo (destructivo)

Solo para una base local de demostración, nunca para producción:

```powershell
# Detener el backend antes de ejecutar
dropdb -h localhost -p 5432 -U postgres unefa_demo
createdb -h localhost -p 5432 -U postgres unefa_demo
cd backend
npm run db:migrate
npm run db:seed
npm run dev
```

Ajustar nombre de base, puerto y usuario a los del entorno. **Advertencia:** esto borra todos los datos.

## 6. Qué no afirmar durante la demo

- No decir que los cambios de revisión se notifican por correo.
- No decir que existen roles “Docente” y “Estudiante” para iniciar sesión.
- No decir que la demo desplegada en Render está verificada.
- No decir que hay CI/CD.
- No decir que las dependencias están actualizadas.
- No decir que los trabajos sembrados tienen PDF.
- No decir que la prueba de humo se ejecutó sobre el commit final si no se repitió.

## 7. Cierre posterior a la demo

1. Anotar cualquier comportamiento inesperado.
2. Actualizar `docs/ESTADO.md` si cambió el estado.
3. Si se modificó la base, restaurar los datos de demo.
4. Confirmar que no quedaron archivos o credenciales en el repositorio.
5. Confirmar que `git status` está limpio y que la demo se hizo sobre el commit `2f8b0a9` o el commit de cierre documental.
