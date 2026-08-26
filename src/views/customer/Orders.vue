<script setup>
import { ref, onMounted } from 'vue'
import { orderService } from '@/services/order.service'
import { formatCurrency, formatDate } from '@/composables/useFormat'
import { STATUS_COLORS } from '@/composables/useOrderMeta'
import StatusBadge from '@/components/common/StatusBadge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'

const cart = useCartStore()
const toast = useToastStore()

const orders = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)
const error = ref(null)
const reordering = ref(null)

async function load(page = 1) {
  loading.value = true
  error.value = null
  try {
    const { data } = await orderService.list({ page })
    orders.value = data.data
    meta.value = data.meta
  } catch (_) {
    error.value = 'Failed to load your orders.'
  } finally {
    loading.value = false
  }
}

async function reorder(order) {
  reordering.value = order.id
  try {
    const { data } = await orderService.reorder(order.order_number)
    await cart.fetchCart()
    toast.success(data.message)
  } catch (_) {
    toast.error('Could not reorder this order.')
  } finally {
    reordering.value = null
  }
}

onMounted(() => load())
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold tracking-tight text-gray-900">My Orders</h1>

    <LoadingSpinner v-if="loading" size="lg" />
    <EmptyState v-else-if="error" :title="error" />
    <EmptyState v-else-if="!orders.length" title="No orders yet" description="When you place an order it will show up here.">
      <RouterLink to="/products" class="mt-4 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
        Start Shopping
      </RouterLink>
    </EmptyState>

    <template v-else>
      <div class="mt-8 space-y-4">
        <div v-for="order in orders" :key="order.id"
          class="rounded-2xl border border-gray-100 bg-white p-5 shadow-card transition hover:shadow-card-hover">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <RouterLink :to="{ name: 'OrderDetail', params: { number: order.order_number } }"
                class="text-sm font-bold text-gray-900 hover:text-primary-700">
                #{{ order.order_number }}
              </RouterLink>
              <p class="mt-0.5 text-xs text-gray-500">Placed {{ formatDate(order.created_at, true) }} · {{ order.items_count }} item(s)</p>
            </div>
            <StatusBadge :status="order.status" :colors="STATUS_COLORS" />
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
            <p class="text-sm">
              <span class="font-bold text-gray-900">{{ formatCurrency(order.total) }}</span>
              <span class="text-gray-400"> · {{ order.payment_method.replace(/_/g, ' ') }}</span>
            </p>
            <div class="flex items-center gap-3">
              <button
                v-if="!['delivered', 'cancelled'].includes(order.status)"
                class="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                :disabled="reordering === order.id"
                @click="reorder(order)"
              >
                Reorder
              </button>
              <RouterLink
                :to="{ name: 'OrderDetail', params: { number: order.order_number } }"
                class="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                View Details
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <AppPagination :current-page="meta.current_page" :last-page="meta.last_page" :total="meta.total"
          @change="load($event)" />
      </div>
    </template>
  </div>
</template>
