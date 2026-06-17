import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '../stores/useAuthStore'
import { useTrabajoStore } from '../stores/useTrabajoStore'
import { authService } from '../services/authService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import type { UserProfile } from '../types'

const schema = z.object({
  email: z.string().email('Correo inválido'),
  cedula: z.string().optional(),
  telefono: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const { mapToDocumentItems, fetchTrabajos, fetchCategorias } = useTrabajoStore()
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const [saved, setSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passError, setPassError] = useState('')
  const [passSaved, setPassSaved] = useState(false)
  const [passLoading, setPassLoading] = useState(false)

  useEffect(() => {
    fetchCategorias()
    if (user) {
      fetchTrabajos({ usuario_id: user.id })
    } else {
      fetchTrabajos()
    }
  }, [user])

  const all = mapToDocumentItems()
  const myWorks = all

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        cedula: user.profile?.cedula,
        telefono: user.profile?.telefono,
      })
    }
  }, [user])

  if (!user) return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-8 text-center shadow-sm backdrop-blur">
      <p className="text-lg font-semibold text-slate-600">Debe iniciar sesión para ver su perfil.</p>
    </section>
  )

  const onSubmit = async (data: FormData) => {
    await updateProfile(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPassSaved(false)

    if (newPassword.length < 6) {
      setPassError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setPassError('Las contraseñas no coinciden')
      return
    }

    setPassLoading(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
      setPassSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPassError('')
      setTimeout(() => setPassSaved(false), 3000)
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al cambiar la contraseña'
      setPassError(msg)
    } finally {
      setPassLoading(false)
    }
  }

  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    docente: 'Docente',
    estudiante: 'Estudiante',
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(11,87,164,0.92),rgba(10,31,68,0.98))] p-6 text-white shadow-[0_35px_80px_-38px_rgba(11,87,164,0.75)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Perfil</p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{user.name}</h2>
            <p className="mt-2 text-sm text-white/78">{user.email}</p>
          </div>
          <div className="inline-flex self-start rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold uppercase tracking-wider">
            {roleLabel[user.role] ?? user.role}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-white/80">
          <span className="rounded-full bg-white/12 px-4 py-2">{myWorks.length} trabajos en el repositorio</span>
          {user.profile?.cedula ? <span className="rounded-full bg-white/12 px-4 py-2">{user.profile.cedula}</span> : null}
          {user.profile?.telefono ? <span className="rounded-full bg-white/12 px-4 py-2">{user.profile.telefono}</span> : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">Editar perfil</p>
                <h3 className="mt-2 text-2xl font-black text-slate-900">Actualizar información</h3>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Correo electrónico</span>
                <Input type="email" autoComplete="email" {...register('email')} placeholder="tu@correo.com" />
                {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Cédula</span>
                  <Input {...register('cedula')} placeholder="V-12345678" inputMode="numeric" onInput={(e) => { const t = e.currentTarget; t.value = t.value.replace(/\D/g, ''); setValue('cedula', t.value, { shouldValidate: true }) }} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Teléfono</span>
                  <Input {...register('telefono')} placeholder="0412-1234567" inputMode="numeric" onInput={(e) => { const t = e.currentTarget; t.value = t.value.replace(/\D/g, ''); setValue('telefono', t.value, { shouldValidate: true }) }} />
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit">Guardar cambios</Button>
                {saved ? <span className="text-sm font-semibold text-emerald-600">¡Perfil actualizado!</span> : null}
              </div>
            </form>
          </div>

          <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">Seguridad</p>
                <h3 className="mt-2 text-2xl font-black text-slate-900">Cambiar contraseña</h3>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Contraseña actual</span>
                <PasswordInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="*******" />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Nueva contraseña</span>
                  <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Confirmar contraseña</span>
                  <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" />
                </label>
              </div>

              {passError ? <p className="text-sm text-rose-600">{passError}</p> : null}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={passLoading}>{passLoading ? 'Cambiando...' : 'Cambiar contraseña'}</Button>
                {passSaved ? <span className="text-sm font-semibold text-emerald-600">¡Contraseña actualizada!</span> : null}
              </div>
            </form>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">Documentos</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">Trabajos en el repositorio</h3>

          <div className="mt-5 space-y-3">
            {myWorks.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No hay trabajos disponibles.
              </p>
            ) : (
              <ul className="space-y-2">
                {myWorks.slice(0, 10).map((w) => (
                  <li key={w.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 transition hover:border-unefa/20">
                    <p className="text-sm font-semibold text-slate-900">{w.title}</p>
                    <p className="text-xs text-slate-500">
                      {w.year}
                      <span className="mx-2">&bull;</span>
                      <span className={`font-medium ${w.status === 'published' ? 'text-emerald-600' : w.status === 'draft' ? 'text-amber-600' : 'text-slate-500'}`}>
                        {w.status === 'published' ? 'Publicado' : w.status === 'draft' ? 'Borrador' : 'Archivado'}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
