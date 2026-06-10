import api from './api'

export interface AuthUser {
  id: string
  nombre: string
  email: string
  rol: string
}

export interface LoginResponse {
  token: string
  usuario: AuthUser
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: LoginResponse }>('/auth/login', { email, password }),

  register: (data: { nombre: string; email: string; password: string; rol?: string }) =>
    api.post<{ success: boolean; data: AuthUser }>('/auth/register', data),

  perfil: () =>
    api.get<{ success: boolean; data: AuthUser }>('/auth/perfil'),
}
