# Guía de desarrollo del frontend (documento histórico)

> **Este documento ya no es la fuente de verdad.** Mencionaba `src/mocks/data.ts`, una carpeta que ya no existe. La guía actual está en el [`README.md`](../../README.md) raíz.

## Comandos actuales

```bash
cd frontend
npm install
npm run dev
npm test
npx tsc --noEmit
npm run build
npm run lint
```

## Requisitos

- Node.js `>=20.16 <21` o `>=22.3`.
- Backend en ejecución en `http://localhost:5000`.

## Cómo probar la aplicación

- Iniciar sesión en `/login` con un usuario real de la base de datos.
- Navegar a `/search` para verificar la búsqueda contra la API.
- Entrar a `/submission` para validar el flujo de dos pasos.
- Acceder a `/admin` con un usuario `admin`.
- Acceder a `/revisiones` con `admin` o `bibliotecario`.

No hay usuarios mock. Los usuarios de prueba se crean con el seeder del backend o desde el panel de administración.

## Fuentes canónicas

- Puesta en marcha: [`../../README.md#puesta-en-marcha`](../../README.md#puesta-en-marcha)
- Backend: [`../../backend/README.md`](../../backend/README.md)
- Evidencias y comandos: [`../../docs/EVIDENCIAS.md`](../../docs/EVIDENCIAS.md)
- Demo: [`../../docs/DEMO.md`](../../docs/DEMO.md)
