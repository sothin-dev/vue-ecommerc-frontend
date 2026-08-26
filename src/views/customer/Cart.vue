<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'
import { formatCurrency } from '@/composables/useFormat'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'

const router = useRouter()
const cart = useCartStore()
const toast = useToastStore()

const updatingId = ref(null)

const shippingEstimate = cart.subtotal >= 50 ? 0 : 5

async function update(item, delta) {
  const newQty = item.quantity + delta
  if (newQty < 1) return removeItem(item)
  updatingId.value = item.id
  try {
    await cart.updateItem(item.id, newQty)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Could not update quantity.')
  } finally {
    updatingId.value = null
  }
}

async function setQuantity(item, event) {
  const q = Math.max(1, parseInt(event.target.value) || 1)
  updatingId.value = item.id
  try {
    await cart.updateItem(item.id, Math.min(q, item.stock))
  } catch (e) {
    toast.error(e.response?.data?.message || 'Only limited stock available.')
  } finally {
    updatingId.value = null
  }
}

async function removeItem(item) {
  try {
    await cart.removeItem(item.id)
    toast.info(`"${item.name}" removed from cart.`)
  } catch (_) {
    toast.error('Could not remove item.')
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>

    <LoadingSpinner v-if="cart.loading" size="lg" />
    <EmptyState v-else-if="!cart.items.length" title="Your cart is empty"
      description="Browse our catalog and find something you love.">
      <RouterLink to="/products" class="mt-4 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
        Start Shopping
      </RouterLink>
    </EmptyState>

    <div v-else class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <!-- Items -->
      <div class="lg:col-span-2">
        <div class="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-card">
          <div v-for="item in cart.items" :key="item.id" class="flex gap-4 p-4 sm:p-5">
            <RouterLink :to="{ name: 'ProductDetail', params: { slug: item.slug } }" class="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50">
              <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="h-full w-full object-cover" />
              <ImagePlaceholder v-else type="product" label="No photo yet" />
            </RouterLink>

            <div class="flex min-w-0 flex-1 flex-col">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <RouterLink :to="{ name: 'ProductDetail', params: { slug: item.slug } }" class="truncate text-sm font-semibold text-gray-900 hover:text-primary-700">
                    {{ item.name }}
                  </RouterLink>
                  <p v-if="item.variant" class="mt-0.5 text-xs text-gray-500">{{ item.variant.type }}: {{ item.variant.value }}</p>
                  <p class="mt-1 text-sm font-medium text-gray-700">{{ formatCurrency(item.price) }}</p>
                </div>
                <button class="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500" aria-label="Remove" @click="removeItem(item)">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div class="mt-auto flex items-center justify-between pt-3">
                <div class="flex items-center rounded-lg border border-gray-200">
                  <button class="px-3 py-1.5 text-gray-600 disabled:opacity-30" :disabled="updatingId === item.id || item.quantity <= 1" @click="update(item, -1)">−</button>
                  <input
                    :value="item.quantity"
                    type="number"
                    min="1"
                    :max="item.stock"
                    class="w-12 border-x border-gray-200 py-1.5 text-center text-sm focus:outline-none"
                    @change="setQuantity(item, $event)"
                  />
                  <button class="px-3 py-1.5 text-gray-600 disabled:opacity-30" :disabled="updatingId === item.id || item.quantity >= item.stock" @click="update(item, +1)">+</button>
                </div>
                <p class="text-sm font-bold text-gray-900">{{ formatCurrency(item.subtotal) }}</p>
              </div>
            </div>
          </div>
        </div>

        <RouterLink to="/products" class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700">
          ← Continue shopping
        </RouterLink>
      </div>

      <!-- Summary -->
      <aside class="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <h2 class="text-base font-bold text-gray-900">Order Summary</h2>
        <dl class="mt-5 space-y-3 text-sm">
          <div class="flex justify-between text-gray-600">
            <dt>Subtotal</dt>
            <dd class="font-semibold text-gray-900">{{ formatCurrency(cart.subtotal) }}</dd>
          </div>
          <div class="flex justify-between text-gray-600">
            <dt>Shipping estimate</dt>
            <dd :class="shippingEstimate === 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-gray-900'">
              {{ shippingEstimate === 0 ? 'Free' : formatCurrency(shippingEstimate) }}
            </dd>
          </div>
        </dl>
        <div class="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base">
          <span class="font-bold text-gray-900">Estimated total</span>
          <span class="font-extrabold text-gray-900">{{ formatCurrency(cart.subtotal + shippingEstimate) }}</span>
        </div>
        <button
          class="mt-6 w-full rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700"
          @click="router.push({ name: 'Checkout' })"
        >
          Proceed to Checkout
        </button>
        <p v-if="cart.subtotal < 50" class="mt-3 text-center text-xs text-gray-400">
          Add {{ formatCurrency(50 - cart.subtotal) }} more for free shipping
        </p>
      </aside>
    </div>
  </div>
</template>
