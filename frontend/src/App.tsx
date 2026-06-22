import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Search from './pages/Search'
import Catalog from './pages/Catalog'
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

  useEffect(() => {
    init()
  }, [init])

  return (
    <Layout>
      <div className="space-y-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/catalogo/:category" element={<Catalog />} />
          <Route path="/submission" element={<Submission />} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><Admin /></ProtectedRoute>} />
          <Route path="/student" element={<ProtectedRoute roles={["bibliotecario", "repositor"]}><Student /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
    </Layout>
  )
}
