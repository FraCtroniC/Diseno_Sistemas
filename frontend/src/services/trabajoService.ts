import api from './api'
import type { NivelAcademico } from '../types'

export interface CarreraEntity {
  id: string
  nombre: string
  slug: string
  descripcion?: string | null
  nivel_id?: string
  nivel?: NivelAcademico | null
}

export interface TutorEntity {
  id: string
  nombre: string
}

export interface EstudianteEntity {
  id: string
  nombre: string
  cedula?: string | null
}

export interface Trabajo {
  id: string
  titulo: string
  autor: string
  tutor: string | null
  anio: number
  identificador: string | null
  carrera_id: string
  linea_operativa_id: string | null
  tutor_id: string | null
  estudiante_id: string | null
  carrera?: CarreraEntity | null
  tutorAsignado?: TutorEntity | null
  estudiante?: EstudianteEntity | null
  lineaOperativa?: LineaOperativaEntity | null
  areasEstrategicas?: AreaEstrategicaEntity[]
  resumen: string | null
  palabras_clave: string[]
  archivo_url: string | null
  metadatos: Record<string, unknown>
  estado: 'borrador' | 'en_revision' | 'publicado' | 'archivado'
  usuario_id: string
  usuario?: { id: string; nombre: string }
  createdAt: string
  updatedAt: string
  snippet?: string | null
}

export interface LineaOperativaEntity {
  id: string
  nombre: string
  sigla: string
  slug: string
}

export interface AreaEstrategicaEntity {
  id: string
  nombre: string
  slug: string
  linea_operativa_id: string
}

export const trabajoService = {
  listar: (params?: { pagina?: number; limite?: number; estado?: string; usuario_id?: string }) =>
    api.get<{ success: boolean; total: number; datos: Trabajo[]; pagina: number; limite: number; totalPaginas: number }>('/trabajos', { params }),

  obtenerPorId: (id: string) =>
    api.get<{ success: boolean; data: Trabajo }>(`/trabajos/${id}`),

  crear: (data: Partial<Trabajo>) =>
    api.post<{ success: boolean; data: Trabajo }>('/trabajos', data),

  crearConArchivo: (formData: FormData) =>
    api.post<{ success: boolean; data: Trabajo }>('/trabajos', formData),

  actualizar: (id: string, data: Partial<Trabajo>) =>
    api.put<{ success: boolean; data: Trabajo }>(`/trabajos/${id}`, data),

  actualizarConArchivo: (id: string, formData: FormData) =>
    api.put<{ success: boolean; data: Trabajo }>(`/trabajos/${id}`, formData),

  eliminar: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/trabajos/${id}`),

  buscar: (params: { q?: string; carrera?: string; tipo_documento?: string; sort?: string; anio?: number; estado?: string; usuario_id?: string; pagina?: number; limite?: number }) =>
    api.get<{ success: boolean; total: number; datos: Trabajo[]; pagina: number; limite: number; totalPaginas: number }>('/trabajos/buscar', { params }),
}

export const lineaService = {
  listar: () =>
    api.get<{ success: boolean; data: LineaOperativaEntity[] }>('/lineas-operativas'),

  obtenerPorId: (id: string) =>
    api.get<{ success: boolean; data: LineaOperativaEntity }>(`/lineas-operativas/${id}`),
}

export const areaService = {
  listar: (params?: { linea_operativa?: string }) =>
    api.get<{ success: boolean; data: AreaEstrategicaEntity[] }>('/areas-estrategicas', { params }),

  obtenerPorId: (id: string) =>
    api.get<{ success: boolean; data: AreaEstrategicaEntity }>(`/areas-estrategicas/${id}`),
}
