import api from './api'

export interface AuthUser {
  id: string
  nombre: string
  email: string
  username: string | null
  rol: string
  cedula: string | null
  telefono: string | null
}

export interface LoginResponse {
  token: string
  usuario: AuthUser
}

export const authService = {
  login: (identificador: string, password: string) =>
    api.post<{ success: boolean; data: LoginResponse }>('/auth/login', { identificador, password }),

  register: (data: { nombre: string; email: string; password: string; cedula?: string; telefono?: string; rol?: string }) =>
    api.post<{ success: boolean; data: LoginResponse }>('/auth/register', data),

  forgotPassword: (email: string) =>
    api.post<{ success: boolean; data: { message: string; devMode?: boolean; resetLink?: string } }>('/auth/forgot-password', { email }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<{ success: boolean; data: { message: string } }>('/auth/change-password', { currentPassword, newPassword }),

  resetPassword: (token: string, email: string, newPassword: string) =>
    api.post<{ success: boolean; data: { message: string } }>('/auth/reset-password', { token, email, newPassword }),

  logout: () =>
    api.post<{ success: boolean; message: string }>('/auth/logout'),

  perfil: () =>
    api.get<{ success: boolean; data: AuthUser }>('/auth/perfil'),

  actualizarPerfil: (data: { email?: string; cedula?: string; telefono?: string }) =>
    api.put<{ success: boolean; data: AuthUser }>('/auth/perfil', data),

  listarUsuarios: () =>
    api.get<{ success: boolean; data: AuthUser[] }>('/usuarios'),
}
