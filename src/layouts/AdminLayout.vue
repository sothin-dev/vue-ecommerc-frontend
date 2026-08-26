<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuthStore } from '@/stores/adminAuth'

const router = useRouter()
const adminAuth = useAdminAuthStore()

const sidebarOpen = ref(false)
const userMenuOpen = ref(false)

const initials = computed(() => {
  return (adminAuth.admin?.name || 'A')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const nav = [
  { name: 'AdminDashboard', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h6' },
  { name: 'AdminProducts', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { name: 'AdminCategories', label: 'Categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { name: 'AdminInventory', label: 'Inventory', icon: 'M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0a2 2 0 00-2-2H6a2 2 0 00-2 2m8 4V7m-4 4V7' },
  { name: 'AdminOrders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { name: 'AdminCustomers', label: 'Customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { name: 'AdminCoupons', label: 'Coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { name: 'AdminReviews', label: 'Reviews', icon: 'M11.05 3.69c.3-.92 1.6-.92 1.9 0l1.52 4.67a1 1 0 00.95.69h4.91c.97 0 1.37 1.24.59 1.81l-3.98 2.89a1 1 0 00-.36 1.12l1.52 4.67c.3.92-.75 1.69-1.54 1.12l-3.98-2.89a1 1 0 00-1.18 0l-3.98 2.9c-.78.56-1.84-.2-1.53-1.12l1.52-4.67a1 1 0 00-.37-1.12L2.08 10.86c-.78-.57-.38-1.81.6-1.81h4.9a1 1 0 00.96-.69l1.51-4.67z' },
  { name: 'AdminReports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { name: 'AdminSettings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
]

async function logout() {
  await adminAuth.logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gray-900 transition-transform duration-200 lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">N</span>
        <div>
          <p class="text-sm font-bold text-white">NovaShop</p>
          <p class="text-[10px] uppercase tracking-wider text-gray-500">Admin Panel</p>
        </div>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <RouterLink
          v-for="item in nav"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          exact-active-class="!bg-primary-600 !text-white"
          @click="sidebarOpen = false"
        >
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
          </svg>
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="border-t border-gray-800 p-3">
        <button
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
          @click="logout"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>

    <!-- Backdrop -->
    <Transition name="fade">
      <div v-if="sidebarOpen" class="fixed inset-0 z-30 bg-gray-900/50 lg:hidden" @click="sidebarOpen = false" />
    </Transition>

    <!-- Main -->
    <div class="lg:pl-64">
      <header class="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-100 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
        <button class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden" aria-label="Toggle sidebar" @click="sidebarOpen = !sidebarOpen">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="ml-auto flex items-center gap-3">
          <RouterLink
            to="/"
            target="_blank"
            class="hidden text-sm font-medium text-gray-500 hover:text-primary-600 sm:block"
          >
            View Store ↗
          </RouterLink>

          <div class="relative">
            <button
              class="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:bg-gray-100"
              @click="userMenuOpen = !userMenuOpen"
            >
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">{{ initials }}</span>
              <span class="hidden text-sm font-medium text-gray-700 sm:block">{{ adminAuth.admin?.name }}</span>
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Transition name="scale">
              <div v-if="userMenuOpen" class="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                <RouterLink to="/admin/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="userMenuOpen = false">Profile Settings</RouterLink>
                <button class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50" @click="logout">Sign out</button>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <main class="px-4 py-6 sm:px-6 lg:px-8">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" :key="$route.fullPath" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
