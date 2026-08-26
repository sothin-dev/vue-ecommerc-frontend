<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const searchQuery = ref('')
const mobileOpen = ref(false)
const userMenuOpen = ref(false)
const userMenuRef = ref(null)
const categories = ref([])
let clickHandler = null

const initials = computed(() => {
  return (auth.user?.name || '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

async function onSearch() {
  if (!searchQuery.value.trim()) return
  router.push({ name: 'Search', query: { search: searchQuery.value.trim() } })
  searchQuery.value = ''
  mobileOpen.value = false
}

async function logout() {
  userMenuOpen.value = false
  await auth.logout()
  cart.reset()
  router.push('/')
}

onMounted(async () => {
  clickHandler = e => {
    if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
      userMenuOpen.value = false
    }
  }
  document.addEventListener('click', clickHandler)

  try {
    const { default: api } = await import('@/services/api')
    const { data } = await api.get('/categories', { params: { all: 1 } })
    categories.value = data.data.filter(c => c.is_active && !c.parent_id).slice(0, 5)
  } catch (_) {}
})

onBeforeUnmount(() => document.removeEventListener('click', clickHandler))
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
    <!-- Announcement bar -->
    <div class="bg-gray-900 py-2 text-center text-xs font-medium text-white">
      Free shipping on orders over $50 · 30-day returns
    </div>

    <nav class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
      <!-- Mobile menu toggle -->
      <button class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden" aria-label="Menu" @click="mobileOpen = !mobileOpen">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path v-if="!mobileOpen" stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Logo -->
      <RouterLink to="/" class="flex shrink-0 items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-base font-bold text-white">N</span>
        <span class="text-lg font-bold tracking-tight text-gray-900">NovaShop</span>
      </RouterLink>

      <!-- Desktop nav -->
      <div class="hidden items-center gap-1 lg:flex">
        <RouterLink to="/" class="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">Home</RouterLink>
        <RouterLink to="/products" class="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">Shop</RouterLink>
        <RouterLink to="/categories" class="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">Categories</RouterLink>
      </div>

      <!-- Search -->
      <form class="ml-auto hidden max-w-md flex-1 md:block" @submit.prevent="onSearch">
        <div class="relative">
          <svg class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search products…"
            class="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </form>

      <div class="ml-auto flex items-center gap-1 md:ml-0">
        <!-- Wishlist -->
        <RouterLink
          v-if="auth.isLoggedIn"
          to="/wishlist"
          class="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Wishlist"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </RouterLink>

        <!-- Cart -->
        <RouterLink to="/cart" class="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100" aria-label="Cart">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span
            v-if="cart.count > 0"
            class="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-600 px-1 text-[11px] font-bold text-white"
          >
            {{ cart.count }}
          </span>
        </RouterLink>

        <!-- User menu -->
        <template v-if="auth.isLoggedIn">
          <div ref="userMenuRef" class="relative ml-1">
            <button
              class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 ring-2 ring-transparent transition hover:ring-primary-300"
              @click="userMenuOpen = !userMenuOpen"
            >
              {{ initials }}
            </button>
            <Transition name="scale">
              <div v-if="userMenuOpen" class="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                <div class="border-b border-gray-50 px-4 py-2.5">
                  <p class="truncate text-sm font-semibold text-gray-900">{{ auth.user?.name }}</p>
                  <p class="truncate text-xs text-gray-500">{{ auth.user?.email }}</p>
                </div>
                <RouterLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="userMenuOpen = false">My Profile</RouterLink>
                <RouterLink to="/orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="userMenuOpen = false">My Orders</RouterLink>
                <button class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50" @click="logout">Log out</button>
              </div>
            </Transition>
          </div>
        </template>
        <template v-else>
          <RouterLink to="/login" class="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 sm:block">Sign in</RouterLink>
          <RouterLink to="/register" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">Sign up</RouterLink>
        </template>
      </div>
    </nav>

    <!-- Mobile panel -->
    <Transition name="slide-up">
      <div v-if="mobileOpen" class="border-t border-gray-100 px-4 pb-4 pt-3 lg:hidden">
        <form class="mb-3 md:hidden" @submit.prevent="onSearch">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search products…"
            class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none"
          />
        </form>
        <div class="flex flex-col gap-1">
          <RouterLink to="/" class="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Home</RouterLink>
          <RouterLink to="/products" class="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">All Products</RouterLink>
          <RouterLink v-for="c in categories" :key="c.id" :to="{ name: 'CategoryProducts', params: { slug: c.slug } }" class="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {{ c.name }}
          </RouterLink>
          <RouterLink to="/categories" class="rounded-lg px-3 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50">View all categories →</RouterLink>
        </div>
      </div>
    </Transition>
  </header>
</template>
