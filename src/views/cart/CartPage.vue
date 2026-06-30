<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1>Shopping Cart</h1>
        <div class="breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span class="breadcrumb__sep">/</span>
          <span>Cart</span>
        </div>
      </div>
    </div>

    <div class="container cart-layout">
      <!-- Items -->
      <div class="cart-items">
        <div v-if="cart.loading" class="loading-center"><div class="spinner"></div></div>

        <div v-else-if="!cart.items.length" class="empty-state">
          <div class="empty-icon-wrap">
            <img src="https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=100&q=80&auto=format&fit=crop" alt="Empty cart" class="empty-icon-img" />
          </div>
          <h2>Your cart is empty</h2>
          <p>Gear up! Add some sports products to get started.</p>
          <RouterLink to="/products" class="btn btn-primary" style="margin-top:1.25rem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Start Shopping
          </RouterLink>
        </div>

        <template v-else>
          <div class="cart-header">
            <span class="cart-header__label">Product</span>
            <span class="cart-header__label">Quantity</span>
            <span class="cart-header__label">Total</span>
            <span></span>
          </div>
          <TransitionGroup name="cart-item" tag="div" class="cart-items__list">
            <div v-for="item in cart.items" :key="item.id" class="cart-item">
              <div class="cart-item__product">
                <img :src="item.image_url || '/placeholder.png'" :alt="item.name" class="cart-item__img" />
                <div class="cart-item__info">
                  <RouterLink :to="`/products/${item.slug}`" class="cart-item__name">{{ item.name }}</RouterLink>
                  <p class="cart-item__unit-price">${{ item.price.toFixed(2) }} each</p>
                </div>
              </div>
              <div class="cart-item__qty">
                <button @click="update(item, item.quantity - 1)" :disabled="item.quantity <= 1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span>{{ item.quantity }}</span>
                <button @click="update(item, item.quantity + 1)" :disabled="item.quantity >= item.stock">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
              <p class="cart-item__subtotal">${{ item.subtotal.toFixed(2) }}</p>
              <button class="cart-item__remove" @click="remove(item.id)" title="Remove item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          </TransitionGroup>

          <div class="cart-actions">
            <RouterLink to="/products" class="btn btn-ghost btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Continue Shopping
            </RouterLink>
            <button class="btn btn-ghost btn-sm" style="color:var(--danger)" @click="clearCart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              Clear Cart
            </button>
          </div>
        </template>
      </div>

      <!-- Summary -->
      <div v-if="cart.items.length" class="cart-summary card" style="padding:1.75rem">
        <h2 class="summary-title">Order Summary</h2>
        <div class="summary-row">
          <span>Subtotal ({{ cart.count }} items)</span>
          <strong>${{ cart.subtotal.toFixed(2) }}</strong>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <strong :class="cart.subtotal >= 50 ? 'text-success' : ''">{{ cart.subtotal >= 50 ? 'FREE' : '$5.00' }}</strong>
        </div>
        <div v-if="cart.subtotal < 50" class="free-shipping-bar">
          <p>Add <strong>${{ (50 - cart.subtotal).toFixed(2) }}</strong> more for free shipping!</p>
          <div class="shipping-progress">
            <div class="shipping-progress__fill" :style="{ width: Math.min(100, (cart.subtotal / 50) * 100) + '%' }"></div>
          </div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row summary-total">
          <span>Total</span>
          <strong>${{ total.toFixed(2) }}</strong>
        </div>
        <RouterLink to="/checkout" class="btn btn-primary btn-full btn-lg" style="margin-top:1.25rem">
          Proceed to Checkout
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </RouterLink>
        <p class="secure-text">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Secure checkout with SSL encryption
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

const total = computed(() => {
  const ship = cart.subtotal >= 50 ? 0 : 5
  return cart.subtotal + ship
})

async function update(item, newQty) {
  if (newQty < 1) return
  try { await cart.updateItem(item.id, newQty) }
  catch (e) { alert(e.response?.data?.message || 'Error') }
}

async function remove(id) {
  await cart.removeItem(id)
}

async function clearCart() {
  if (confirm('Clear the entire cart?')) await cart.clearCart()
}

onMounted(() => cart.fetchCart())
</script>

<style scoped>
.cart-layout {
  display: grid; grid-template-columns: 1fr 360px;
  gap: 1.5rem; align-items: flex-start; padding-bottom: 3rem;
}
.cart-items { display: flex; flex-direction: column; }

.cart-header {
  display: grid; grid-template-columns: 1fr 120px 90px 40px;
  gap: 1rem; padding: .75rem 0; border-bottom: 2px solid var(--gray-200);
  margin-bottom: .5rem;
}
.cart-header__label {
  font-size: .7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .06em; color: var(--gray-400);
}

.cart-items__list { display: flex; flex-direction: column; }

.cart-item {
  display: grid; grid-template-columns: 1fr 120px 90px 40px;
  gap: 1rem; align-items: center; padding: 1rem 0;
  border-bottom: 1px solid var(--gray-100);
}
.cart-item__product { display: flex; align-items: center; gap: 1rem; min-width: 0; }
.cart-item__img {
  width: 72px; height: 72px; object-fit: cover; border-radius: var(--radius);
  flex-shrink: 0; background: var(--gray-100);
}
.cart-item__info { min-width: 0; }
.cart-item__name {
  font-weight: 600; font-size: .9rem; display: block;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color .2s;
}
.cart-item__name:hover { color: var(--primary); }
.cart-item__unit-price { font-size: .8rem; color: var(--gray-400); margin-top: .2rem; }

.cart-item__qty {
  display: flex; align-items: center;
  border: 1.5px solid var(--gray-200); border-radius: var(--radius);
  overflow: hidden;
}
.cart-item__qty button {
  width: 32px; height: 32px; background: none; border: none;
  display: grid; place-items: center; color: var(--gray-500);
  transition: all .15s;
}
.cart-item__qty button:hover { background: var(--gray-100); color: var(--gray-900); }
.cart-item__qty button:disabled { opacity: .25; cursor: not-allowed; }
.cart-item__qty span {
  min-width: 32px; text-align: center; font-weight: 700; font-size: .875rem;
}

.cart-item__subtotal { font-weight: 700; font-size: .95rem; text-align: right; }
.cart-item__remove {
  background: none; border: none; color: var(--gray-300);
  padding: .4rem; border-radius: .5rem; transition: all .2s;
  display: grid; place-items: center;
}
.cart-item__remove:hover { color: var(--danger); background: #fef2f2; }

.cart-actions {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1rem;
}

/* Summary */
.summary-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 1.25rem; }
.summary-row {
  display: flex; justify-content: space-between;
  font-size: .9rem; margin-bottom: .6rem; color: var(--gray-600);
}
.summary-row strong { color: var(--gray-800); }
.summary-total { font-size: 1.1rem; margin-bottom: 0; }
.summary-total strong { color: var(--primary); }
.summary-divider { height: 1px; background: var(--gray-100); margin: .85rem 0; }

.text-success { color: var(--success) !important; }

.free-shipping-bar {
  background: var(--gray-50); border-radius: var(--radius);
  padding: .75rem; margin: .75rem 0; font-size: .8rem; color: var(--gray-600);
}
.shipping-progress {
  height: 4px; background: var(--gray-200); border-radius: 999px;
  margin-top: .5rem; overflow: hidden;
}
.shipping-progress__fill {
  height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-light));
  border-radius: 999px; transition: width .4s cubic-bezier(.4,0,.2,1);
}

.secure-text {
  display: flex; align-items: center; justify-content: center;
  gap: .4rem; font-size: .75rem; color: var(--gray-400);
  margin-top: .85rem;
}

/* Cart item transition */
.cart-item-enter-active { animation: fadeInUp .3s var(--ease); }
.cart-item-leave-active { animation: fadeInUp .2s var(--ease) reverse; }

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

@media (max-width: 768px) {
  .cart-layout { grid-template-columns: 1fr; }
  .cart-header { display: none; }
  .cart-item {
    grid-template-columns: 1fr;
    gap: .75rem;
    padding: 1.25rem; margin-bottom: .75rem;
    border: 1px solid var(--gray-100); border-radius: var(--radius-lg);
    background: #fff;
  }
  .cart-item__qty { justify-self: start; }
  .cart-item__subtotal { text-align: left; font-size: 1.05rem; }
  .cart-item__remove { position: absolute; top: .75rem; right: .75rem; }
  .cart-item { position: relative; }
}
</style>
