export type UserRole = 'admin' | 'repositor' | 'bibliotecario'

export interface UserProfile {
  cedula?: string
  telefono?: string
}

export interface User {
  id: string
  name: string
  email: string
  username?: string
  role: UserRole
  profile?: UserProfile
}

export type TipoDocumento = 'pregrado' | 'postgrado' | 'normativas' | 'institucional' | 'editorial' | 'divulgacion'

export interface DocumentItem {
  id: string
  title: string
  authors: string[]
  year: number
  abstract?: string
  status: 'draft' | 'published' | 'archived'
  category: string
  tipoDocumento?: TipoDocumento
  carrera?: string
}

export interface Work {
  id: string
  ownerId: string
  title: string
  year: number
  status: 'draft' | 'published' | 'archived'
}

export const TIPOS_DOCUMENTO: { value: TipoDocumento; label: string }[] = [
  { value: 'pregrado', label: 'Pregrado' },
  { value: 'postgrado', label: 'Postgrado' },
  { value: 'normativas', label: 'Normativas' },
  { value: 'institucional', label: 'Documentación institucional' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'divulgacion', label: 'Divulgación' },
]
