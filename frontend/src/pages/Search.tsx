import { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useLocation, useNavigate } from 'react-router-dom'
import { trabajoService, categoriaService, type Trabajo, type Categoria } from '../services/trabajoService'

export default function Search() {
  const [query, setQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [category, setCategory] = useState('')
  const [results, setResults] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    categoriaService.listar()
      .then((res) => setCategorias(res.data.data))
      .catch(() => {})
  }, [])

  function slugToId(slug: string): string | undefined {
    return categorias.find((c) => c.slug === slug)?.id
  }

  async function doSearch(q: string, y: string, c: string) {
    setLoading(true)
    try {
      const params: Record<string, string> = { estado: 'publicado' }
      if (q.trim()) params.q = q.trim()
      if (y) params.anio = y
      if (c) {
        const id = slugToId(c)
        if (id) params.categoria = id
      }
      const res = await trabajoService.buscar(params as any)
      setResults(res.data.datos)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('query') ?? ''
    const y = params.get('year') ?? ''
    const c = params.get('category') ?? ''
    setQuery(q)
    setYearFilter(y)
    setCategory(c)

    doSearch(q, y, c)
  }, [location.search, categorias])

  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-unefa">Repository / Search</p>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Búsqueda avanzada</h2>
        <p className="text-slate-600">Consulta documentos académicos en el repositorio.</p>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-3 md:items-end">
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
            <span className="text-sm font-medium text-slate-700">Categoría</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border px-2 py-2 text-sm">
              <option value="">Todas</option>
              <option value="pregrado">Pregrado</option>
              <option value="postgrado">Postgrado</option>
              <option value="normativas">Normativas</option>
              <option value="institucional">Documentación institucional</option>
              <option value="editorial">Editorial</option>
              <option value="divulgacion">Divulgación</option>
            </select>
          </label>
        </div>

          <div className="mt-4 flex gap-3">
            <Button type="button" onClick={() => { setQuery(''); setYearFilter(''); setCategory(''); navigate('/search') }}>
              Limpiar filtros
            </Button>
            <Button variant="secondary" type="button" onClick={() => {
              const params = new URLSearchParams()
              if (query.trim()) params.set('query', query.trim())
              if (yearFilter) params.set('year', yearFilter)
              if (category) params.set('category', category)
              navigate(`/search?${params.toString()}`)
            }}>
              Aplicar
            </Button>
          </div>
      </Card>

      {loading ? (
        <Card><p className="text-sm text-slate-500">Buscando...</p></Card>
      ) : (
        <div className="grid gap-4">
          {results.map((document) => (
            <Card key={document.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{document.titulo}</h3>
                  <p className="mt-1 text-sm text-slate-600">{document.autor}</p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-unefa/10 px-3 py-1 text-xs font-semibold text-unefa">
                  {document.anio} · {document.estado}
                </span>
              </div>
              {document.resumen ? <p className="mt-3 text-sm text-slate-600">{document.resumen}</p> : null}
            </Card>
          ))}

          {results.length === 0 ? <Card><p className="text-sm text-slate-600">No hay resultados con esos filtros.</p></Card> : null}
        </div>
      )}
    </section>
  )
}
