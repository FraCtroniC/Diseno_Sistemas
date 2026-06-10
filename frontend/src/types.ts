export type UserRole = 'admin' | 'docente' | 'estudiante'

export interface UserProfile {
  cedula?: string
  telefono?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  profile?: UserProfile
}

export interface DocumentItem {
  id: string
  title: string
  authors: string[]
  year: number
  abstract?: string
  status: 'draft' | 'published' | 'archived'
  category: 'pregrado' | 'postgrado' | 'normativas' | 'institucional' | 'editorial' | 'divulgacion'
}

export interface Work {
  id: string
  ownerId: string
  title: string
  year: number
  status: 'draft' | 'published' | 'archived'
}
