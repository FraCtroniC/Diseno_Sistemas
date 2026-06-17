import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockDocuments } from '../../mocks/data'

const categories = [
  { value: '', label: 'Todas' },
  { value: 'pregrado', label: 'Pregrado' },
  { value: 'postgrado', label: 'Postgrado' },
  { value: 'normativas', label: 'Normativas' },
  { value: 'institucional', label: 'Documentación institucional' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'divulgacion', label: 'Divulgación' },
]

export default function SearchBar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('')
  const [category, setCategory] = useState('')
  const [openAdvanced, setOpenAdvanced] = useState(false)
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setFocused(false)
        setOpenAdvanced(false)
      }
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length === 0) return []
    return mockDocuments
      .filter((d) => d.status === 'published')
      .filter((d) => d.title.toLowerCase().includes(q) || d.authors.join(' ').toLowerCase().includes(q))
      .slice(0, 6)
  }, [query])

  function submitSearch() {
    const params = new URLSearchParams()
    if (query.trim()) params.set('query', query.trim())
    if (year) params.set('year', year)
    if (category) params.set('category', category)
    navigate(`/search?${params.toString()}`)
    setFocused(false)
    setOpenAdvanced(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') submitSearch() }}
          placeholder="Buscar títulos o autores..."
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-unefa/40"
        />

        <button
          type="button"
          onClick={() => setOpenAdvanced((s) => !s)}
          className="hidden rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-unefa/5 lg:inline-flex"
        >
          Filtros
        </button>

        <button
          type="button"
          onClick={submitSearch}
          className="rounded-full bg-[linear-gradient(135deg,#0b57a4,#073a6a)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-unefa/20 hover:brightness-110"
        >Buscar</button>
      </div>

      {focused && results.length > 0 ? (
        <div className="absolute left-0 top-full z-40 mt-2 w-full rounded-xl border bg-white shadow-lg">
          <ul className="divide-y">
            {results.map((r) => (
              <li key={r.id} className="px-4 py-3 hover:bg-slate-50">
                <button
                  type="button"
                  onClick={() => { setQuery(r.title); navigate(`/search?query=${encodeURIComponent(r.title)}`); setFocused(false) }}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{r.title}</div>
                      <div className="text-xs text-slate-500">{r.authors.join(', ')} • {r.year}</div>
                    </div>
                    <div className="text-xs text-slate-400">Ver</div>
                  </div>
                </button>
              </li>
            ))}
            <li className="px-4 py-2">
              <button onClick={submitSearch} className="w-full text-left text-sm text-unefa font-semibold">Ver todos los resultados</button>
            </li>
          </ul>
        </div>
      ) : null}

      {openAdvanced ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-full max-w-xs rounded-xl border bg-white p-4 shadow-lg">
          <label className="block text-xs text-slate-600">Año</label>
          <input value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))} placeholder="2024" inputMode="numeric" className="mt-1 w-full rounded-md border px-2 py-1 text-sm" />

          <label className="mt-3 block text-xs text-slate-600">Categoría</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1 text-sm">
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <div className="mt-4 flex justify-end">
            <button onClick={() => { setOpenAdvanced(false); submitSearch() }} className="rounded-full bg-unefa px-4 py-1 text-sm font-semibold text-white">Aplicar</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
