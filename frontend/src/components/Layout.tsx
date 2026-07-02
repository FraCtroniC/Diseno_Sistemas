import { useState, type PropsWithChildren } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import SearchBar from './ui/SearchBar'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'
import { useAuthStore } from '../stores/useAuthStore'

const navSections = [
  {
    title: 'Producción académica',
    description: 'Pregrado y postgrado',
    items: [
      { to: '/', label: 'Inicio', description: 'Vista general del repositorio' },
      { to: '/submission', label: 'Subir documento', description: 'Carga de metadatos y archivo' },
      { to: '/catalogo/pregrado', label: 'Pregrado', description: 'Trabajos, tesis y proyectos' },
      { to: '/catalogo/postgrado', label: 'Postgrado', description: 'Maestría y doctorado' },
    ],
  },
  {
    title: 'Normativas e institucional',
    description: 'Documentación y reglamentos',
    items: [
      { to: '/catalogo/normativas', label: 'Normativas', description: 'Reglamentos y resoluciones' },
      { to: '/catalogo/institucional', label: 'Documentación institucional', description: 'Manuales y procedimientos' },
    ],
  },
  {
    title: 'Editorial y divulgación',
    description: 'Publicaciones y difusión',
    items: [
      { to: '/catalogo/editorial', label: 'Editorial de publicaciones', description: 'Libros digitales y memorias' },
      { to: '/catalogo/divulgacion', label: 'Divulgación', description: 'Boletines y recursos educativos' },
    ],
  },
]

export default function Layout({ children }: PropsWithChildren) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(11,87,164,0.2),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(255,210,0,0.18),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#eef3fa_55%,_#e7edf7_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(11,87,164,0.3),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(255,210,0,0.15),_transparent_24%),linear-gradient(180deg,_#0f172a_0%,_#1e293b_55%,_#0f172a_100%)] dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80">
        <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-4 px-3 py-4 sm:px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-unefa text-sm font-black text-white shadow-lg shadow-unefa/25">
              RD
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-unefa">UNEFA</p>
              <h1 className="text-lg font-bold text-slate-900">Repositorio Digital Núcleo Táchira</h1>
            </div>
          </div>
          <div className="mx-6 hidden flex-1 lg:block">
            <SearchBar />
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            {user ? <NotificationBell /> : null}
            <div className="rounded-full border border-unefa/15 bg-unefa/5 px-4 py-2 text-sm font-medium text-unefa-dark dark:border-white/15 dark:bg-white/10 dark:text-unefa-accent">
              {user ? `${user.name} · ${user.role}` : 'Exploración institucional'}
            </div>
            {user ? (
              <NavLink
                    to={user.role === 'admin' ? '/admin' : '/profile'}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-unefa text-white shadow-sm' : 'bg-slate-900 text-white hover:bg-slate-700'
                  }`
                }
              >
                Dashboard
              </NavLink>
            ) : null}
            {!user ? (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive ? 'bg-unefa text-white shadow-sm' : 'bg-slate-900 text-white hover:bg-slate-700'
                    }`
                  }
                >
                  Acceso
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive ? 'bg-unefa text-white shadow-sm' : 'bg-slate-900 text-white hover:bg-slate-700'
                    }`
                  }
                >
                  Registrarse
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive ? 'bg-unefa text-white shadow-sm' : 'bg-slate-900 text-white hover:bg-slate-700'
                    }`
                  }
                >
                  Mi Perfil
                </NavLink>
                <button
                  onClick={() => { logout(); navigate('/') }}
                  className="rounded-full px-4 py-2 text-sm font-semibold bg-rose-600 text-white hover:bg-rose-500"
                >
                  Salir
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-unefa/5 lg:hidden"
            aria-label="Menú"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/70 bg-white/95 backdrop-blur-xl lg:hidden">
            <div className="mx-auto max-w-[1680px] space-y-4 px-3 py-4 sm:px-4">
              <SearchBar />
              <div className="flex flex-wrap items-center gap-3">
                {user ? <NotificationBell /> : null}
                <div className="rounded-full border border-unefa/15 bg-unefa/5 px-4 py-2 text-sm font-medium text-unefa-dark">
                  {user ? `${user.name} · ${user.role}` : 'Exploración institucional'}
                </div>
                {user ? (
                  <NavLink
                to={user.role === 'admin' ? '/admin' : '/profile'}
                    onClick={closeMobileMenu}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    Dashboard
                  </NavLink>
                ) : null}
                {!user ? (
                  <>
                    <NavLink to="/login" onClick={closeMobileMenu} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Acceso</NavLink>
                    <NavLink to="/register" onClick={closeMobileMenu} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Registrarse</NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/profile" onClick={closeMobileMenu} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Mi Perfil</NavLink>
                    <button onClick={() => { logout(); navigate('/'); closeMobileMenu() }} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500">Salir</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto grid w-full max-w-[1680px] gap-6 px-3 py-6 sm:px-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-6 lg:py-8">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-[1.5rem] border border-unefa/10 bg-unefa/5 px-4 py-3 text-left text-sm font-semibold text-unefa lg:hidden"
          >
            <span>Panel lateral de navegación</span>
            <svg className={`h-5 w-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`space-y-4 lg:block ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,rgba(11,87,164,0.96),rgba(7,58,106,0.98))] p-5 text-white shadow-[0_30px_70px_-34px_rgba(11,87,164,0.75)]">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Panel lateral</p>
            <h2 className="mt-2 text-2xl font-black leading-tight">Módulos y opciones del sistema</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">
              La navegación se organiza por familias funcionales para que el usuario llegue más rápido a cada
              colección y proceso.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <NavLink to="/catalogo/normativas" className={({ isActive }) => `rounded-full px-3 py-1 transition ${isActive ? 'bg-unefa-accent text-slate-900' : 'bg-white/12 text-white/90 hover:bg-white/25'}`}>Normativas</NavLink>
              <NavLink to="/catalogo/pregrado" className={({ isActive }) => `rounded-full px-3 py-1 transition ${isActive ? 'bg-unefa-accent text-slate-900' : 'bg-white/12 text-white/90 hover:bg-white/25'}`}>Producción</NavLink>
              <NavLink to="/catalogo/editorial" className={({ isActive }) => `rounded-full px-3 py-1 transition ${isActive ? 'bg-unefa-accent text-slate-900' : 'bg-white/12 text-white/90 hover:bg-white/25'}`}>Editorial</NavLink>
            </div>
          </div>

          <nav className="space-y-4">
            {navSections.map((section) => (
              <section key={section.title} className="rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
                <div className="mb-4">
                  <p className="text-sm font-bold text-slate-900">{section.title}</p>
                  <p className="text-xs text-slate-500">{section.description}</p>
                </div>

                <div className="space-y-2">
                  {section.items.map((item) => (
                    <NavLink
                      key={`${section.title}-${item.label}`}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                          isActive
                            ? 'border-unefa/25 bg-unefa text-white shadow-lg shadow-unefa/15'
                            : 'border-slate-200/80 bg-white/90 text-slate-700 hover:border-unefa/20 hover:bg-unefa/5 hover:text-slate-900'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${isActive ? 'bg-unefa-accent' : 'bg-unefa/40'}`} />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold">{item.label}</span>
                            <span className={`block text-xs leading-5 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                              {item.description}
                            </span>
                          </span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </section>
            ))}
          </nav>

          <div className="rounded-[1.5rem] border border-unefa/10 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/80">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-unefa">Acceso</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Los administradores entran por login y el sistema muestra su panel automáticamente.</p>
            {user?.role === 'admin' ? (
              <NavLink to="/admin" onClick={() => setSidebarOpen(false)} className="mt-4 flex items-center justify-between rounded-2xl bg-unefa/5 px-4 py-3 text-sm font-medium text-unefa-dark hover:bg-unefa/10">
                <span>Sesión administrativa activa</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-unefa">Ir al dashboard →</span>
              </NavLink>
            ) : null}
            <a href="/feed/rss" target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-2 rounded-2xl bg-unefa/5 px-4 py-3 text-sm font-medium text-unefa-dark hover:bg-unefa/10 dark:text-unefa-accent">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.18 15.64a2.18 2.18 0 010 4.36 2.18 2.18 0 010-4.36M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93v-2.83z"/></svg>
              <span>Feed RSS</span>
            </a>
          </div>
          </div>
        </aside>

        <section className="min-w-0">{children}</section>
      </main>
    </div>
  )
}
