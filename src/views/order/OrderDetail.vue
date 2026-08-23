<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1>Order Detail</h1>
        <div class="breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span class="breadcrumb__sep">/</span>
          <RouterLink to="/orders">Orders</RouterLink>
          <span class="breadcrumb__sep">/</span>
          <span>{{ order?.order_number }}</span>
        </div>
      </div>
    </div>

    <div class="container" style="padding-bottom:3rem">
      <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

      <template v-else-if="order">
        <!-- Status Timeline -->
        <div class="status-timeline card" style="padding:1.75rem 2rem;margin-bottom:1.5rem">
          <div class="timeline">
            <div v-for="(step, i) in steps" :key="step" class="timeline__step" :class="{ done: isStepDone(step), current: step === order.status }">
              <div class="timeline__dot">
                <svg v-if="isStepDone(step) && step !== order.status" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                <span v-else class="timeline__dot-inner"></span>
              </div>
              <span class="timeline__label">{{ stepLabels[step] }}</span>
              <div v-if="i < steps.length - 1" class="timeline__line" :class="{ filled: isStepDone(steps[i + 1]) }"></div>
            </div>
          </div>
        </div>

        <div class="order-grid">
          <!-- Order Items -->
          <div>
            <div class="card" style="padding:1.75rem;margin-bottom:1rem">
              <h2 class="section-sub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                Items Ordered
              </h2>
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <ProductImage :src="item.image_url" :alt="item.name" imgClass="order-item__img" size="sm" />
                  <div class="order-item__info">
                    <RouterLink :to="`/products/${item.slug}`" class="order-item__name">
                      {{ item.name }}
                    </RouterLink>
                    <p class="order-item__meta">Qty: {{ item.quantity }} × ${{ item.unit_price.toFixed(2) }}</p>
                    <p v-if="item.variant" class="order-item__meta">{{ item.variant.type }}: {{ item.variant.value }}</p>
                  </div>
                <strong class="order-item__total">${{ item.subtotal.toFixed(2) }}</strong>
              </div>
            </div>

            <!-- Shipping -->
            <div class="card" style="padding:1.75rem">
              <h2 class="section-sub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Shipping Address
              </h2>
              <p class="shipping-address">{{ order.shipping_address }}</p>
            </div>
          </div>

          <!-- Summary -->
          <div>
            <div class="card" style="padding:1.75rem">
              <h2 class="section-sub" style="margin-bottom:1rem">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Order Info
              </h2>
              <div class="info-row"><span>Order #</span><strong>{{ order.order_number }}</strong></div>
              <div class="info-row"><span>Date</span><span>{{ formatDate(order.created_at) }}</span></div>
              <div class="info-row"><span>Status</span><span :class="`status status-${order.status}`">{{ order.status }}</span></div>
              <div class="info-row"><span>Payment</span><span style="text-transform:capitalize">{{ order.payment_method.replace('_', ' ') }}</span></div>
              <div class="info-row"><span>Pay status</span><span :class="`status status-${order.payment_status}`">{{ order.payment_status }}</span></div>
              <div class="info-divider"></div>
              <div class="info-row"><span>Subtotal</span><span>${{ order.subtotal.toFixed(2) }}</span></div>
              <div class="info-row"><span>Shipping</span><span>{{ order.shipping_fee > 0 ? '$' + order.shipping_fee.toFixed(2) : 'FREE' }}</span></div>
              <div v-if="order.discount > 0" class="info-row info-discount"><span>Discount<span v-if="order.coupon_code"> ({{ order.coupon_code }})</span></span><span>-${{ order.discount.toFixed(2) }}</span></div>
              <div class="info-divider"></div>
              <div class="info-row info-total">
                <strong>Total</strong>
                <strong>${{ order.total.toFixed(2) }}</strong>
              </div>
            </div>

            <button class="btn btn-primary btn-full" style="margin-top:1rem" @click="reorder" :disabled="reordering">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {{ reordering ? 'Adding…' : 'Reorder This Order' }}
            </button>

            <button
              v-if="canCancel"
              class="btn btn-outline btn-full btn-danger"
              style="margin-top:.75rem"
              :disabled="cancelling"
              @click="cancelOrder"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {{ cancelling ? 'Cancelling…' : 'Cancel Order' }}
            </button>

            <RouterLink to="/orders" class="btn btn-outline btn-full" style="margin-top:.75rem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Orders
            </RouterLink>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter }       from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import ProductImage from '@/components/common/ProductImage.vue'

const route      = useRoute()
const router     = useRouter()
const auth       = useAuthStore()
const order      = ref(null)
const loading    = ref(true)
const reordering = ref(false)
const cancelling = ref(false)

const canCancel = computed(() => ['pending', 'confirmed', 'processing'].includes(order.value?.status))

const steps = ['pending', 'processing', 'shipped', 'delivered']
const stepLabels = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered'
}

function isStepDone(step) {
  const cur = steps.indexOf(order.value?.status)
  return cur >= steps.indexOf(step)
}

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function cancelOrder() {
  if (!confirm('Are you sure you want to cancel this order?')) return
  cancelling.value = true
  try {
    const { data } = await api.post(`/orders/${order.value.order_number}/cancel`)
    order.value = data.data
  } catch (e) {
    alert(e.response?.data?.message || 'Could not cancel the order.')
  } finally {
    cancelling.value = false
  }
}

onMounted(async () => {
  const { data } = await api.get(`/orders/${route.params.number}`)
  order.value    = data.data
  loading.value  = false
})
</script>

<style scoped>
/* Timeline */
.timeline {
  display: flex; align-items: flex-start; justify-content: space-between;
}
.timeline__step {
  display: flex; flex-direction: column; align-items: center;
  position: relative; flex: 1;
}
.timeline__dot {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--gray-100); border: 2px solid var(--gray-200);
  display: grid; place-items: center; color: var(--gray-300);
  position: relative; z-index: 2;
  transition: all .3s;
}
.timeline__dot-inner {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--gray-300);
}
.timeline__step.done .timeline__dot {
  background: var(--primary); border-color: var(--primary);
  color: #fff;
}
.timeline__step.done .timeline__dot-inner { background: #fff; }
.timeline__step.current .timeline__dot {
  background: var(--primary); border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99,102,241,.2);
  color: #fff;
}
.timeline__label {
  margin-top: .6rem; font-size: .8rem; font-weight: 600;
  color: var(--gray-400); text-align: center;
}
.timeline__step.done .timeline__label { color: var(--primary); }
.timeline__step.current .timeline__label { color: var(--primary); font-weight: 700; }
.timeline__line {
  position: absolute; top: 18px; left: calc(50% + 20px); right: calc(-50% + 20px);
  height: 2px; background: var(--gray-200); z-index: 1;
  transition: background .3s;
}
.timeline__line.filled { background: var(--primary); }

/* Order grid */
.order-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.25rem; align-items: flex-start; }

.section-sub {
  font-size: 1rem; font-weight: 700;
  display: flex; align-items: center; gap: .5rem;
  color: var(--gray-800);
}

.order-item {
  display: flex; align-items: center; gap: .85rem;
  margin-bottom: .75rem; padding-bottom: .75rem;
  border-bottom: 1px solid var(--gray-100);
}
.order-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.order-item__img {
  width: 56px; height: 56px; object-fit: cover;
  border-radius: var(--radius); flex-shrink: 0; background: var(--gray-100);
}
.order-item__info { flex: 1; min-width: 0; }
.order-item__name {
  font-weight: 600; font-size: .9rem;
  transition: color .2s;
}
.order-item__name:hover { color: var(--primary); }
.order-item__meta { font-size: .8rem; color: var(--gray-500); margin-top: .15rem; }
.order-item__total { font-size: .95rem; flex-shrink: 0; }

.shipping-address {
  color: var(--gray-600); line-height: 1.7; font-size: .9rem;
  margin-top: .5rem;
}

.info-row {
  display: flex; justify-content: space-between;
  font-size: .875rem; margin-bottom: .5rem; color: var(--gray-600);
}
.info-row strong { color: var(--gray-800); }
.info-divider { height: 1px; background: var(--gray-100); margin: .75rem 0; }
.info-total { font-size: 1.1rem; }
.info-total strong:last-child { color: var(--primary); }

@media (max-width: 768px) {
  .order-grid { grid-template-columns: 1fr; }
  .timeline { flex-wrap: wrap; gap: .5rem; justify-content: center; }
  .timeline__line { display: none; }
  .timeline__step { flex: 0 0 auto; }
}
</style>
