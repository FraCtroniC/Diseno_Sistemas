import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

type Props = PropsWithChildren<{ roles?: string[] }>

export default function ProtectedRoute({ children, roles }: Props) {
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to="/login" replace />

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-rose-700">
        Acceso denegado: no tienes permisos para ver esta sección.
      </div>
    )
  }

  return <>{children}</>
}
