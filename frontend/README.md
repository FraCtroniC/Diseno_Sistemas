# Repositorio Digital UNEFA Táchira

Frontend en React + TypeScript para el Repositorio Digital de la UNEFA, Núcleo Táchira. El proyecto centraliza la consulta, carga y administración de documentos académicos, normativos y editoriales con una interfaz modular basada en rutas.

## Funcionalidad actual

- Inicio con presentación del sistema y accesos principales.
- Búsqueda de documentos con filtros por término y año.
- Flujo de envío de documentos en dos pasos.
- Acceso simulado con roles y vista administrativa protegida.
- Catálogo y usuarios en datos mock para desarrollo local.

## Stack

- React 18
- Vite
- TypeScript
- React Router DOM
- Zustand
- React Hook Form y Zod instalados para futura validación avanzada
- Tailwind CSS

## Requisitos

- Node.js 18 o superior.
- npm 9 o superior.

## Instalación y arranque

```bash
npm install
npm run dev
```

## Scripts disponibles

- `npm run dev`: levanta el servidor de desarrollo.
- `npm run build`: genera el build de producción.
- `npm run preview`: previsualiza el build generado.
- `npm run lint`: ejecuta ESLint sobre el proyecto.

## Rutas principales

- `/`: pantalla de inicio.
- `/search`: búsqueda de documentos.
- `/submission`: carga de documentos.
- `/admin`: panel administrativo protegido.
- `/login`: autenticación simulada.

## Estructura del proyecto

```text
src/
	App.tsx             # Definición de rutas
	main.tsx            # Punto de entrada
	types.ts            # Tipos compartidos
	components/         # Layout, protección de rutas y UI base
	mocks/              # Datos simulados para desarrollo
	pages/              # Pantallas de la aplicación
	stores/             # Estado global con Zustand
	styles/             # Estilos globales y Tailwind
```

## Estado funcional actual

El proyecto todavía trabaja con datos mock. El login acepta correos existentes en los mocks y la búsqueda/registro operan sobre información local. El backend, la persistencia real y la subida de archivos a un servicio remoto siguen pendientes de integración.

## Documentación adicional

- [Arquitectura](docs/architecture.md)
- [Guía de desarrollo](docs/development.md)

## Siguientes pasos recomendados

1. Conectar autenticación real con backend y JWT.
2. Reemplazar los mocks por consumo de API.
3. Completar la validación de formularios con React Hook Form y Zod.
4. Separar servicios, hooks y features por dominio funcional.
