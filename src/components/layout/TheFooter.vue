<script setup>
import { ref, onMounted } from 'vue'

const categories = ref([])

onMounted(async () => {
  try {
    const { default: api } = await import('@/services/api')
    const { data } = await api.get('/categories', { params: { all: 1 } })
    categories.value = data.data.filter(c => c.is_active && !c.parent_id).slice(0, 4)
  } catch (_) {}
})
</script>

<template>
  <footer class="mt-16 border-t border-gray-100 bg-white">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-base font-bold text-white">N</span>
            <span class="text-lg font-bold tracking-tight text-gray-900">NovaShop</span>
          </div>
          <p class="mt-3 text-sm leading-relaxed text-gray-500">
            Your destination for quality products, fair prices and fast delivery.
          </p>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-900">Shop</h3>
          <ul class="mt-4 space-y-2.5">
            <li><RouterLink to="/products" class="text-sm text-gray-500 hover:text-primary-600">All Products</RouterLink></li>
            <li v-for="c in categories" :key="c.id">
              <RouterLink :to="{ name: 'CategoryProducts', params: { slug: c.slug } }" class="text-sm text-gray-500 hover:text-primary-600">
                {{ c.name }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-900">Account</h3>
          <ul class="mt-4 space-y-2.5">
            <li><RouterLink to="/profile" class="text-sm text-gray-500 hover:text-primary-600">My Profile</RouterLink></li>
            <li><RouterLink to="/orders" class="text-sm text-gray-500 hover:text-primary-600">Order History</RouterLink></li>
            <li><RouterLink to="/wishlist" class="text-sm text-gray-500 hover:text-primary-600">Wishlist</RouterLink></li>
            <li><RouterLink to="/cart" class="text-sm text-gray-500 hover:text-primary-600">Cart</RouterLink></li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-900">Support</h3>
          <ul class="mt-4 space-y-2.5">
            <li class="text-sm text-gray-500">Free shipping over $50</li>
            <li class="text-sm text-gray-500">30-day return policy</li>
            <li class="text-sm text-gray-500">support@novashop.com</li>
          </ul>
        </div>
      </div>

      <div class="mt-10 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
        © {{ new Date().getFullYear() }} NovaShop. All rights reserved.
      </div>
    </div>
  </footer>
</template>
