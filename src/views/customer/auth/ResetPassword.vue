<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/auth.service'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const form = ref({
  token: String(route.query.token || ''),
  email: String(route.query.email || ''),
  password: '',
  password_confirmation: ''
})
const error = ref('')
const success = ref(false)
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await authService.resetPassword(form.value)
    success.value = true
    setTimeout(() => router.push('/login'), 2500)
  } catch (e) {
    const errors = e.response?.data?.errors
    error.value = errors
      ? Object.values(errors).flat()[0]
      : e.response?.data?.message || 'Reset failed. The link may have expired.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-3xl bg-white p-8 shadow-xl shadow-gray-200/50">
    <template v-if="!success">
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">Choose a new password</h1>
      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <div v-if="error" class="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-100">{{ error }}</div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input v-model="form.email" type="email" required
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">New Password</label>
          <input v-model="form.password" type="password" required minlength="8"
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Confirm Password</label>
          <input v-model="form.password_confirmation" type="password" required
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
        </div>
        <BaseButton type="submit" :loading="loading" block size="lg">Reset Password</BaseButton>
      </form>
    </template>
    <div v-else class="text-center">
      <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      </span>
      <h1 class="mt-4 text-xl font-bold text-gray-900">Password updated!</h1>
      <p class="mt-2 text-sm text-gray-500">Redirecting you to the login page…</p>
    </div>
  </div>
</template>
