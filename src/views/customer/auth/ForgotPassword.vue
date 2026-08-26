<script setup>
import { ref } from 'vue'
import { authService } from '@/services/auth.service'
import BaseButton from '@/components/common/BaseButton.vue'

const email = ref('')
const sent = ref(false)
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    await authService.forgotPassword(email.value)
    sent.value = true
  } catch (_) {} finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-3xl bg-white p-8 shadow-xl shadow-gray-200/50">
    <template v-if="!sent">
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">Forgot password</h1>
      <p class="mt-1 text-sm text-gray-500">Enter your email and we'll send you a reset link.</p>
      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input v-model="email" type="email" required autocomplete="email"
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
        </div>
        <BaseButton type="submit" :loading="loading" block size="lg">Send Reset Link</BaseButton>
      </form>
    </template>

    <div v-else class="text-center">
      <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
      </span>
      <h1 class="mt-4 text-xl font-bold text-gray-900">Check your inbox</h1>
      <p class="mt-2 text-sm text-gray-500">
        If an account exists for <strong>{{ email }}</strong>, a password reset link is on its way.
      </p>
    </div>

    <p class="mt-6 text-center text-sm">
      <RouterLink to="/login" class="font-semibold text-primary-600 hover:underline">← Back to login</RouterLink>
    </p>
  </div>
</template>
