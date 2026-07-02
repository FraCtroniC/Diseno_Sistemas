import api from './api'

export interface CarreraEntity {
  id: string
  nombre: string
  slug: string
}

export interface TutorEntity {
  id: string
  nombre: string
}

export interface EstudianteEntity {
  id: string
  nombre: string
  cedula: string | null
}

export interface Trabajo {
  id: string
  titulo: string
  autor: string
  tutor: string | null
  anio: number
  identificador: string | null
  carrera_id: string | null
  tutor_id: string | null
  estudiante_id: string | null
  carrera?: CarreraEntity | null
  tutorAsignado?: TutorEntity | null
  estudiante?: EstudianteEntity | null
  resumen: string | null
  palabras_clave: string[]
  categoria_id: string
  categoria?: { id: string; nombre: string; slug: string }
  archivo_url: string | null
  metadatos: Record<string, unknown>
  estado: 'borrador' | 'publicado' | 'archivado'
  usuario_id: string
  usuario?: { id: string; nombre: string }
  createdAt: string
  updatedAt: string
  snippet?: string | null
}

export interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
  slug: string
}

export const trabajoService = {
  listar: (params?: { pagina?: number; limite?: number; estado?: string; usuario_id?: string }) =>
    api.get<{ success: boolean; total: number; datos: Trabajo[]; pagina: number; limite: number; totalPaginas: number }>('/trabajos', { params }),

  obtenerPorId: (id: string) =>
    api.get<{ success: boolean; data: Trabajo }>(`/trabajos/${id}`),

  crear: (data: Partial<Trabajo> & { categoria_id: string }) =>
    api.post<{ success: boolean; data: Trabajo }>('/trabajos', data),

  crearConArchivo: (formData: FormData) =>
    api.post<{ success: boolean; data: Trabajo }>('/trabajos', formData),

  actualizar: (id: string, data: Partial<Trabajo>) =>
    api.put<{ success: boolean; data: Trabajo }>(`/trabajos/${id}`, data),

  eliminar: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/trabajos/${id}`),

  buscar: (params: { q?: string; categoria?: string; anio?: number; estado?: string; usuario_id?: string; pagina?: number; limite?: number }) =>
    api.get<{ success: boolean; total: number; datos: Trabajo[] }>('/trabajos/buscar', { params }),
}

export const categoriaService = {
  listar: () =>
    api.get<{ success: boolean; data: Categoria[] }>('/categorias'),

  obtenerPorId: (id: string) =>
    api.get<{ success: boolean; data: Categoria }>(`/categorias/${id}`),

  crear: (data: { nombre: string; descripcion?: string; slug: string }) =>
    api.post<{ success: boolean; data: Categoria }>('/categorias', data),

  actualizar: (id: string, data: { nombre?: string; descripcion?: string; slug?: string }) =>
    api.put<{ success: boolean; data: Categoria }>(`/categorias/${id}`, data),

  eliminar: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/categorias/${id}`),
}
