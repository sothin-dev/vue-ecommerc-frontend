import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import adminApi from '@/services/adminApi'

export const useAdminAuthStore = defineStore('adminAuth', () => {
  const admin = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))
  const token = ref(localStorage.getItem('admin_token') || null)

  const isLoggedIn = computed(() => !!token.value)

  function setAuth(adminData, tokenValue) {
    admin.value = adminData
    token.value = tokenValue
    localStorage.setItem('admin_user', JSON.stringify(adminData))
    localStorage.setItem('admin_token', tokenValue)
  }

  function clearAuth() {
    admin.value = null
    token.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  async function login(email, password) {
    const { data } = await adminApi.post('/login', { email, password })
    setAuth(data.admin, data.token)
    return data
  }

  async function verify() {
    if (!token.value) return false
    try {
      await adminApi.get('/me')
      return true
    } catch (_) {
      clearAuth()
      return false
    }
  }

  async function logout() {
    try { await adminApi.post('/logout') } catch (_) {}
    clearAuth()
  }

  return { admin, token, isLoggedIn, login, logout, verify, setAuth, clearAuth }
})
