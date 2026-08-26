<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { formatCurrency, formatDate } from '@/composables/useFormat'
import { ORDER_STATUSES, STATUS_COLORS } from '@/composables/useOrderMeta'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import DataTable from '@/components/admin/DataTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'

const toast = useToastStore()

const orders = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)
const filters = reactive({ search: '', status: '' })

// Detail drawer
const detail = ref(null)
const detailLoading = ref(false)
const statusUpdating = ref(false)
const selectedStatus = ref('')

async function load(page = 1) {
  loading.value = true
  try {
    const { data } = await adminService.orders({ ...filters, page })
    orders.value = data.data
    meta.value = data.meta
  } catch (_) {
    toast.error('Failed to load orders.')
  } finally {
    loading.value = false
  }
}

async function openDetail(id) {
  detailLoading.value = true
  detail.value = null
  selectedStatus.value = ''
  try {
    const { data } = await adminService.order(id)
    detail.value = data.data
    selectedStatus.value = data.data.status
  } catch (_) {
    toast.error('Failed to load the order.')
  } finally {
    detailLoading.value = false
  }
}

async function updateStatus() {
  if (!detail.value || selectedStatus.value === detail.value.status) return
  statusUpdating.value = true
  try {
    const { data } = await adminService.updateOrderStatus(detail.value.id, selectedStatus.value)
    detail.value = data.data
    toast.success(data.message)
    await load(meta.value.current_page)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Could not update the status.')
  } finally {
    statusUpdating.value = false
  }
}

async function copyAddress() {
  try {
    await navigator.clipboard.writeText(detail.value.shipping_address)
    toast.info('Shipping address copied.')
  } catch (_) {}
}

onMounted(() => load())
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Orders</h1>
        <p class="mt-0.5 text-sm text-gray-500">{{ meta.total }} order(s)</p>
      </div>
      <select v-model="filters.status" @change="load(1)"
        class="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-primary-500 focus:outline-none">
        <option value="">All Statuses</option>
        <option v-for="s in ORDER_STATUSES" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-3">
      <input v-model="filters.search" placeholder="Search by order # or customer…" @keyup.enter="load(1)"
        class="w-full max-w-sm rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none" />
      <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700" @click="load(1)">Search</button>
    </div>

    <div class="mt-5">
      <DataTable :columns="[
        { key: 'number', label: 'Order' },
        { key: 'customer', label: 'Customer' },
        { key: 'items', label: 'Items' },
        { key: 'total', label: 'Total' },
        { key: 'payment', label: 'Payment' },
        { key: 'status', label: 'Status' },
        { key: 'date', label: 'Date' },
        { key: 'actions', label: '' }
      ]" :loading="loading">
        <tr v-for="o in orders" :key="o.id" class="cursor-pointer hover:bg-gray-50/50" @click="openDetail(o.id)">
          <td class="whitespace-nowrap px-4 py-3 font-semibold text-primary-700">#{{ o.order_number }}</td>
          <td class="px-4 py-3">
            <p class="font-medium text-gray-900">{{ o.customer?.name }}</p>
            <p class="text-xs text-gray-400">{{ o.customer?.email }}</p>
          </td>
          <td class="px-4 py-3 text-gray-600">{{ o.items_count }}</td>
          <td class="px-4 py-3 font-bold text-gray-900">{{ formatCurrency(o.total) }}</td>
          <td class="px-4 py-3"><StatusBadge :status="o.payment_status" /></td>
          <td class="px-4 py-3"><StatusBadge :status="o.status" :colors="STATUS_COLORS" /></td>
          <td class="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{{ formatDate(o.created_at) }}</td>
          <td class="px-4 py-3 text-right">
            <span class="text-xs font-semibold text-primary-600 hover:underline">View</span>
          </td>
        </tr>
      </DataTable>

      <div class="mt-5 flex justify-center">
        <AppPagination :current-page="meta.current_page" :last-page="meta.last_page" :total="meta.total" @change="load($event)" />
      </div>
    </div>

    <!-- Order detail modal -->
    <BaseModal :open="detailLoading || !!detail" size="lg" :title="detail ? `Order #${detail.order_number}` : 'Loading…'" @close="detail = null; detailLoading = false">
      <div v-if="detail">
        <!-- Status control -->
        <div class="flex flex-wrap items-center gap-3 rounded-xl bg-gray-50 p-4">
          <label class="text-xs font-bold uppercase tracking-wide text-gray-500">Update status</label>
          <select v-model="selectedStatus"
            class="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm capitalize focus:border-primary-500 focus:outline-none">
            <option v-for="s in ORDER_STATUSES" :key="s" :value="s">{{ s }}</option>
          </select>
          <button
            class="rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-40"
            :disabled="statusUpdating || selectedStatus === detail.status"
            @click="updateStatus"
          >
            {{ statusUpdating ? 'Saving…' : 'Apply' }}
          </button>
          <StatusBadge class="ml-auto" :status="detail.status" :colors="STATUS_COLORS" />
        </div>

        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="rounded-xl border border-gray-100 p-4 text-sm">
            <p class="text-xs font-bold uppercase tracking-wide text-gray-400">Customer</p>
            <p class="mt-1.5 font-semibold text-gray-900">{{ detail.customer?.name }}</p>
            <p class="text-gray-500">{{ detail.customer?.email }}</p>
            <p v-if="detail.customer?.phone" class="text-gray-500">{{ detail.customer.phone }}</p>
            <button v-if="detail.shipping_address" class="mt-2 flex items-start gap-1.5 text-left text-xs text-primary-600 hover:underline" @click="copyAddress">
              📍 {{ detail.shipping_address }}
            </button>
          </div>
          <div class="rounded-xl border border-gray-100 p-4 text-sm">
            <p class="text-xs font-bold uppercase tracking-wide text-gray-400">Summary</p>
            <dl class="mt-1.5 space-y-1.5">
              <div class="flex justify-between"><dt class="text-gray-500">Placed</dt><dd>{{ formatDate(detail.created_at, true) }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Payment</dt><dd class="capitalize">{{ detail.payment_method.replace(/_/g,' ') }} · {{ detail.payment_status }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Subtotal</dt><dd>{{ formatCurrency(detail.subtotal) }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Shipping</dt><dd>{{ formatCurrency(detail.shipping_fee) }}</dd></div>
              <div v-if="detail.discount > 0" class="flex justify-between"><dt class="text-gray-500">Discount {{ detail.coupon_code ? `(${detail.coupon_code})` : '' }}</dt><dd class="text-emerald-600">−{{ formatCurrency(detail.discount) }}</dd></div>
              <div class="flex justify-between border-t border-gray-100 pt-1.5 font-extrabold text-gray-900"><dt>Total</dt><dd>{{ formatCurrency(detail.total) }}</dd></div>
            </dl>
          </div>
        </div>

        <ul class="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
          <li v-for="item in detail.items" :key="item.id" class="flex items-center gap-3 p-3">
            <img v-if="item.image_url" :src="item.image_url" class="h-11 w-11 rounded-lg object-cover" alt="" />
            <div v-else class="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
              <ImagePlaceholder type="product" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-gray-900">{{ item.name }}</p>
              <p class="text-xs text-gray-400">
                {{ formatCurrency(item.unit_price) }} × {{ item.quantity }}
                <template v-if="item.variant"> · {{ item.variant.type }}: {{ item.variant.value }}</template>
              </p>
            </div>
            <p class="text-sm font-semibold">{{ formatCurrency(item.subtotal) }}</p>
          </li>
        </ul>
      </div>
    </BaseModal>
  </div>
</template>
