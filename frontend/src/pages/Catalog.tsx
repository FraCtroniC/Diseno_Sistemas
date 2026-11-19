import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useTrabajoStore } from '../stores/useTrabajoStore'
import { TIPOS_DOCUMENTO, esPostgrado, type TipoDocumento } from '../types'

type CatalogKey = TipoDocumento | 'maestrias' | 'doctorados'

const catalogConfig: Record<CatalogKey, { title: string; subtitle: string; description: string; accent: string }> = {
  pregrado: {
    title: 'Pregrado',
    subtitle: 'Trabajos de grado y proyectos académicos',
    description: 'Trabajos, tesis y proyectos desarrollados por estudiantes de pregrado.',
    accent: 'bg-unefa/10 text-unefa-dark',
  },
  postgrado: {
    title: 'Postgrado',
    subtitle: 'Investigación avanzada y tesis especializadas',
    description: 'Maestrías, especializaciones y doctorados con enfoque investigativo.',
    accent: 'bg-slate-900 text-white',
  },
  maestrias: {
    title: 'Maestrías',
    subtitle: 'Programas de maestría UNEFA',
    description: 'Trabajos de investigación y tesis de los programas de maestría del núcleo Táchira.',
    accent: 'bg-emerald-100 text-emerald-900',
  },
  doctorados: {
    title: 'Doctorados',
    subtitle: 'Programas de doctorado UNEFA',
    description: 'Tesis doctorales y proyectos de investigación avanzada del núcleo Táchira.',
    accent: 'bg-violet-100 text-violet-900',
  },
  normativas: {
    title: 'Normativas',
    subtitle: 'Reglamentos y resoluciones',
    description: 'Marco normativo para la elaboración, revisión y publicación académica.',
    accent: 'bg-amber-100 text-slate-900',
  },
  institucional: {
    title: 'Documentación institucional',
    subtitle: 'Manuales y procedimientos',
    description: 'Documentos de soporte para procesos y gestión administrativa interna.',
    accent: 'bg-blue-100 text-unefa-dark',
  },
  editorial: {
    title: 'Editorial de publicaciones',
    subtitle: 'Libros y colecciones editoriales',
    description: 'Publicaciones con sello editorial, memorias y compilaciones especiales.',
    accent: 'bg-emerald-100 text-emerald-900',
  },
  divulgacion: {
    title: 'Divulgación',
    subtitle: 'Boletines y recursos de difusión',
    description: 'Material divulgativo para compartir resultados y contenidos de interés público.',
    accent: 'bg-rose-100 text-rose-900',
  },
}

const categoryOrder: CatalogKey[] = [
  'pregrado', 'postgrado', 'maestrias', 'doctorados',
  'normativas', 'institucional', 'editorial', 'divulgacion',
]

function isCatalogKey(value: string | undefined): value is CatalogKey {
  return Boolean(value && categoryOrder.includes(value as CatalogKey))
}

const vistasPosgrado: CatalogKey[] = ['postgrado', 'maestrias', 'doctorados']

const ITEMS_PER_PAGE = 6

export default function Catalog() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const tipo = isCatalogKey(params.category) ? params.category : 'pregrado'
  const config = catalogConfig[tipo]
  const [page, setPage] = useState(1)

  const programaParam = searchParams.get('programa') ?? ''
  const rutaActual = `/catalogo/${tipo}`

  // Las rutas dedicadas a maestría/doctorado filtran por el nivel del programa;
  // /catalogo/postgrado respeta el tipo de documento y muestra ambos niveles.
  const nivelRequerido = tipo === 'maestrias' ? 'maestria' : tipo === 'doctorados' ? 'doctorado' : undefined
  const tipoDocumentoRequerido: TipoDocumento =
    tipo === 'maestrias' || tipo === 'doctorados' ? 'postgrado' : tipo

  const { mapToDocumentItems, fetchTrabajos, fetchCategorias, loading, error } = useTrabajoStore()

  useEffect(() => {
    fetchCategorias()
    fetchTrabajos({ estado: 'publicado' })
  }, [fetchCategorias, fetchTrabajos])

  useEffect(() => {
    setPage(1)
  }, [tipo, programaParam])

  const all = mapToDocumentItems()

  const baseFiltrados = useMemo(
    () => all
      .filter((document) => {
        if (document.status !== 'published') return false
        if (document.tipoDocumento !== tipoDocumentoRequerido) return false
        if (nivelRequerido && document.nivel?.slug !== nivelRequerido) return false
        return true
      })
      .sort((a, b) => b.year - a.year),
    [all, tipoDocumentoRequerido, nivelRequerido],
  )

  const programas = useMemo(() => {
    const vistos = new Map<string, string>()
    baseFiltrados.forEach((document) => {
      if (document.carreraSlug && document.carrera) {
        vistos.set(document.carreraSlug, document.carrera)
      }
    })
    return Array.from(vistos, ([slug, nombre]) => ({ slug, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [baseFiltrados])

  const filtered = useMemo(
    () => programaParam
      ? baseFiltrados.filter((document) => document.carreraSlug === programaParam)
      : baseFiltrados,
    [baseFiltrados, programaParam],
  )

  const documents = filtered.slice(0, page * ITEMS_PER_PAGE)
  const highlight = documents[0]
  const mostrarFiltrosPosgrado = vistasPosgrado.includes(tipo)
  const programaActivo = programas.find((programa) => programa.slug === programaParam)

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(135deg,rgba(11,87,164,0.96),rgba(7,58,106,0.92)_55%,rgba(255,210,0,0.16))] p-8 text-white shadow-[0_30px_80px_-40px_rgba(11,87,164,0.8)] sm:p-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Catálogo por categoría</p>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">{config.title}</h2>
          <p className="max-w-2xl text-lg leading-8 text-white/82">{config.description}</p>
        </div>
      </div>

      {error ? (
        <Card className="border-rose-100 bg-rose-50/80 dark:border-rose-900/40 dark:bg-rose-900/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
            <Button variant="secondary" onClick={() => fetchTrabajos({ estado: 'publicado' })}>Reintentar</Button>
          </div>
        </Card>
      ) : null}

      {mostrarFiltrosPosgrado ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[1.25rem] border border-white/70 bg-white/70 p-3 dark:border-slate-700/50 dark:bg-slate-800/60">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Nivel:</span>
          {([
            { to: '/catalogo/postgrado', label: 'Todos', activo: tipo === 'postgrado' },
            { to: '/catalogo/maestrias', label: 'Maestrías', activo: tipo === 'maestrias' },
            { to: '/catalogo/doctorados', label: 'Doctorados', activo: tipo === 'doctorados' },
          ]).map((opcion) => (
            <Link
              key={opcion.to}
              to={opcion.to}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${opcion.activo ? 'bg-unefa text-white shadow-sm' : 'bg-white/85 text-slate-700 hover:bg-unefa/10 hover:text-unefa-dark dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-unefa/20 dark:hover:text-unefa-accent'}`}
            >
              {opcion.label}
            </Link>
          ))}

          <span className="mx-2 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-600" />
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Programa:</span>
          <Link
            to={rutaActual}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${!programaParam ? 'bg-slate-900 text-white' : 'bg-white/85 text-slate-600 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300'}`}
          >
            Todos
          </Link>
          {programas.map((programa) => (
            <Link
              key={programa.slug}
              to={`${rutaActual}?programa=${programa.slug}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${programaParam === programa.slug ? 'bg-slate-900 text-white' : 'bg-white/85 text-slate-600 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300'}`}
            >
              {programa.nombre}
            </Link>
          ))}
          {programas.length === 0 ? (
            <span className="text-xs text-slate-400">Aún no hay programas con publicaciones.</span>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="border-unefa/15 bg-white/90 shadow-[0_24px_70px_-50px_rgba(11,87,164,0.45)] dark:bg-slate-800/90 dark:shadow-[0_24px_70px_-50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-700/50">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">{config.subtitle}</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
                {filtered.length} documentos publicados{programaActivo ? ` · ${programaActivo.nombre}` : ''}
              </h3>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.accent}`}>{config.title}</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {loading ? (
              <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (
              documents.map((document) => (
                <Link key={document.id} to={`/trabajos/${document.id}`} className="block rounded-[1.4rem] border border-slate-200 bg-white p-5 transition hover:border-unefa/25 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{document.year}</p>
                    {document.tipoDocumento ? (
                      <span className="rounded-full bg-unefa/10 px-2 py-0.5 text-xs font-semibold text-unefa-dark">
                        {TIPOS_DOCUMENTO.find(t => t.value === document.tipoDocumento)?.label || document.tipoDocumento}
                      </span>
                    ) : null}
                  </div>
                  <h4 className="mt-2 text-lg font-black leading-6 text-slate-900 dark:text-slate-100">{document.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{document.abstract}</p>
                  <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">{document.authors.join(' · ')}</p>
                  {document.nivel ? (
                    <p className="mt-1 text-xs font-semibold text-unefa-dark dark:text-unefa-accent">
                      {[document.carrera, document.nivel.nombre].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                </Link>
              ))
            )}

            {!loading && documents.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 md:col-span-2 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                Todavía no hay publicaciones cargadas para esta categoría.
              </div>
            ) : null}
            {!loading && filtered.length > ITEMS_PER_PAGE && documents.length < filtered.length ? (
              <div className="md:col-span-2 flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full border border-unefa/20 bg-white px-6 py-2 text-sm font-semibold text-unefa-dark transition hover:bg-unefa/5 hover:shadow-sm dark:border-unefa/30 dark:bg-slate-800 dark:text-unefa-accent dark:hover:bg-slate-700"
                >
                  Mostrar más ({filtered.length - documents.length} restantes)
                </button>
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="border-unefa/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.98))] shadow-[0_24px_70px_-50px_rgba(11,87,164,0.45)] dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.98),rgba(15,23,42,0.98))] dark:shadow-[0_24px_70px_-50px_rgba(0,0,0,0.5)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-unefa">Destacado</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Ficha rápida</h3>

          {highlight ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Título</p>
                <p className="mt-2 text-xl font-black leading-tight text-slate-900 dark:text-slate-100">{highlight.title}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Autores</p>
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">{highlight.authors.join(', ')}</p>
              </div>
              {highlight.nivel ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Programa</p>
                  <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                    {[highlight.carrera, highlight.nivel.nombre].filter(Boolean).join(' · ')}
                  </p>
                  {esPostgrado(highlight.nivel) ? (
                    <p className="mt-1 text-xs text-slate-500">Producción de postgrado</p>
                  ) : null}
                </div>
              ) : null}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Resumen</p>
                <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">{highlight.abstract}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-800">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Año</p>
                <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">{highlight.year}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">No hay contenido destacado para mostrar.</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/search"
              className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0b57a4,#073a6a)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-unefa/20 transition hover:brightness-110"
            >
              Buscar en todo el repositorio
            </Link>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">Filtrar:</span>
        {TIPOS_DOCUMENTO.map((item) => (
          <Link
            key={item.value}
            to={`/catalogo/${item.value}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${item.value === tipo ? 'bg-unefa text-white shadow-sm' : 'bg-white/85 text-slate-700 hover:bg-unefa/10 hover:text-unefa-dark dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-unefa/20 dark:hover:text-unefa-accent'}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
