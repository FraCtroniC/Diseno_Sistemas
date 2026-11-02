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

export const TIPOS_CEDULA = ['V', 'E', 'J', 'G', 'P'] as const

/** Separa una cédula guardada ("V-12345678") en tipo y número para poblar el formulario. */
export function parseCedula(cedula?: string): { cedulaTipo: string; cedula: string } {
  if (!cedula) return { cedulaTipo: 'V', cedula: '' }
  const match = cedula.match(/^([VEJGP])-?(.*)$/i)
  if (match) return { cedulaTipo: match[1].toUpperCase(), cedula: match[2].replace(/\D/g, '') }
  return { cedulaTipo: 'V', cedula: cedula.replace(/\D/g, '') }
}

/** Une tipo y número en el formato almacenado ("V" + "12345678" -> "V-12345678"). */
export function composeCedula(cedulaTipo: string, cedula: string): string {
  return cedula ? `${cedulaTipo || 'V'}-${cedula}` : ''
}
