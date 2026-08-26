<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminAuthStore } from '@/stores/adminAuth'

const route = useRoute()
const router = useRouter()
const adminAuth = useAdminAuthStore()

const form = ref({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await adminAuth.login(form.value.email, form.value.password)
    router.push(route.query.redirect || '/admin')
  } catch (e) {
    error.value = e.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-900 px-4">
    <div class="w-full max-w-md">
      <div class="mb-8 flex items-center justify-center gap-2">
        <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-lg font-bold text-white">N</span>
        <div>
          <p class="text-lg font-bold text-white">NovaShop</p>
          <p class="text-xs uppercase tracking-wider text-gray-500">Admin Panel</p>
        </div>
      </div>

      <div class="rounded-3xl bg-white p-8 shadow-2xl">
        <h1 class="text-xl font-bold text-gray-900">Sign in to your account</h1>

        <form class="mt-6 space-y-4" @submit.prevent="submit">
          <div v-if="error" class="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-100">{{ error }}</div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">Email address</label>
            <input v-model="form.email" type="email" required autocomplete="email"
              class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
            <input v-model="form.password" type="password" required autocomplete="current-password"
              class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
          </div>
          <button type="submit"
            class="flex w-full items-center justify-center rounded-xl bg-primary-600 py-3 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-50"
            :disabled="loading">
            <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
