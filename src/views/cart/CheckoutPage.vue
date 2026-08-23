<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1>Checkout</h1>
        <div class="breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span class="breadcrumb__sep">/</span>
          <RouterLink to="/cart">Cart</RouterLink>
          <span class="breadcrumb__sep">/</span>
          <span>Checkout</span>
        </div>
      </div>
    </div>

    <div class="container checkout-layout">
      <!-- Form -->
      <div class="checkout-form">
        <div class="checkout-section card" style="padding:1.75rem">
          <div class="checkout-section__header">
            <div class="checkout-section__num">1</div>
            <div>
              <h2 class="checkout-section__title">Shipping Address</h2>
              <p class="checkout-section__desc">Where should we deliver your order?</p>
            </div>
          </div>
          <div class="checkout-section__body">
            <div class="form-group">
              <label>Full Shipping Address</label>
              <textarea
                v-model="form.shipping_address"
                class="form-control"
                rows="3"
                placeholder="House number, street, city, state/province, postal code, country"
                required
              ></textarea>
            </div>
          </div>
        </div>

        <div class="checkout-section card" style="padding:1.75rem">
          <div class="checkout-section__header">
            <div class="checkout-section__num">2</div>
            <div>
              <h2 class="checkout-section__title">Payment Method</h2>
              <p class="checkout-section__desc">Choose how you'd like to pay</p>
            </div>
          </div>
          <div class="checkout-section__body">
            <div class="payment-methods">
              <label
                v-for="m in paymentMethods" :key="m.value"
                class="payment-option"
                :class="{ selected: form.payment_method === m.value }"
              >
                <input type="radio" v-model="form.payment_method" :value="m.value" />
                <div class="payment-option__radio"></div>
                <span class="payment-option__icon">
                  <img :src="m.icon" alt="" class="payment-option__icon-img" />
                </span>
                <div class="payment-option__info">
                  <strong>{{ m.label }}</strong>
                  <p>{{ m.desc }}</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="checkout-summary">
        <div class="card" style="padding:1.75rem;position:sticky;top:88px">
          <h2 class="summary-title">Order Summary</h2>

          <div class="summary-items">
            <div v-for="item in cart.items" :key="item.id" class="summary-item">
              <ProductImage :src="item.image_url" :alt="item.name" imgClass="summary-item__img" size="sm" />
              <div class="summary-item__info">
                <p class="summary-item__name">{{ item.name }}</p>
                <p class="summary-item__qty">Qty: {{ item.quantity }}</p>
              </div>
              <strong class="summary-item__price">${{ item.subtotal.toFixed(2) }}</strong>
            </div>
          </div>

          <div class="summary-divider"></div>

          <!-- Coupon -->
          <div v-if="!appliedCoupon" class="coupon-box">
            <div class="coupon-input">
              <input
                v-model="couponCode"
                class="form-control"
                placeholder="Coupon code"
                @keyup.enter="applyCoupon"
              />
              <button class="btn btn-outline btn-sm" :disabled="applyingCoupon" @click="applyCoupon">
                {{ applyingCoupon ? '…' : 'Apply' }}
              </button>
            </div>
            <p v-if="couponMsg" class="coupon-msg" :class="couponError ? 'coupon-msg--error' : 'coupon-msg--ok'">
              {{ couponMsg }}
            </p>
          </div>

          <div v-else class="coupon-applied">
            <div>
              <span class="coupon-applied__code">{{ appliedCoupon.code }}</span>
              <span class="coupon-applied__label">coupon applied</span>
            </div>
            <button class="coupon-applied__remove" @click="removeCoupon" aria-label="Remove coupon">✕</button>
          </div>

          <div class="summary-row"><span>Subtotal</span><strong>${{ cart.subtotal.toFixed(2) }}</strong></div>
          <div class="summary-row">
            <span>Shipping</span>
            <strong :class="shipping === 0 ? 'text-success' : ''">{{ shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2) }}</strong>
          </div>
          <div v-if="appliedCoupon" class="summary-row summary-discount">
            <span>Discount</span><strong>-${{ appliedCoupon.discount.toFixed(2) }}</strong>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row summary-total">
            <span>Total</span>
            <strong>${{ total.toFixed(2) }}</strong>
          </div>

          <Transition name="fade">
            <div v-if="error" class="alert alert-error" style="margin-top:1rem">{{ error }}</div>
          </Transition>

          <button
            class="btn btn-primary btn-full btn-lg"
            style="margin-top:1.25rem"
            :disabled="placing || !form.shipping_address || !form.payment_method"
            @click="placeOrder"
          >
            <svg v-if="!placing" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            {{ placing ? 'Placing Order…' : 'Place Order' }}
          </button>

          <p class="secure-text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Your payment is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter }    from 'vue-router'
import { useCartStore } from '@/stores/cart'
import api from '@/services/api'
import ProductImage from '@/components/common/ProductImage.vue'

const cart    = useCartStore()
const router  = useRouter()
const placing = ref(false)
const error   = ref('')

const form = reactive({
  shipping_address: '',
  payment_method:   'cash_on_delivery',
  coupon_code:      '',
})

const couponCode     = ref('')
const appliedCoupon  = ref(null)
const applyingCoupon = ref(false)
const couponMsg      = ref('')
const couponError    = ref(false)

const paymentMethods = [
  { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: 'https://images.unsplash.com/photo-1589227365533-1cb251a96435?w=60&q=80&auto=format&fit=crop', desc: 'Pay when your order arrives at your doorstep.' },
  { value: 'bank_transfer',    label: 'Bank Transfer',    icon: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=60&q=80&auto=format&fit=crop', desc: 'Transfer directly to our bank account.' },
  { value: 'credit_card',      label: 'Credit / Debit Card', icon: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=60&q=80&auto=format&fit=crop', desc: 'Pay securely online with your card.' },
]

const shipping = computed(() => (cart.subtotal >= 50 ? 0 : 5))

const total = computed(() => {
  const discount = appliedCoupon.value?.discount || 0
  return Math.max(0, cart.subtotal + shipping.value - discount)
})

async function applyCoupon() {
  if (!couponCode.value.trim()) return
  couponMsg.value = ''
  couponError.value = false
  applyingCoupon.value = true
  try {
    const { data } = await api.post('/coupon/validate', {
      code:     couponCode.value.trim(),
      subtotal: cart.subtotal,
    })
    appliedCoupon.value = { code: data.code, discount: data.discount }
    form.coupon_code = data.code
    couponMsg.value = data.message
  } catch (e) {
    couponError.value = true
    couponMsg.value = e.response?.data?.message || 'Invalid coupon code.'
  } finally {
    applyingCoupon.value = false
  }
}

function removeCoupon() {
  appliedCoupon.value = null
  form.coupon_code = ''
  couponCode.value = ''
  couponMsg.value = ''
}

async function placeOrder() {
  error.value   = ''
  placing.value = true
  try {
    const { data } = await api.post('/checkout', form)
    cart.reset()
    router.push({ name: 'OrderDetail', params: { number: data.data.order_number } })
  } catch (e) {
    error.value = e.response?.data?.message || 'Checkout failed. Please try again.'
  } finally {
    placing.value = false
  }
}

onMounted(() => cart.fetchCart())
</script>

<style scoped>
.checkout-layout {
  display: grid; grid-template-columns: 1fr 400px;
  gap: 1.5rem; align-items: flex-start; padding-bottom: 3rem;
}

.checkout-form { display: flex; flex-direction: column; gap: 1.25rem; }

.checkout-section__header {
  display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;
}
.checkout-section__num {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--primary-50); color: var(--primary);
  display: grid; place-items: center;
  font-weight: 700; font-size: .85rem; flex-shrink: 0;
}
.checkout-section__title { font-size: 1rem; font-weight: 700; }
.checkout-section__desc { font-size: .8rem; color: var(--gray-500); margin-top: .1rem; }

/* Payment methods */
.payment-methods { display: flex; flex-direction: column; gap: .65rem; }
.payment-option {
  display: flex; align-items: center; gap: 1rem;
  border: 1.5px solid var(--gray-200); border-radius: var(--radius-lg);
  padding: 1rem 1.15rem; cursor: pointer;
  transition: all .25s cubic-bezier(.4,0,.2,1);
}
.payment-option:hover { border-color: var(--gray-300); background: var(--gray-50); }
.payment-option.selected {
  border-color: var(--primary); background: var(--primary-50);
  box-shadow: 0 0 0 3px rgba(99,102,241,.08);
}
.payment-option input { display: none; }
.payment-option__radio {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid var(--gray-300); flex-shrink: 0;
  transition: all .2s; position: relative;
}
.payment-option.selected .payment-option__radio { border-color: var(--primary); }
.payment-option.selected .payment-option__radio::after {
  content: ''; position: absolute; inset: 3px;
  border-radius: 50%; background: var(--primary);
}
.payment-option__icon {
  width: 44px; height: 44px; border-radius: .5rem; overflow: hidden;
  flex-shrink: 0;
}
.payment-option__icon-img {
  width: 100%; height: 100%; object-fit: cover;
}
.payment-option__info { flex: 1; }
.payment-option__info strong { font-size: .9rem; display: block; }
.payment-option__info p { font-size: .8rem; color: var(--gray-500); margin-top: .1rem; }

/* Summary */
.summary-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 1rem; }
.summary-items {
  max-height: 240px; overflow-y: auto;
  margin-bottom: .5rem;
}
.summary-item {
  display: flex; align-items: center; gap: .75rem;
  margin-bottom: .75rem; padding-bottom: .75rem;
  border-bottom: 1px solid var(--gray-100);
}
.summary-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.summary-item__img {
  width: 48px; height: 48px; object-fit: cover;
  border-radius: .5rem; background: var(--gray-100); flex-shrink: 0;
}
.summary-item__info { flex: 1; min-width: 0; }
.summary-item__name {
  font-size: .85rem; font-weight: 600; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.summary-item__qty { font-size: .75rem; color: var(--gray-500); }
.summary-item__price { font-size: .9rem; flex-shrink: 0; }

.summary-divider { height: 1px; background: var(--gray-100); margin: .75rem 0; }
.summary-row { display: flex; justify-content: space-between; font-size: .9rem; margin-bottom: .5rem; color: var(--gray-600); }
.summary-row strong { color: var(--gray-800); }
.summary-total { font-size: 1.1rem; }
.summary-total strong { color: var(--primary); font-size: 1.15rem; }
.text-success { color: var(--success) !important; }

/* Coupon */
.coupon-box { margin-bottom: .75rem; }
.coupon-input { display: flex; gap: .5rem; }
.coupon-input .form-control { flex: 1; padding: .5rem .65rem; font-size: .85rem; }
.coupon-msg { font-size: .78rem; margin-top: .4rem; }
.coupon-msg--error { color: var(--danger, #dc2626); }
.coupon-msg--ok { color: var(--success, #16a34a); }
.coupon-applied {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--primary-50, #eef2ff); border: 1px solid var(--primary, #6366f1);
  border-radius: var(--radius); padding: .6rem .8rem; margin-bottom: .75rem;
}
.coupon-applied__code { font-weight: 700; font-size: .85rem; color: var(--primary, #4f46e5); }
.coupon-applied__label { display: block; font-size: .7rem; color: var(--gray-500); }
.coupon-applied__remove {
  border: none; background: transparent; color: var(--gray-400);
  cursor: pointer; font-size: 1rem; line-height: 1; padding: .2rem .4rem; border-radius: .4rem;
}
.coupon-applied__remove:hover { background: rgba(0,0,0,.05); color: var(--danger, #dc2626); }
.summary-discount { color: var(--success, #16a34a); }
.summary-discount strong { color: var(--success, #16a34a); }

.secure-text {
  display: flex; align-items: center; justify-content: center;
  gap: .4rem; font-size: .75rem; color: var(--gray-400);
  margin-top: .85rem;
}

.fade-enter-active { animation: fadeInUp .3s var(--ease); }
.fade-leave-active { animation: fadeInUp .2s var(--ease) reverse; }

@media (max-width: 768px) {
  .checkout-layout { grid-template-columns: 1fr; }
  .checkout-summary { order: -1; }
}
</style>
