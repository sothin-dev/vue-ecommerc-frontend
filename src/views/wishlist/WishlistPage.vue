<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1>My Wishlist</h1>
        <div class="breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span class="breadcrumb__sep">/</span>
          <span>Wishlist</span>
        </div>
      </div>
    </div>

    <div class="container" style="padding-bottom:3rem">
      <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

      <div v-else-if="!wishlist.items.length" class="empty-state">
        <div class="empty-icon-wrap">
          <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=100&q=80&auto=format&fit=crop" alt="Empty wishlist" class="empty-icon-img" />
        </div>
        <h2>Your wishlist is empty</h2>
        <p>Save your favorite sports gear and come back to them later.</p>
        <RouterLink to="/products" class="btn btn-primary" style="margin-top:1.25rem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Explore Gear
        </RouterLink>
      </div>

      <div v-else>
        <p class="wishlist-count">{{ wishlist.items.length }} saved item{{ wishlist.items.length !== 1 ? 's' : '' }}</p>
        <div class="product-grid">
          <div v-for="item in wishlist.items" :key="item.id" class="product-card">
            <span v-if="!item.in_stock" class="badge-oos">Out of Stock</span>
            <button class="wishlist-btn" @click="remove(item.product_id)" title="Remove from wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </button>
            <div class="product-card__img-wrapper">
              <RouterLink :to="`/products/${item.slug}`">
                <ProductImage :src="item.image_url" :alt="item.name" imgClass="product-card__img" size="lg" />
              </RouterLink>
            </div>
            <div class="product-card__body">
              <RouterLink :to="`/products/${item.slug}`">
                <h3 class="product-card__name">{{ item.name }}</h3>
              </RouterLink>
              <div class="product-card__price">
                <span class="sale">${{ (item.sale_price || item.price).toFixed(2) }}</span>
                <span v-if="item.sale_price" class="orig">${{ item.price.toFixed(2) }}</span>
              </div>
              <div class="product-card__actions">
                <button
                  class="btn btn-sm add-to-cart-btn"
                  :class="item.in_stock ? 'btn-primary' : 'btn-oos'"
                  :disabled="!item.in_stock || adding[item.product_id]"
                  @click="addToCart(item)"
                >
                  <svg v-if="!adding[item.product_id]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                  {{ item.in_stock ? (adding[item.product_id] ? 'Adding…' : 'Add to Cart') : 'Unavailable' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore }     from '@/stores/cart'
import ProductImage from '@/components/common/ProductImage.vue'

const wishlist = useWishlistStore()
const cart     = useCartStore()
const loading  = ref(true)
const adding   = reactive({})

async function remove(productId) {
  await wishlist.toggle(productId)
}

async function addToCart(item) {
  adding[item.product_id] = true
  try { await cart.addToCart(item.product_id) }
  finally { adding[item.product_id] = false }
}

onMounted(async () => {
  await wishlist.fetchWishlist()
  loading.value = false
})
</script>

<style scoped>
.wishlist-count {
  font-size: .9rem; color: var(--gray-500);
  margin-bottom: 1.5rem;
}
.add-to-cart-btn { flex: 1; width: 100%; }
.btn-oos {
  background: var(--gray-100); color: var(--gray-400);
  cursor: default; pointer-events: none;
  border: 1px solid var(--gray-200);
  font-weight: 500;
}
.empty-icon-wrap {
  width: 96px; height: 96px; border-radius: 50%; overflow: hidden;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  display: grid; place-items: center;
  margin: 0 auto 1rem; color: var(--gray-300);
  box-shadow: 0 4px 12px rgba(34,197,94,.15);
}
.empty-icon-img {
  width: 100%; height: 100%; object-fit: cover;
}
</style>
