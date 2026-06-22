import { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useLocation, useNavigate } from 'react-router-dom'
import { trabajoService, categoriaService, type Trabajo, type Categoria } from '../services/trabajoService'
import { TIPOS_DOCUMENTO } from '../types'

export default function Search() {
  const [query, setQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('')
  const [tipoDocFilter, setTipoDocFilter] = useState('')
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

  async function doSearch(q: string, y: string, cat: string, tipoDoc: string) {
    setLoading(true)
    try {
      const params: Record<string, string> = { estado: 'publicado' }
      if (q.trim()) params.q = q.trim()
      if (y) params.anio = y
      if (cat) params.categoria = cat
      if (tipoDoc) params.tipo_documento = tipoDoc
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
    const cat = params.get('categoria') ?? ''
    const tipoDoc = params.get('tipo_documento') ?? ''
    setQuery(q)
    setYearFilter(y)
    setCategoriaFilter(cat)
    setTipoDocFilter(tipoDoc)

    doSearch(q, y, cat, tipoDoc)
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
