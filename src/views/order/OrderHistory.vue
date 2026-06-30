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
          <img src="https://images.unsplash.com/photo-1574629810360-0f8b3f2bd956?w=100&q=80&auto=format&fit=crop" alt="No orders" class="empty-icon-img" />
        </div>
        <h2>No orders yet</h2>
        <p>Place your first order and your gear journey begins.</p>
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

        <!-- Pagination -->
        <div class="pagination pagination-top" v-if="meta.last_page > 1">
          <button :disabled="meta.current_page === 1" @click="changePage(meta.current_page - 1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button v-for="p in pagesRange" :key="p" :class="{ active: p === meta.current_page }" @click="changePage(p)">{{ p }}</button>
          <button :disabled="meta.current_page === meta.last_page" @click="changePage(meta.current_page + 1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
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

        <!-- Pagination (bottom) -->
        <div class="pagination pagination-bottom" v-if="meta.last_page > 1">
          <button :disabled="meta.current_page === 1" @click="changePage(meta.current_page - 1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button v-for="p in pagesRange" :key="p" :class="{ active: p === meta.current_page }" @click="changePage(p)">{{ p }}</button>
          <button :disabled="meta.current_page === meta.last_page" @click="changePage(meta.current_page + 1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const orders  = ref([])
const meta    = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)

const pagesRange = computed(() => {
  const { current_page: cur, last_page: last } = meta.value
  const range = []
  for (let p = Math.max(1, cur - 2); p <= Math.min(last, cur + 2); p++) range.push(p)
  return range
})

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function fetchOrders(page = 1) {
  loading.value = true
  try {
    const { data } = await api.get('/orders', { params: { page, per_page: 10 } })
    orders.value   = data.data
    meta.value     = data.meta
  } catch (e) {
    console.error('Failed to fetch orders', e)
  } finally {
    loading.value = false
  }
}

function changePage(p) {
  fetchOrders(p)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => fetchOrders())
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
  width: 96px; height: 96px; border-radius: 50%; overflow: hidden;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  display: grid; place-items: center;
  margin: 0 auto 1rem; color: var(--gray-300);
  box-shadow: 0 4px 12px rgba(34,197,94,.15);
}
.empty-icon-img {
  width: 100%; height: 100%; object-fit: cover;
}

.pagination {
  display: flex; align-items: center; justify-content: center; gap: .35rem;
  flex-wrap: wrap;
}
.pagination-top { margin-bottom: 1rem; }
.pagination-bottom { margin-top: 1.5rem; }
.pagination button {
  width: 36px; height: 36px; border-radius: var(--radius);
  border: 1px solid var(--gray-200); background: #fff;
  color: var(--gray-600); font-size: .875rem; font-weight: 600;
  cursor: pointer; transition: all .2s;
  display: grid; place-items: center;
}
.pagination button:hover:not(:disabled) {
  border-color: var(--primary); color: var(--primary);
  background: var(--primary-50);
}
.pagination button.active {
  background: var(--primary); color: #fff; border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(37,99,235,.25);
}
.pagination button:disabled {
  opacity: .35; cursor: not-allowed;
}

@media (max-width: 768px) {
  .orders-mobile { display: flex; flex-direction: column; gap: .75rem; }
  .orders-table-wrap { display: none; }
  .pagination-top { display: none; }
}
</style>
