import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { trabajoService, type Trabajo } from '../services/trabajoService'
import Card from '../components/ui/Card'
import { TIPOS_DOCUMENTO } from '../types'
import { useAuthStore } from '../stores/useAuthStore'

export default function TrabajoDetalle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [trabajo, setTrabajo] = useState<Trabajo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    trabajoService.obtenerPorId(id)
      .then((res) => setTrabajo(res.data.data))
      .catch(() => setError('No se pudo cargar el documento.'))
      .finally(() => setLoading(false))
  }, [id])

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
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">{trabajo.titulo}</h2>
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            {tipoDoc ? (
              <span className="rounded-full bg-white/15 px-3 py-1 text-white/90">{tipoDoc.label}</span>
            ) : null}
            <span className="rounded-full bg-white/15 px-3 py-1 text-white/90">{trabajo.anio}</span>
            <span className={`rounded-full px-3 py-1 font-semibold ${
              trabajo.estado === 'publicado' ? 'bg-emerald-400/20 text-emerald-300' :
              trabajo.estado === 'borrador' ? 'bg-amber-400/20 text-amber-300' :
              'bg-slate-400/20 text-slate-300'
            }`}>
              {trabajo.estado === 'publicado' ? 'Publicado' : trabajo.estado === 'borrador' ? 'Borrador' : 'Archivado'}
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

          {trabajo.tutor ? (
            <Card className="border-unefa/15 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Tutor</p>
              <p className="mt-3 text-sm font-medium text-slate-800">{trabajo.tutor}</p>
            </Card>
          ) : null}

          {trabajo.categoria ? (
            <Card className="border-unefa/15 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Categoría</p>
              <p className="mt-3 text-sm font-medium text-slate-800">{trabajo.categoria.nombre}</p>
            </Card>
          ) : null}

          {trabajo.archivo_url ? (
            <Card className="border-emerald-100 bg-emerald-50/70">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Archivo disponible</p>
              <a
                href={`/api/v1${trabajo.archivo_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0b57a4,#073a6a)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-unefa/20 transition hover:brightness-110"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
              </a>
            </Card>
          ) : (
            <Card className="border-slate-200 bg-slate-50/70">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Sin archivo</p>
              <p className="mt-2 text-sm text-slate-600">Este documento no tiene un archivo adjunto.</p>
            </Card>
          )}

          {user && (user.role === 'admin' || user.role === 'repositor') ? (
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
          ) : null}

          <Link
            to="/search"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-unefa/30 hover:text-unefa-dark"
          >
            ← Volver a resultados
          </Link>
        </div>
      </div>
    </section>
  )
}
