import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '../stores/useNotificationStore'

export default function NotificationBell() {
  const { notificaciones, noLeidas, fetch, setNoLeidas, marcarLeida, marcarTodasLeidas } = useNotificationStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch()
    const es = new EventSource('/api/v1/notificaciones/stream')
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'count' && typeof data.noLeidas === 'number') {
          setNoLeidas(data.noLeidas)
        }
      } catch { /* ignore parse errors */ }
    }
    es.onerror = () => {
      es.close()
    }
    return () => es.close()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((v) => !v); if (!open) fetch() }}
        className="relative rounded-full p-2 text-slate-600 hover:bg-unefa/10 transition dark:text-slate-300"
        aria-label="Notificaciones"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {noLeidas > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Notificaciones</p>
            {noLeidas > 0 ? (
              <button
                onClick={marcarTodasLeidas}
                className="text-xs font-semibold text-unefa hover:text-unefa-dark transition"
              >
                Marcar todas leídas
              </button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No hay notificaciones</p>
            ) : (
              notificaciones.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    marcarLeida(n.id)
                    if (n.trabajo_id) navigate(`/trabajos/${n.trabajo_id}`)
                    setOpen(false)
                  }}
                  className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                    !n.leida ? 'border-l-2 border-unefa bg-unefa/[0.03]' : ''
                  }`}
                >
                  <p className={`text-sm ${n.leida ? 'text-slate-600 dark:text-slate-400' : 'font-semibold text-slate-900 dark:text-slate-100'}`}>
                    {n.mensaje}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    {new Date(n.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
