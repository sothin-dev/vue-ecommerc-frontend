import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)

  const isLoggedIn = computed(() => !!token.value)

  function setAuth(userData, tokenValue) {
    user.value  = userData
    token.value = tokenValue
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', tokenValue)
  }

  function clearAuth() {
    user.value  = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  async function login(email, password) {
    const { data } = await authService.login(email, password)
    setAuth(data.user, data.token)
    return data
  }

  async function register(payload) {
    const { data } = await authService.register(payload)
    setAuth(data.user, data.token)
    return data
  }

  async function logout() {
    try { await authService.logout() } catch (_) {}
    clearAuth()
  }

  async function fetchProfile() {
    const { data } = await authService.getProfile()
    user.value = data.data
    localStorage.setItem('user', JSON.stringify(data.data))
    return data.data
  }

  function updateUser(userData) {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  return { user, token, isLoggedIn, login, register, logout, fetchProfile, setAuth, clearAuth, updateUser }
})
