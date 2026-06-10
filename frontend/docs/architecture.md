# Arquitectura del Frontend

## Visión general
La aplicación está construida como un frontend de una sola página con rutas protegidas y componentes reutilizables. El diseño actual prioriza una experiencia clara para consulta de documentos, carga de metadatos y acceso administrativo.

## Flujo de ejecución
1. `src/main.tsx` monta la aplicación dentro de `BrowserRouter`.
2. `src/App.tsx` define las rutas principales.
3. `src/components/Layout.tsx` envuelve todas las vistas con navegación y encabezado global.
4. Cada pantalla vive en `src/pages/` y consume componentes UI y mocks locales.

## Componentes base
- `Layout.tsx`: estructura global con navegación.
- `ProtectedRoute.tsx`: guarda acceso por autenticación y rol.
- `Button.tsx`, `Card.tsx`, `Input.tsx`: primitivas visuales compartidas.

## Estado y datos
La capa de estado global actual está limitada a autenticación simulada mediante Zustand en `src/stores/useAuthStore.ts`. Los documentos y usuarios de prueba viven en `src/mocks/data.ts`.

## Páginas
- `Home.tsx`: presentación del repositorio y capacidades principales.
- `Search.tsx`: búsqueda local por título, autor y año.
- `Submission.tsx`: formulario por pasos para metadatos y archivo.
- `Admin.tsx`: vista protegida para rol administrador.
- `Login.tsx`: acceso con datos mock y redirección posterior.

## Limitaciones conocidas
- No existe persistencia remota.
- No hay integración con backend ni subida real de archivos.
- Los roles están simulados en memoria.
- Los formularios aún no están conectados a validación declarativa con Zod.

## Evolución recomendada
Cuando el backend esté disponible, la separación natural sería:
- servicios para API en una carpeta dedicada,
- hooks para lógica reutilizable,
- features por dominio: auth, search, submission, admin.