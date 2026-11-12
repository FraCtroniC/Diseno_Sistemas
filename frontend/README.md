# Frontend — Repositorio Digital UNEFA Táchira

Interfaz React del Repositorio Digital UNEFA Táchira. Consume la API real del backend; **no usa datos mock**.

La documentación canónica del proyecto está en el [`README.md`](../README.md) raíz. El estado verificado y las brechas están en [`docs/ESTADO.md`](../docs/ESTADO.md) y [`docs/TRAZABILIDAD.md`](../docs/TRAZABILIDAD.md).

---

## Stack

- React 18 + Vite 5
- TypeScript
- Tailwind CSS 3
- React Router DOM 6
- Zustand 4
- React Hook Form 7 + Zod 3 (login, registro y perfil)
- Recharts
- react-pdf / pdfjs-dist
- Vitest + Testing Library

## Requisitos

- Node.js `>=20.16 <21` o `>=22.3` (rango del backend del mismo repositorio).
- npm 9 o superior.
- Backend en ejecución en `http://localhost:5000`.

## Instalación y arranque

```bash
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`. Vite redirige `/api` a `http://localhost:5000`.

En producción, `vercel.json` reescribe `/api/(.*)` hacia `https://diseno-sistemas.onrender.com/api/$1`. Esa URL **no fue verificada** durante la auditoría.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Previsualiza el build |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Rutas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Inicio | Público |
| `/search` | Búsqueda | Público |
| `/catalogo/:category` | Catálogo por tipo | Público |
| `/trabajos/:id` | Detalle del trabajo | Público; borradores según rol |
| `/submission` | Carga/edición de trabajo | Requiere sesión para guardar |
| `/login` | Inicio de sesión | Público |
| `/register` | Registro | Público |
| `/forgot-password` | Solicitud de recuperación | Público |
| `/reset-password` | Restablecimiento | Público |
| `/profile` | Perfil | Autenticado |
| `/student` | Panel de autor/revisor | `repositor`, `bibliotecario` |
| `/revisiones` | Cola de revisión | `admin`, `bibliotecario` |
| `/admin` | Panel administrativo | `admin` |

## Roles

- `admin`: administración completa.
- `repositor`: autor; crea y envía sus trabajos.
- `bibliotecario`: revisa y publica.

“Docente” y “Estudiante” son entidades de datos, no roles de login. Ver [`docs/TRAZABILIDAD.md`](../docs/TRAZABILIDAD.md#2-requisitos-funcionales).

## Pruebas

```bash
npm test
npx tsc --noEmit
npm run build
npm run lint
```

Resultados del último snapshot: 15/15 pruebas, TypeScript sin errores, build correcto con aviso de chunk > 500 kB, lint con 0 errores y 19 advertencias.

## Notas

- La carpeta `src/mocks/` ya no existe; fue eliminada cuando el frontend se conectó a la API.
- La validación de PDF está en `src/utils/pdfValidation.ts` (tipo y tamaño máximo de 10 MB).
- El build genera un único chunk de ~1,35 MB; falta code splitting.
- La guía histórica [`docs/development.md`](docs/development.md) y la arquitectura histórica [`docs/architecture.md`](docs/architecture.md) se conservan solo como redirección.
