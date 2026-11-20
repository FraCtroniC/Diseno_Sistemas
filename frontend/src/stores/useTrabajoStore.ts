import { create } from 'zustand'
import { trabajoService, type Trabajo } from '../services/trabajoService'
import type { DocumentItem } from '../types'

interface TrabajoState {
  trabajos: Trabajo[]
  loading: boolean
  total: number
  /** Mensaje de la última carga fallida; null cuando todo va bien. */
  error: string | null
  fetchTrabajos: (params?: { estado?: string; límite?: number; usuario_id?: string }) => Promise<void>
  mapToDocumentItems: () => DocumentItem[]
}

export const useTrabajoStore = create<TrabajoState>((set, get) => ({
  trabajos: [],
  loading: false,
  total: 0,
  error: null,

  fetchTrabajos: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await trabajoService.listar({ limite: 50, ...params })
      set({ trabajos: res.data.datos, total: res.data.total, loading: false, error: null })
    } catch {
      // Sin este mensaje la app mostraba una lista vacía como si no hubiera
      // publicaciones, enmascarando un fallo real de la API.
      set({ loading: false, error: 'No se pudo cargar el catálogo de trabajos.' })
    }
  },

  mapToDocumentItems: () => {
    const { trabajos } = get()
    return trabajos.map((t) => {
      let status: 'draft' | 'published' | 'archived' = 'draft'
      if (t.estado === 'publicado') status = 'published'
      else if (t.estado === 'archivado') status = 'archived'

      const metadatos = t.metadatos as Record<string, unknown> | undefined
      const tipoDocumento = metadatos?.tipo_documento as string | undefined

      return {
        id: t.id,
        title: t.titulo,
        authors: t.autor.split(',').map((a) => a.trim()),
        year: t.anio,
        abstract: t.resumen ?? '',
        status,
        tipoDocumento: tipoDocumento as DocumentItem['tipoDocumento'],
        carrera: t.carrera?.nombre,
        carreraSlug: t.carrera?.slug,
        nivel: t.carrera?.nivel,
      }
    })
  },
}))
