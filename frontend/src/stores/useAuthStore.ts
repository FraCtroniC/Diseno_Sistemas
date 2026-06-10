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
  let role: User['role'] = 'estudiante'
  if (authUser.rol === 'admin' || authUser.rol === 'repositor') role = 'admin'
  else if (authUser.rol === 'bibliotecario') role = 'docente'

  return {
    id: authUser.id,
    name: authUser.nombre,
    email: authUser.email,
    role,
    profile: {},
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
    try {
      const res = await authService.login(email, password)
      const { token, usuario } = res.data.data
      localStorage.setItem('token', token)
      const user = mapBackendUser(usuario)
      set({ user, token })
      return user
    } catch {
      return null
    }
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
    })
    const user = mapBackendUser(res.data.data)
    set({ user })
    return user
  },

  updateProfile: async (payload) => {
    const user = get().user
    if (!user) return null
    const updated: User = {
      ...user,
      email: payload.email ?? user.email,
      profile: {
        cedula: payload.cedula ?? user.profile?.cedula,
        telefono: payload.telefono ?? user.profile?.telefono,
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
