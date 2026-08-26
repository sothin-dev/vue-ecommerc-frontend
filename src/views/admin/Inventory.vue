<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import AppPagination from '@/components/common/AppPagination.vue'
import DataTable from '@/components/admin/DataTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import StatCard from '@/components/admin/StatCard.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'

const toast = useToastStore()

const products = ref([])
const stats = ref(null)
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)
const filters = reactive({ search: '', filter: '' })

// Stock adjust modal
const adjustTarget = ref(null) // { product, variant|null }
const newStock = ref(0)
const saving = ref(false)

async function load(page = 1) {
  loading.value = true
  try {
    const { data } = await adminService.inventory({ ...filters, page })
    products.value = data.data
    meta.value = data.meta
    stats.value = data.stats
  } catch (_) {
    toast.error('Failed to load inventory.')
  } finally {
    loading.value = false
  }
}

function openAdjust(product, variant = null) {
  adjustTarget.value = { product, variant }
  newStock.value = variant ? variant.stock : product.stock
}

async function saveStock() {
  saving.value = true
  try {
    const { data } = await adminService.adjustStock(adjustTarget.value.product.id, {
      stock: newStock.value,
      ...(adjustTarget.value.variant ? { variant_id: adjustTarget.value.variant.id } : {})
    })
    toast.success(data.message)
    adjustTarget.value = null
    await load(meta.value.current_page)
  } catch (_) {
    toast.error('Could not update the stock.')
  } finally {
    saving.value = false
  }
}

onMounted(() => load())
</script>

<template>
  <div>
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">Inventory</h1>
      <p class="mt-0.5 text-sm text-gray-500">Monitor and adjust stock levels</p>
    </div>

    <!-- Stats -->
    <div v-if="stats" class="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard title="Products" :value="stats.total_products" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      <StatCard title="Low Stock (≤5)" :value="stats.low_stock" tone="amber" icon="M12 9v2m0 4h.01M12 3l9.66 16.5H2.34L12 3z" />
      <StatCard title="Out of Stock" :value="stats.out_of_stock" tone="violet" icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      <StatCard title="Variant OOS" :value="stats.variant_out_of_stock" sub="of" :sub="`${stats.total_variants} variants`" tone="sky"
        icon="M4 6h16M4 12h16M4 18h7" />
    </div>

    <!-- Filters -->
    <div class="mt-6 flex flex-wrap items-center gap-3">
      <input v-model="filters.search" placeholder="Search by name or SKU…" @keyup.enter="load(1)"
        class="w-full max-w-xs rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none sm:w-64" />
      <select v-model="filters.filter" @change="load(1)"
        class="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-primary-500 focus:outline-none">
        <option value="">All Products</option>
        <option value="low_stock">Low Stock</option>
        <option value="out_of_stock">Out of Stock</option>
      </select>
      <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700" @click="load(1)">Search</button>
    </div>

    <div class="mt-5">
      <DataTable :columns="[
        { key: 'product', label: 'Product' },
        { key: 'sku', label: 'SKU' },
        { key: 'stock', label: 'Stock' },
        { key: 'sold', label: 'Total Sold' },
        { key: 'variants', label: 'Variants' },
        { key: 'actions', label: '' }
      ]" :loading="loading">
        <template v-for="p in products" :key="p.id">
          <tr class="hover:bg-gray-50/50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img v-if="p.image_url" :src="p.image_url" class="h-10 w-10 rounded-lg object-cover" alt="" />
                <div v-else class="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <ImagePlaceholder type="product" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ p.name }}</p>
                  <p class="text-xs text-gray-400">{{ p.category?.name }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-xs text-gray-500">{{ p.sku }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex min-w-[40px] justify-center rounded-full px-2 py-0.5 text-xs font-bold"
                :class="p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
                {{ p.stock }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ p.total_sold }}</td>
            <td class="px-4 py-3">
              <div v-if="p.variants.length" class="flex flex-wrap gap-1.5">
                <button v-for="v in p.variants" :key="v.id"
                  class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition hover:border-primary-400 hover:text-primary-700"
                  :class="v.stock === 0 ? 'border-red-200 text-red-500' : 'border-gray-200 text-gray-600'"
                  @click="openAdjust(p, v)"
                  :title="`Adjust ${v.value} stock`">
                  {{ v.value }}: {{ v.stock }}
                </button>
              </div>
              <span v-else class="text-xs italic text-gray-400">none</span>
            </td>
            <td class="px-4 py-3 text-right">
              <button class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50" @click="openAdjust(p)">
                Adjust
              </button>
            </td>
          </tr>
        </template>
      </DataTable>

      <div class="mt-5 flex justify-center">
        <AppPagination :current-page="meta.current_page" :last-page="meta.last_page" :total="meta.total" @change="load($event)" />
      </div>
    </div>

    <BaseModal :open="!!adjustTarget" size="sm" title="Adjust Stock" @close="adjustTarget = null">
      <div v-if="adjustTarget">
        <p class="text-sm text-gray-600">
          {{ adjustTarget.product.name }}
          <template v-if="adjustTarget.variant">
            — <strong>{{ adjustTarget.variant.type }}: {{ adjustTarget.variant.value }}</strong>
          </template>
        </p>
        <label class="mb-1 mt-4 block text-xs font-semibold uppercase tracking-wide text-gray-500">New stock level *</label>
        <input v-model.number="newStock" type="number" min="0"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
      </div>
      <template #footer>
        <button class="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700" :disabled="saving" @click="adjustTarget = null">Cancel</button>
        <button class="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          :disabled="saving || newStock < 0" @click="saveStock">
          {{ saving ? 'Saving…' : 'Update Stock' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
