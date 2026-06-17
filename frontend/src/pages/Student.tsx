import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { trabajoService, type Trabajo } from '../services/trabajoService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ProtectedRoute from '../components/ProtectedRoute'

export default function Student() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [published, setPublished] = useState<Trabajo[]>([])
  const [myDrafts, setMyDrafts] = useState<Trabajo[]>([])

  useEffect(() => {
    trabajoService.listar({ estado: 'publicado', limite: 50 })
      .then((res) => setPublished(res.data.datos))
      .catch(() => {})
    if (user) {
      trabajoService.listar({ estado: 'borrador', usuario_id: user.id, limite: 50 })
        .then((res) => setMyDrafts(res.data.datos))
        .catch(() => {})
    }
  }, [user])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <ProtectedRoute roles={["estudiante"]}>
      <section className="space-y-6 pb-6">
        <div className="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/95 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Bienvenido</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Panel del estudiante</h2>
              <p className="mt-1 text-sm text-slate-600">Accede a tus recursos, envíos y lecturas recomendadas.</p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <Button variant="secondary" onClick={handleLogout} className="mt-2">Salir</Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <p className="text-sm font-medium text-slate-500">Lecturas recomendadas</p>
            <p className="mt-3 text-2xl font-black text-slate-900">{published.length}</p>
            <p className="mt-2 text-sm text-slate-600">Documentos publicados disponibles para consulta.</p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-slate-500">Tus borradores</p>
            <p className="mt-3 text-2xl font-black text-slate-900">{myDrafts.length}</p>
            <p className="mt-2 text-sm text-slate-600">Trabajos que has guardado como borrador.</p>
          </Card>

          <Card>
            <button type="button" onClick={() => navigate('/submission')} className="w-full text-left">
              <p className="text-sm font-medium text-slate-500">Subir trabajo</p>
              <p className="mt-3 text-2xl font-black text-slate-900">Enviar</p>
              <p className="mt-2 text-sm text-slate-600">Carga tus entregas para revisión docente.</p>
            </button>
          </Card>

          <Card>
            <button type="button" onClick={() => navigate('/search')} className="w-full text-left">
              <p className="text-sm font-medium text-slate-500">Búsqueda rápida</p>
              <p className="mt-3 text-2xl font-black text-slate-900">Explorar</p>
              <p className="mt-2 text-sm text-slate-600">Encuentra tesis, normativas y recursos por palabra clave.</p>
            </button>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h3 className="text-lg font-black">Recientes</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {published.slice(0, 5).map((doc) => (
                <li key={doc.id} className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                  <p className="font-semibold text-slate-900">{doc.titulo}</p>
                  <p className="text-xs text-slate-500">{doc.autor} &bull; {doc.anio}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="text-lg font-black">Acciones rápidas</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button onClick={() => navigate('/submission')}>Subir trabajo</Button>
              <Button variant="secondary" onClick={() => navigate('/search')}>Buscar recursos</Button>
            </div>
          </Card>
        </div>
      </section>
    </ProtectedRoute>
  )
}
