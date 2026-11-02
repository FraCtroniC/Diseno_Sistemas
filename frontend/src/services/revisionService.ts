import api from './api'
import type { Trabajo } from './trabajoService'

export interface Revision {
  id: string
  trabajo_id: string
  revisor_id: string
  estado_anterior: string
  estado_nuevo: string
  comentario: string | null
  createdAt: string
  revisor?: { id: string; nombre: string }
}

export type EstadoCola = 'en_revision' | 'borrador'

export const revisionService = {
  listarPendientes: (estado: EstadoCola = 'en_revision') =>
    api.get<{ success: boolean; total: number; datos: Trabajo[] }>('/revisiones/pendientes', {
      params: { estado },
    }),

  listarRevisiones: (trabajoId: string) =>
    api.get<{ success: boolean; data: Revision[] }>(`/revisiones/${trabajoId}`),

  cambiarEstado: (trabajoId: string, estado: string, comentario?: string) =>
    api.patch<{ success: boolean; data: Trabajo }>(`/revisiones/${trabajoId}/estado`, { estado, comentario }),
}
