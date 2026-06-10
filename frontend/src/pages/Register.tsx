import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '../stores/useAuthStore'
import type { UserProfile } from '../types'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  cedula: z.string().optional(),
  telefono: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function Register() {
  const registerFn = useAuthStore((s) => s.register)
  const { register, handleSubmit } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    const profile: UserProfile = {
      cedula: data.cedula,
      telefono: data.telefono,
    }
    try {
      await registerFn({ name: data.name, email: data.email, password: data.password, profile })
      alert('Registro completado. Sesión iniciada.')
    } catch {
      alert('Error al registrarse. Intente de nuevo.')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Registro de Usuario</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm">Nombre</label>
          <input className="w-full border rounded px-2 py-1" {...register('name')} />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input className="w-full border rounded px-2 py-1" {...register('email')} />
        </div>
        <div>
          <label className="block text-sm">Contraseña</label>
          <input type="password" className="w-full border rounded px-2 py-1" {...register('password')} />
        </div>
        <hr />
        <h3 className="text-lg">Perfil ampliado</h3>
        <div>
          <label className="block text-sm">Cédula</label>
          <input className="w-full border rounded px-2 py-1" {...register('cedula')} />
        </div>
        <div>
          <label className="block text-sm">Teléfono</label>
          <input className="w-full border rounded px-2 py-1" {...register('telefono')} />
        </div>
        <div>
          <button className="bg-unefa text-white px-4 py-2 rounded" type="submit">Registrarse</button>
        </div>
      </form>
    </div>
  )
}
