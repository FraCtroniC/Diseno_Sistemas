import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '../stores/useAuthStore'
import { useTrabajoStore } from '../stores/useTrabajoStore'
import type { UserProfile } from '../types'

const schema = z.object({
  email: z.string().email(),
  cedula: z.string().optional(),
  telefono: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const { mapToDocumentItems, fetchTrabajos, fetchCategorias } = useTrabajoStore()
  const { register, handleSubmit, reset } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    fetchCategorias()
    fetchTrabajos()
  }, [])

  const all = mapToDocumentItems()
  const myWorks = all.filter((w) => w.id)

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        cedula: user.profile?.cedula,
        telefono: user.profile?.telefono,
      })
    }
  }, [user])

  if (!user) return <div className="p-4">Debe iniciar sesión para ver su perfil.</div>

  const onSubmit = async (data: FormData) => {
    await updateProfile(data)
    alert('Perfil actualizado.')
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-semibold">Mi Perfil</h2>
      <div className="bg-white p-4 rounded shadow">
        <p><strong>Nombre:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rol:</strong> {user.role}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded shadow space-y-3">
        <h3 className="text-lg">Editar perfil</h3>
        <div>
          <label className="block text-sm">Correo electrónico</label>
          <input className="w-full border rounded px-2 py-1" {...register('email')} />
        </div>
        <div>
          <label className="block text-sm">Cédula</label>
          <input className="w-full border rounded px-2 py-1" {...register('cedula')} />
        </div>
        <div>
          <label className="block text-sm">Teléfono</label>
          <input className="w-full border rounded px-2 py-1" {...register('telefono')} />
        </div>
        <div>
          <button className="bg-unefa text-white px-4 py-2 rounded" type="submit">Guardar</button>
        </div>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg mb-2">Todos los trabajos en el repositorio</h3>
        {myWorks.length === 0 ? (
          <p>No hay trabajos disponibles.</p>
        ) : (
          <ul className="divide-y">
            {myWorks.slice(0, 10).map((w) => (
              <li key={w.id} className="py-2">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{w.title}</div>
                    <div className="text-sm text-gray-600">{w.year} &bull; {w.status}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
