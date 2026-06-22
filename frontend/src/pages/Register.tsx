import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { NavLink, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import { useAuthStore } from '../stores/useAuthStore'
import type { UserProfile } from '../types'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  cedula: z.string().optional(),
  telefono: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function Register() {
  const registerFn = useAuthStore((s) => s.register)
  const navigate = useNavigate()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const [registerError, setRegisterError] = useState('')

  const onSubmit = async (data: FormData) => {
    setRegisterError('')
    const profile: UserProfile = {
      cedula: data.cedula,
      telefono: data.telefono,
    }
    try {
      await registerFn({ name: data.name, email: data.email, password: data.password, profile })
      navigate('/')
    } catch (err: any) {
      setRegisterError(err?.response?.data?.error || err?.response?.data?.message || 'Error al registrarse. Intente de nuevo.')
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(11,87,164,0.95),rgba(7,58,106,0.96))] p-6 text-white shadow-[0_30px_70px_-34px_rgba(11,87,164,0.8)]">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Registro</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight">Crear cuenta</h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
          Regístrate para acceder a todas las funcionalidades del repositorio digital. Los administradores
          activarán tu rol después de la validación.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/12 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Datos</p>
            <p className="mt-2 text-sm font-semibold">Nombre, email y contraseña</p>
          </div>
          <div className="rounded-2xl bg-white/12 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Perfil</p>
            <p className="mt-2 text-sm font-semibold">Cédula y teléfono opcionales</p>
          </div>
          <div className="rounded-2xl bg-white/12 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Acceso</p>
            <p className="mt-2 text-sm font-semibold">Inicio automático tras registro</p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">Nuevo usuario</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Información personal</h3>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Nombre completo</span>
            <Input {...register('name')} placeholder="Tu nombre" onInput={(e) => { const t = e.currentTarget; t.value = t.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''); setValue('name', t.value, { shouldValidate: true }) }} />
            {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Correo electrónico</span>
            <Input type="email" autoComplete="email" {...register('email')} placeholder="usuario@correo.com" />
            {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Contraseña</span>
            <PasswordInput {...register('password')} placeholder="Mínimo 6 caracteres" />
            {errors.password ? <p className="text-sm text-rose-600">{errors.password.message}</p> : null}
          </label>

          <hr className="border-slate-200" />

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">Información adicional</p>
            <p className="text-xs text-slate-500">Campos opcionales para completar tu perfil</p>
          </div>

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

          {registerError ? <p className="text-sm text-rose-600">{registerError}</p> : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit">Crear cuenta</Button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta? <NavLink to="/login" className="font-semibold text-unefa">Inicia sesión</NavLink>
        </p>
      </div>
    </section>
  )
}
