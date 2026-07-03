import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Search from './pages/Search'
import Catalog from './pages/Catalog'
import TrabajoDetalle from './pages/TrabajoDetalle'
import Submission from './pages/Submission'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Student from './pages/Student'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { useAuthStore } from './stores/useAuthStore'

export default function App() {
  const init = useAuthStore((s) => s.init)
  const loading = useAuthStore((s) => s.loading)
  const [inited, setInited] = useState(false)

  useEffect(() => {
    init().finally(() => setInited(true))
  }, [init])

  if (!inited && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-unefa/30 border-t-unefa" />
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '1rem', padding: '12px 16px', fontSize: '14px' },
          success: { iconTheme: { primary: '#0b57a4', secondary: '#fff' } },
          error: { iconTheme: { primary: '#e11d48', secondary: '#fff' } },
        }}
      />
      <Layout>
        <div className="space-y-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/catalogo/:category" element={<Catalog />} />
            <Route path="/trabajos/:id" element={<TrabajoDetalle />} />
            <Route path="/submission" element={<Submission />} />
            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><Admin /></ProtectedRoute>} />
            <Route path="/student" element={<ProtectedRoute roles={["bibliotecario", "repositor"]}><Student /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={
              <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-8 text-center shadow-sm backdrop-blur">
                <p className="text-4xl font-black text-slate-300">404</p>
                <p className="mt-2 text-lg font-semibold text-slate-600">Página no encontrada</p>
                <a href="/" className="mt-4 inline-block rounded-full bg-unefa px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-unefa/20 hover:brightness-110">
                  Volver al inicio
                </a>
              </section>
            } />
          </Routes>
        </div>
      </Layout>
    </>
  )
}
