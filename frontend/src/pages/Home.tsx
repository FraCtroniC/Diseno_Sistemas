import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useTrabajoStore } from '../stores/useTrabajoStore'

export default function Home() {
  const { mapToDocumentItems, fetchTrabajos, fetchCategorias, loading } = useTrabajoStore()

  useEffect(() => {
    fetchCategorias()
    fetchTrabajos({ estado: 'publicado' })
  }, [])

  const all = mapToDocumentItems()
  const latestPublications = all.sort((a, b) => b.year - a.year)
  const [selectedId, setSelectedId] = useState('')
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    if (!selectedId && latestPublications[0]) {
      setSelectedId(latestPublications[0].id)
    }
  }, [latestPublications, selectedId, latestPublications.length])

  useEffect(() => {
    if (!isDetailOpen) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDetailOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDetailOpen])

  const selectedPublication = latestPublications.find((document) => document.id === selectedId) ?? latestPublications[0]

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-8 text-center text-slate-500 shadow-sm">
          Cargando publicaciones...
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(135deg,rgba(11,87,164,0.96),rgba(7,58,106,0.92)_55%,rgba(255,210,0,0.16))] p-8 text-white shadow-[0_30px_80px_-40px_rgba(11,87,164,0.8)] sm:p-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Repositorio académico</p>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Producción intelectual, normativa y divulgación en un solo lugar.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-white/82">
            La interfaz ahora agrupa mejor los módulos del sistema: normativas, producción de pregrado y postgrado,
            documentación institucional y editorial de publicaciones.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)]">
        <Card className="overflow-hidden border-unefa/15 bg-white/90 p-0 shadow-[0_24px_70px_-50px_rgba(11,87,164,0.45)]">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Últimas publicaciones</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Explora los trabajos recientes</h3>
                <p className="mt-1 text-sm text-slate-600">Selecciona una tarjeta para ver la ficha técnica completa.</p>
              </div>
              <p className="text-sm font-medium text-slate-500">{latestPublications.length} resultados</p>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6">
            <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:overflow-visible lg:pb-0">
              {latestPublications.map((document) => {
                const isSelected = document.id === selectedPublication?.id

                return (
                  <Link
                    key={document.id}
                    to={`/trabajos/${document.id}`}
                    className={`min-w-[260px] snap-start rounded-[1.4rem] border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-unefa/40 lg:min-w-0 ${
                      isSelected
                        ? 'border-unefa bg-[linear-gradient(180deg,rgba(11,87,164,0.08),rgba(255,255,255,1))] shadow-[0_18px_50px_-34px_rgba(11,87,164,0.55)]'
                        : 'border-slate-200 bg-white hover:border-unefa/25 hover:bg-unefa/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{document.year}</p>
                        <h4 className="mt-2 text-base font-black leading-6 text-slate-900">{document.title}</h4>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isSelected ? 'bg-unefa text-white' : 'bg-slate-100 text-slate-600'}`}>
                        Ficha
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {document.abstract}
                    </p>
                    <p className="mt-4 text-xs font-medium text-slate-500">{document.authors.join(' · ')}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-unefa">
                      Ver ficha técnica
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {isDetailOpen && selectedPublication ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsDetailOpen(false)} aria-hidden="true" />
          <Card className="relative z-10 w-full max-w-4xl overflow-hidden border-unefa/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(244,248,255,0.98))] p-0 shadow-[0_30px_90px_-35px_rgba(11,87,164,0.55)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Detalle del Trabajo Académico</p>
                <h3 className="mt-2 text-2xl font-black text-slate-900">Ficha técnica</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-unefa/30 hover:text-unefa-dark"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Título</p>
                  <h4 className="mt-2 text-3xl font-black leading-tight text-slate-900">{selectedPublication.title}</h4>
                </div>

                <div className="rounded-[1.4rem] border border-unefa/10 bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Resumen</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{selectedPublication.abstract}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-unefa/10 px-3 py-1 font-semibold text-unefa-dark">Publicación reciente</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                    Selecciona otra tarjeta para cambiar
                  </span>
                </div>
              </div>

              <div className="grid gap-4 self-start sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Autores</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">{selectedPublication.authors.join(', ')}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Año</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">{selectedPublication.year}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {all.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { tipo: 'pregrado' as const, label: 'Pregrado', desc: 'Trabajos de grado y tesis de pregrado.' },
            { tipo: 'postgrado' as const, label: 'Postgrado', desc: 'Investigación avanzada y tesis de postgrado.' },
            { tipo: 'normativas' as const, label: 'Normativas', desc: 'Reglamentos, resoluciones y lineamientos.' },
            { tipo: 'institucional' as const, label: 'Documentación institucional', desc: 'Manuales, procedimientos y guías.' },
            { tipo: 'editorial' as const, label: 'Editorial', desc: 'Libros, memorias y publicaciones.' },
            { tipo: 'divulgacion' as const, label: 'Divulgación', desc: 'Boletines y recursos de difusión.' },
          ].map((item) => {
            const count = all.filter((d) => d.tipoDocumento === item.tipo && d.status === 'published').length
            return (
              <Card key={item.tipo} className="border-unefa/15 bg-white/90 transition hover:shadow-md">
                <p className="text-sm font-semibold text-unefa">{item.label}</p>
                <p className="mt-1 text-3xl font-black text-slate-900">{count}</p>
                <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
              </Card>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
