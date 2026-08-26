<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const form = ref({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(form.value.email, form.value.password)
    router.push(route.query.redirect || '/')
  } catch (e) {
    error.value = e.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-3xl bg-white p-8 shadow-xl shadow-gray-200/50">
    <h1 class="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h1>
    <p class="mt-1 text-sm text-gray-500">Log in to your NovaShop account</p>

    <div v-if="route.query.expired" class="mt-4 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700 ring-1 ring-inset ring-amber-200">
      Your session expired. Please log in again.
    </div>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div v-if="error" class="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-100">{{ error }}</div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
        <input v-model="form.email" type="email" required autocomplete="email"
          class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
      </div>
      <div>
        <div class="mb-1.5 flex items-center justify-between">
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <RouterLink to="/forgot-password" class="text-xs font-medium text-primary-600 hover:underline">Forgot password?</RouterLink>
        </div>
        <input v-model="form.password" type="password" required autocomplete="current-password"
          class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
      </div>
      <BaseButton type="submit" :loading="loading" block size="lg">Log In</BaseButton>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500">
      Don't have an account?
      <RouterLink to="/register" class="font-semibold text-primary-600 hover:underline">Create one</RouterLink>
    </p>

    <div class="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-center text-xs text-gray-500">
      This is the <strong>customer</strong> sign-in.
      <RouterLink to="/admin/login" class="font-semibold text-primary-600 hover:underline">Administrator? Sign in here →</RouterLink>
    </div>
  </div>
</template>
