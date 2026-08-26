<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { orderService } from '@/services/order.service'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'
import { formatCurrency, formatDate } from '@/composables/useFormat'
import { STATUS_COLORS, TRACKING_STEPS, statusStep } from '@/composables/useOrderMeta'
import StatusBadge from '@/components/common/StatusBadge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'

const route = useRoute()
const cart = useCartStore()
const toast = useToastStore()

const order = ref(null)
const loading = ref(true)
const error = ref(null)
const cancelling = ref(false)
const reordering = ref(false)
const showCancel = ref(false)

const justPlaced = computed(() => route.query.placed === '1')

const stepIndex = computed(() => (order.value ? statusStep(order.value.status) : -1))

async function load() {
  loading.value = true
  error.value = null
  try {
    const { data } = await orderService.show(route.params.number)
    order.value = data.data
  } catch (e) {
    error.value = e.response?.status === 404 ? 'Order not found.' : 'Failed to load this order.'
  } finally {
    loading.value = false
  }
}

const canCancel = computed(() =>
  order.value && ['pending', 'confirmed', 'processing'].includes(order.value.status)
)

async function cancelOrder() {
  cancelling.value = true
  try {
    const { data } = await orderService.cancel(order.value.order_number)
    toast.success(data.message || 'Order cancelled.')
    await load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Could not cancel this order.')
  } finally {
    cancelling.value = false
    showCancel.value = false
  }
}

async function reorder() {
  reordering.value = true
  try {
    const { data } = await orderService.reorder(order.value.order_number)
    await cart.fetchCart()
    toast.success(data.message)
  } catch (_) {
    toast.error('Could not reorder.')
  } finally {
    reordering.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
    <!-- Success banner -->
    <div v-if="justPlaced && order" class="mb-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-5 ring-1 ring-inset ring-emerald-200">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      </span>
      <div>
        <p class="font-bold text-emerald-800">Thank you! Your order has been placed.</p>
        <p class="mt-0.5 text-sm text-emerald-700">We'll start processing it right away. Order #{{ order.order_number }}.</p>
      </div>
    </div>

    <LoadingSpinner v-if="loading" size="lg" />
    <EmptyState v-else-if="error" :title="error">
      <RouterLink to="/orders" class="mt-3 inline-block text-sm font-semibold text-primary-600 hover:underline">← Back to orders</RouterLink>
    </EmptyState>

    <template v-else-if="order">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-gray-900">Order #{{ order.order_number }}</h1>
          <p class="mt-1 text-sm text-gray-500">Placed {{ formatDate(order.created_at, true) }}</p>
        </div>
        <StatusBadge :status="order.status" :colors="STATUS_COLORS" />
      </div>

      <!-- Tracking timeline -->
      <div v-if="order.status !== 'cancelled'" class="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-8">
        <ol class="flex items-start">
          <li v-for="(step, i) in TRACKING_STEPS" :key="step" class="flex flex-1 flex-col items-center">
            <div class="flex w-full items-center">
              <div class="h-1 flex-1 rounded" :class="i === 0 ? 'bg-transparent' : i <= stepIndex ? 'bg-primary-500' : 'bg-gray-200'" />
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition"
                :class="i < stepIndex ? 'border-primary-600 bg-primary-600 text-white'
                  : i === stepIndex ? 'border-primary-600 bg-white text-primary-600 ring-4 ring-primary-100'
                  : 'border-gray-200 bg-white text-gray-300'"
              >
                <svg v-if="i < stepIndex" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                {{ i + 1 }}
              </div>
              <div class="h-1 flex-1 rounded" :class="i === TRACKING_STEPS.length - 1 ? 'bg-transparent' : i < stepIndex ? 'bg-primary-500' : 'bg-gray-200'" />
            </div>
            <span class="mt-3 hidden text-xs font-medium capitalize sm:block"
              :class="i <= stepIndex ? 'text-gray-900' : 'text-gray-400'">{{ step }}</span>
          </li>
        </ol>
      </div>
      <div v-else class="mt-8 rounded-2xl bg-red-50 p-5 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200">
        This order was cancelled on {{ formatDate(order.created_at, true) }}.
      </div>

      <!-- Items -->
      <div class="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-card">
        <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4 p-4 sm:p-5">
          <RouterLink :to="{ name: 'ProductDetail', params: { slug: item.slug } }" class="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-50">
            <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="h-full w-full object-cover" />
            <ImagePlaceholder v-else type="product" label="No photo yet" />
          </RouterLink>
          <div class="min-w-0 flex-1">
            <RouterLink :to="{ name: 'ProductDetail', params: { slug: item.slug } }" class="truncate text-sm font-semibold text-gray-900 hover:text-primary-700">
              {{ item.name }}
            </RouterLink>
            <p class="mt-0.5 text-xs text-gray-500">
              {{ formatCurrency(item.unit_price) }} × {{ item.quantity }}
              <template v-if="item.variant"> · {{ item.variant.type }}: {{ item.variant.value }}</template>
            </p>
          </div>
          <p class="text-sm font-bold text-gray-900">{{ formatCurrency(item.subtotal) }}</p>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Address & payment -->
        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <h2 class="text-sm font-bold uppercase tracking-wide text-gray-400">Shipping</h2>
          <p class="mt-3 text-sm leading-relaxed text-gray-700">{{ order.shipping_address }}</p>
          <h2 class="mt-6 text-sm font-bold uppercase tracking-wide text-gray-400">Payment</h2>
          <p class="mt-2 flex items-center gap-2 text-sm capitalize text-gray-700">
            {{ order.payment_method.replace(/_/g, ' ') }}
            <StatusBadge :status="order.payment_status" />
          </p>
        </div>

        <!-- Totals -->
        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between"><dt class="text-gray-500">Subtotal</dt><dd class="font-semibold">{{ formatCurrency(order.subtotal) }}</dd></div>
            <div class="flex justify-between"><dt class="text-gray-500">Shipping</dt><dd class="font-semibold">{{ order.shipping_fee ? formatCurrency(order.shipping_fee) : 'Free' }}</dd></div>
            <div v-if="order.discount > 0" class="flex justify-between">
              <dt class="text-gray-500">Discount {{ order.coupon_code ? `(${order.coupon_code})` : '' }}</dt>
              <dd class="font-semibold text-emerald-600">−{{ formatCurrency(order.discount) }}</dd>
            </div>
            <div class="flex justify-between border-t border-gray-100 pt-3 text-base font-extrabold text-gray-900">
              <dt>Total</dt><dd>{{ formatCurrency(order.total) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex flex-wrap items-center justify-end gap-3">
        <RouterLink to="/orders" class="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900">← All Orders</RouterLink>
        <button
          v-if="order.status !== 'cancelled'"
          class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          :disabled="reordering"
          @click="reorder"
        >
          {{ reordering ? 'Adding…' : 'Reorder' }}
        </button>
        <button
          v-if="canCancel"
          class="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          @click="showCancel = true"
        >
          Cancel Order
        </button>
      </div>

      <ConfirmDialog
        :open="showCancel"
        danger
        title="Cancel this order?"
        :message="`Order #${order?.order_number} will be cancelled and the stock will be returned. This cannot be undone.`"
        confirm-text="Cancel Order"
        :loading="cancelling"
        @close="showCancel = false"
        @confirm="cancelOrder"
      />
    </template>
  </div>
</template>
