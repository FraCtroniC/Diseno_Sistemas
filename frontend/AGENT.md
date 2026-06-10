# AGENT.md - Frontend: Repositorio Digital UNEFA Táchira

## 1. Propósito del Proyecto
Este archivo proporciona el contexto técnico y de negocio para el desarrollo del Frontend del **Repositorio Digital para la gestión de proyectos de todas las carreras en la UNEFA Núcleo-Táchira**. El sistema centraliza la producción intelectual, normativa institucional y divulgación editorial.

## 2. Stack Tecnológico (Recomendado)
- **Framework:** React (Vite como build tool).
- **Lenguaje:** TypeScript (Modo estricto para manejo seguro de metadatos de proyectos).
- **Estilado:** Tailwind CSS.
- **Gestión de Estado:** Zustand (para manejo ágil de filtros y estados de carga de archivos).
- **Enrutamiento:** React Router DOM.
- **Formularios:** React Hook Form + Zod (Validación de carga de documentos).

## 3. Lógica de Negocio y Módulos
Basado en el análisis de procesos, el Frontend debe estructurarse en los siguientes módulos core:

### A. Gestión de Acceso y Administración (1.0)
- Control de perfiles (Administrador, Docente, Estudiante).
- Registro de accesos y logs de actividad.

### B. Producción Académica (3.0)
- **Categorización:** Pregrado, Postgrado, Maestría, Tesis Doctorales y Trabajos de Ascenso.
- **Flujo:** Registro de metadatos, carga de archivos digitales y visualización por jerarquía.

### C. Documentación Institucional y Normativa (2.0 y 4.0)
- Gestión de Reglamentos y Resoluciones.
- Consultas de manuales de normas y procedimientos.
- Generación y visualización de Boletines Estadísticos de producción académica.

### D. Editorial y Divulgación (5.0)
- Publicación de Libros Digitales, Memorias y Recursos Educativos.
- Gestión de estados de publicación (Borrador, Validado, Publicado).

## 4. Estructura de Carpetas (Feature-Based)
```text
src/
├── assets/          # Logos UNEFA, iconos de archivos (PDF, Word).
├── components/      # UI Atoms/Molecules (Buttons, Modals, Cards).
├── features/        # Lógica por proceso de negocio.
│   ├── auth/        # Login y Perfiles.
│   ├── repository/  # Búsqueda, Filtros y Visualización de trabajos.
│   ├── submission/  # Formulario de carga y validación de documentos.
│   ├── editorial/   # Gestión de libros y boletines.
│   └── admin/       # Tablas de gestión de usuarios y normas.
├── hooks/           # Lógica de descarga de archivos y filtros.
├── services/        # Capa API (Axios).
├── store/           # Estado global (AuthStore, RepositoryStore).
├── types/           # Interfaces para 'Work', 'User', 'Collection'.
└── utils/           # Formateo de metadatos y validación de archivos.
```

## 5. Consideraciones Técnicas

- **Seguridad:** Implementar autenticación JWT y roles de acceso.
- **Performance:** Lazy loading de documentos y optimización de consultas.
- **Usabilidad:** Interfaz intuitiva con filtros avanzados y visualización clara de jerarquías de trabajos.
- **Escalabilidad:** Estructura modular para facilitar futuras expansiones (e.g., integración con repositorios externos).

## 6. Convenciones y Reglas de Desarrollo
- **Naming:** PascalCase para componentes, camelCase para funciones.

- **TypeScript:** Prohibido el uso de any. Definir interfaces claras para los metadatos de los trabajos (Autores, Fecha, Carrera, Tipo).

- **Estilos:** Usar exclusivamente Tailwind CSS. Mantener la paleta institucional (Azul, Amarillo, Blanco).

- **Validaciones:** Comprobar tipos de archivo y peso máximo antes de la subida al repositorio.

## 7. Fuentes de Referencia
- **Procesos:** Manuales de normas y procedimientos institucionales.

- **Metadatos:** Basados en estándares de repositorios digitales (Autor, Título, Colección, Identificador).

### Notas adicionales para tu plan de trabajo:
1.  **Prioridad 1:** Implementar el módulo de **Repository/Search**, ya que es la funcionalidad más consultada (Búsquedas por jerarquía y categorías).
2.  **Prioridad 2:** Crear el flujo de **Submission** (Carga de trabajos), asegurando que los metadatos se capturen correctamente según los documentos de análisis.
3.  **Prioridad 3:** Panel de **Administración** para la gestión de reglamentos y boletines estadísticos.
