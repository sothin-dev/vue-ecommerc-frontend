import axios from 'axios'

/**
 * Customer-facing API client.
 * Bearer token auth via localStorage; 401 handling skips auth endpoints so
 * failed logins show inline errors instead of forcing a redirect.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    const url = err.config?.url || ''
    const isAuthCall = url.includes('/login') || url.includes('/register') ||
      url.includes('/forgot-password') || url.includes('/reset-password')

    if (status === 401 && !isAuthCall) {
      // Session expired — clear state and let the router guard handle the redirect
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login?expired=1'
      }
    }
    return Promise.reject(err)
  }
)

export default api
