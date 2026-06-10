import type { DocumentItem, User, Work } from '../types'

export const mockDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Diseño Curricular en la UNEFA',
    authors: ['A. Pérez', 'M. Gómez'],
    year: 2026,
    abstract: 'Estudio sobre el rediseño curricular y su impacto en la formación integral por competencias.',
    status: 'published',
    category: 'pregrado'
  },
  {
    id: 'doc-2',
    title: 'Transformación Digital en la Gestión Académica',
    authors: ['L. Rodríguez', 'C. Pérez'],
    year: 2025,
    abstract: 'Análisis de herramientas digitales para optimizar procesos académicos, administrativos y de consulta.',
    status: 'published',
    category: 'institucional'
  },
  {
    id: 'doc-3',
    title: 'Metodologías Activas de Aprendizaje',
    authors: ['M. Salazar'],
    year: 2025,
    abstract: 'Sistematización de estrategias didácticas centradas en el estudiante y la evaluación formativa.',
    status: 'published',
    category: 'pregrado'
  },
  {
    id: 'doc-4',
    title: 'Líneas de Investigación en Ingeniería',
    authors: ['J. Méndez', 'R. Flores'],
    year: 2024,
    abstract: 'Mapa de líneas priorizadas para la producción de trabajos de grado y proyectos aplicados.',
    status: 'published',
    category: 'postgrado'
  },
  {
    id: 'doc-5',
    title: 'Boletín de Divulgación Científica',
    authors: ['Equipo Editorial'],
    year: 2023,
    abstract: 'Selección de artículos, memorias y reseñas de interés para la comunidad universitaria.',
    status: 'published',
    category: 'divulgacion'
  },
  {
    id: 'doc-6',
    title: 'Reglamento de Citas y Referencias',
    authors: ['Comisión Normativa'],
    year: 2024,
    abstract: 'Lineamientos para la presentación formal de trabajos académicos y publicaciones institucionales.',
    status: 'published',
    category: 'normativas'
  },
  {
    id: 'doc-7',
    title: 'Manual de Procedimientos Académicos',
    authors: ['Secretaría Académica'],
    year: 2023,
    abstract: 'Compendio de procesos internos para solicitudes, validaciones y trámites académicos.',
    status: 'published',
    category: 'institucional'
  },
  {
    id: 'doc-8',
    title: 'Memorias Editoriales UNEFA',
    authors: ['Equipo Editorial'],
    year: 2022,
    abstract: 'Selección de libros, cuadernos y publicaciones especiales generadas por la institución.',
    status: 'published',
    category: 'editorial'
  }
]

export const mockUsers: User[] = [
  { id: 'u-1', name: 'Admin Uno', email: 'admin@example.com', role: 'admin' },
  { id: 'u-2', name: 'Docente Dos', email: 'docente@example.com', role: 'docente' },
  { id: 'u-3', name: 'Estudiante Tres', email: 'student@example.com', role: 'estudiante' },
]

export const mockWorks: Work[] = [
  { id: 'w-1', ownerId: 'u-3', title: 'Trabajo de Investigación en Redes', year: 2022, status: 'published' },
  { id: 'w-2', ownerId: 'u-3', title: 'Tesis de Grado sobre Enseñanza', year: 2021, status: 'draft' },
]
