<script setup>
import { ref, computed } from 'vue'
import { formatCurrency } from '@/composables/useFormat'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  product: { type: Object, required: true }
})

const cart = useCartStore()
const wishlist = useWishlistStore()
const toast = useToastStore()
const auth = useAuthStore()
const adding = ref(false)

const discountPercent = computed(() => {
  if (!props.product.on_sale) return 0
  return Math.round((1 - props.product.sale_price / props.product.price) * 100)
})

async function addToCart() {
  if (!auth.isLoggedIn) {
    toast.info('Please log in to add items to your cart.')
    return
  }
  adding.value = true
  try {
    await cart.addToCart(props.product.id, 1)
    toast.success(`"${props.product.name}" added to cart.`)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Could not add to cart.')
  } finally {
    adding.value = false
  }
}

async function toggleWishlist() {
  if (!auth.isLoggedIn) {
    toast.info('Please log in to save items to your wishlist.')
    return
  }
  try {
    await wishlist.toggle(props.product.id)
  } catch (_) {
    toast.error('Could not update wishlist.')
  }
}
</script>

<template>
  <div class="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
    <!-- Image -->
    <RouterLink :to="{ name: 'ProductDetail', params: { slug: product.slug } }" class="relative block aspect-square overflow-hidden bg-gray-50">
      <img
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <ImagePlaceholder v-if="!product.image_url" type="product" label="No photo yet" />

      <!-- Badges -->
      <span v-if="discountPercent" class="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
        -{{ discountPercent }}%
      </span>
      <span v-if="!product.in_stock" class="absolute inset-x-0 bottom-0 bg-gray-900/70 py-1.5 text-center text-xs font-medium text-white">
        Out of Stock
      </span>
    </RouterLink>

    <!-- Wishlist -->
    <button
      v-if="auth.isLoggedIn"
      class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110"
      :class="wishlist.isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'"
      :aria-label="wishlist.isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
      @click.prevent="toggleWishlist"
    >
      <svg class="h-5 w-5" :fill="wishlist.isInWishlist(product.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>

    <!-- Body -->
    <div class="flex flex-1 flex-col p-4">
      <p class="text-xs font-medium uppercase tracking-wide text-primary-600">{{ product.category?.name }}</p>
      <RouterLink
        :to="{ name: 'ProductDetail', params: { slug: product.slug } }"
        class="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 hover:text-primary-700"
      >
        {{ product.name }}
      </RouterLink>
      <div class="mt-2 flex items-baseline gap-2">
        <span class="text-base font-bold text-gray-900">{{ formatCurrency(product.display_price) }}</span>
        <span v-if="product.on_sale" class="text-sm text-gray-400 line-through">{{ formatCurrency(product.price) }}</span>
      </div>
      <button
        class="mt-3 w-full rounded-lg border border-primary-600 py-2 text-sm font-semibold text-primary-600 transition hover:bg-primary-600 hover:text-white disabled:pointer-events-none disabled:opacity-40"
        :disabled="!product.in_stock || adding"
        @click="addToCart"
      >
        {{ adding ? 'Adding…' : 'Add to Cart' }}
      </button>
    </div>
  </div>
</template>
