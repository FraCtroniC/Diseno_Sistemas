import { create } from 'zustand'
import { authService, type AuthUser } from '../services/authService'
import { trabajoService, type Trabajo } from '../services/trabajoService'
import type { User, UserProfile } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (identificador: string, password: string) => Promise<User | null>
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
    username: authUser.username ?? undefined,
    role: authUser.rol as User['role'],
    profile: {
      cedula: authUser.cedula ?? undefined,
      telefono: authUser.telefono ?? undefined,
    },
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,

  init: async () => {
    set({ loading: true })
    try {
      const res = await authService.perfil()
      const user = mapBackendUser(res.data.data)
      set({ user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  login: async (identificador: string, password: string) => {
    const res = await authService.login(identificador, password)
    const { usuario } = res.data.data
    const user = mapBackendUser(usuario)
    set({ user })
    return user
  },

  logout: async () => {
    try {
      await authService.logout()
    } catch {
      // ignore
    }
    set({ user: null })
  },

  register: async (payload) => {
    const res = await authService.register({
      nombre: payload.name ?? 'Sin nombre',
      email: payload.email ?? '',
      password: payload.password ?? '',
      cedula: payload.profile?.cedula || undefined,
      telefono: payload.profile?.telefono || undefined,
    })
    const { usuario } = res.data.data
    const user = mapBackendUser(usuario)
    set({ user })
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
