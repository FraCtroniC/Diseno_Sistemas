import { create } from 'zustand'
import { trabajoService, categoriaService, type Trabajo, type Categoria } from '../services/trabajoService'

interface TrabajoState {
  trabajos: Trabajo[]
  categorias: Categoria[]
  loading: boolean
  total: number
  fetchTrabajos: (params?: { estado?: string; limite?: number }) => Promise<void>
  fetchCategorias: () => Promise<void>
  mapToDocumentItems: () => { id: string; title: string; authors: string[]; year: number; abstract: string; status: 'draft' | 'published' | 'archived'; category: string }[]
}

export const useTrabajoStore = create<TrabajoState>((set, get) => ({
  trabajos: [],
  categorias: [],
  loading: false,
  total: 0,

  fetchTrabajos: async (params) => {
    set({ loading: true })
    try {
      const res = await trabajoService.listar({ limite: 50, ...params })
      set({ trabajos: res.data.datos, total: res.data.total, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchCategorias: async () => {
    try {
      const res = await categoriaService.listar()
      set({ categorias: res.data.data })
    } catch {
      // silencio
    }
  },

  mapToDocumentItems: () => {
    const { trabajos, categorias } = get()
    return trabajos.map((t) => {
      const cat = categorias.find((c) => c.id === t.categoria_id)
      let status: 'draft' | 'published' | 'archived' = 'draft'
      if (t.estado === 'publicado') status = 'published'
      else if (t.estado === 'archivado') status = 'archived'

      return {
        id: t.id,
        title: t.titulo,
        authors: t.autor.split(',').map((a) => a.trim()),
        year: t.anio,
        abstract: t.resumen ?? '',
        status,
        category: cat?.slug ?? t.categoria_id,
      }
    })
  },
}))
