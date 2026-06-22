import { create } from 'zustand'
import { authService, type AuthUser } from '../services/authService'
import { trabajoService, type Trabajo } from '../services/trabajoService'
import type { User, UserProfile } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<User | null>
  logout: () => void
  register: (payload: Partial<User> & { password?: string; profile?: UserProfile }) => Promise<User>
  updateProfile: (payload: Partial<Pick<User, 'email'>> & UserProfile) => Promise<User | null>
  getWorksForUser: (userId: string) => Promise<Trabajo[]>
  init: () => Promise<void>
}

function mapBackendUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    name: authUser.nombre,
    email: authUser.email,
    role: authUser.rol as User['role'],
    profile: {
      cedula: authUser.cedula ?? undefined,
      telefono: authUser.telefono ?? undefined,
    },
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,

  init: async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    set({ loading: true })
    try {
      const res = await authService.perfil()
      const user = mapBackendUser(res.data.data)
      set({ user, token, loading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, loading: false })
    }
  },

  login: async (email: string, password: string) => {
    const res = await authService.login(email, password)
    const { token, usuario } = res.data.data
    localStorage.setItem('token', token)
    const user = mapBackendUser(usuario)
    set({ user, token })
    return user
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  register: async (payload) => {
    const res = await authService.register({
      nombre: payload.name ?? 'Sin nombre',
      email: payload.email ?? '',
      password: payload.password ?? '',
      cedula: payload.profile?.cedula || undefined,
      telefono: payload.profile?.telefono || undefined,
    })
    const { token, usuario } = res.data.data
    localStorage.setItem('token', token)
    const user = mapBackendUser(usuario)
    set({ user, token })
    return user
  },

  updateProfile: async (payload) => {
    const user = get().user
    if (!user) return null

    const res = await authService.actualizarPerfil({
      email: payload.email,
      cedula: payload.cedula,
      telefono: payload.telefono,
    })

    const updated: User = {
      ...user,
      email: res.data.data.email,
      profile: {
        cedula: res.data.data.cedula ?? undefined,
        telefono: res.data.data.telefono ?? undefined,
      },
    }
    set({ user: updated })
    return updated
  },

  getWorksForUser: async (userId: string) => {
    const res = await trabajoService.listar({ estado: 'publicado' })
    return res.data.datos.filter((t) => t.usuario_id === userId)
  },
}))
