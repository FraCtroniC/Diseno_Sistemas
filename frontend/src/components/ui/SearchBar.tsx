import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trabajoService, type Trabajo } from '../../services/trabajoService'
import { TIPOS_DOCUMENTO } from '../../types'

export default function SearchBar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('')
  const [tipoDoc, setTipoDoc] = useState('')
  const [openAdvanced, setOpenAdvanced] = useState(false)
  const [focused, setFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<Trabajo[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    if (q.length === 0) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await trabajoService.buscar({ q, limite: 6, estado: 'publicado' })
        setSuggestions(res.data.datos)
      } catch {
        setSuggestions([])
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  function submitSearch() {
    const params = new URLSearchParams()
    if (query.trim()) params.set('query', query.trim())
    if (year) params.set('year', year)
    if (tipoDoc) params.set('tipo_documento', tipoDoc)
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
          placeholder="Buscar títulos, autores o contenido de PDFs..."
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-unefa/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={() => setOpenAdvanced((s) => !s)}
          className="rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-unefa/5 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Filtros
        </button>

        <button
          type="button"
          onClick={submitSearch}
          className="rounded-full bg-[linear-gradient(135deg,#0b57a4,#073a6a)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-unefa/20 hover:brightness-110"
        >Buscar</button>
      </div>

      {focused && suggestions.length > 0 ? (
        <div className="absolute left-0 top-full z-40 mt-2 w-full rounded-xl border bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <ul className="divide-y dark:divide-slate-700">
            {suggestions.map((r) => (
              <li key={r.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <button
                  type="button"
                  onClick={() => { setQuery(r.titulo); navigate(`/search?query=${encodeURIComponent(r.titulo)}`); setFocused(false) }}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{r.titulo}</div>
                      <div className="text-xs text-slate-500">{r.autor} • {r.anio}</div>
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

          <label className="mt-3 block text-xs text-slate-600">Tipo de documento</label>
          <select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1 text-sm">
            <option value="">Todos</option>
            {TIPOS_DOCUMENTO.map((c) => (
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
