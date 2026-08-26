<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '@/services/product.service'

const route = useRoute()
const router = useRouter()

const props = defineProps({
  categories: { type: Array, default: null }
})

const emit = defineEmits(['applied'])

const local = reactive({
  search: '',
  category: '',
  min_price: '',
  max_price: ''
})

const categories = ref([])

watch(() => route.query, () => {
  local.search    = String(route.query.search ?? '')
  local.category  = String(route.query.category ?? '')
  local.min_price = String(route.query.min_price ?? '')
  local.max_price = String(route.query.max_price ?? '')
}, { immediate: true })

function apply() {
  const query = {}
  if (local.search) query.search = local.search
  if (local.category) query.category = local.category
  if (local.min_price) query.min_price = local.min_price
  if (local.max_price) query.max_price = local.max_price
  const sort = route.query.sort
  if (sort) query.sort = sort
  router.replace({ query })
  emit('applied')
}

function clear() {
  router.replace({ query: {} })
  Object.assign(local, { search: '', category: '', min_price: '', max_price: '' })
  emit('applied')
}

onMounted(async () => {
  if (!props.categories) {
    try {
      const { data } = await productService.categories()
      categories.value = data.data.filter(c => c.is_active && c.parent_id === null)
    } catch (_) {}
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Search</h3>
      <form @submit.prevent="apply">
        <input
          v-model="local.search"
          type="search"
          placeholder="Keyword…"
          class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </form>
    </div>

    <div>
      <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Category</h3>
      <select v-model="local.category" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-8 text-sm focus:border-primary-500 focus:outline-none" @change="apply">
        <option value="">All Categories</option>
        <option v-for="c in (categories || [])" :key="c.id" :value="c.slug">{{ c.name }}</option>
      </select>
    </div>

    <div>
      <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Price Range ($)</h3>
      <div class="flex items-center gap-2">
        <input v-model="local.min_price" type="number" min="0" placeholder="Min" @keyup.enter="apply"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        <span class="text-gray-400">–</span>
        <input v-model="local.max_price" type="number" min="0" placeholder="Max" @keyup.enter="apply"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
      </div>
    </div>

    <div class="flex gap-2">
      <button
        class="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        @click="apply"
      >
        Apply Filters
      </button>
      <button
        class="rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-600 hover:bg-gray-50"
        @click="clear"
      >
        Reset
      </button>
    </div>
  </div>
</template>
