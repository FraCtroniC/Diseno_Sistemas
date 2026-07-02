import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { useTrabajoStore } from '../stores/useTrabajoStore'
import { adminService, type AdminStats } from '../services/adminService'
import { authService, type AuthUser } from '../services/authService'
import { categoriaService, type Categoria } from '../services/trabajoService'
import api from '../services/api'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'


const quickActions = [
  {
    title: 'Publicar boletín',
    description: 'Preparar y liberar un boletín institucional desde el flujo editorial.',
    to: '/submission',
  },
  {
    title: 'Revisar envíos',
    description: 'Validar metadatos, formato y estado de los documentos en cola.',
    to: '/catalogo/postgrado',
  },
  {
    title: 'Gestionar normativas',
    description: 'Actualizar resoluciones, reglamentos y documentos de referencia.',
    to: '/catalogo/normativas',
  },
]

export default function Admin() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [usuarios, setUsuarios] = useState<AuthUser[]>([])
  const [usuariosError, setUsuariosError] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [newCatNombre, setNewCatNombre] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [catLoading, setCatLoading] = useState(false)
  const [editingCat, setEditingCat] = useState<Categoria | null>(null)

  const { mapToDocumentItems, fetchTrabajos, fetchCategorias, loading } = useTrabajoStore()

  function loadCategorias() {
    categoriaService.listar()
      .then((res) => setCategorias(res.data.data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchCategorias()
    fetchTrabajos()
    adminService.getStats()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
    authService.listarUsuarios()
      .then((res) => { setUsuarios(res.data.data); setUsuariosError('') })
      .catch(() => setUsuariosError('No se pudieron cargar los usuarios'))
    loadCategorias()
  }, [fetchCategorias, fetchTrabajos])

  const all = mapToDocumentItems()
  const publishedDocuments = all.filter((document) => document.status === 'published')
  const draftDocuments = all.filter((document) => document.status === 'draft')
  const archivedDocuments = all.filter((document) => document.status === 'archived')

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
      <section className="space-y-6 pb-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(11,87,164,0.92),rgba(10,31,68,0.98))] p-6 text-white shadow-[0_35px_80px_-38px_rgba(11,87,164,0.75)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                Panel administrativo
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Centro de control para normativa, publicaciones y envíos</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
                  Vista operativa para supervisar el repositorio, priorizar revisiones y mantener alineados los módulos
                  institucionales.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-medium text-white/80">
                <span className="rounded-full bg-white/12 px-4 py-2">{publishedDocuments.length} documentos publicados</span>
                <span className="rounded-full bg-white/12 px-4 py-2">{draftDocuments.length} en borrador</span>
                <span className="rounded-full bg-white/12 px-4 py-2">{stats ? stats.totalUsuarios : '...'} administradores</span>
                {stats ? <span className="rounded-full bg-white/12 px-4 py-2">{stats.visitas.total} visitas totales</span> : null}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/65">Sesión activa</p>
                <p className="mt-2 text-lg font-bold">{user?.name}</p>
                <p className="text-sm text-white/72">{user?.email} · {user?.role}</p>
              </div>
              <Button variant="secondary" onClick={handleLogout} className="justify-center border-white/20 bg-white text-slate-900 hover:bg-slate-100">
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-unefa/10 bg-white/95">
            <p className="text-sm font-medium text-slate-500">Documentos totales</p>
            <p className="mt-3 text-4xl font-black text-slate-900">{loading ? '...' : all.length}</p>
            <p className="mt-2 text-sm text-slate-600">Contenido académico y editorial disponible en el repositorio.</p>
          </Card>
          <Card className="border-emerald-100 bg-emerald-50/70">
            <p className="text-sm font-medium text-emerald-700">Publicados</p>
            <p className="mt-3 text-4xl font-black text-emerald-700">{publishedDocuments.length}</p>
            <p className="mt-2 text-sm text-emerald-900/70">Listos para consulta pública o institucional.</p>
          </Card>
          <Card className="border-amber-100 bg-amber-50/70">
            <p className="text-sm font-medium text-amber-700">Borradores</p>
            <p className="mt-3 text-4xl font-black text-amber-700">{draftDocuments.length}</p>
            <p className="mt-2 text-sm text-amber-900/70">Pendientes de validación antes de su difusión.</p>
          </Card>
          <Card className="border-slate-200 bg-slate-50/70">
            <p className="text-sm font-medium text-slate-600">Usuarios activos</p>
            <p className="mt-3 text-4xl font-black text-slate-900">{stats ? stats.usuariosActivos : (user ? '1' : '0')}</p>
            <p className="mt-2 text-sm text-slate-600">Administración, docencia y futuras cuentas del sistema.</p>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-6">
            <Card className="border-white/80 bg-white/90">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Accesos rápidos</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">Operaciones frecuentes del admin</h3>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-600">
                  Estos bloques sirven como atajos visuales para las tareas que más se repiten en un panel de control.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {quickActions.map((action) => (
                  <button key={action.title} type="button" onClick={() => navigate(action.to)} className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-unefa/20 hover:bg-white hover:shadow-[0_16px_40px_-28px_rgba(11,87,164,0.3)]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(11,87,164,0.12),rgba(7,58,106,0.08))] text-lg font-black text-unefa-dark">
                      •
                    </div>
                    <h4 className="mt-4 text-base font-bold text-slate-900">{action.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="border-white/80 bg-white/90">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Gráficos</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">Distribución del repositorio</h3>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">Estado de documentos</p>
                  <div className="mt-4 space-y-3">
                    {[
                      { label: 'Publicados', value: stats?.publicados ?? 0, color: 'bg-emerald-500', max: all.length || 1 },
                      { label: 'En revisión', value: stats?.enRevision ?? 0, color: 'bg-amber-400', max: all.length || 1 },
                      { label: 'Borradores', value: stats?.borradores ?? 0, color: 'bg-slate-400', max: all.length || 1 },
                      { label: 'Archivados', value: stats?.archivados ?? 0, color: 'bg-rose-400', max: all.length || 1 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="font-bold text-slate-900">{item.value}</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                          <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${(item.value / item.max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">Tráfico total</p>
                  {stats ? (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-end gap-3">
                        <p className="text-4xl font-black text-slate-900">{stats.visitas.total}</p>
                        <p className="mb-1 text-sm text-slate-500">interacciones</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1 rounded-xl bg-sky-50 p-3 text-center">
                          <p className="text-lg font-black text-sky-700">{stats.visitas.vistas}</p>
                          <p className="text-xs text-sky-600">Visitas</p>
                        </div>
                        <div className="flex-1 rounded-xl bg-emerald-50 p-3 text-center">
                          <p className="text-lg font-black text-emerald-700">{stats.visitas.descargas}</p>
                          <p className="text-xs text-emerald-600">Descargas</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">Cargando...</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-500 mb-3">Trabajos subidos por mes</p>
                {stats && stats.trabajosPorMes.length > 0 ? (
                  <div className="flex items-end gap-2">
                    {stats.trabajosPorMes.map((item) => {
                      const max = Math.max(...stats.trabajosPorMes.map((m) => m.cantidad), 1)
                      const h = Math.max((item.cantidad / max) * 120, 8)
                      return (
                        <div key={item.mes} className="flex flex-1 flex-col items-center gap-1">
                          <span className="text-xs font-bold text-slate-700">{item.cantidad}</span>
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-unefa to-unefa/60 transition-all hover:to-unefa/80"
                            style={{ height: `${h}px`, minHeight: '8px' }}
                          />
                          <span className="text-[10px] text-slate-500">{item.mes.slice(5)}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No hay datos disponibles.</p>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-white/80 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Top documentos</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Más consultados</h3>

              <div className="mt-6 space-y-4">
                {stats && stats.topTrabajos.length > 0 ? (
                  stats.topTrabajos.map((item, i) => {
                    const maxVistas = Math.max(...stats.topTrabajos.map((t) => t.total), 1)
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/trabajos/${item.id}`)}
                        className="w-full flex gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 text-left transition hover:border-unefa/20 hover:bg-white"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-unefa/10 text-sm font-black text-unefa">
                          {i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold text-slate-900 truncate">{item.titulo}</p>
                            <span className="shrink-0 text-xs font-medium text-slate-500">{item.total}</span>
                          </div>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                            <div className="h-1.5 rounded-full bg-unefa/60" style={{ width: `${(item.total / maxVistas) * 100}%` }} />
                          </div>
                          <div className="mt-1 flex gap-3 text-xs text-slate-500">
                            <span>{item.vistas} visitas</span>
                            <span>{item.descargas} descargas</span>
                          </div>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <p className="text-sm text-slate-500">No hay datos de actividad disponibles.</p>
                )}
              </div>
            </Card>

            <Card className="border-white/80 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Usuarios y permisos</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Cuentas con acceso</h3>

              <div className="mt-5 space-y-3">
                {usuarios.length > 0 ? (
                  usuarios.map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">{u.nombre}</p>
                        <p className="text-sm text-slate-500 truncate">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="relative">
                          <select
                            value={u.rol}
                            onChange={async (e) => {
                              const newRol = e.target.value
                              try {
                                await api.put(`/usuarios/${u.id}`, { rol: newRol })
                                setUsuarios((prev) => prev.map((x) => x.id === u.id ? { ...x, rol: newRol } : x))
                              } catch { /* silencio */ }
                            }}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold capitalize text-unefa-dark appearance-none cursor-pointer hover:border-unefa/30"
                          >
                            <option value="admin">admin</option>
                            <option value="repositor">repositor</option>
                            <option value="bibliotecario">bibliotecario</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                ) : usuariosError ? (
                  <p className="text-sm text-rose-600">{usuariosError}</p>
                ) : (
                  <p className="text-sm text-slate-500">No hay usuarios registrados.</p>
                )}
              </div>
            </Card>

            <Card className="border-white/80 bg-white/90">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Notas del sistema</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Acciones sugeridas</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Revisar los documentos en borrador antes de liberar nuevas publicaciones.</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Mantener la normativa vigente visible desde el panel principal.</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Centralizar el seguimiento de envíos y publicaciones desde este espacio.</li>
              </ul>
            </Card>
          </div>
        </div>

        <Card className="border-white/80 bg-white/90">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Gestión de categorías</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Administrar carreras y categorías</h3>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">{editingCat ? 'Editar categoría' : 'Nueva categoría'}</p>
              <div className="mt-4 space-y-3">
                <Input
                  value={newCatNombre}
                  onChange={(e) => setNewCatNombre(e.target.value)}
                  placeholder="Nombre (ej: Ingeniería de Sistemas)"
                />
                <Input
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="Slug (ej: ingenieria-de-sistemas)"
                />
                <Input
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Descripción (opcional)"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    disabled={catLoading || !newCatNombre || !newCatSlug}
                    onClick={async () => {
                      setCatLoading(true)
                      try {
                        if (editingCat) {
                          await categoriaService.actualizar(editingCat.id, {
                            nombre: newCatNombre,
                            slug: newCatSlug,
                            descripcion: newCatDesc || undefined,
                          })
                        } else {
                          await categoriaService.crear({
                            nombre: newCatNombre,
                            slug: newCatSlug,
                            descripcion: newCatDesc || undefined,
                          })
                        }
                        setNewCatNombre('')
                        setNewCatSlug('')
                        setNewCatDesc('')
                        setEditingCat(null)
                        loadCategorias()
                      } catch {
                        // silencio
                      } finally {
                        setCatLoading(false)
                      }
                    }}
                  >
                    {editingCat ? 'Actualizar' : 'Crear'}
                  </Button>
                  {editingCat ? (
                    <Button variant="secondary" type="button" onClick={() => { setEditingCat(null); setNewCatNombre(''); setNewCatSlug(''); setNewCatDesc('') }}>
                      Cancelar
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {categorias.length === 0 ? (
                <p className="text-sm text-slate-500">No hay categorías creadas.</p>
              ) : (
                categorias.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{cat.nombre}</p>
                      <p className="text-sm text-slate-500">{cat.slug}{cat.descripcion ? ` · ${cat.descripcion}` : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCat(cat)
                          setNewCatNombre(cat.nombre)
                          setNewCatSlug(cat.slug)
                          setNewCatDesc(cat.descripcion ?? '')
                        }}
                        className="rounded-full bg-unefa/10 px-3 py-1 text-xs font-semibold text-unefa-dark hover:bg-unefa/20"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`¿Eliminar "${cat.nombre}"?`)) return
                          try {
                            await categoriaService.eliminar(cat.id)
                            loadCategorias()
                          } catch {
                            // silencio
                          }
                        }}
                        className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </section>
  )
}
