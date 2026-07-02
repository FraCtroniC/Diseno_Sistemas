import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { trabajoService, type Trabajo } from '../services/trabajoService'
import { revisionService, type Revision } from '../services/revisionService'
import PDFViewer from '../components/ui/PDFViewer'
import Card from '../components/ui/Card'
import { TIPOS_DOCUMENTO } from '../types'
import { useAuthStore } from '../stores/useAuthStore'
import ComentariosSection from '../components/ComentariosSection'
import HistorialVersiones from '../components/HistorialVersiones'

export default function TrabajoDetalle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [trabajo, setTrabajo] = useState<Trabajo | null>(null)
  const [revisiones, setRevisiones] = useState<Revision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectComment, setRejectComment] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [actionLoading, setActionLoading] = useState('')
  const [showCita, setShowCita] = useState(false)
  const [citaFormato, setCitaFormato] = useState('apa')
  const [citaContenido, setCitaContenido] = useState('')
  const [citaLoading, setCitaLoading] = useState(false)
  const [stats, setStats] = useState<{ vistas: number; descargas: number } | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      trabajoService.obtenerPorId(id),
      revisionService.listarRevisiones(id).catch(() => ({ data: { data: [] } }))
    ])
      .then(([trabajoRes, revRes]) => {
        setTrabajo(trabajoRes.data.data)
        setRevisiones(revRes.data.data)
      })
      .catch(() => setError('No se pudo cargar el documento.'))
    fetch(`/api/v1/trabajos/${id}/estadisticas`)
      .then((r) => r.json())
      .then((r) => { if (r.success) setStats(r.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  async function handleCambioEstado(estado: string, comentario?: string) {
    if (!trabajo) return
    setActionLoading(estado)
    try {
      await revisionService.cambiarEstado(trabajo.id, estado, comentario)
      const res = await trabajoService.obtenerPorId(trabajo.id)
      setTrabajo(res.data.data)
      const revRes = await revisionService.listarRevisiones(trabajo.id)
      setRevisiones(revRes.data.data)
      setShowRejectForm(false)
      setRejectComment('')
    } catch {
      alert('Error al cambiar el estado')
    } finally {
      setActionLoading('')
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-8 text-center text-slate-500 shadow-sm">
          Cargando documento...
        </div>
      </section>
    )
  }

  if (error || !trabajo) {
    return (
      <section className="space-y-6">
        <div className="rounded-[1.75rem] border border-rose-100 bg-rose-50 p-8 text-center text-rose-700 shadow-sm">
          <p className="text-lg font-semibold">{error || 'Documento no encontrado'}</p>
          <Link to="/search" className="mt-4 inline-block rounded-full bg-unefa px-6 py-2 text-sm font-semibold text-white">
            Volver a búsqueda
          </Link>
        </div>
      </section>
    )
  }

  const metadatos = trabajo.metadatos as Record<string, unknown> | undefined
  const tipoDoc = TIPOS_DOCUMENTO.find((t) => t.value === metadatos?.tipo_documento)

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(135deg,rgba(11,87,164,0.96),rgba(7,58,106,0.92)_55%,rgba(255,210,0,0.16))] p-8 text-white shadow-[0_30px_80px_-40px_rgba(11,87,164,0.8)] sm:p-10">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Detalle del trabajo académico</p>
            {trabajo.identificador ? (
              <p className="text-xs font-mono font-semibold tracking-wider text-white/50">
                {trabajo.identificador}
              </p>
            ) : null}
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">{trabajo.titulo}</h2>
            <div className="flex flex-wrap gap-2 text-sm font-medium">
            {tipoDoc ? (
              <span className="rounded-full bg-white/15 px-3 py-1 text-white/90">{tipoDoc.label}</span>
            ) : null}
            <span className="rounded-full bg-white/15 px-3 py-1 text-white/90">{trabajo.anio}</span>
            <span className={`rounded-full px-3 py-1 font-semibold ${
              trabajo.estado === 'publicado' ? 'bg-emerald-400/20 text-emerald-300' :
              trabajo.estado === 'en_revision' ? 'bg-sky-400/20 text-sky-300' :
              trabajo.estado === 'borrador' ? 'bg-amber-400/20 text-amber-300' :
              'bg-slate-400/20 text-slate-300'
            }`}>
              {trabajo.estado === 'publicado' ? 'Publicado' :
               trabajo.estado === 'en_revision' ? 'En revisión' :
               trabajo.estado === 'borrador' ? 'Borrador' : 'Archivado'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <Card className="border-unefa/15 bg-white/90">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Resumen</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{trabajo.resumen || 'Sin resumen disponible.'}</p>
          </Card>

          {trabajo.palabras_clave && trabajo.palabras_clave.length > 0 ? (
            <Card className="border-unefa/15 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Palabras clave</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {trabajo.palabras_clave.map((p) => (
                  <span key={p} className="rounded-full bg-unefa/10 px-3 py-1 text-xs font-semibold text-unefa-dark">
                    {p}
                  </span>
                ))}
              </div>
            </Card>
          ) : null}

          {metadatos && Object.keys(metadatos).length > 0 ? (
            <Card className="border-unefa/15 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Metadatos</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {Object.entries(metadatos).map(([key, val]) => {
                  if (!val) return null
                  const labelMap: Record<string, string> = {
                    tipo_documento: 'Tipo de documento',
                    idioma: 'Idioma',
                    paginas: 'Páginas',
                    institucion: 'Institución',
                    carrera: 'Carrera',
                    tutor_academico: 'Tutor académico',
                    tutor_industrial: 'Tutor industrial',
                    linea_investigacion: 'Línea de investigación',
                    deposito_legal: 'Depósito legal',
                    isbn: 'ISBN',
                    issn: 'ISSN',
                    doi: 'DOI',
                  }
                  return (
                    <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">{labelMap[key] || key}</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">{String(val)}</p>
                    </div>
                  )
                })}
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="border-unefa/15 bg-white/90">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Autores</p>
            <p className="mt-3 text-sm font-medium text-slate-800">{trabajo.autor}</p>
          </Card>

          {stats ? (
            <Card className="border-unefa/15 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Estadísticas de uso</p>
              <div className="mt-3 flex gap-4">
                <div className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-center">
                  <p className="text-lg font-black text-slate-900">{stats.vistas}</p>
                  <p className="text-xs text-slate-500">Visitas</p>
                </div>
                <div className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-center">
                  <p className="text-lg font-black text-slate-900">{stats.descargas}</p>
                  <p className="text-xs text-slate-500">Descargas</p>
                </div>
              </div>
            </Card>
          ) : null}

          {trabajo.estudiante ? (
            <Card className="border-unefa/15 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Estudiante</p>
              <p className="mt-3 text-sm font-medium text-slate-800">{trabajo.estudiante.nombre}</p>
              {trabajo.estudiante.cedula ? (
                <p className="text-xs text-slate-500">C.I.: {trabajo.estudiante.cedula}</p>
              ) : null}
            </Card>
          ) : null}

          {trabajo.tutorAsignado ? (
            <Card className="border-unefa/15 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Tutor asignado</p>
              <p className="mt-3 text-sm font-medium text-slate-800">{trabajo.tutorAsignado.nombre}</p>
            </Card>
          ) : trabajo.tutor ? (
            <Card className="border-unefa/15 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Tutor</p>
              <p className="mt-3 text-sm font-medium text-slate-800">{trabajo.tutor}</p>
            </Card>
          ) : null}

          {trabajo.carrera ? (
            <Card className="border-unefa/15 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Carrera</p>
              <p className="mt-3 text-sm font-medium text-slate-800">{trabajo.carrera.nombre}</p>
            </Card>
          ) : null}

          {trabajo.categoria ? (
            <Card className="border-unefa/15 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Categoría</p>
              <p className="mt-3 text-sm font-medium text-slate-800">{trabajo.categoria.nombre}</p>
            </Card>
          ) : null}

          {trabajo.archivo_url ? (
            <Card className="border-unefa/15 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Vista previa del documento</p>
              <div className="mt-4">
                <PDFViewer url={trabajo.archivo_url} />
              </div>
            </Card>
          ) : (
            <Card className="border-slate-200 bg-slate-50/70">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Sin archivo</p>
              <p className="mt-2 text-sm text-slate-600">Este documento no tiene un archivo adjunto.</p>
            </Card>
          )}

          <Card className="border-unefa/15 bg-white/90">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Citar este documento</p>
            <div className="mt-3 flex gap-2">
              {(['apa', 'bibtex', 'ris'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={async () => {
                    setCitaFormato(fmt)
                    setCitaLoading(true)
                    try {
                      const res = await fetch(`/api/v1/trabajos/${trabajo.id}/cita?formato=${fmt}`)
                      const text = await res.text()
                      setCitaContenido(text)
                      setShowCita(true)
                    } catch {
                      setCitaContenido('Error al generar la cita')
                    } finally {
                      setCitaLoading(false)
                    }
                  }}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-unefa/5 hover:border-unefa/30"
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>

            {citaLoading ? (
              <p className="mt-2 text-xs text-slate-500">Generando cita...</p>
            ) : null}

            {showCita && citaContenido ? (
              <div className="mt-3 space-y-2">
                <textarea
                  readOnly
                  value={citaContenido}
                  rows={citaFormato === 'bibtex' || citaFormato === 'ris' ? 6 : 3}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(citaContenido)}
                    className="rounded-lg bg-unefa px-3 py-1 text-xs font-semibold text-white transition hover:brightness-110"
                  >
                    Copiar
                  </button>
                  <a
                    href={`/api/v1/trabajos/${trabajo.id}/cita?formato=${citaFormato}`}
                    download
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Descargar
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowCita(false)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : null}
          </Card>

          {(user?.role === 'admin' || user?.role === 'repositor') ? (
            <>
              <div className="flex gap-3">
                <Link
                  to={`/submission?edit=${trabajo.id}`}
                  className="flex-1 rounded-xl bg-unefa/10 px-4 py-2 text-center text-sm font-semibold text-unefa-dark transition hover:bg-unefa/20"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('¿Eliminar este documento?')) return
                    try {
                      await trabajoService.eliminar(trabajo.id)
                      navigate('/search')
                    } catch {
                      alert('Error al eliminar')
                    }
                  }}
                  className="flex-1 rounded-xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-200"
                >
                  Eliminar
                </button>
              </div>

              {trabajo.estado === 'en_revision' ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-unefa">Revisión pendiente</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={actionLoading === 'publicado'}
                      onClick={() => handleCambioEstado('publicado')}
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {actionLoading === 'publicado' ? '...' : 'Aprobar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      className="flex-1 rounded-xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-200"
                    >
                      Rechazar
                    </button>
                  </div>
                  {showRejectForm ? (
                    <div className="space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
                      <textarea
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        placeholder="Indica el motivo del rechazo..."
                        className="w-full rounded-lg border border-rose-200 p-2 text-sm"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={actionLoading === 'borrador' || !rejectComment.trim()}
                          onClick={() => handleCambioEstado('borrador', rejectComment.trim())}
                          className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          {actionLoading === 'borrador' ? '...' : 'Confirmar rechazo'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowRejectForm(false); setRejectComment('') }}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}

          {user?.role === 'bibliotecario' && trabajo.estado === 'borrador' ? (
            <button
              type="button"
              disabled={actionLoading === 'en_revision'}
              onClick={() => handleCambioEstado('en_revision')}
              className="w-full rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
            >
              {actionLoading === 'en_revision' ? 'Enviando...' : 'Solicitar revisión'}
            </button>
          ) : null}

          {revisiones.length > 0 ? (
            <Card className="border-unefa/15 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Historial de revisiones</p>
              <div className="mt-3 space-y-2">
                {revisiones.map((rev) => (
                  <div key={rev.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">{rev.revisor?.nombre || 'Usuario'}</span>
                      <span className="text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 text-slate-600">
                      {rev.estado_anterior} → {rev.estado_nuevo}
                    </p>
                    {rev.comentario ? (
                      <p className="mt-1 italic text-slate-500">{rev.comentario}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          <HistorialVersiones trabajoId={id!} onRestore={() => window.location.reload()} />

          <Link
            to="/search"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-unefa/30 hover:text-unefa-dark"
          >
            ← Volver a resultados
          </Link>
        </div>

        <div className="mt-8">
          <ComentariosSection trabajoId={id!} />
        </div>
      </div>
    </section>
  )
}
