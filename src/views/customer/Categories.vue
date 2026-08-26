<script setup>
import { ref, onMounted } from 'vue'
import { productService } from '@/services/product.service'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'

const categories = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await productService.categories()
    const all = data.data.filter(c => c.is_active)
    categories.value = all.filter(c => c.parent_id === null).map(parent => ({
      ...parent,
      children: all.filter(c => c.parent_id === parent.id)
    }))
  } catch (_) {} finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold tracking-tight text-gray-900">All Categories</h1>
    <p class="mt-1 text-sm text-gray-500">Browse our full catalog by category</p>

    <LoadingSpinner v-if="loading" size="lg" />

    <div v-else class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="cat in categories" :key="cat.id" class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <div class="flex items-center gap-4">
          <img v-if="cat.image_url" :src="cat.image_url" :alt="cat.name" class="h-14 w-14 rounded-xl object-cover" />
          <div v-else class="h-14 w-14 overflow-hidden rounded-xl">
            <ImagePlaceholder type="category" />
          </div>
          <div>
            <RouterLink :to="{ name: 'CategoryProducts', params: { slug: cat.slug } }"
              class="text-base font-bold text-gray-900 hover:text-primary-600">{{ cat.name }}</RouterLink>
            <p class="text-xs text-gray-400">{{ cat.products_count }} product(s)</p>
          </div>
        </div>

        <div v-if="cat.children.length" class="mt-4 flex flex-wrap gap-2 border-t border-gray-50 pt-4">
          <RouterLink v-for="child in cat.children" :key="child.id"
            :to="{ name: 'CategoryProducts', params: { slug: child.slug } }"
            class="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-700">
            {{ child.name }}
          </RouterLink>
        </div>

        <RouterLink :to="{ name: 'CategoryProducts', params: { slug: cat.slug } }"
          class="mt-4 inline-block text-sm font-semibold text-primary-600 hover:text-primary-700">
          Shop {{ cat.name }} →
        </RouterLink>
      </div>
    </div>
  </div>
</template>
