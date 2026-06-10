# Guía de desarrollo

## Requisitos
- Node.js 18 o superior.
- npm instalado.

## Comandos útiles

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

## Cómo probar la aplicación
- Ir a `/login` y usar un correo que exista en `mockUsers`.
- Navegar a `/search` para verificar el filtrado local.
- Entrar a `/submission` para validar el flujo de dos pasos.
- Acceder a `/admin` con un usuario de rol `admin`.

## Datos de prueba
- Usuarios de prueba: `src/mocks/data.ts`
- Documentos de prueba: `src/mocks/data.ts`

## Convenciones para contribuir
- Mantener componentes pequeños y reutilizables.
- No duplicar lógica de filtros o validaciones si puede extraerse.
- Evitar introducir nuevas dependencias si no aportan valor claro.
- Documentar cualquier cambio de rutas o comportamiento visible.

## Checklist antes de cerrar cambios
- `npm run build` debe pasar.
- Revisar que las rutas sigan accesibles.
- Confirmar que el estado mock no rompa los flujos existentes.