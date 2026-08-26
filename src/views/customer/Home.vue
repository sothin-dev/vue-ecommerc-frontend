<script setup>
import { ref, onMounted } from 'vue'
import { productService } from '@/services/product.service'
import ProductCard from '@/components/product/ProductCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import HeroCarousel from '@/components/common/HeroCarousel.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'
import { formatCurrency } from '@/composables/useFormat'

const categories = ref([])
const newArrivals = ref([])
const onSale = ref([])
const slides = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const [catRes, newRes, saleRes] = await Promise.all([
      productService.categories(),
      productService.list({ per_page: 8, sort: 'newest' }),
      productService.list({ per_page: 4, sort: 'on_sale' })
    ])
    categories.value = catRes.data.data.filter(c => c.is_active && !c.parent_id).slice(0, 6)
    newArrivals.value = newRes.data.data
    onSale.value = saleRes.data.data

    // Hero slideshow: featured products that have images (mix of deals + newest)
    const withImages = [...saleRes.data.data, ...newRes.data.data]
      .filter(p => p.image_url && p.in_stock)
    const seen = new Set()
    slides.value = withImages
      .filter(p => !seen.has(p.id) && seen.add(p.id))
      .slice(0, 5)
      .map(p => ({
        image_url: p.image_url,
        title: p.name,
        subtitle: p.category?.name ? `Explore our ${p.category.name} collection — quality you can trust.` : null,
        price: p.price,
        sale_price: p.sale_price,
        link: { name: 'ProductDetail', params: { slug: p.slug } }
      }))
  } catch (e) {
    error.value = 'Failed to load the store. Please try again later.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Hero slideshow (real product images) -->
    <HeroCarousel :slides="slides" />

    <!-- Features strip -->
    <section class="border-b border-gray-100 bg-white">
      <div class="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div v-for="f in [
          { icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', title: 'Free Shipping', sub: 'On orders over $50' },
          { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0A8.003 8.003 0 0115.419 20', title: '30-Day Returns', sub: 'No questions asked' },
          { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Secure Payment', sub: 'Encrypted checkout' },
          { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', title: '24/7 Support', sub: 'We are here to help' }
        ]" :key="f.title" class="flex items-center gap-3.5">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" :d="f.icon" />
            </svg>
          </span>
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ f.title }}</p>
            <p class="text-xs text-gray-500">{{ f.sub }}</p>
          </div>
        </div>
      </div>
    </section>

    <LoadingSpinner v-if="loading" size="lg" />
    <div v-else-if="error" class="mx-auto max-w-md px-4 pt-10"><EmptyState :title="error" /></div>

    <template v-else>
      <!-- Categories -->
      <section v-if="categories.length" class="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between">
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-gray-900">Shop by Category</h2>
            <p class="mt-1 text-sm text-gray-500">Find exactly what you're looking for</p>
          </div>
          <RouterLink to="/categories" class="text-sm font-semibold text-primary-600 hover:text-primary-700">View all →</RouterLink>
        </div>
        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <RouterLink
            v-for="c in categories"
            :key="c.id"
            :to="{ name: 'CategoryProducts', params: { slug: c.slug } }"
            class="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover"
          >
            <div v-if="!c.image_url" class="h-14 w-14 overflow-hidden rounded-xl">
              <ImagePlaceholder type="category" />
            </div>
            <img v-else :src="c.image_url" :alt="c.name" class="h-14 w-14 rounded-xl object-cover" />
            <p class="mt-3 text-center text-sm font-semibold text-gray-800 group-hover:text-primary-700">{{ c.name }}</p>
            <p class="text-xs text-gray-400">{{ c.products_count }} items</p>
          </RouterLink>
        </div>
      </section>

      <!-- On sale -->
      <section v-if="onSale.length" class="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div class="rounded-3xl bg-gradient-to-l from-red-50 to-orange-50 p-6 sm:p-8">
          <div class="mb-6 flex items-end justify-between">
            <div>
              <span class="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-600">Hot Deals</span>
              <h2 class="mt-2 text-2xl font-bold tracking-tight text-gray-900">Deals of the Week</h2>
            </div>
            <RouterLink to="/products?sort=on_sale" class="text-sm font-semibold text-red-600 hover:text-red-700">See all deals →</RouterLink>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ProductCard v-for="p in onSale" :key="p.id" :product="p" />
          </div>
        </div>
      </section>

      <!-- New arrivals -->
      <section class="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between">
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-gray-900">New Arrivals</h2>
            <p class="mt-1 text-sm text-gray-500">Fresh picks added this week</p>
          </div>
          <RouterLink to="/products?sort=newest" class="text-sm font-semibold text-primary-600 hover:text-primary-700">Shop all →</RouterLink>
        </div>
        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <ProductCard v-for="p in newArrivals" :key="p.id" :product="p" />
        </div>
      </section>
    </template>
  </div>
</template>
