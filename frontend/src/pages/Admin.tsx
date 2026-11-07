import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useAuthStore } from '../stores/useAuthStore'
import { adminService, type AdminStats } from '../services/adminService'
import { authService, type AuthUser } from '../services/authService'
import { categoriaService, type Categoria } from '../services/trabajoService'
import api from '../services/api'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import { TIPOS_CEDULA, composeCedula, parseCedula } from '../types'

const COLORS = ['#0b57a4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const quickActions = [
  {
    title: 'Publicar boletín',
    description: 'Preparar y liberar un boletín institucional desde el flujo editorial.',
    to: '/submission',
  },
  {
    title: 'Revisar envíos',
    description: 'Validar metadatos, formato y estado de los documentos en cola.',
    to: '/revisiones',
  },
  {
    title: 'Gestionar normativas',
    description: 'Actualizar resoluciones, reglamentos y documentos de referencia.',
    to: '/catalogo/normativas',
  },
]

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map((row) => headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Reporte exportado')
}

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

  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState<'admin' | 'repositor' | 'bibliotecario'>('repositor')
  const [creatingUser, setCreatingUser] = useState(false)

  const [editingCedulaId, setEditingCedulaId] = useState<string | null>(null)
  const [editCedulaTipo, setEditCedulaTipo] = useState('V')
  const [editCedulaNumero, setEditCedulaNumero] = useState('')
  const [savingCedula, setSavingCedula] = useState(false)

  const loadCategorias = useCallback(() => {
    categoriaService.listar()
      .then((res) => setCategorias(res.data.data))
      .catch(() => toast.error('Error al cargar categorías'))
  }, [])

  useEffect(() => {
    adminService.getStats()
      .then((res) => setStats(res.data.data))
      .catch(() => toast.error('Error al cargar estadísticas'))
    authService.listarUsuarios()
      .then((res) => { setUsuarios(res.data.data); setUsuariosError('') })
      .catch(() => setUsuariosError('No se pudieron cargar los usuarios'))
    loadCategorias()
  }, [loadCategorias])

  function handleLogout() {
    logout()
    navigate('/')
    toast.success('Sesión cerrada')
  }

  function startEditCedula(u: AuthUser) {
    const parsed = parseCedula(u.cedula ?? undefined)
    setEditingCedulaId(u.id)
    setEditCedulaTipo(parsed.cedulaTipo)
    setEditCedulaNumero(parsed.cedula)
  }

  function cancelEditCedula() {
    setEditingCedulaId(null)
    setEditCedulaNumero('')
  }

  async function saveCedula(u: AuthUser) {
    if (!/^\d{6,9}$/.test(editCedulaNumero)) {
      toast.error('El número de cédula debe tener entre 6 y 9 dígitos')
      return
    }

    const cedula = composeCedula(editCedulaTipo, editCedulaNumero)
    setSavingCedula(true)
    try {
      await api.put(`/usuarios/${u.id}`, { cedula })
      setUsuarios((prev) => prev.map((x) => x.id === u.id ? { ...x, cedula } : x))
      toast.success(`Cédula de ${u.nombre} actualizada`)
      cancelEditCedula()
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(message || 'Error al actualizar la cédula')
    } finally {
      setSavingCedula(false)
    }
  }

  const chartData = stats?.trabajosPorMes.map((m) => ({ mes: m.mes.slice(5) + '/' + m.mes.slice(0, 4), cantidad: m.cantidad })) ?? []

  const pieData = stats?.publishedPorCategoria.map((c) => ({ name: c.nombre, value: c.cantidad })) ?? []

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
                <span className="rounded-full bg-white/12 px-4 py-2">{stats ? stats.publicados : '...'} documentos publicados</span>
                <span className="rounded-full bg-white/12 px-4 py-2">{stats ? stats.enRevision : '...'} en revisión</span>
                <span className="rounded-full bg-white/12 px-4 py-2">{stats ? stats.borradores : '...'} en borrador</span>
                <span className="rounded-full bg-white/12 px-4 py-2">{stats ? stats.totalUsuarios : '...'} usuarios registrados</span>
                {stats ? <span className="rounded-full bg-white/12 px-4 py-2">{stats.visitas.total} visitas totales</span> : null}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/65">Sesión activa</p>
                <p className="mt-2 text-lg font-bold">{user?.name}</p>
                <p className="text-sm text-white/72">{user?.email} · {user?.role}</p>
              </div>
              <Button variant="secondary" onClick={handleLogout} className="justify-center border-white/20 bg-white text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="border-unefa/10 bg-white/95 dark:border-slate-700/50 dark:bg-slate-800/90">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Documentos totales</p>
            <p className="mt-3 text-4xl font-black text-slate-900 dark:text-slate-100">{stats ? stats.totalDocumentos : '...'}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Contenido académico y editorial disponible en el repositorio.</p>
          </Card>
          <Card className="border-emerald-100 bg-emerald-50/70 dark:border-emerald-800/30 dark:bg-emerald-900/20">
            <p className="text-sm font-medium text-emerald-700">Publicados</p>
            <p className="mt-3 text-4xl font-black text-emerald-700">{stats ? stats.publicados : '...'}</p>
            <p className="mt-2 text-sm text-emerald-900/70">Listos para consulta pública o institucional.</p>
          </Card>
          <Card
            onClick={() => navigate('/revisiones')}
            className="cursor-pointer border-amber-100 bg-amber-50/70 transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg dark:border-amber-800/30 dark:bg-amber-900/20"
          >
            <p className="text-sm font-medium text-amber-700">En revisión</p>
            <p className="mt-3 text-4xl font-black text-amber-700">{stats ? stats.enRevision : '...'}</p>
            <p className="mt-2 text-sm text-amber-900/70">Pendientes de aprobación. Haz clic para abrir la bandeja de revisión.</p>
          </Card>
          <Card
            onClick={() => navigate('/revisiones?tab=borradores')}
            className="cursor-pointer border-slate-200 bg-slate-50/70 transition hover:-translate-y-0.5 hover:border-unefa/30 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/50"
          >
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Borradores</p>
            <p className="mt-3 text-4xl font-black text-slate-900 dark:text-slate-100">{stats ? stats.borradores : '...'}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Trabajos guardados sin enviar a revisión.</p>
          </Card>
          <Card className="border-sky-100 bg-sky-50/70 dark:border-sky-900/30 dark:bg-sky-900/20">
            <p className="text-sm font-medium text-sky-700">Usuarios activos</p>
            <p className="mt-3 text-4xl font-black text-sky-700">{stats ? stats.usuariosActivos : '...'}</p>
            <p className="mt-2 text-sm text-sky-900/70">Cuentas habilitadas para acceder al sistema.</p>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-6">
            <Card className="border-white/80 bg-white/90 dark:border-slate-700/50 dark:bg-slate-800/90">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Accesos rápidos</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Operaciones frecuentes del admin</h3>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Estos bloques sirven como atajos visuales para las tareas que más se repiten en un panel de control.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {quickActions.map((action) => (
                  <button key={action.title} type="button" onClick={() => navigate(action.to)} className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-unefa/20 hover:bg-white hover:shadow-[0_16px_40px_-28px_rgba(11,87,164,0.3)] dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-unefa/20 dark:hover:bg-slate-700 dark:hover:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.5)]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(11,87,164,0.12),rgba(7,58,106,0.08))] text-lg font-black text-unefa-dark">
                      •
                    </div>
                    <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">{action.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{action.description}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="border-white/80 bg-white/90 dark:border-slate-700/50 dark:bg-slate-800/90">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Gráficos interactivos</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Distribución del repositorio</h3>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Documentos por mes</p>
                  {chartData.length > 0 ? (
                    <div className="mt-4 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="cantidad" fill="#0b57a4" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">No hay datos disponibles.</p>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Documentos por categoría</p>
                  {pieData.length > 0 ? (
                    <div className="mt-4 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent = 0 }) => `${(percent * 100).toFixed(0)}%`}>
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">No hay datos disponibles.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800">
                  <p className="text-xs font-semibold text-slate-500">Estado de documentos</p>
                  <div className="mt-3 space-y-2">
                    {[
                      { label: 'Publicados', value: stats?.publicados ?? 0, color: 'bg-emerald-500', to: '/search' },
                      { label: 'En revisión', value: stats?.enRevision ?? 0, color: 'bg-amber-400', to: '/revisiones' },
                      { label: 'Borradores', value: stats?.borradores ?? 0, color: 'bg-slate-400', to: '/revisiones?tab=borradores' },
                      { label: 'Archivados', value: stats?.archivados ?? 0, color: 'bg-rose-400', to: '' },
                    ].map((item) => {
                      const content = (
                        <>
                          <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <span className={`inline-block h-2.5 w-2.5 rounded-full ${item.color}`} />
                            {item.label}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{item.value}</span>
                        </>
                      )

                      return item.to ? (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => navigate(item.to)}
                          className="flex w-full items-center justify-between rounded-lg px-1 py-0.5 text-sm transition hover:bg-unefa/5 hover:text-unefa dark:hover:bg-unefa/10 dark:hover:text-unefa-accent"
                        >
                          {content}
                        </button>
                      ) : (
                        <div key={item.label} className="flex items-center justify-between px-1 py-0.5 text-sm">
                          {content}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800">
                  <p className="text-xs font-semibold text-slate-500">Tráfico total</p>
                  {stats ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-end gap-2">
                        <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.visitas.total}</p>
                        <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">interacciones</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 rounded-xl bg-sky-50 p-2 text-center dark:bg-sky-900/30">
                          <p className="text-lg font-black text-sky-700">{stats.visitas.vistas}</p>
                          <p className="text-[10px] text-sky-600">Visitas</p>
                        </div>
                        <div className="flex-1 rounded-xl bg-emerald-50 p-2 text-center dark:bg-emerald-900/30">
                          <p className="text-lg font-black text-emerald-700">{stats.visitas.descargas}</p>
                          <p className="text-[10px] text-emerald-600">Descargas</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">Cargando...</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800">
                  <p className="text-xs font-semibold text-slate-500">Exportar datos</p>
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!stats) return
                        exportCSV(
                          stats.trabajosPorMes.map((m) => ({ Mes: m.mes, Cantidad: m.cantidad })),
                          'trabajos-por-mes.csv'
                        )
                      }}
                      className="w-full rounded-xl bg-unefa/10 px-3 py-2 text-xs font-semibold text-unefa-dark hover:bg-unefa/20"
                    >
                      Exportar trabajos por mes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!stats) return
                        exportCSV(
                          stats.publishedPorCategoria.map((c) => ({ Categoria: c.nombre, Publicados: c.cantidad })),
                          'publicados-por-categoria.csv'
                        )
                      }}
                      className="w-full rounded-xl bg-unefa/10 px-3 py-2 text-xs font-semibold text-unefa-dark hover:bg-unefa/20"
                    >
                      Exportar por categoría
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!stats) return
                        exportCSV(
                          stats.topTrabajos.map((t) => ({ Titulo: t.titulo, Visitas: t.vistas, Descargas: t.descargas, Total: t.total })),
                          'top-trabajos.csv'
                        )
                      }}
                      className="w-full rounded-xl bg-unefa/10 px-3 py-2 text-xs font-semibold text-unefa-dark hover:bg-unefa/20"
                    >
                      Exportar top trabajos
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-white/80 bg-white/90 dark:border-slate-700/50 dark:bg-slate-800/90">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Top documentos</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Más consultados</h3>

              <div className="mt-6 space-y-4">
                {stats && stats.topTrabajos.length > 0 ? (
                  stats.topTrabajos.map((item, i) => {
                    const maxVistas = Math.max(...stats.topTrabajos.map((t) => t.total), 1)
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/trabajos/${item.id}`)}
                        className="w-full flex gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 text-left transition hover:border-unefa/20 hover:bg-white dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-unefa/20 dark:hover:bg-slate-700"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-unefa/10 text-sm font-black text-unefa">
                          {i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold text-slate-900 truncate dark:text-slate-100">{item.titulo}</p>
                            <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">{item.total}</span>
                          </div>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-1.5 rounded-full bg-unefa/60" style={{ width: `${(item.total / maxVistas) * 100}%` }} />
                          </div>
                          <div className="mt-1 flex gap-3 text-xs text-slate-500 dark:text-slate-400">
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

            <Card className="border-white/80 bg-white/90 dark:border-slate-700/50 dark:bg-slate-800/90">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Usuarios y permisos</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Cuentas con acceso</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateUser(!showCreateUser)}
                  className="rounded-full bg-unefa px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
                >
                  {showCreateUser ? 'Cancelar' : '+ Nuevo usuario'}
                </button>
              </div>

              {showCreateUser ? (
                <div className="mt-4 rounded-2xl border border-unefa/20 bg-unefa/5 p-4 space-y-3">
                  <p className="text-sm font-bold text-unefa-dark">Crear nuevo usuario</p>
                  <Input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Nombre completo" />
                  <Input value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="Correo electrónico" type="email" />
                  <PasswordInput value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Contraseña" />
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full rounded-md border px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="repositor">Repositor</option>
                    <option value="bibliotecario">Bibliotecario</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      disabled={creatingUser || !newUserName || !newUserEmail || !newUserPassword}
                      onClick={async () => {
                        setCreatingUser(true)
                        try {
                          await api.post('/usuarios', {
                            nombre: newUserName,
                            email: newUserEmail,
                            password: newUserPassword,
                            rol: newUserRole,
                          })
                          toast.success(`Usuario ${newUserName} creado`)
                          setNewUserName('')
                          setNewUserEmail('')
                          setNewUserPassword('')
                          setNewUserRole('repositor')
                          setShowCreateUser(false)
                          const res = await authService.listarUsuarios()
                          setUsuarios(res.data.data)
                        } catch {
                          toast.error('Error al crear usuario')
                        } finally {
                          setCreatingUser(false)
                        }
                      }}
                    >
                      {creatingUser ? 'Creando...' : 'Crear usuario'}
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="mt-5 space-y-3">
                {usuarios.length > 0 ? (
                  usuarios.map((u) => (
                    <div key={u.id} className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/50 dark:bg-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{u.nombre}</p>
                          <p className="text-sm text-slate-500 truncate dark:text-slate-400">{u.email}</p>
                          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            C.I.: {u.cedula || 'Sin cédula'}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEditCedula(u)}
                            className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                          >
                            Editar cédula
                          </button>
                          <div className="relative">
                            <select
                              value={u.rol}
                              onChange={async (e) => {
                                const newRol = e.target.value
                                try {
                                  await api.put(`/usuarios/${u.id}`, { rol: newRol })
                                  setUsuarios((prev) => prev.map((x) => x.id === u.id ? { ...x, rol: newRol } : x))
                                  toast.success(`Rol de ${u.nombre} actualizado a ${newRol}`)
                                } catch { toast.error('Error al actualizar rol') }
                              }}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold capitalize text-unefa-dark appearance-none cursor-pointer hover:border-unefa/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:border-unefa/30"
                            >
                              <option value="admin">admin</option>
                              <option value="repositor">repositor</option>
                              <option value="bibliotecario">bibliotecario</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm(`¿Desactivar usuario "${u.nombre}"?`)) return
                              try {
                                await api.patch(`/usuarios/${u.id}/estado`, { activo: false })
                                toast.success(`Usuario ${u.nombre} desactivado`)
                                const res = await authService.listarUsuarios()
                                setUsuarios(res.data.data)
                              } catch { toast.error('Error al desactivar usuario') }
                            }}
                            className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                          >
                            Desactivar
                          </button>
                        </div>
                      </div>
                      {editingCedulaId === u.id ? (
                        <div className="border-t border-slate-200/80 px-4 py-3 dark:border-slate-700/50">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-unefa">Corregir cédula</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <select
                              value={editCedulaTipo}
                              onChange={(e) => setEditCedulaTipo(e.target.value)}
                              aria-label="Tipo de cédula"
                              className="w-20 rounded-xl border border-slate-300/90 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-unefa focus:ring-2 focus:ring-unefa/20 dark:border-slate-600/80 dark:bg-slate-800/90 dark:text-slate-100"
                            >
                              {TIPOS_CEDULA.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <div className="w-40">
                              <Input
                                value={editCedulaNumero}
                                onChange={(e) => setEditCedulaNumero(e.target.value.replace(/\D/g, ''))}
                                placeholder="12345678"
                                inputMode="numeric"
                              />
                            </div>
                            <Button type="button" disabled={savingCedula} onClick={() => saveCedula(u)}>
                              {savingCedula ? 'Guardando...' : 'Guardar'}
                            </Button>
                            <Button variant="secondary" type="button" onClick={cancelEditCedula}>
                              Cancelar
                            </Button>
                          </div>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Solo un administrador puede corregir este dato. El usuario no podrá cambiarlo después.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : usuariosError ? (
                  <p className="text-sm text-rose-600 dark:text-rose-400">{usuariosError}</p>
                ) : (
                  <p className="text-sm text-slate-500">No hay usuarios registrados.</p>
                )}
              </div>
            </Card>

            <Card className="border-white/80 bg-white/90 dark:border-slate-700/50 dark:bg-slate-800/90">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Notas del sistema</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Acciones sugeridas</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <li className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">Revisar los envíos pendientes desde la bandeja de revisión antes de liberar nuevas publicaciones.</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Mantener la normativa vigente visible desde el panel principal.</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Centralizar el seguimiento de envíos y publicaciones desde este espacio.</li>
              </ul>
            </Card>
          </div>
        </div>

        <Card className="border-white/80 bg-white/90 dark:border-slate-700/50 dark:bg-slate-800/90">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Gestión de categorías</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Administrar carreras y categorías</h3>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{editingCat ? 'Editar categoría' : 'Nueva categoría'}</p>
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
                          toast.success('Categoría actualizada')
                        } else {
                          await categoriaService.crear({
                            nombre: newCatNombre,
                            slug: newCatSlug,
                            descripcion: newCatDesc || undefined,
                          })
                          toast.success('Categoría creada')
                        }
                        setNewCatNombre('')
                        setNewCatSlug('')
                        setNewCatDesc('')
                        setEditingCat(null)
                        loadCategorias()
                      } catch {
                        toast.error('Error al guardar categoría')
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
                  <div key={cat.id} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{cat.nombre}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{cat.slug}{cat.descripcion ? ` · ${cat.descripcion}` : ''}</p>
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
                            toast.success(`Categoría "${cat.nombre}" eliminada`)
                          } catch {
                            toast.error('Error al eliminar categoría')
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
