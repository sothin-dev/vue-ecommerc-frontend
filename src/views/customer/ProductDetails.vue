<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '@/services/product.service'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatDate } from '@/composables/useFormat'
import RatingStars from '@/components/product/RatingStars.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ProductCard from '@/components/product/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const wishlist = useWishlistStore()
const toast = useToastStore()
const auth = useAuthStore()

const product = ref(null)
const related = ref([])
const loading = ref(true)
const error = ref(null)

const selectedImage = ref(0)
const selectedVariantId = ref(null)
const quantity = ref(1)
const adding = ref(false)
const activeTab = ref('description')
const submittingReview = ref(false)

// Review form
const reviewForm = ref({ rating: 5, comment: '' })
const editingReview = ref(false)

const galleryImages = computed(() => {
  if (!product.value) return []
  const images = product.value.images?.map(i => i.url) ?? []
  return product.value.image_url ? [product.value.image_url, ...images] : images
})

const selectedVariant = computed(() =>
  product.value?.variants.find(v => v.id === Number(selectedVariantId.value)) || null
)

const effectiveStock = computed(() => selectedVariant.value ? selectedVariant.value.stock : (product.value?.stock ?? 0))

const effectivePrice = computed(() => {
  if (!product.value) return 0
  if (selectedVariant.value?.price) return selectedVariant.value.price
  return product.value.display_price
})

const variantTypes = computed(() => {
  const map = {}
  for (const v of product.value?.variants ?? []) {
    (map[v.type] ||= []).push(v)
  }
  return map
})

async function load() {
  loading.value = true
  error.value = null
  try {
    const { data } = await productService.show(route.params.slug)
    product.value = data.data

    // Preselect the first available variant, if any
    selectedVariantId.value = product.value.variants.find(v => v.stock > 0)?.id ?? product.value.variants[0]?.id ?? null

    reviewForm.value.comment = ''
    if (data.data.my_review) {
      reviewForm.value.rating = data.data.my_review.rating
      reviewForm.value.comment = data.data.my_review.comment
    }

    loadRelated()
  } catch (e) {
    error.value = e.response?.status === 404 ? 'Product not found.' : 'Failed to load this product.'
  } finally {
    loading.value = false
  }
}

async function loadRelated() {
  try {
    const { data } = await productService.list({
      category: product.value.category.slug,
      per_page: 4
    })
    related.value = data.data.filter(p => p.id !== product.value.id).slice(0, 4)
  } catch (_) {}
}

async function addToCart() {
  if (!auth.isLoggedIn) {
    toast.info('Please log in to add items to your cart.')
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  adding.value = true
  try {
    await cart.addToCart(product.value.id, quantity.value, selectedVariantId.value || null)
    toast.success(`Added ${quantity.value} × "${product.value.name}" to cart.`)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Could not add to cart.')
  } finally {
    adding.value = false
  }
}

async function toggleWishlist() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  try {
    await wishlist.toggle(product.value.id)
    toast.success(wishlist.isInWishlist(product.value.id) ? 'Added to wishlist.' : 'Removed from wishlist.')
  } catch (_) {
    toast.error('Could not update wishlist.')
  }
}

async function submitReview() {
  submittingReview.value = true
  try {
    const existing = product.value.my_review
    if (existing) {
      await productService.updateReview(product.value.id, existing.id, reviewForm.value)
      toast.success('Review updated. It will be visible after moderation.')
    } else {
      await productService.createReview(product.value.id, reviewForm.value)
      toast.success('Thank you! Your review will appear after moderation.')
    }
    editingReview.value = false
    await load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Could not submit your review.')
  } finally {
    submittingReview.value = false
  }
}

async function deleteMyReview() {
  try {
    await productService.deleteReview(product.value.id, product.value.my_review.id)
    toast.success('Review deleted.')
    await load()
  } catch (_) {
    toast.error('Could not delete your review.')
  }
}

watch(quantity, q => {
  if (effectiveStock.value > 0 && q > effectiveStock.value) quantity.value = effectiveStock.value
})

onMounted(load)
watch(() => route.params.slug, () => {
  if (route.name === 'ProductDetail') {
    selectedVariantId.value = null
    quantity.value = 1
    selectedImage.value = 0
    load()
  }
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Breadcrumb -->
    <nav class="mb-6 flex items-center gap-2 text-sm text-gray-500">
      <RouterLink to="/" class="hover:text-primary-600">Home</RouterLink>
      <span>/</span>
      <RouterLink to="/products" class="hover:text-primary-600">Products</RouterLink>
      <template v-if="product">
        <span>/</span>
        <RouterLink :to="{ name: 'CategoryProducts', params: { slug: product.category.slug } }" class="hover:text-primary-600">
          {{ product.category.name }}
        </RouterLink>
      </template>
    </nav>

    <LoadingSpinner v-if="loading" size="lg" />
    <div v-else-if="error" class="max-w-md"><EmptyState :title="error" /></div>

    <template v-else-if="product">
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <!-- Gallery -->
        <div>
          <div class="aspect-square overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-gray-100">
            <ImagePlaceholder v-if="!galleryImages[selectedImage]" type="product" label="No photo yet" />
            <img
              v-else
              :src="galleryImages[selectedImage]"
              :alt="product.name"
              class="h-full w-full object-cover"
            />
          </div>
          <div v-if="galleryImages.length > 1" class="mt-3 flex gap-3 overflow-x-auto pb-1">
            <button
              v-for="(img, i) in galleryImages"
              :key="i"
              class="h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition"
              :class="i === selectedImage ? 'border-primary-600' : 'border-transparent opacity-70 hover:opacity-100'"
              @click="selectedImage = i"
            >
              <img :src="img" class="h-full w-full object-cover" alt="" />
            </button>
          </div>
        </div>

        <!-- Info -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-primary-600">{{ product.category.name }}</p>
          <h1 class="mt-1 text-3xl font-bold tracking-tight text-gray-900">{{ product.name }}</h1>

          <div class="mt-3 flex flex-wrap items-center gap-4">
            <RatingStars :rating="product.avg_rating || 0" :count="product.review_count" size="md" />
            <span v-if="product.sku" class="text-xs text-gray-400">SKU: {{ product.sku }}</span>
          </div>

          <!-- Price -->
          <div class="mt-5 flex items-baseline gap-3">
            <span class="text-4xl font-extrabold text-gray-900">{{ formatCurrency(effectivePrice) }}</span>
            <span v-if="product.on_sale" class="text-xl font-medium text-gray-400 line-through">{{ formatCurrency(product.price) }}</span>
            <span v-if="product.on_sale" class="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">SALE</span>
          </div>

          <!-- Stock status -->
          <p class="mt-3 flex items-center gap-2 text-sm font-medium" :class="effectiveStock > 0 ? 'text-emerald-600' : 'text-red-600'">
            <span class="h-2 w-2 rounded-full" :class="effectiveStock > 0 ? 'bg-emerald-500' : 'bg-red-500'" />
            {{ effectiveStock > 0 ? `In stock (${effectiveStock} available)` : 'Out of stock' }}
          </p>

          <!-- Variants -->
          <div v-for="(options, type) in variantTypes" :key="type" class="mt-5">
            <p class="mb-2 text-sm font-semibold text-gray-800">{{ type }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="v in options"
                :key="v.id"
                class="rounded-lg border px-4 py-2 text-sm font-medium transition"
                :class="selectedVariantId === v.id
                  ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'"
                @click="selectedVariantId = v.id; quantity = 1"
              >
                {{ v.value }}
                <span v-if="v.stock === 0" class="ml-1 text-xs text-red-400">(out)</span>
              </button>
            </div>
          </div>

          <!-- Quantity + actions -->
          <div class="mt-7 flex flex-wrap items-center gap-4">
            <div class="flex items-center rounded-lg border border-gray-300">
              <button class="px-4 py-2.5 text-gray-600 hover:text-gray-900 disabled:opacity-30" :disabled="quantity <= 1" @click="quantity--">−</button>
              <input v-model.number="quantity" type="number" min="1" :max="effectiveStock"
                class="w-14 border-x border-gray-300 py-2.5 text-center text-sm font-semibold focus:outline-none" />
              <button class="px-4 py-2.5 text-gray-600 hover:text-gray-900 disabled:opacity-30" :disabled="quantity >= effectiveStock" @click="quantity++">+</button>
            </div>

            <button
              class="flex-1 rounded-xl bg-primary-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
              :disabled="effectiveStock < 1 || adding"
              @click="addToCart"
            >
              {{ adding ? 'Adding…' : 'Add to Cart' }}
            </button>

            <button
              v-if="auth.isLoggedIn"
              class="flex h-[50px] w-[50px] items-center justify-center rounded-xl border transition"
              :class="wishlist.isInWishlist(product.id)
                ? 'border-red-200 bg-red-50 text-red-500'
                : 'border-gray-300 bg-white text-gray-400 hover:text-red-500'"
              aria-label="Toggle wishlist"
              @click="toggleWishlist"
            >
              <svg class="h-6 w-6" :fill="wishlist.isInWishlist(product.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="mt-9 border-b border-gray-200">
            <div class="flex gap-6">
              <button
                class="-mb-px border-b-2 pb-3 text-sm font-semibold transition"
                :class="activeTab === 'description' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-800'"
                @click="activeTab = 'description'"
              >
                Description
              </button>
              <button
                class="-mb-px border-b-2 pb-3 text-sm font-semibold transition"
                :class="activeTab === 'reviews' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-800'"
                @click="activeTab = 'reviews'"
              >
                Reviews ({{ product.review_count }})
              </button>
            </div>
          </div>

          <!-- Description tab -->
          <div v-if="activeTab === 'description'" class="prose prose-sm mt-5 max-w-none leading-relaxed text-gray-600 whitespace-pre-line">
            {{ product.description }}
          </div>

          <!-- Reviews tab -->
          <div v-else class="mt-5 space-y-5">
            <!-- My review form -->
            <div v-if="auth.isLoggedIn" class="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <template v-if="!product.my_review || editingReview">
                <h3 class="text-sm font-bold text-gray-900">{{ product.my_review ? 'Edit your review' : 'Write a review' }}</h3>
                <div class="mt-2 flex gap-1">
                  <button v-for="star in 5" :key="star" @click="reviewForm.rating = star" class="transition hover:scale-110">
                    <svg class="h-6 w-6" :class="star <= reviewForm.rating ? 'text-amber-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.358 2.44a1 1 0 00-.364 1.118l1.287 3.95c.3.922-.755 1.688-1.539 1.118l-3.357-2.44a1 1 0 00-1.176 0l-3.357 2.44c-.783.57-1.838-.196-1.538-1.118l1.286-3.95a1 1 0 00-.364-1.118L2.075 9.377c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.95z"/>
                    </svg>
                  </button>
                </div>
                <textarea
                  v-model="reviewForm.comment"
                  rows="3"
                  placeholder="Share your experience with this product…"
                  class="mt-3 w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                <div class="mt-3 flex gap-2">
                  <button
                    class="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                    :disabled="submittingReview || !reviewForm.comment.trim()"
                    @click="submitReview"
                  >
                    Submit Review
                  </button>
                  <button v-if="editingReview" class="rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-gray-700" @click="editingReview = false">Cancel</button>
                </div>
              </template>
              <template v-else>
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h3 class="text-sm font-bold text-gray-900">Your review</h3>
                    <RatingStars class="mt-1" :rating="product.my_review.rating" />
                    <p class="mt-1.5 text-sm text-gray-600">{{ product.my_review.comment }}</p>
                    <p v-if="!product.my_review.is_approved" class="mt-1 text-xs italic text-amber-600">Pending approval</p>
                  </div>
                  <div class="flex shrink-0 gap-2">
                    <button class="text-xs font-medium text-primary-600 hover:underline" @click="editingReview = true">Edit</button>
                    <button class="text-xs font-medium text-red-500 hover:underline" @click="deleteMyReview">Delete</button>
                  </div>
                </div>
              </template>
            </div>
            <p v-else class="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-500">
              <RouterLink :to="{ name: 'Login', query: { redirect: route.fullPath } }" class="font-semibold text-primary-600 hover:underline">Log in</RouterLink>
              to write a review.
            </p>

            <!-- Reviews list -->
            <div v-if="product.reviews.length" class="divide-y divide-gray-100">
              <div v-for="r in product.reviews" :key="r.id" class="py-4">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-semibold text-gray-900">{{ r.user_name }}</p>
                  <p class="text-xs text-gray-400">{{ formatDate(r.created_at) }}</p>
                </div>
                <RatingStars class="mt-1" :rating="r.rating" />
                <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ r.comment }}</p>
              </div>
            </div>
            <p v-else class="py-4 text-sm italic text-gray-400">No reviews yet — be the first!</p>
          </div>
        </div>
      </div>

      <!-- Related products -->
      <section v-if="related.length" class="mt-16 border-t border-gray-100 pt-12">
        <h2 class="text-xl font-bold tracking-tight text-gray-900">You may also like</h2>
        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <ProductCard v-for="p in related" :key="p.id" :product="p" />
        </div>
      </section>
    </template>
  </div>
</template>
