import axios from 'axios'

/**
 * Admin API client.
 * Separate token storage from the customer app; on 401 clears session and
 * redirects to the admin login page.
 */
const adminApi = axios.create({
  baseURL: '/api/admin',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminApi.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    const url = err.config?.url || ''

    if (status === 401 && !url.includes('/login')) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export default adminApi
