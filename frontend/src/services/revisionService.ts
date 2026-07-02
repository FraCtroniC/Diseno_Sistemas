import api from './api'

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

export const revisionService = {
  listarPendientes: () =>
    api.get<{ success: boolean; total: number; datos: any[] }>('/revisiones/pendientes'),

  listarRevisiones: (trabajoId: string) =>
    api.get<{ success: boolean; data: Revision[] }>(`/revisiones/${trabajoId}`),

  cambiarEstado: (trabajoId: string, estado: string, comentario?: string) =>
    api.patch<{ success: boolean; data: any }>(`/revisiones/${trabajoId}/estado`, { estado, comentario }),
}
