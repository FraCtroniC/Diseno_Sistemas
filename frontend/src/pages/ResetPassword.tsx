import { useState } from 'react'
import { useSearchParams, NavLink } from 'react-router-dom'
import Button from '../components/ui/Button'
import PasswordInput from '../components/ui/PasswordInput'
import { authService } from '../services/authService'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, email, newPassword)
      setSuccess(true)
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al restablecer la contraseña'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <section className="mx-auto max-w-lg pt-12">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-8 text-center shadow-sm backdrop-blur">
          <p className="text-lg font-semibold text-slate-600">Enlace inválido. Faltan parámetros de recuperación.</p>
          <NavLink to="/forgot-password" className="mt-4 inline-block font-semibold text-unefa">Solicitar nuevo enlace</NavLink>
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(11,87,164,0.95),rgba(7,58,106,0.96))] p-6 text-white shadow-[0_30px_70px_-34px_rgba(11,87,164,0.8)]">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Restablecer</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight">Nueva contraseña</h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
          Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres. La sesión expirará para que ingreses con tu nueva clave.
        </p>
      </div>

      <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
        {success ? (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Contraseña restablecida</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Todo listo</h3>
              <p className="mt-2 text-sm text-slate-600">
                Tu contraseña ha sido cambiada correctamente. Ahora puedes iniciar sesión con tu nueva clave.
              </p>
            </div>
            <NavLink to="/login" className="inline-block rounded-full bg-unefa px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-unefa/20 hover:brightness-110">
              Iniciar sesión
            </NavLink>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">Restablecimiento</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Ingresa tu nueva contraseña</h3>
              <p className="mt-1 text-sm text-slate-500">Para la cuenta <strong>{email}</strong></p>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Nueva contraseña</span>
              <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Confirmar contraseña</span>
              <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" />
            </label>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={loading}>{loading ? 'Restableciendo...' : 'Restablecer contraseña'}</Button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
