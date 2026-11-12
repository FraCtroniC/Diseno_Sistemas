# Arquitectura del frontend (documento histórico)

> **Este documento ya no es la fuente de verdad.** Describía una arquitectura basada en datos mock y una carpeta `src/mocks/` que ya no existe. Se conserva solo como referencia histórica.

## Arquitectura real

El frontend es una SPA React 18 + Vite + TypeScript que consume la API real del backend:

- `../src/main.tsx` monta la aplicación dentro de `BrowserRouter`.
- `../src/App.tsx` define las rutas.
- `../src/components/Layout.tsx` envuelve las vistas con navegación, notificaciones y tema.
- `../src/components/ProtectedRoute.tsx` protege rutas por autenticación y rol.
- `../src/pages/` contiene las pantallas.
- `../src/services/` contiene la capa HTTP con Axios (`baseURL: '/api/v1'`, `withCredentials: true`).
- `../src/stores/` contiene el estado global con Zustand.
- `../src/utils/` contiene validaciones y utilidades.

## Fuentes canónicas

- Arquitectura full-stack: [`../../README.md#arquitectura`](../../README.md#arquitectura)
- Estado real: [`../../docs/ESTADO.md`](../../docs/ESTADO.md)
- Trazabilidad: [`../../docs/TRAZABILIDAD.md`](../../docs/TRAZABILIDAD.md)
- Documentación del backend: [`../../backend/README.md`](../../backend/README.md)
