<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1>My Orders</h1>
        <div class="breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span class="breadcrumb__sep">/</span>
          <span>Orders</span>
        </div>
      </div>
    </div>

    <div class="container" style="padding-bottom:3rem">
      <div v-if="loading" class="loading-center"><div class="spinner"></div></div>

      <div v-else-if="!orders.length" class="empty-state">
        <div class="empty-icon-wrap">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
        </div>
        <h2>No orders yet</h2>
        <p>Place your first order and it will appear here.</p>
        <RouterLink to="/products" class="btn btn-primary" style="margin-top:1.25rem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Start Shopping
        </RouterLink>
      </div>

      <div v-else>
        <!-- Mobile cards -->
        <div class="orders-mobile">
          <div v-for="order in orders" :key="order.id" class="order-card card" style="padding:1.25rem">
            <div class="order-card__header">
              <strong class="order-card__num">{{ order.order_number }}</strong>
              <span :class="`status status-${order.status}`">{{ order.status }}</span>
            </div>
            <div class="order-card__body">
              <div class="order-card__row">
                <span>Date</span>
                <span>{{ formatDate(order.created_at) }}</span>
              </div>
              <div class="order-card__row">
                <span>Items</span>
                <span>{{ order.items_count }} item(s)</span>
              </div>
              <div class="order-card__row">
                <span>Total</span>
                <strong>${{ order.total.toFixed(2) }}</strong>
              </div>
            </div>
            <RouterLink :to="`/orders/${order.order_number}`" class="btn btn-outline btn-sm btn-full" style="margin-top:.75rem">
              View Details
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </RouterLink>
          </div>
        </div>

        <!-- Desktop table -->
        <div class="card orders-table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td><strong>{{ order.order_number }}</strong></td>
                <td>{{ formatDate(order.created_at) }}</td>
                <td>{{ order.items_count }} item(s)</td>
                <td><strong>${{ order.total.toFixed(2) }}</strong></td>
                <td><span :class="`status status-${order.status}`">{{ order.status }}</span></td>
                <td><span :class="`status status-${order.payment_status}`">{{ order.payment_status }}</span></td>
                <td>
                  <RouterLink :to="`/orders/${order.order_number}`" class="btn btn-outline btn-sm">
                    View
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const orders  = ref([])
const loading = ref(true)

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(async () => {
  const { data } = await api.get('/orders')
  orders.value   = data.data
  loading.value  = false
})
</script>

<style scoped>
.orders-mobile { display: none; }
.order-card__header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: .75rem;
}
.order-card__num { font-size: 1rem; }
.order-card__row {
  display: flex; justify-content: space-between;
  font-size: .875rem; padding: .35rem 0;
  color: var(--gray-600);
}
.order-card__row strong { color: var(--gray-900); }

.orders-table-wrap { overflow-x: auto; }
.empty-icon-wrap {
  width: 80px; height: 80px; border-radius: 50%;
  background: var(--gray-100); display: grid; place-items: center;
  margin: 0 auto 1rem; color: var(--gray-300);
}

@media (max-width: 768px) {
  .orders-mobile { display: flex; flex-direction: column; gap: .75rem; }
  .orders-table-wrap { display: none; }
}
</style>
