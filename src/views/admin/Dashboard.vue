<script setup>
import { ref, onMounted } from 'vue'
import { adminService } from '@/services/admin.service'
import { formatCurrency, formatDate } from '@/composables/useFormat'
import StatusBadge from '@/components/common/StatusBadge.vue'
import StatCard from '@/components/admin/StatCard.vue'
import BarChart from '@/components/admin/BarChart.vue'
import DoughnutChart from '@/components/admin/DoughnutChart.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'

const data = ref(null)
const loading = ref(true)
const error = ref(null)

const STATUS_CHART_COLORS = {
  pending:    '#f59e0b',
  confirmed:  '#0ea5e9',
  processing: '#8b5cf6',
  shipped:    '#3b82f6',
  delivered:  '#10b981',
  cancelled:  '#ef4444'
}

onMounted(async () => {
  try {
    const res = await adminService.dashboard()
    data.value = res.data.data
  } catch (e) {
    error.value = 'Failed to load dashboard.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
    <p class="mt-0.5 text-sm text-gray-500">Overview of your store's performance</p>

    <LoadingSpinner v-if="loading" size="lg" />
    <div v-else-if="error" class="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">{{ error }}</div>

    <template v-else-if="data">
      <!-- Stats grid -->
      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Revenue (Total)" :value="formatCurrency(data.stats.revenue_total)"
          :sub="`${formatCurrency(data.stats.revenue_today)} today`" tone="primary"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatCard title="Orders" :value="data.stats.total_orders"
          :sub="`${formatCurrency(data.stats.avg_order_value)} avg. order`" tone="sky"
          icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        <StatCard title="Customers" :value="data.stats.total_users" sub="Registered accounts" tone="violet"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        <StatCard title="Products" :value="data.stats.total_products"
          :sub="`${data.stats.total_categories} categories`" tone="amber"
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </div>

      <!-- Charts row -->
      <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card lg:col-span-2">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-gray-900">Revenue — Last 7 Days</h2>
            <p class="text-xs text-gray-400">{{ formatCurrency(data.stats.revenue_month) }} this month</p>
          </div>
          <BarChart
            class="mt-5"
            :labels="data.chart.map(c => c.label)"
            :values="data.chart.map(c => c.revenue)"
            :format-value="v => formatCurrency(v)"
          />
        </div>

        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <h2 class="text-sm font-bold text-gray-900">Order Status</h2>
          <div class="mt-5">
            <DoughnutChart :data="data.status_counts" :colors="STATUS_CHART_COLORS" />
          </div>
        </div>
      </div>

      <!-- Second row -->
      <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Recent orders -->
        <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
          <div class="flex items-center justify-between border-b border-gray-50 px-6 py-4">
            <h2 class="text-sm font-bold text-gray-900">Recent Orders</h2>
            <RouterLink to="/admin/orders" class="text-xs font-semibold text-primary-600 hover:underline">View all</RouterLink>
          </div>
          <ul class="divide-y divide-gray-50">
            <li v-for="o in data.recent_orders" :key="o.id" class="flex items-center gap-3 px-6 py-3.5">
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-gray-900">#{{ o.order_number }}</p>
                <p class="truncate text-xs text-gray-400">{{ o.customer?.name || 'Guest' }} · {{ formatDate(o.created_at) }}</p>
              </div>
              <span class="text-sm font-bold text-gray-900">{{ formatCurrency(o.total) }}</span>
              <StatusBadge :status="o.status" />
            </li>
            <li v-if="!data.recent_orders.length" class="px-6 py-8 text-center text-sm text-gray-400">No orders yet</li>
          </ul>
        </div>

        <!-- Top products -->
        <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
          <div class="border-b border-gray-50 px-6 py-4">
            <h2 class="text-sm font-bold text-gray-900">Best Sellers</h2>
          </div>
          <ul class="divide-y divide-gray-50">
            <li v-for="(p, i) in data.top_products" :key="p.id" class="flex items-center gap-4 px-6 py-3.5">
              <span class="w-5 text-center text-sm font-extrabold text-gray-300">{{ i + 1 }}</span>
              <img v-if="p.image_url" :src="p.image_url" class="h-10 w-10 rounded-lg object-cover" alt="" />
              <div v-else class="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <ImagePlaceholder type="product" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-gray-900">{{ p.name }}</p>
                <p class="text-xs text-gray-400">{{ p.total_qty }} sold · {{ formatCurrency(p.total_revenue) }}</p>
              </div>
            </li>
            <li v-if="!data.top_products.length" class="px-6 py-8 text-center text-sm text-gray-400">No sales yet</li>
          </ul>
        </div>
      </div>

      <!-- Third row: low stock + top categories + reviews -->
      <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Low stock -->
        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <h2 class="text-sm font-bold text-gray-900">Low Stock Alerts</h2>
          <ul class="mt-4 space-y-3">
            <li v-for="p in data.low_stock_products" :key="p.id" class="flex items-center gap-3">
              <img v-if="p.image_url" :src="p.image_url" class="h-9 w-9 rounded-lg object-cover" alt="" />
              <div v-else class="h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                <ImagePlaceholder type="product" />
              </div>
              <p class="min-w-0 flex-1 truncate text-sm text-gray-800">{{ p.name }}</p>
              <span class="rounded-full px-2 py-0.5 text-xs font-bold"
                :class="p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 2 ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'">
                {{ p.stock }}
              </span>
            </li>
            <li v-if="!data.low_stock_products.length" class="py-4 text-center text-sm text-gray-400">All good!</li>
          </ul>
        </div>

        <!-- Top categories -->
        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <h2 class="text-sm font-bold text-gray-900">Top Categories</h2>
          <ul class="mt-4 space-y-3.5">
            <li v-for="c in data.top_categories" :key="c.id">
              <div class="mb-1 flex items-center justify-between text-sm">
                <span class="font-medium text-gray-700">{{ c.name }}</span>
                <span class="font-bold text-gray-900">{{ formatCurrency(c.total_revenue) }}</span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div class="h-full rounded-full bg-primary-500 transition-all duration-500"
                  :style="{ width: `${Math.min(100, (c.total_revenue / (Math.max(...data.top_categories.map(x => x.total_revenue), 1)) * 100))}%` }" />
              </div>
            </li>
          </ul>
        </div>

        <!-- Latest reviews -->
        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-gray-900">Latest Reviews</h2>
            <RouterLink to="/admin/reviews" class="text-xs font-semibold text-primary-600 hover:underline">Moderate</RouterLink>
          </div>
          <ul class="mt-4 space-y-4">
            <li v-for="r in data.latest_reviews" :key="r.id">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-amber-500">{{ '★'.repeat(r.rating) }}</span>
                <span class="truncate text-xs font-medium text-gray-600">{{ r.user_name }}</span>
                <span v-if="!r.is_approved" class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">pending</span>
              </div>
              <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{{ r.comment }}</p>
            </li>
            <li v-if="!data.latest_reviews.length" class="py-4 text-center text-sm text-gray-400">No reviews yet</li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>
