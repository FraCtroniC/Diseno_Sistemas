import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { categoriaService, type Categoria, type Trabajo } from '../services/trabajoService'
import { revisionService, type EstadoCola } from '../services/revisionService'
import { TIPOS_DOCUMENTO } from '../types'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'

const tabs: { id: EstadoCola; label: string; description: string }[] = [
  {
    id: 'en_revision',
    label: 'Pendientes de revisión',
    description: 'Trabajos que esperan aprobación o rechazo.',
  },
  {
    id: 'borrador',
    label: 'Borradores',
    description: 'Trabajos guardados que todavía no se han enviado a revisión.',
  },
]

function getTipoDocumento(trabajo: Trabajo) {
  const tipo = trabajo.metadatos?.tipo_documento
  if (typeof tipo !== 'string') return undefined
  return TIPOS_DOCUMENTO.find((item) => item.value === tipo)
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function Revisiones() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: EstadoCola = tabParam === 'borradores' ? 'borrador' : 'en_revision'
  const [pendientes, setPendientes] = useState<Trabajo[]>([])
  const [borradores, setBorradores] = useState<Trabajo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('')
  const [actionId, setActionId] = useState('')
  const [rejectTarget, setRejectTarget] = useState<Trabajo | null>(null)
  const [rejectComment, setRejectComment] = useState('')

  const loadCola = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [pendientesRes, borradoresRes] = await Promise.all([
        revisionService.listarPendientes('en_revision'),
        revisionService.listarPendientes('borrador'),
      ])
      setPendientes(pendientesRes.data.datos)
      setBorradores(borradoresRes.data.datos)
      window.dispatchEvent(new Event('revisiones:actualizadas'))
    } catch {
      setError('No se pudo cargar la cola de revisión.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCola()
    categoriaService.listar()
      .then((res) => setCategorias(res.data.data))
      .catch(() => {})
  }, [loadCola])

  function changeTab(tab: EstadoCola) {
    setSearchParams(tab === 'borrador' ? { tab: 'borradores' } : {}, { replace: true })
  }

  const items = activeTab === 'en_revision' ? pendientes : borradores

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return items.filter((trabajo) => {
      if (categoriaFilter && trabajo.categoria_id !== categoriaFilter) return false
      if (!term) return true

      const haystack = [
        trabajo.titulo,
        trabajo.autor,
        trabajo.usuario?.nombre,
        trabajo.categoria?.nombre,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [items, search, categoriaFilter])

  async function handleAprobar(trabajo: Trabajo) {
    if (!window.confirm(`¿Aprobar y publicar "${trabajo.titulo}"?`)) return

    setActionId(trabajo.id)
    try {
      await revisionService.cambiarEstado(trabajo.id, 'publicado')
      toast.success('Trabajo aprobado y publicado')
      await loadCola()
    } catch {
      toast.error('No se pudo aprobar el trabajo')
    } finally {
      setActionId('')
    }
  }

  async function handleEnviarARevision(trabajo: Trabajo) {
    if (!window.confirm(`¿Enviar "${trabajo.titulo}" a revisión?`)) return

    setActionId(trabajo.id)
    try {
      await revisionService.cambiarEstado(trabajo.id, 'en_revision')
      toast.success('Trabajo enviado a revisión')
      changeTab('en_revision')
      await loadCola()
    } catch {
      toast.error('No se pudo enviar el trabajo a revisión')
    } finally {
      setActionId('')
    }
  }

  function openReject(trabajo: Trabajo) {
    setRejectTarget(trabajo)
    setRejectComment('')
  }

  function closeReject() {
    setRejectTarget(null)
    setRejectComment('')
  }

  async function handleRechazar() {
    if (!rejectTarget || !rejectComment.trim()) return

    setActionId(rejectTarget.id)
    try {
      await revisionService.cambiarEstado(rejectTarget.id, 'borrador', rejectComment.trim())
      toast.success('Trabajo rechazado y devuelto a borrador')
      closeReject()
      await loadCola()
    } catch {
      toast.error('No se pudo rechazar el trabajo')
    } finally {
      setActionId('')
    }
  }

  return (
    <section className="space-y-6 pb-6">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(135deg,rgba(11,87,164,0.96),rgba(7,58,106,0.92)_55%,rgba(255,210,0,0.16))] p-6 text-white shadow-[0_30px_80px_-40px_rgba(11,87,164,0.8)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Gestión editorial</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Bandeja de revisión</h2>
            <p className="text-sm leading-6 text-white/80 sm:text-base">
              Revisa los envíos pendientes, aprueba publicaciones o devuelve trabajos con observaciones.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm font-semibold text-white/85">
            <span className="rounded-full bg-white/12 px-4 py-2">{pendientes.length} pendientes</span>
            <span className="rounded-full bg-white/12 px-4 py-2">{borradores.length} borradores</span>
            <button
              type="button"
              onClick={loadCola}
              disabled={loading}
              className="rounded-full bg-white px-4 py-2 text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      <Card className="border-white/80 bg-white/90 dark:border-slate-700/50 dark:bg-slate-800/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const count = tab.id === 'en_revision' ? pendientes.length : borradores.length
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => changeTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-unefa text-white shadow-lg shadow-unefa/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-unefa/10 hover:text-unefa-dark dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              )
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título, autor o categoría"
            />
            <select
              value={categoriaFilter}
              onChange={(event) => setCategoriaFilter(event.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {tabs.find((tab) => tab.id === activeTab)?.description}
        </p>
      </Card>

      {error ? (
        <Card className="border-rose-100 bg-rose-50/80 dark:border-rose-900/40 dark:bg-rose-900/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
            <Button variant="secondary" onClick={loadCola}>Reintentar</Button>
          </div>
        </Card>
      ) : null}

      {loading ? (
        <Card className="border-white/80 bg-white/90 text-center text-sm text-slate-500 dark:border-slate-700/50 dark:bg-slate-800/90 dark:text-slate-400">
          Cargando cola de revisión...
        </Card>
      ) : error ? null : filtered.length === 0 ? (
        <Card className="border-white/80 bg-white/90 p-10 text-center dark:border-slate-700/50 dark:bg-slate-800/90">
          <p className="text-4xl font-black text-slate-200 dark:text-slate-600">{search || categoriaFilter ? '⌕' : '✓'}</p>
          <h3 className="mt-3 text-xl font-black text-slate-900 dark:text-slate-100">
            {search || categoriaFilter
              ? 'Sin resultados para tu búsqueda'
              : activeTab === 'en_revision'
                ? 'No hay envíos pendientes'
                : 'No hay borradores'}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {search || categoriaFilter
              ? 'Prueba con otro término o cambia la categoría seleccionada.'
              : activeTab === 'en_revision'
                ? 'Todos los trabajos enviados ya fueron revisados.'
                : 'Los trabajos guardados como borrador aparecerán aquí.'}
          </p>
          {search || categoriaFilter ? (
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => {
                setSearch('')
                setCategoriaFilter('')
              }}
            >
              Limpiar filtros
            </Button>
          ) : null}
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((trabajo) => {
            const tipo = getTipoDocumento(trabajo)
            const busy = actionId === trabajo.id

            return (
              <article
                key={trabajo.id}
                className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_40px_-30px_rgba(11,87,164,0.35)] dark:border-slate-700/50 dark:bg-slate-800/90"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        activeTab === 'en_revision'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}>
                        {activeTab === 'en_revision' ? 'En revisión' : 'Borrador'}
                      </span>
                      {tipo ? (
                        <span className="rounded-full bg-unefa/10 px-3 py-1 text-xs font-semibold text-unefa-dark dark:bg-unefa/20 dark:text-unefa-accent">
                          {tipo.label}
                        </span>
                      ) : null}
                      {trabajo.categoria ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {trabajo.categoria.nombre}
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <h3 className="text-xl font-black leading-7 text-slate-900 dark:text-slate-100">{trabajo.titulo}</h3>
                      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{trabajo.autor}</p>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>Enviado por {trabajo.usuario?.nombre ?? 'Usuario'}</span>
                      <span>Actualizado el {formatFecha(trabajo.updatedAt)}</span>
                      {trabajo.identificador ? <span>{trabajo.identificador}</span> : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                    <Link
                      to={`/trabajos/${trabajo.id}`}
                      className="rounded-xl bg-unefa/10 px-4 py-2 text-center text-sm font-semibold text-unefa-dark transition hover:bg-unefa/20 dark:bg-unefa/20 dark:text-unefa-accent dark:hover:bg-unefa/30"
                    >
                      Ver documento
                    </Link>

                    {activeTab === 'en_revision' ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleAprobar(trabajo)}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                        >
                          {busy ? 'Procesando...' : 'Aprobar'}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => openReject(trabajo)}
                          className="rounded-xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-200 disabled:opacity-50 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
                        >
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/submission?edit=${trabajo.id}`}
                          className="rounded-xl bg-slate-100 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleEnviarARevision(trabajo)}
                          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
                        >
                          {busy ? 'Enviando...' : 'Enviar a revisión'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {rejectTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="reject-title">
          <div className="w-full max-w-lg rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600 dark:text-rose-400">Rechazar envío</p>
            <h3 id="reject-title" className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">{rejectTarget.titulo}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Indica el motivo del rechazo. El trabajo volverá a estado borrador y el autor recibirá una notificación.
            </p>

            <textarea
              value={rejectComment}
              onChange={(event) => setRejectComment(event.target.value)}
              placeholder="Escribe las observaciones..."
              rows={4}
              className="mt-4 w-full rounded-xl border border-rose-200 p-3 text-sm dark:border-rose-800 dark:bg-slate-900 dark:text-slate-100"
              autoFocus
            />

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={closeReject}>Cancelar</Button>
              <button
                type="button"
                disabled={!rejectComment.trim() || actionId === rejectTarget.id}
                onClick={handleRechazar}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
              >
                {actionId === rejectTarget.id ? 'Rechazando...' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
