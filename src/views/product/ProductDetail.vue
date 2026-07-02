<template>
  <div>
    <div v-if="loading" class="loading-center" style="min-height:60vh"><div class="spinner"></div></div>

    <template v-else-if="product">
      <!-- Breadcrumb -->
      <div class="page-header">
        <div class="container">
          <div class="breadcrumb">
            <RouterLink to="/">Home</RouterLink>
            <span class="breadcrumb__sep">/</span>
            <RouterLink :to="`/products?category=${product.category.slug}`">{{ product.category.name }}</RouterLink>
            <span class="breadcrumb__sep">/</span>
            <span>{{ product.name }}</span>
          </div>
        </div>
      </div>

      <!-- Product Main -->
      <div class="container" style="padding-bottom:3rem">
        <div class="product-detail">
          <!-- Images -->
          <div class="product-detail__gallery animate-fade-in">
            <div class="main-image-wrap">
              <ProductImage :src="activeImage" :alt="product.name" imgClass="product-detail__main-img" size="xl" />
              <span v-if="product.on_sale" class="detail-badge-sale">SALE</span>
              <span v-if="!product.in_stock" class="detail-badge-oos">Out of Stock</span>
            </div>
            <div v-if="product.images?.length" class="product-detail__thumbs">
              <button
                v-for="img in product.images" :key="img.id"
                class="product-detail__thumb"
                :class="{ active: activeImage === img.url }"
                @click="activeImage = img.url"
              >
                <img :src="img.url" :alt="img.alt" />
              </button>
            </div>
          </div>

          <!-- Info -->
          <div class="product-detail__info animate-fade-in-delay-1">
            <p class="product-detail__cat">
              <RouterLink :to="`/products?category=${product.category.slug}`">{{ product.category.name }}</RouterLink>
            </p>
            <h1 class="product-detail__title">{{ product.name }}</h1>

            <!-- Rating -->
            <div class="product-detail__rating" v-if="product.review_count">
              <div class="stars">
                <span v-for="s in 5" :key="s">
                  <svg v-if="s <= Math.round(product.avg_rating)" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </span>
              </div>
              <span class="rating-text">{{ product.avg_rating?.toFixed(1) }} ({{ product.review_count }} reviews)</span>
            </div>

            <!-- Price -->
            <div class="product-detail__price">
              <span class="price-main">${{ formatPrice(product.display_price) }}</span>
              <span v-if="product.on_sale" class="price-orig">${{ formatPrice(product.price) }}</span>
              <span v-if="product.on_sale" class="price-discount">
                -{{ Math.round((1 - product.display_price/product.price)*100) }}%
              </span>
            </div>

            <!-- Stock -->
            <div class="product-detail__stock" :class="product.in_stock ? 'in-stock' : 'out-stock'">
              <span class="stock-dot"></span>
              {{ product.in_stock ? `In Stock (${product.stock} available)` : 'Out of Stock' }}
            </div>

            <!-- Description -->
            <p class="product-detail__desc">{{ product.description }}</p>

            <!-- Qty + Add to Cart -->
            <div class="product-detail__actions">
              <div class="qty-control">
                <button @click="qty > 1 && qty--" :disabled="qty <= 1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span>{{ qty }}</span>
                <button @click="qty < product.stock && qty++" :disabled="qty >= product.stock">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
              <button
                class="btn btn-primary btn-lg"
                style="flex:1"
                :disabled="!product.in_stock || adding"
                @click="addToCart"
              >
                <svg v-if="!adding" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                {{ adding ? 'Adding…' : 'Add to Cart' }}
              </button>
              <button class="btn btn-outline btn-icon" @click="toggleWish" :title="wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'">
                <svg v-if="!wishlisted" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </button>
            </div>

            <Transition name="fade">
              <div v-if="addedMsg" class="alert alert-success" style="margin-top:.75rem">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                {{ addedMsg }}
              </div>
            </Transition>

            <!-- SKU -->
            <div class="product-detail__meta">
              <span class="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                SKU: {{ product.sku }}
              </span>
            </div>
          </div>
        </div>

        <!-- Description + Reviews -->
        <div class="product-tabs">
          <div class="tabs">
            <button :class="{ active: tab === 'desc' }" @click="tab='desc'">Description</button>
            <button :class="{ active: tab === 'reviews' }" @click="tab='reviews'">
              Reviews ({{ product.review_count || 0 }})
            </button>
          </div>

          <!-- Description -->
          <div v-if="tab === 'desc'" class="tab-content">
            <p class="desc-text">{{ product.description }}</p>
          </div>

          <!-- Reviews -->
          <div v-else class="tab-content">
            <!-- Submit review -->
            <div v-if="auth.isLoggedIn" class="review-form card" style="padding:1.5rem;margin-bottom:1.5rem">
              <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:1rem">Write a Review</h3>
              <div class="star-picker">
                <button v-for="s in 5" :key="s" @click="review.rating = s" class="star-btn">
                  <svg :width="s <= review.rating ? 24 : 24" :height="s <= review.rating ? 24 : 24" viewBox="0 0 24 24" :fill="s <= review.rating ? 'currentColor' : 'none'" :stroke="s <= review.rating ? 'currentColor' : '#cbd5e1'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>
              </div>
              <textarea v-model="review.comment" class="form-control" rows="3" placeholder="Share your experience with this product…" style="margin:.75rem 0"></textarea>
              <button class="btn btn-primary btn-sm" @click="submitReview" :disabled="!review.rating || submitting">
                {{ submitting ? 'Submitting…' : 'Submit Review' }}
              </button>
              <div v-if="reviewMsg" class="alert alert-success" style="margin-top:.75rem">{{ reviewMsg }}</div>
            </div>

            <!-- Review list -->
            <div v-if="product.reviews?.length" class="review-list">
              <div v-for="r in product.reviews" :key="r.id" class="review-item card" style="padding:1.25rem;margin-bottom:.75rem">
                <div class="review-item__header">
                  <div class="review-avatar">{{ r.user_name?.charAt(0)?.toUpperCase() }}</div>
                  <div>
                    <strong class="review-name">{{ r.user_name }}</strong>
                    <div class="stars" style="margin-top:.15rem">
                      <svg v-for="s in 5" :key="s" width="14" height="14" viewBox="0 0 24 24" :fill="s <= r.rating ? 'currentColor' : 'none'" :stroke="s <= r.rating ? 'currentColor' : '#cbd5e1'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </div>
                  </div>
                  <span class="review-date">{{ r.created_at }}</span>
                </div>
                <p class="review-text">{{ r.comment }}</p>
              </div>
            </div>
            <div v-else class="empty-state" style="padding:2rem">
              <div class="empty-icon-wrap">
                <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=80&q=80&auto=format&fit=crop" alt="No reviews" class="empty-icon-img" />
              </div>
              <p style="margin-top:.5rem;color:var(--gray-500)">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter }      from 'vue-router'
import { useAuthStore }     from '@/stores/auth'
import { useCartStore }     from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import api from '@/services/api'
import ProductImage from '@/components/common/ProductImage.vue'

const route   = useRoute()
const router  = useRouter()
const auth    = useAuthStore()
const cart    = useCartStore()
const wish    = useWishlistStore()

const product    = ref(null)
const loading    = ref(true)
const tab        = ref('desc')
const qty        = ref(1)
const activeImage= ref(null)
const adding     = ref(false)
const addedMsg   = ref('')
const submitting = ref(false)
const reviewMsg  = ref('')
const review     = ref({ rating: 0, comment: '' })

const wishlisted = computed(() => wish.isWishlisted(product.value?.id))

function formatPrice(n) { return Number(n).toFixed(2) }

async function addToCart() {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  adding.value = true
  try {
    await cart.addToCart(product.value.id, qty.value)
    addedMsg.value = `${qty.value} item(s) added to your cart!`
    setTimeout(() => addedMsg.value = '', 3000)
  } catch (e) {
    alert(e.response?.data?.message || 'Error')
  } finally {
    adding.value = false
  }
}

async function toggleWish() {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  await wish.toggle(product.value.id)
}

async function submitReview() {
  if (!review.value.rating) return
  submitting.value = true
  try {
    await api.post(`/products/${product.value.id}/reviews`, review.value)
    reviewMsg.value = 'Review submitted! It will appear after approval.'
    review.value    = { rating: 0, comment: '' }
  } catch (e) {
    alert(e.response?.data?.message || 'Error')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/products/${route.params.slug}`)
    product.value   = data.data
    activeImage.value = product.value.image_url || product.value.images?.[0]?.url || null
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.product-detail {
  display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;
  margin-top: 1.5rem;
}

/* Gallery */
.main-image-wrap { position: relative; overflow: hidden; border-radius: var(--radius-lg); }
.product-detail__main-img {
  width: 100%; height: 480px; object-fit: cover;
  background: linear-gradient(135deg, var(--gray-100), var(--gray-200));
  transition: transform .4s;
}
.detail-badge-sale {
  position: absolute; top: 1rem; left: 1rem;
  background: linear-gradient(135deg, var(--danger), #dc2626);
  color: #fff; padding: .35rem .85rem; border-radius: var(--radius-full);
  font-size: .75rem; font-weight: 700;
}
.detail-badge-oos {
  position: absolute; top: 1rem; left: 1rem;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  color: rgba(255,255,255,.85); padding: .35rem .85rem;
  border-radius: var(--radius-full); font-size: .75rem; font-weight: 700;
  border: 1px solid rgba(255,255,255,.15);
}
.product-detail__thumbs {
  display: flex; gap: .5rem; margin-top: .75rem; flex-wrap: wrap;
}
.product-detail__thumb {
  width: 72px; height: 72px; border-radius: var(--radius);
  cursor: pointer; border: 2px solid transparent;
  overflow: hidden; padding: 0; background: none;
  transition: all .2s;
}
.product-detail__thumb img { width: 100%; height: 100%; object-fit: cover; }
.product-detail__thumb.active { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
.product-detail__thumb:hover { border-color: var(--gray-300); }

/* Info */
.product-detail__cat { margin-bottom: .5rem; }
.product-detail__cat a {
  color: var(--primary); font-size: .85rem; font-weight: 600;
  transition: color .2s;
}
.product-detail__cat a:hover { color: var(--primary-dark); }
.product-detail__title {
  font-size: 2rem; font-weight: 800; line-height: 1.2;
  margin-bottom: .75rem; letter-spacing: -.02em;
}
.product-detail__rating { display: flex; align-items: center; gap: .6rem; margin-bottom: 1rem; }
.rating-text { font-size: .85rem; color: var(--gray-500); }
.product-detail__price { display: flex; align-items: center; gap: .75rem; margin-bottom: 1rem; }
.price-main { font-size: 2rem; font-weight: 800; color: var(--primary); }
.price-orig { font-size: 1.1rem; color: var(--gray-400); text-decoration: line-through; }
.price-discount {
  background: #fef2f2; color: var(--danger); border-radius: var(--radius-full);
  font-size: .75rem; font-weight: 700; padding: .25rem .65rem;
}

.product-detail__stock {
  display: inline-flex; align-items: center; gap: .5rem;
  font-size: .9rem; font-weight: 500; margin-bottom: 1rem;
  padding: .4rem .85rem; border-radius: var(--radius-full);
}
.in-stock { background: #f0fdf4; color: #15803d; }
.in-stock .stock-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: pulse-soft 2s infinite; }
.out-stock { background: #f1f5f9; color: #64748b; }
.out-stock .stock-dot { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; }

.product-detail__desc {
  font-size: .9rem; color: var(--gray-600); line-height: 1.7;
  margin-bottom: 1.25rem;
}

.product-detail__actions { display: flex; gap: .75rem; align-items: center; margin-bottom: 1rem; }
.qty-control {
  display: flex; align-items: center;
  border: 1.5px solid var(--gray-200); border-radius: var(--radius);
  overflow: hidden;
}
.qty-control button {
  width: 40px; height: 42px; background: var(--gray-50); border: none;
  display: grid; place-items: center; color: var(--gray-600);
  transition: all .15s;
}
.qty-control button:hover { background: var(--gray-100); color: var(--gray-900); }
.qty-control button:disabled { opacity: .3; cursor: not-allowed; }
.qty-control span {
  min-width: 40px; text-align: center; font-weight: 700; font-size: .95rem;
}

.product-detail__meta {
  display: flex; gap: 1.5rem; padding-top: 1rem;
  border-top: 1px solid var(--gray-100);
}
.meta-item {
  display: flex; align-items: center; gap: .4rem;
  font-size: .8rem; color: var(--gray-400);
}

/* Tabs */
.product-tabs { margin-top: 3rem; }
.desc-text { line-height: 1.8; color: var(--gray-600); font-size: .95rem; }

/* Reviews */
.star-picker { display: flex; gap: .3rem; }
.star-btn {
  background: none; border: none; padding: .25rem;
  color: var(--secondary); cursor: pointer; transition: transform .15s;
}
.star-btn:hover { transform: scale(1.15); }

.review-item__header { display: flex; align-items: center; gap: .75rem; }
.review-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff; display: grid; place-items: center;
  font-weight: 700; font-size: .8rem; flex-shrink: 0;
}
.review-name { font-size: .9rem; }
.review-date { font-size: .8rem; color: var(--gray-400); margin-left: auto; }
.review-text { margin-top: .6rem; color: var(--gray-600); line-height: 1.6; font-size: .9rem; }

.empty-icon-wrap {
  width: 72px; height: 72px; border-radius: 50%; overflow: hidden;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  display: grid; place-items: center;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 12px rgba(34,197,94,.15);
}
.empty-icon-img {
  width: 100%; height: 100%; object-fit: cover;
}

/* Fade transition */
.fade-enter-active { animation: fadeInUp .3s var(--ease); }
.fade-leave-active { animation: fadeInUp .2s var(--ease) reverse; }

@media (max-width: 768px) {
  .product-detail { grid-template-columns: 1fr; gap: 1.5rem; }
  .product-detail__main-img { height: 320px; }
  .product-detail__title { font-size: 1.5rem; }
  .price-main { font-size: 1.5rem; }
}
</style>
