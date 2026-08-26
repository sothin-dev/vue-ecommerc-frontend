<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '@/services/product.service'
import ProductCard from '@/components/product/ProductCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import ProductFilters from '@/components/product/ProductFilters.vue'

const route = useRoute()
const router = useRouter()

const products = ref([])
const categories = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)
const error = ref(null)
const filtersOpen = ref(false)

const filters = reactive({
  search: '',
  category: '',
  min_price: '',
  max_price: '',
  sort: 'newest'
})

const isSearchPage = computed(() => route.name === 'Search')

function syncFromUrl() {
  filters.search    = String(route.query.search ?? '')
  filters.category  = String(route.query.category ?? '')
  filters.min_price = String(route.query.min_price ?? '')
  filters.max_price = String(route.query.max_price ?? '')
  filters.sort      = String(route.query.sort ?? 'newest')
}

function syncToUrl(page) {
  const query = {}
  for (const key of ['search', 'category', 'min_price', 'max_price', 'sort']) {
    if (String(filters[key] ?? '') !== '') query[key] = filters[key]
  }
  if (query.sort === 'newest') delete query.sort
  if (page > 1) query.page = page
  router.replace({ query })
}

async function fetchProducts() {
  loading.value = true
  error.value = null
  try {
    const params = { page: Number(route.query.page) || 1, per_page: 12 }
    if (filters.search) params.search = filters.search
    if (filters.category) params.category = filters.category
    if (filters.min_price) params.min_price = filters.min_price
    if (filters.max_price) params.max_price = filters.max_price
    params.sort = filters.sort

    const { data } = await productService.list(params)
    products.value = data.data
    meta.value = data.meta
  } catch (e) {
    error.value = 'Failed to load products.'
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  syncToUrl(1)
}

function resetFilters() {
  Object.assign(filters, { search: '', category: '', min_price: '', max_price: '', sort: 'newest' })
  applyFilters()
}

const hasActiveFilters = computed(() =>
  !!(filters.search || filters.category || filters.min_price || filters.max_price || (filters.sort !== 'newest'))
)

watch(() => route.query, () => {
  syncFromUrl()
  fetchProducts()
})

onMounted(async () => {
  syncFromUrl()
  fetchProducts()
  try {
    const { data } = await productService.categories()
    categories.value = data.data.filter(c => c.is_active && c.parent_id === null)
  } catch (_) {}
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">
          {{ isSearchPage ? `Search results for "${filters.search}"` : 'All Products' }}
        </h1>
        <p class="mt-0.5 text-sm text-gray-500">{{ meta.total }} product{{ meta.total === 1 ? '' : 's' }} found</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Mobile filter toggle -->
        <button
          class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
          @click="filtersOpen = !filtersOpen"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
        <select v-model="filters.sort" @change="applyFilters"
          class="rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm font-medium text-gray-700 focus:border-primary-500 focus:outline-none">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="name">Name A–Z</option>
          <option value="on_sale">On Sale</option>
        </select>
      </div>
    </div>

    <div class="mt-6 flex gap-8">
      <!-- Sidebar filters -->
      <aside class="hidden w-64 shrink-0 lg:block">
        <ProductFilters />
      </aside>

      <Transition name="slide-up">
        <div v-if="filtersOpen" class="fixed inset-x-4 top-24 z-30 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl lg:hidden">
          <ProductFilters @applied="filtersOpen = false" />
        </div>
      </Transition>

      <!-- Grid -->
      <div class="min-w-0 flex-1">
        <LoadingSpinner v-if="loading" size="lg" />
        <EmptyState v-else-if="error" :title="error" description="Try adjusting your search or filters." />
        <template v-else-if="products.length">
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            <ProductCard v-for="p in products" :key="p.id" :product="p" />
          </div>
          <div class="mt-10">
            <AppPagination
              :current-page="meta.current_page"
              :last-page="meta.last_page"
              :total="meta.total"
              @change="page => { router.replace({ query: { ...route.query, page } }); }"
            />
          </div>
        </template>
        <EmptyState v-else title="No products found" description="Try adjusting your search or filters." />
      </div>
    </div>
  </div>
</template>

