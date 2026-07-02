import api from './api'

export interface AdminStats {
  totalDocumentos: number
  publicados: number
  borradores: number
  enRevision: number
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
  trabajosPorMes: { mes: string; cantidad: number }[]
  visitas: { total: number; vistas: number; descargas: number }
  topTrabajos: { id: string; titulo: string; identificador: string; total: number; vistas: number; descargas: number }[]
}

export const adminService = {
  getStats: () =>
    api.get<{ success: boolean; data: AdminStats }>('/admin/stats'),
}
