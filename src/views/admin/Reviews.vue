<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/composables/useFormat'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import DataTable from '@/components/admin/DataTable.vue'

const toast = useToastStore()

const reviews = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)
const filters = reactive({ search: '', status: '', rating: '' })
const busyId = ref(null)

async function load(page = 1) {
  loading.value = true
  try {
    const { data } = await adminService.reviews({ ...filters, page })
    reviews.value = data.data
    meta.value = data.meta
  } catch (_) {
    toast.error('Failed to load reviews.')
  } finally {
    loading.value = false
  }
}

async function moderate(review, action) {
  busyId.value = review.id
  try {
    const { data } = action === 'approve'
      ? await adminService.approveReview(review.id)
      : await adminService.hideReview(review.id)
    toast.success(data.message)
    Object.assign(review, { is_approved: action === 'approve' })
  } catch (_) {
    toast.error('Could not update the review.')
  } finally {
    busyId.value = null
  }
}

async function remove(review) {
  if (!confirm(`Delete this review from "${review.user_name}"?`)) return
  busyId.value = review.id
  try {
    await adminService.deleteReview(review.id)
    toast.success('Review deleted.')
    await load(meta.value.current_page)
  } catch (_) {
    toast.error('Could not delete the review.')
  } finally {
    busyId.value = null
  }
}

onMounted(() => load())
</script>

<template>
  <div>
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">Reviews</h1>
      <p class="mt-0.5 text-sm text-gray-500">{{ meta.total }} review(s) — approve, hide or delete customer reviews</p>
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <input v-model="filters.search" placeholder="Search comment, user or product…" @keyup.enter="load(1)"
        class="w-full max-w-xs rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none sm:w-64" />
      <select v-model="filters.status" @change="load(1)"
        class="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-primary-500 focus:outline-none">
        <option value="">All Statuses</option>
        <option value="approved">Approved</option>
        <option value="pending">Pending</option>
      </select>
      <select v-model="filters.rating" @change="load(1)"
        class="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-primary-500 focus:outline-none">
        <option value="">Any Rating</option>
        <option v-for="r in [5,4,3,2,1]" :key="r" :value="r">{{ r }} ★</option>
      </select>
      <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700" @click="load(1)">Search</button>
    </div>

    <div class="mt-5">
      <DataTable :columns="[
        { key: 'review', label: 'Review' },
        { key: 'product', label: 'Product' },
        { key: 'status', label: 'Status' },
        { key: 'date', label: 'Date' },
        { key: 'actions', label: '' }
      ]" :loading="loading">
        <tr v-for="r in reviews" :key="r.id" class="hover:bg-gray-50/50">
          <td class="max-w-md px-4 py-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold tracking-wide text-amber-500">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
              <span class="text-xs font-semibold text-gray-700">{{ r.user_name }}</span>
            </div>
            <p class="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">{{ r.comment }}</p>
          </td>
          <td class="px-4 py-3">
            <a v-if="r.product" :href="'/products/' + r.product.slug" target="_blank"
              class="text-sm font-medium text-primary-600 hover:underline">{{ r.product.name }}</a>
          </td>
          <td class="px-4 py-3"><StatusBadge :status="r.is_approved ? 'approved' : 'hidden'" /></td>
          <td class="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{{ formatDate(r.created_at) }}</td>
          <td class="whitespace-nowrap px-4 py-3 text-right">
            <button v-if="!r.is_approved"
              class="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
              :disabled="busyId === r.id" @click="moderate(r, 'approve')">
              Approve
            </button>
            <button v-else
              class="mr-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              :disabled="busyId === r.id" @click="moderate(r, 'hide')">
              Hide
            </button>
            <button
              class="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
              :disabled="busyId === r.id" @click="remove(r)">
              Delete
            </button>
          </td>
        </tr>
      </DataTable>

      <div class="mt-5 flex justify-center">
        <AppPagination :current-page="meta.current_page" :last-page="meta.last_page" :total="meta.total" @change="load($event)" />
      </div>
    </div>
  </div>
</template>
