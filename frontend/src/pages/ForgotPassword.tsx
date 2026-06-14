import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { authService } from '../services/authService'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [devLink, setDevLink] = useState('')
  const [devMode, setDevMode] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authService.forgotPassword(email)
      const data = res.data.data
      if (data.devMode && data.resetLink) {
        setDevLink(data.resetLink)
        setDevMode(true)
      }
      setSent(true)
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al enviar la solicitud. Intente de nuevo.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(11,87,164,0.95),rgba(7,58,106,0.96))] p-6 text-white shadow-[0_30px_70px_-34px_rgba(11,87,164,0.8)]">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Recuperación</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight">Restablecer contraseña</h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
          Ingresa tu correo electrónico registrado y te enviaremos un enlace para restablecer tu contraseña.
          El enlace expira en 30 minutos.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/12 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Enlace</p>
            <p className="mt-2 text-sm font-semibold">Recibes un link seguro en tu correo</p>
          </div>
          <div className="rounded-2xl bg-white/12 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Vigencia</p>
            <p className="mt-2 text-sm font-semibold">30 minutos para restablecer</p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
        {sent ? (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Correo enviado</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Revisa tu bandeja de entrada</h3>
              <p className="mt-2 text-sm text-slate-600">
                Te hemos enviado un enlace de restablecimiento a <strong className="text-slate-900">{email}</strong>.
                El enlace expira en 30 minutos. Si no lo encuentras, revisa la carpeta de spam.
              </p>
            </div>
            {devMode && devLink ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Modo desarrollo</p>
                <p className="mt-1 text-sm text-amber-800">El correo no se pudo enviar. Usa este enlace para restablecer:</p>
                <a href={devLink} className="mt-2 inline-block rounded-lg bg-white px-4 py-3 text-sm font-semibold text-unefa underline break-all shadow-sm">
                  {devLink}
                </a>
              </div>
            ) : null}
            <NavLink to="/login" className="inline-block rounded-full bg-unefa px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-unefa/20 hover:brightness-110">
              Ir al inicio de sesión
            </NavLink>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">Recuperación</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Ingresa tu correo electrónico</h3>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Correo institucional</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@correo.com" required />
            </label>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar enlace de recuperación'}</Button>
            </div>

            <p className="text-center text-sm">
              <NavLink to="/login" className="font-semibold text-unefa">Volver al inicio de sesión</NavLink>
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
