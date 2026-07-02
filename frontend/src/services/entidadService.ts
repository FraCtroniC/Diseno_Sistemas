import api from './api'
import type { CarreraEntity, TutorEntity, EstudianteEntity } from './trabajoService'

export const carreraService = {
  listar: () =>
    api.get<{ success: boolean; data: CarreraEntity[] }>('/carreras'),

  crear: (data: { nombre: string; slug: string; descripcion?: string }) =>
    api.post<{ success: boolean; data: CarreraEntity }>('/carreras', data),

  actualizar: (id: string, data: { nombre?: string; slug?: string; descripcion?: string }) =>
    api.put<{ success: boolean; data: CarreraEntity }>(`/carreras/${id}`, data),

  eliminar: (id: string) =>
    api.delete(`/carreras/${id}`),
}

export const tutorService = {
  listar: (q?: string) =>
    api.get<{ success: boolean; data: TutorEntity[] }>('/tutores', { params: { q } }),

  crear: (data: { nombre: string; email?: string }) =>
    api.post<{ success: boolean; data: TutorEntity }>('/tutores', data),

  eliminar: (id: string) =>
    api.delete(`/tutores/${id}`),
}

export const estudianteService = {
  listar: (params?: { q?: string; carrera_id?: string }) =>
    api.get<{ success: boolean; data: EstudianteEntity[] }>('/estudiantes', { params }),

  crear: (data: { nombre: string; email?: string; cedula?: string; carrera_id?: string }) =>
    api.post<{ success: boolean; data: EstudianteEntity }>('/estudiantes', data),

  eliminar: (id: string) =>
    api.delete(`/estudiantes/${id}`),
}
