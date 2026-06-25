<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <h1>{{ pageTitle }}</h1>
        <div class="breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span class="breadcrumb__sep">/</span>
          <span>{{ pageTitle }}</span>
        </div>
      </div>
    </div>

    <div class="container product-layout">
      <!-- Mobile filter overlay -->
      <div v-if="sidebarOpen" class="filter-overlay" @click="sidebarOpen=false"></div>

      <!-- Sidebar Filters -->
      <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
        <div class="sidebar__header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filters
          </h3>
          <button @click="sidebarOpen=false" class="sidebar__close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Categories -->
        <div class="filter-group">
          <h4 class="filter-title">Category</h4>
          <label class="filter-item" :class="{ active: !filters.category }">
            <input type="radio" v-model="filters.category" value="" @change="applyFilters" />
            <span class="filter-radio"></span>
            All Categories
          </label>
          <label v-for="cat in categories" :key="cat.id" class="filter-item" :class="{ active: filters.category === cat.slug }">
            <input type="radio" v-model="filters.category" :value="cat.slug" @change="applyFilters" />
            <span class="filter-radio"></span>
            {{ cat.name }}
            <span class="filter-count">{{ cat.products_count }}</span>
          </label>
        </div>

        <!-- Price Range -->
        <div class="filter-group">
          <h4 class="filter-title">Price Range</h4>
          <div class="price-inputs">
            <input v-model="filters.min_price" type="number" placeholder="Min" class="form-control" />
            <span class="price-dash">—</span>
            <input v-model="filters.max_price" type="number" placeholder="Max" class="form-control" />
          </div>
          <button class="btn btn-primary btn-sm" style="width:100%;margin-top:.75rem" @click="applyFilters">Apply Price</button>
        </div>

        <!-- Clear -->
        <button class="btn btn-sm clear-btn" style="width:100%" @click="clearFilters">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Clear All Filters
        </button>
      </aside>

      <!-- Main content -->
      <div class="product-main">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar__left">
            <button class="btn btn-outline btn-sm filter-toggle-btn" @click="sidebarOpen=true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters
            </button>
            <p class="toolbar__count">
              <strong>{{ meta.total }}</strong> products found
            </p>
          </div>
          <div class="toolbar__right">
            <label class="toolbar__sort-label">Sort by:</label>
            <select v-model="filters.sort" @change="applyFilters" class="form-control toolbar__sort-select">
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="name">Name A–Z</option>
              <option value="on_sale">On Sale</option>
            </select>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

        <!-- Empty -->
        <div v-else-if="!products.length" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h2>No products found</h2>
          <p>Try adjusting your filters or search terms.</p>
          <button class="btn btn-primary" style="margin-top:1.25rem" @click="clearFilters">Clear Filters</button>
        </div>

        <!-- Grid -->
        <div v-else class="product-grid">
          <ProductCard v-for="p in products" :key="p.id" :product="p" />
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="meta.last_page > 1">
          <button :disabled="meta.current_page === 1" @click="changePage(meta.current_page - 1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            v-for="p in pagesRange" :key="p"
            :class="{ active: p === meta.current_page }"
            @click="changePage(p)"
          >{{ p }}</button>
          <button :disabled="meta.current_page === meta.last_page" @click="changePage(meta.current_page + 1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/common/ProductCard.vue'
import api from '@/services/api'

const route   = useRoute()
const router  = useRouter()
const loading = ref(true)
const sidebarOpen = ref(false)

const products   = ref([])
const categories = ref([])
const meta       = ref({ current_page: 1, last_page: 1, total: 0, per_page: 16 })

const filters = reactive({
  category:  '',
  search:    '',
  min_price: '',
  max_price: '',
  sort:      'newest',
  page:      1,
})

const pageTitle = computed(() => {
  if (filters.search)   return `Search: "${filters.search}"`
  if (filters.category) return categories.value.find(c => c.slug === filters.category)?.name || 'Products'
  return 'All Products'
})

const pagesRange = computed(() => {
  const { current_page: cur, last_page: last } = meta.value
  const range = []
  for (let p = Math.max(1, cur - 2); p <= Math.min(last, cur + 2); p++) range.push(p)
  return range
})

async function fetchProducts() {
  loading.value = true
  const params = {}
  if (filters.category)  params.category  = filters.category
  if (filters.search)    params.search    = filters.search
  if (filters.min_price) params.min_price = filters.min_price
  if (filters.max_price) params.max_price = filters.max_price
  if (filters.sort)      params.sort      = filters.sort
  params.page     = filters.page
  params.per_page = 16

  try {
    const { data } = await api.get('/products', { params })
    products.value = data.data
    meta.value     = data.meta
  } catch (e) {
    console.error('Failed to fetch products', e)
  } finally {
    loading.value = false
  }
}

async function applyFilters() {
  filters.page = 1
  syncToUrl()
  await fetchProducts()
}

function clearFilters() {
  Object.assign(filters, { category: '', search: '', min_price: '', max_price: '', sort: 'newest', page: 1 })
  syncToUrl()
  fetchProducts()
  sidebarOpen.value = false
}

function changePage(p) {
  filters.page = p
  syncToUrl()
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function syncToUrl() {
  const q = {}
  if (filters.category)        q.category  = filters.category
  if (filters.search)          q.search    = filters.search
  if (filters.sort !== 'newest') q.sort    = filters.sort
  if (filters.page > 1)        q.page      = filters.page
  router.replace({ query: q })
}

watch(() => route.query, (q) => {
  filters.category  = q.category  || ''
  filters.search    = q.search    || ''
  filters.min_price = q.min_price || ''
  filters.max_price = q.max_price || ''
  filters.sort      = q.sort      || 'newest'
  filters.page      = Number(q.page) || 1
  fetchProducts()
}, { immediate: false })

onMounted(async () => {
  const q = route.query
  filters.category  = q.category  || ''
  filters.search    = q.search    || ''
  filters.sort      = q.sort      || 'newest'
  filters.page      = Number(q.page) || 1

  const [, cats] = await Promise.all([
    fetchProducts(),
    api.get('/categories'),
  ])
  categories.value = cats.data.data
})
</script>

<style scoped>
.product-layout {
  display: flex; gap: 1.5rem; align-items: flex-start;
  padding-bottom: 3rem; position: relative;
}

/* Overlay for mobile */
.filter-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,.4); z-index: 290;
  animation: fadeIn .2s;
}

/* Sidebar */
.sidebar {
  width: 240px; flex-shrink: 0;
  background: #fff; border-radius: var(--radius-lg);
  border: 1px solid var(--gray-100);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem; position: sticky; top: 88px;
  max-height: calc(100vh - 100px); overflow-y: auto;
}
.sidebar__header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.25rem;
}
.sidebar__header h3 {
  font-size: 1rem; font-weight: 700; display: flex;
  align-items: center; gap: .5rem; color: var(--gray-800);
}
.sidebar__close {
  display: none; background: none; border: none;
  color: var(--gray-400); padding: .25rem;
  border-radius: .5rem; transition: all .2s;
}
.sidebar__close:hover { background: var(--gray-100); color: var(--gray-700); }

.filter-group { margin-bottom: 1.5rem; }
.filter-title {
  font-size: .7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .08em; color: var(--gray-400);
  margin-bottom: .65rem;
}
.filter-item {
  display: flex; align-items: center; gap: .55rem;
  font-size: .85rem; margin-bottom: .2rem; cursor: pointer;
  padding: .4rem .6rem; border-radius: .5rem;
  color: var(--gray-600); transition: all .15s;
}
.filter-item:hover { background: var(--gray-50); color: var(--gray-800); }
.filter-item.active { background: var(--primary-50); color: var(--primary); font-weight: 600; }
.filter-item input { display: none; }
.filter-radio {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid var(--gray-300); flex-shrink: 0;
  transition: all .2s; position: relative;
}
.filter-item.active .filter-radio {
  border-color: var(--primary);
}
.filter-item.active .filter-radio::after {
  content: ''; position: absolute; inset: 3px;
  border-radius: 50%; background: var(--primary);
}
.filter-count {
  margin-left: auto; font-size: .75rem;
  color: var(--gray-400); font-weight: 500;
}

.price-inputs { display: flex; gap: .5rem; align-items: center; }
.price-inputs .form-control { flex: 1; padding: .5rem .6rem; font-size: .85rem; }
.price-dash { color: var(--gray-300); }

.clear-btn {
  background: var(--gray-100); color: var(--gray-600);
  border: none; font-weight: 600;
}
.clear-btn:hover { background: var(--gray-200); }

/* Main */
.product-main { flex: 1; min-width: 0; }

.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.5rem; flex-wrap: wrap; gap: .75rem;
}
.toolbar__left { display: flex; align-items: center; gap: 1rem; }
.toolbar__count { font-size: .875rem; color: var(--gray-500); }
.toolbar__count strong { color: var(--gray-800); }
.toolbar__right { display: flex; align-items: center; gap: .5rem; }
.toolbar__sort-label { font-size: .8rem; color: var(--gray-500); font-weight: 500; }
.toolbar__sort-select {
  width: auto; padding: .45rem 2.25rem .45rem .85rem;
  font-size: .8125rem; border-radius: var(--radius);
}
.filter-toggle-btn { display: none; }

/* Empty */
.empty-icon {
  width: 80px; height: 80px; border-radius: 50%;
  background: var(--gray-100); display: grid; place-items: center;
  margin: 0 auto 1rem; color: var(--gray-300);
}

@media (max-width: 768px) {
  .filter-overlay { display: block; }
  .sidebar {
    position: fixed; top: 0; left: -300px; width: 280px;
    height: 100vh; z-index: 300; border-radius: 0;
    transition: left .3s cubic-bezier(.4,0,.2,1);
    max-height: 100vh; padding-top: 1.5rem;
  }
  .sidebar--open { left: 0; }
  .sidebar__close { display: flex; }
  .filter-toggle-btn { display: inline-flex !important; }
  .toolbar__sort-label { display: none; }
}
</style>
