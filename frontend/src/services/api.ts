import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login') && !error.config.url?.includes('/auth/register') && !error.config.url?.includes('/auth/perfil')) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
