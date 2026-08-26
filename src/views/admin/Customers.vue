<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { formatCurrency, formatDate } from '@/composables/useFormat'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import DataTable from '@/components/admin/DataTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'

const toast = useToastStore()

const customers = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)
const filters = reactive({ search: '', status: '' })

const detail = ref(null)
const togglingId = ref(null)

async function load(page = 1) {
  loading.value = true
  try {
    const { data } = await adminService.customers({ ...filters, page })
    customers.value = data.data
    meta.value = data.meta
  } catch (_) {
    toast.error('Failed to load customers.')
  } finally {
    loading.value = false
  }
}

async function openDetail(id) {
  try {
    const { data } = await adminService.customer(id)
    detail.value = data.data
  } catch (_) {
    toast.error('Failed to load the customer.')
  }
}

async function toggleStatus(customer) {
  togglingId.value = customer.id
  try {
    const { data } = await adminService.toggleCustomerStatus(customer.id)
    toast.success(data.message)
    await load(meta.value.current_page)
    if (detail.value?.id === customer.id) detail.value.data ? null : null
    if (detail.value?.id === customer.id) {
      const { data: fresh } = await adminService.customer(customer.id)
      detail.value = fresh.data
    }
  } catch (_) {
    toast.error('Could not update the customer.')
  } finally {
    togglingId.value = null
  }
}

onMounted(() => load())
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Customers</h1>
        <p class="mt-0.5 text-sm text-gray-500">{{ meta.total }} registered customer(s)</p>
      </div>
      <select v-model="filters.status" @change="load(1)"
        class="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-primary-500 focus:outline-none">
        <option value="">All</option>
        <option value="active">Active</option>
        <option value="inactive">Deactivated</option>
      </select>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-3">
      <input v-model="filters.search" placeholder="Search name, email or phone…" @keyup.enter="load(1)"
        class="w-full max-w-sm rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none" />
      <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700" @click="load(1)">Search</button>
    </div>

    <div class="mt-5">
      <DataTable :columns="[
        { key: 'name', label: 'Customer' },
        { key: 'phone', label: 'Phone' },
        { key: 'orders', label: 'Orders' },
        { key: 'joined', label: 'Joined' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: '' }
      ]" :loading="loading">
        <tr v-for="c in customers" :key="c.id" class="hover:bg-gray-50/50">
          <td class="px-4 py-3">
            <button class="flex items-center gap-3 text-left" @click="openDetail(c.id)">
              <img v-if="c.avatar_url" :src="c.avatar_url" class="h-9 w-9 rounded-full object-cover" alt="" />
              <span v-else class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {{ c.name[0]?.toUpperCase() }}
              </span>
              <span>
                <span class="block font-medium text-gray-900 hover:text-primary-700">{{ c.name }}</span>
                <span class="block text-xs text-gray-400">{{ c.email }}</span>
              </span>
            </button>
          </td>
          <td class="px-4 py-3 text-gray-600">{{ c.phone || '—' }}</td>
          <td class="px-4 py-3 font-semibold text-gray-900">{{ c.orders_count }}</td>
          <td class="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{{ formatDate(c.joined_at) }}</td>
          <td class="px-4 py-3"><StatusBadge :status="c.is_active ? 'active' : 'inactive'" /></td>
          <td class="whitespace-nowrap px-4 py-3 text-right">
            <button
              class="mr-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 disabled:opacity-50"
              :disabled="togglingId === c.id"
              @click="openDetail(c.id)"
            >
              View
            </button>
            <button
              class="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              :class="c.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'"
              :disabled="togglingId === c.id"
              @click="toggleStatus(c)"
            >
              {{ togglingId === c.id ? '…' : c.is_active ? 'Deactivate' : 'Activate' }}
            </button>
          </td>
        </tr>
      </DataTable>

      <div class="mt-5 flex justify-center">
        <AppPagination :current-page="meta.current_page" :last-page="meta.last_page" :total="meta.total" @change="load($event)" />
      </div>
    </div>

    <BaseModal :open="!!detail" size="sm" title="Customer Details" @close="detail = null">
      <div v-if="detail" class="space-y-4">
        <div class="flex items-center gap-4">
          <img v-if="detail.avatar_url" :src="detail.avatar_url" class="h-14 w-14 rounded-full object-cover" alt="" />
          <span v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
            {{ detail.name[0]?.toUpperCase() }}
          </span>
          <div>
            <p class="font-bold text-gray-900">{{ detail.name }}</p>
            <StatusBadge :status="detail.is_active ? 'active' : 'inactive'" />
          </div>
        </div>
        <dl class="space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
          <div class="flex justify-between"><dt class="text-gray-500">Email</dt><dd>{{ detail.email }}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Phone</dt><dd>{{ detail.phone || '—' }}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Joined</dt><dd>{{ formatDate(detail.joined_at) }}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Orders</dt><dd class="font-bold">{{ detail.stats?.orders_count ?? 0 }}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Total Spent</dt><dd class="font-bold text-emerald-600">{{ formatCurrency(detail.stats?.total_spent) }}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Last Order</dt><dd>{{ detail.stats?.last_order_at ? formatDate(detail.stats.last_order_at) : '—' }}</dd></div>
        </dl>
      </div>
    </BaseModal>
  </div>
</template>
