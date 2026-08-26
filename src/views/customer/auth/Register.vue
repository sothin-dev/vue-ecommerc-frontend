<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()
const wishlist = useWishlistStore()

const form = ref({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
const errors = ref({})
const loading = ref(false)

async function submit() {
  errors.value = {}
  loading.value = true
  try {
    await auth.register(form.value)
    cart.fetchCart().catch(() => {})
    wishlist.fetchWishlist().catch(() => {})
    router.push(route.query.redirect || '/')
  } catch (e) {
    if (e.response?.status === 422 && e.response.data?.errors) {
      errors.value = e.response.data.errors
    } else {
      errors.value = { general: [e.response?.data?.message || 'Registration failed.'] }
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-3xl bg-white p-8 shadow-xl shadow-gray-200/50">
    <h1 class="text-2xl font-bold tracking-tight text-gray-900">Create account</h1>
    <p class="mt-1 text-sm text-gray-500">Join NovaShop for a better shopping experience</p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div v-if="errors.general" class="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-100">
        {{ errors.general[0] }}
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
        <input v-model="form.name" required autocomplete="name"
          class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
        <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name[0] }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
        <input v-model="form.email" type="email" required autocomplete="email"
          class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
        <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email[0] }}</p>
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Phone <span class="text-gray-400">(optional)</span></label>
        <input v-model="form.phone" type="tel" autocomplete="tel"
          class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
          <input v-model="form.password" type="password" required minlength="8" autocomplete="new-password"
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
          <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password[0] }}</p>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Confirm</label>
          <input v-model="form.password_confirmation" type="password" required autocomplete="new-password"
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
        </div>
      </div>
      <BaseButton type="submit" :loading="loading" block size="lg">Create Account</BaseButton>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500">
      Already have an account?
      <RouterLink to="/login" class="font-semibold text-primary-600 hover:underline">Log in</RouterLink>
    </p>
  </div>
</template>
