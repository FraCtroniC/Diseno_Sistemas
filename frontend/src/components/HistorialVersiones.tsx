import { useEffect, useState } from 'react'
import axios from 'axios'
import Card from './ui/Card'
import { useAuthStore } from '../stores/useAuthStore'

interface Version {
  id: string
  version: number
  datos: {
    titulo: string
    autor: string
    tutor: string | null
    anio: number
    resumen: string | null
    palabras_clave: string[]
    estado: string
    identificador: string | null
  }
  archivo_url: string | null
  createdAt: string
  creador: { id: string; nombre: string } | null
}

interface Props {
  trabajoId: string
  onRestore: () => void
}

export default function HistorialVersiones({ trabajoId, onRestore }: Props) {
  const user = useAuthStore((s) => s.user)
  const [versiones, setVersiones] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)

  useEffect(() => {
    axios.get(`/api/v1/trabajos/${trabajoId}/versiones`)
      .then((r) => { if (r.data.success) setVersiones(r.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [trabajoId])

  async function handleRestore(versionId: string) {
    if (!confirm('¿Restaurar esta versión? Se creará una copia de seguridad de la versión actual.')) return
    setRestoring(versionId)
    try {
      await axios.post(`/api/v1/trabajos/${trabajoId}/versiones/${versionId}/restaurar`)
      onRestore()
    } catch { /* ignore */ }
    setRestoring(null)
  }

  if (loading) return null
  if (versiones.length === 0) return null

  const isAdmin = user?.role === 'admin' || user?.role === 'repositor'

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Historial de versiones</p>
      <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
        {versiones.length} {versiones.length === 1 ? 'versión' : 'versiones'}
      </h3>

      <div className="mt-4 space-y-3">
        {versiones.map((v) => (
          <div key={v.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">v{v.version}</span>
                <span className="ml-2 text-xs text-slate-500">
                  {new Date(v.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
                {v.creador ? <span className="ml-2 text-xs text-slate-400">por {v.creador.nombre}</span> : null}
              </div>
              {isAdmin ? (
                <button
                  onClick={() => handleRestore(v.id)}
                  disabled={restoring === v.id}
                  className="rounded-full bg-unefa/10 px-3 py-1 text-xs font-semibold text-unefa-dark hover:bg-unefa/20 disabled:opacity-50"
                >
                  {restoring === v.id ? 'Restaurando...' : 'Restaurar'}
                </button>
              ) : null}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
              <span>Título: {v.datos.titulo}</span>
              <span>Autor: {v.datos.autor}</span>
              <span>Año: {v.datos.anio}</span>
              <span>Estado: {v.datos.estado}</span>
              {v.datos.identificador ? <span>ID: {v.datos.identificador}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
