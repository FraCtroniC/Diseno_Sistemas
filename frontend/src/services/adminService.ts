import api from './api'

export interface AdminStats {
  totalDocumentos: number
  publicados: number
  borradores: number
  archivados: number
  porcentajePublicado: number
  totalUsuarios: number
  usuariosActivos: number
  totalCategorias: number
  normativasVigentes: number
  publishedPorCategoria: {
    categoriaId: string
    nombre: string
    slug: string
    cantidad: number
  }[]
}

export const adminService = {
  getStats: () =>
    api.get<{ success: boolean; data: AdminStats }>('/admin/stats'),
}
