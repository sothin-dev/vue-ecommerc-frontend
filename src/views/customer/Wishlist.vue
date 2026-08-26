<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'
import { formatCurrency } from '@/composables/useFormat'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'

const router = useRouter()
const wishlist = useWishlistStore()
const cart = useCartStore()
const toast = useToastStore()

const busyId = ref(null)

async function moveToCart(product) {
  busyId.value = product.id
  try {
    await cart.addToCart(product.id, 1)
    await wishlist.toggle(product.id)
    toast.success(`"${product.name}" moved to cart.`)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Could not add to cart.')
  } finally {
    busyId.value = null
  }
}

async function remove(product) {
  try {
    await wishlist.toggle(product.id)
  } catch (_) {
    toast.error('Could not remove item.')
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold tracking-tight text-gray-900">My Wishlist</h1>

    <LoadingSpinner v-if="wishlist.loading" size="lg" />
    <EmptyState v-else-if="!wishlist.items.length" title="Your wishlist is empty"
      description="Tap the heart on any product to save it for later.">
      <RouterLink to="/products" class="mt-4 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
        Discover Products
      </RouterLink>
    </EmptyState>

    <div v-else class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="p in wishlist.items" :key="p.id" class="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-card">
        <RouterLink :to="{ name: 'ProductDetail', params: { slug: p.slug } }" class="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50">
          <img v-if="p.image_url" :src="p.image_url" :alt="p.name" class="h-full w-full object-cover" />
          <ImagePlaceholder v-else type="product" label="No photo yet" />
        </RouterLink>
        <div class="flex min-w-0 flex-1 flex-col">
          <RouterLink :to="{ name: 'ProductDetail', params: { slug: p.slug } }" class="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-primary-700">
            {{ p.name }}
          </RouterLink>
          <p class="mt-1 text-sm font-bold text-gray-900">{{ formatCurrency(p.sale_price ?? p.price) }}</p>
          <div class="mt-auto flex gap-2 pt-2">
            <button
              class="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              :disabled="!p.in_stock || busyId === p.id"
              @click="moveToCart(p)"
            >
              {{ p.in_stock ? (busyId === p.id ? 'Adding…' : 'Move to Cart') : 'Out of Stock' }}
            </button>
            <button class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50" @click="remove(p)">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
