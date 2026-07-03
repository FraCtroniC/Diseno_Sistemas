
import { useState } from 'react'
import { useNavigate, useLocation, NavLink } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import { useAuthStore } from '../stores/useAuthStore'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const from = (location.state as any)?.from?.pathname ?? '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const loggedInUser = await login(identifier, password)
      const dest = loggedInUser?.role === 'admin' ? '/admin' : from
      toast.success(`Bienvenido, ${loggedInUser?.name}`)
      navigate(dest, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Credenciales inválidas')
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(11,87,164,0.95),rgba(7,58,106,0.96))] p-6 text-white shadow-[0_30px_70px_-34px_rgba(11,87,164,0.8)]">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Acceso</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight">Iniciar sesión</h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
          Repositorio academico para organizar, consultar y preservar trabajos de investigacion.
          Accede para continuar con tus registros, revisiones y publicaciones.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/12 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Repositorio</p>
            <p className="mt-2 text-sm font-semibold">Trabajos de grado y tesis</p>
          </div>
          <div className="rounded-2xl bg-white/12 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Consulta</p>
            <p className="mt-2 text-sm font-semibold">Busqueda por categoria y carrera</p>
          </div>
          <div className="rounded-2xl bg-white/12 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Gestion</p>
            <p className="mt-2 text-sm font-semibold">Versiones, comentarios y revision</p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/80">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">Ingreso seguro</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Validación de credenciales</h3>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Usuario o correo</span>
            <Input type="text" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="usuario o usuario@dominio.com" />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Contraseña</span>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="*******" />
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit">Entrar</Button>
            <Button type="button" variant="secondary" onClick={() => { setIdentifier('admin@unefa.edu.ve'); setPassword('admin123') }}>
              Usar cuenta demo (admin)
            </Button>
          </div>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          <NavLink to="/forgot-password" className="text-unefa font-semibold hover:underline">¿Olvidaste tu contraseña?</NavLink>
          <span className="text-slate-400 dark:text-slate-500">·</span>
          <span className="dark:text-slate-300">¿No tienes cuenta? <NavLink to="/register" className="text-unefa font-semibold">Regístrate</NavLink></span>
        </div>
      </div>
    </section>
  )
}

