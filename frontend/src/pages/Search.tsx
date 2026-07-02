import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { trabajoService, categoriaService, type Trabajo, type Categoria } from '../services/trabajoService'
import { TIPOS_DOCUMENTO } from '../types'
import { SkeletonCard } from '../components/ui/Skeleton'

export default function Search() {
  const [query, setQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('')
  const [tipoDocFilter, setTipoDocFilter] = useState('')
  const [results, setResults] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    categoriaService.listar()
      .then((res) => setCategorias(res.data.data))
      .catch(() => {})
  }, [])

  async function doSearch(q: string, y: string, cat: string, tipoDoc: string, page: number = 1) {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { estado: 'publicado', pagina: page, limite: 10 }
      if (q.trim()) params.q = q.trim()
      if (y) params.anio = y
      if (cat) params.categoria = cat
      if (tipoDoc) params.tipo_documento = tipoDoc
      const res = await trabajoService.buscar(params as any)
      setResults(res.data.datos)
      setTotal(res.data.total)
      setPagina(page)
      setTotalPaginas(res.data.totalPaginas || 1)
    } catch {
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('query') ?? ''
    const y = params.get('year') ?? ''
    const cat = params.get('categoria') ?? ''
    const tipoDoc = params.get('tipo_documento') ?? ''
    const page = parseInt(params.get('pagina') || '1', 10)
    setQuery(q)
    setYearFilter(y)
    setCategoriaFilter(cat)
    setTipoDocFilter(tipoDoc)

    doSearch(q, y, cat, tipoDoc, page)
  }, [location.search, categorias])

  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">Repository / Search</p>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Búsqueda avanzada</h2>
        <p className="text-slate-600">Consulta documentos académicos en el repositorio.</p>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-4 md:items-end">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Término de búsqueda</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Título o autor"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Año</span>
            <Input value={yearFilter} onChange={(event) => setYearFilter(event.target.value.replace(/\D/g, ''))} placeholder="2022" inputMode="numeric" />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Carrera</span>
            <select value={categoriaFilter} onChange={(e) => setCategoriaFilter(e.target.value)} className="w-full rounded-md border px-2 py-2 text-sm">
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Tipo de documento</span>
            <select value={tipoDocFilter} onChange={(e) => setTipoDocFilter(e.target.value)} className="w-full rounded-md border px-2 py-2 text-sm">
              <option value="">Todos</option>
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
        </div>

          <div className="mt-4 flex gap-3">
            <Button type="button" onClick={() => { setQuery(''); setYearFilter(''); setCategoriaFilter(''); setTipoDocFilter(''); navigate('/search') }}>
              Limpiar filtros
            </Button>
            <Button variant="secondary" type="button" onClick={() => {
              const params = new URLSearchParams()
              if (query.trim()) params.set('query', query.trim())
              if (yearFilter) params.set('year', yearFilter)
              if (categoriaFilter) params.set('categoria', categoriaFilter)
              if (tipoDocFilter) params.set('tipo_documento', tipoDocFilter)
              params.set('pagina', '1')
              navigate(`/search?${params.toString()}`)
            }}>
              Aplicar
            </Button>
          </div>
      </Card>

      {loading ? (
        <div className="grid gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((document) => (
            <Card key={document.id}>
              <Link to={`/trabajos/${document.id}`} className="block">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 hover:text-unefa transition-colors">{document.titulo}</h3>
                    <p className="mt-1 text-sm text-slate-600">{document.autor}</p>
                  </div>
                  <span className="inline-flex w-fit shrink-0 rounded-full bg-unefa/10 px-3 py-1 text-xs font-semibold text-unefa">
                    {document.anio} · {document.estado}
                  </span>
                </div>
                {document.snippet ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 [&>b]:font-semibold [&>b]:text-unefa-dark" dangerouslySetInnerHTML={{ __html: document.snippet }} />
                ) : document.resumen ? (
                  <p className="mt-3 text-sm text-slate-600">{document.resumen}</p>
                ) : null}
              </Link>
              {document.archivo_url ? (
                <a
                  href={document.archivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-unefa/10 px-3 py-1 text-xs font-semibold text-unefa-dark hover:bg-unefa/20"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar PDF
                </a>
              ) : null}
            </Card>
          ))}

          {results.length === 0 ? <Card><p className="text-sm text-slate-600">No hay resultados con esos filtros.</p></Card> : null}
        </div>
      )}

      {totalPaginas > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={pagina <= 1}
            onClick={() => {
              const params = new URLSearchParams(location.search)
              params.set('pagina', String(pagina - 1))
              navigate(`/search?${params.toString()}`)
            }}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-unefa/30 hover:text-unefa-dark disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="text-sm font-medium text-slate-500">
            Página {pagina} de {totalPaginas} ({total} resultados)
          </span>
          <button
            type="button"
            disabled={pagina >= totalPaginas}
            onClick={() => {
              const params = new URLSearchParams(location.search)
              params.set('pagina', String(pagina + 1))
              navigate(`/search?${params.toString()}`)
            }}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-unefa/30 hover:text-unefa-dark disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      ) : null}
    </section>
  )
}
