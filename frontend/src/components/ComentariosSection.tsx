import { useEffect, useState } from 'react'
import axios from 'axios'
import Card from './ui/Card'
import { useAuthStore } from '../stores/useAuthStore'

interface Comentario {
  id: string
  usuario_id: string
  comentario: string
  calificacion: number | null
  createdAt: string
  usuario: { id: string; nombre: string }
}

interface Props {
  trabajoId: string
}

export default function ComentariosSection({ trabajoId }: Props) {
  const user = useAuthStore((s) => s.user)
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [promedio, setPromedio] = useState(0)
  const [total, setTotal] = useState(0)
  const [texto, setTexto] = useState('')
  const [calif, setCalif] = useState(0)
  const [loading, setLoading] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    setLoading(true)
    axios.get(`/api/v1/trabajos/${trabajoId}/comentarios`)
      .then((r) => {
        if (r.data.success) {
          setComentarios(r.data.datos)
          setPromedio(r.data.promedio)
          setTotal(r.data.total)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [trabajoId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    try {
      const r = await axios.post(`/api/v1/trabajos/${trabajoId}/comentarios`, {
        comentario: texto.trim(),
        calificacion: calif || null
      })
      if (r.data.success) {
        setComentarios((prev) => [r.data.data, ...prev])
        setTexto('')
        setCalif(0)
      }
    } catch { /* ignore */ }
    setEnviando(false)
  }

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Comentarios</p>
      <div className="mt-2 flex items-center gap-3">
        <h3 className="text-2xl font-black text-slate-900">
          {total} {total === 1 ? 'comentario' : 'comentarios'}
        </h3>
        {promedio > 0 ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
            {promedio.toFixed(1)} ★
          </span>
        ) : null}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setCalif(star === calif ? 0 : star)}
                className={`text-lg transition ${star <= calif ? 'text-amber-400' : 'text-slate-300'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe un comentario..."
            rows={3}
            className="w-full rounded-xl border border-slate-300/90 bg-white/90 px-4 py-2 text-sm outline-none transition focus:border-unefa focus:ring-2 focus:ring-unefa/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            className="rounded-xl bg-unefa px-4 py-2 text-sm font-semibold text-white transition hover:bg-unefa-dark disabled:opacity-50"
          >
            {enviando ? 'Enviando...' : 'Publicar comentario'}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          <a href="/login" className="font-semibold text-unefa">Inicia sesión</a> para comentar.
        </p>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-slate-400">Cargando comentarios...</p>
        ) : comentarios.length === 0 ? (
          <p className="text-sm text-slate-500">No hay comentarios aún.</p>
        ) : (
          comentarios.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.usuario.nombre}</span>
                  {c.calificacion ? (
                    <span className="text-xs text-amber-500">{'★'.repeat(c.calificacion)}{'☆'.repeat(5 - c.calificacion)}</span>
                  ) : null}
                </div>
                <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{c.comentario}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
