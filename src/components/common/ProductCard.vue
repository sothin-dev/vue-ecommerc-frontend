<template>
  <div class="product-card">
    <!-- Sale badge -->
    <span v-if="product.on_sale" class="badge-sale">SALE</span>

    <!-- Out of Stock badge -->
    <span v-if="!product.in_stock" class="badge-oos">Out of Stock</span>

    <!-- Wishlist toggle -->
    <button v-if="auth.isLoggedIn" class="wishlist-btn" @click.prevent="toggleWish" :title="wishlisted ? 'Remove from wishlist' : 'Add to wishlist'">
      <svg v-if="!wishlisted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
    </button>

    <!-- Image -->
    <div class="product-card__img-wrapper">
      <RouterLink :to="`/products/${product.slug}`">
        <ProductImage :src="product.image_url" :alt="product.name" imgClass="product-card__img" size="lg" />
      </RouterLink>
    </div>

    <!-- Body -->
    <div class="product-card__body">
      <p class="product-card__cat">{{ product.category?.name }}</p>
      <RouterLink :to="`/products/${product.slug}`">
        <h3 class="product-card__name">{{ product.name }}</h3>
      </RouterLink>

      <div class="product-card__price">
        <span class="sale">${{ formatPrice(product.display_price) }}</span>
        <span v-if="product.on_sale" class="orig">${{ formatPrice(product.price) }}</span>
      </div>

      <div class="product-card__actions">
        <button
          class="btn btn-sm add-to-cart-btn"
          :class="product.in_stock ? 'btn-primary' : 'btn-oos'"
          :disabled="!product.in_stock || adding"
          @click="addToCart"
        >
          <svg v-if="!adding" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <span>{{ product.in_stock ? (adding ? 'Adding…' : 'Add to Cart') : 'Unavailable' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter }        from 'vue-router'
import { useAuthStore }     from '@/stores/auth'
import { useCartStore }     from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import ProductImage from '@/components/common/ProductImage.vue'

const props  = defineProps({ product: Object })
const auth   = useAuthStore()
const cart   = useCartStore()
const wish   = useWishlistStore()
const router = useRouter()
const adding = ref(false)

const wishlisted = computed(() => wish.isWishlisted(props.product.id))

function formatPrice(n) { return Number(n).toFixed(2) }

async function addToCart() {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  adding.value = true
  try { await cart.addToCart(props.product.id) }
  catch (e) { alert(e.response?.data?.message || 'Could not add to cart') }
  finally { adding.value = false }
}

async function toggleWish() {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  await wish.toggle(props.product.id)
}
</script>

<style scoped>
.product-card__img-wrapper { overflow: hidden; position: relative; }
.product-card__img {
  width: 100%; height: 240px; object-fit: cover;
  background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%);
  transition: transform .5s cubic-bezier(.4,0,.2,1);
}
.product-card:hover .product-card__img { transform: scale(1.06); }

.add-to-cart-btn {
  flex: 1; width: 100%;
  opacity: 0; transform: translateY(4px);
  transition: all .25s cubic-bezier(.4,0,.2,1);
}
.product-card:hover .add-to-cart-btn {
  opacity: 1; transform: translateY(0);
}
.btn-oos {
  background: var(--gray-100); color: var(--gray-400);
  cursor: default; pointer-events: none;
  border: 1px solid var(--gray-200);
  font-weight: 500;
}
/* Always show on mobile */
@media (max-width: 768px) {
  .add-to-cart-btn { opacity: 1; transform: none; }
}
</style>
