<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { formatCurrency, formatDate } from '@/composables/useFormat'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import DataTable from '@/components/admin/DataTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const toast = useToastStore()

const coupons = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)
const filters = reactive({ search: '', status: '' })

const showForm = ref(false)
const editingId = ref(null)
const saving = ref(false)
const formErrors = ref({})

const emptyForm = () => ({
  code: '', type: 'percentage', value: 10,
  min_order_amount: '', max_discount: '',
  usage_limit: '', starts_at: '', expires_at: '',
  is_active: true, description: ''
})
const form = reactive(emptyForm())

const deleteTarget = ref(null)
const deleting = ref(false)

async function load(page = 1) {
  loading.value = true
  try {
    const { data } = await adminService.coupons({ ...filters, page })
    coupons.value = data.data
    meta.value = data.meta
  } catch (_) {
    toast.error('Failed to load coupons.')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  formErrors.value = {}
  showForm.value = true
}

function openEdit(coupon) {
  editingId.value = coupon.id
  Object.assign(form, {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    min_order_amount: coupon.min_order_amount ?? '',
    max_discount: coupon.max_discount ?? '',
    usage_limit: coupon.usage_limit ?? '',
    starts_at: coupon.starts_at ?? '',
    expires_at: coupon.expires_at ?? '',
    is_active: coupon.is_active,
    description: coupon.description ?? ''
  })
  formErrors.value = {}
  showForm.value = true
}

async function save() {
  saving.value = true
  formErrors.value = {}
  const payload = {
    ...form.value,
    code: form.code.toUpperCase().trim(),
    min_order_amount: form.min_order_amount === '' ? null : form.min_order_amount,
    max_discount: form.max_discount === '' ? null : form.max_discount,
    usage_limit: form.usage_limit === '' ? null : form.usage_limit,
    starts_at: form.starts_at || null,
    expires_at: form.expires_at || null
  }
  // percentage type caps at 100; fixed amounts shouldn't be limited to 100 client-side either — let backend validate
  try {
    if (editingId.value) {
      await adminService.updateCoupon(editingId.value, payload)
      toast.success('Coupon updated successfully.')
    } else {
      await adminService.createCoupon(payload)
      toast.success('Coupon created successfully.')
    }
    showForm.value = false
    await load(meta.value.current_page)
  } catch (e) {
    if (e.response?.status === 422 && e.response.data?.errors) {
      formErrors.value = e.response.data.errors
    } else {
      toast.error(e.response?.data?.message || 'Could not save the coupon.')
    }
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  deleting.value = true
  try {
    await adminService.deleteCoupon(deleteTarget.value.id)
    toast.success('Coupon deleted successfully.')
    await load(meta.value.current_page)
  } catch (_) {
    toast.error('Could not delete the coupon.')
  } finally {
    deleting.value = false
    deleteTarget.value = null
  }
}

const displayValue = computed(() => c => c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value))

onMounted(() => load())
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Coupons & Promotions</h1>
        <p class="mt-0.5 text-sm text-gray-500">{{ meta.total }} coupon(s)</p>
      </div>
      <button class="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700" @click="openCreate">
        + New Coupon
      </button>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-3">
      <input v-model="filters.search" placeholder="Search by code…" @keyup.enter="load(1)"
        class="w-full max-w-xs rounded-lg border border-gray-300 px-3.5 py-2 text-sm uppercase focus:border-primary-500 focus:outline-none sm:w-64" />
      <select v-model="filters.status" @change="load(1)"
        class="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-primary-500 focus:outline-none">
        <option value="">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="expired">Expired</option>
      </select>
      <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700" @click="load(1)">Search</button>
    </div>

    <div class="mt-5">
      <DataTable :columns="[
        { key: 'code', label: 'Code' },
        { key: 'value', label: 'Discount' },
        { key: 'usage', label: 'Usage' },
        { key: 'validity', label: 'Validity' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: '' }
      ]" :loading="loading">
        <tr v-for="c in coupons" :key="c.id" class="hover:bg-gray-50/50">
          <td class="px-4 py-3">
            <span class="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs font-bold text-gray-800">{{ c.code }}</span>
            <p v-if="c.description" class="mt-1 max-w-[200px] truncate text-xs text-gray-400">{{ c.description }}</p>
          </td>
          <td class="px-4 py-3 font-semibold text-gray-900">
            {{ c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value) }}
          </td>
          <td class="px-4 py-3 text-gray-600">
            {{ c.used_count }}<template v-if="c.usage_limit"> / {{ c.usage_limit }}</template>
          </td>
          <td class="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
            {{ c.starts_at ? formatDate(c.starts_at) : '∞' }} → {{ c.expires_at ? formatDate(c.expires_at) : '∞' }}
          </td>
          <td class="px-4 py-3"><StatusBadge :status="!c.is_active ? 'inactive' : c.is_expired ? 'expired' : 'active'" /></td>
          <td class="px-4 py-3 text-right">
            <button class="rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="Edit" @click="openEdit(c)">
              <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Delete" @click="deleteTarget = c">
              <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </td>
        </tr>
      </DataTable>

      <div class="mt-5 flex justify-center">
        <AppPagination :current-page="meta.current_page" :last-page="meta.last_page" :total="meta.total" @change="load($event)" />
      </div>
    </div>

    <!-- Modal -->
    <BaseModal :open="showForm" size="md" :title="editingId ? 'Edit Coupon' : 'New Coupon'" @close="!saving && (showForm = false)">
      <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="save">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Code *</label>
          <input v-model="form.code" required placeholder="SUMMER25"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm uppercase focus:border-primary-500 focus:outline-none" />
          <p v-if="formErrors.code" class="mt-1 text-xs text-red-600">{{ formErrors.code[0] }}</p>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Type *</label>
          <select v-model="form.type"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed amount ($)</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Value * <span class="normal-case text-gray-400">({{ form.type === 'percentage' ? '%' : '$' }})</span>
          </label>
          <input v-model.number="form.value" type="number" step="0.01" min="0" required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
          <p v-if="formErrors.value" class="mt-1 text-xs text-red-600">{{ formErrors.value[0] }}</p>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Min Order ($)</label>
          <input v-model.number="form.min_order_amount" type="number" step="0.01" min="0"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Max Discount ($)</label>
          <input v-model.number="form.max_discount" type="number" step="0.01" min="0" :disabled="form.type !== 'percentage'"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Usage Limit</label>
          <input v-model.number="form.usage_limit" type="number" min="1"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Starts At</label>
          <input v-model="form.starts_at" type="date"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Expires At</label>
          <input v-model="form.expires_at" type="date"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
          <p v-if="formErrors.expires_at" class="mt-1 text-xs text-red-600">{{ formErrors.expires_at[0] }}</p>
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
          <textarea v-model="form.description" rows="2" maxlength="500"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
        <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 sm:col-span-2">
          <input v-model="form.is_active" type="checkbox" class="h-4 w-4 accent-primary-600" />
          Active
        </label>
      </form>
      <template #footer>
        <button class="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700" :disabled="saving" @click="showForm = false">Cancel</button>
        <button class="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : editingId ? 'Update' : 'Create Coupon' }}
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog :open="!!deleteTarget" danger title="Delete this coupon?"
      :message="`Coupon '${deleteTarget?.code}' will be permanently removed.`"
      confirm-text="Delete" :loading="deleting"
      @close="deleteTarget = null" @confirm="doDelete" />
  </div>
</template>
