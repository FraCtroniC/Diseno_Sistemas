import { create } from 'zustand'
import axios from 'axios'

export interface Notificacion {
  id: string
  usuario_id: string
  tipo: string
  mensaje: string
  trabajo_id: string | null
  leida: boolean
  createdAt: string
  trabajo?: { id: string; titulo: string; identificador: string } | null
}

interface NotificationState {
  notificaciones: Notificacion[]
  noLeidas: number
  loading: boolean
  fetch: () => Promise<void>
  contar: () => Promise<void>
  setNoLeidas: (n: number) => void
  marcarLeida: (id: string) => Promise<void>
  marcarTodasLeidas: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notificaciones: [],
  noLeidas: 0,
  loading: false,

  fetch: async () => {
    set({ loading: true })
    try {
      const res = await axios.get('/api/v1/notificaciones')
      set({ notificaciones: res.data.datos, loading: false })
    } catch {
      set({ loading: false })
    }
    get().contar()
  },

  setNoLeidas: (n) => set({ noLeidas: n }),

  contar: async () => {
    try {
      const res = await axios.get('/api/v1/notificaciones/contar')
      set({ noLeidas: res.data.data.noLeidas })
    } catch { /* ignore */ }
  },

  marcarLeida: async (id: string) => {
    try {
      await axios.patch(`/api/v1/notificaciones/${id}/leer`)
      get().contar()
    } catch { /* ignore */ }
  },

  marcarTodasLeidas: async () => {
    try {
      await axios.post('/api/v1/notificaciones/leer-todas')
      set({ noLeidas: 0 })
    } catch { /* ignore */ }
  }
}))
