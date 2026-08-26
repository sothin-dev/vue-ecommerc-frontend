<script setup>
import { ref, onMounted, watch } from 'vue'
import { adminService } from '@/services/admin.service'
import { formatCurrency } from '@/composables/useFormat'
import StatCard from '@/components/admin/StatCard.vue'
import BarChart from '@/components/admin/BarChart.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'

const days = ref(30)
const data = ref(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await adminService.reportSummary(days.value)
    data.value = res.data.data
  } catch (_) {} finally {
    loading.value = false
  }
}

onMounted(load)
watch(days, load)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Reports</h1>
        <p class="mt-0.5 text-sm text-gray-500">Sales performance and trends</p>
      </div>
      <select v-model="days"
        class="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-primary-500 focus:outline-none">
        <option :value="7">Last 7 days</option>
        <option :value="30">Last 30 days</option>
        <option :value="90">Last 90 days</option>
        <option :value="365">Last 365 days</option>
      </select>
    </div>

    <div v-if="loading" class="py-12 text-center text-sm text-gray-400">Loading report…</div>

    <template v-else-if="data">
      <!-- KPIs -->
      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Revenue" :value="formatCurrency(data.revenue)" :sub="`${days} day period`"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatCard title="Orders" :value="data.orders_count" tone="sky" icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        <StatCard title="Avg Order Value" :value="formatCurrency(data.avg_order_value)" tone="emerald"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        <StatCard title="New Customers" :value="data.new_customers" :sub="`${data.repeat_customers} repeat buyers`" tone="amber"
          icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </div>

      <!-- Revenue chart -->
      <div class="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <h2 class="text-sm font-bold text-gray-900">Daily Revenue</h2>
        <BarChart
          class="mt-5"
          :labels="data.series.map(s => s.label)"
          :values="data.series.map(s => s.revenue)"
          :format-value="v => formatCurrency(v)"
        />
      </div>

      <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Top products -->
        <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
          <h2 class="border-b border-gray-50 px-6 py-4 text-sm font-bold text-gray-900">Top Products (by revenue)</h2>
          <ul class="divide-y divide-gray-50">
            <li v-for="(p, i) in data.top_products" :key="p.id" class="flex items-center gap-4 px-6 py-3.5">
              <span class="w-5 text-center text-sm font-extrabold text-gray-300">{{ i + 1 }}</span>
              <img v-if="p.image_url" :src="p.image_url" class="h-10 w-10 rounded-lg object-cover" alt="" />
              <div v-else class="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <ImagePlaceholder type="product" />
              </div>
              <p class="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{{ p.name }}</p>
              <div class="text-right">
                <p class="text-sm font-bold text-gray-900">{{ formatCurrency(p.total_revenue) }}</p>
                <p class="text-xs text-gray-400">{{ p.total_qty }} sold</p>
              </div>
            </li>
            <li v-if="!data.top_products.length" class="px-6 py-8 text-center text-sm text-gray-400">No sales in this period</li>
          </ul>
        </div>

        <!-- Top categories -->
        <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
          <h2 class="border-b border-gray-50 px-6 py-4 text-sm font-bold text-gray-900">Top Categories (by revenue)</h2>
          <ul class="divide-y divide-gray-50">
            <li v-for="(c, i) in data.top_categories" :key="c.id" class="flex items-center gap-4 px-6 py-3.5">
              <span class="w-5 text-center text-sm font-extrabold text-gray-300">{{ i + 1 }}</span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-gray-900">{{ c.name }}</p>
                <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div class="h-full rounded-full bg-primary-500 transition-all duration-500"
                    :style="{ width: `${Math.min(100, c.total_revenue / Math.max(...data.top_categories.map(x => x.total_revenue), 1) * 100)}%` }" />
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-gray-900">{{ formatCurrency(c.total_revenue) }}</p>
                <p class="text-xs text-gray-400">{{ c.total_sold }} sold</p>
              </div>
            </li>
            <li v-if="!data.top_categories.length" class="px-6 py-8 text-center text-sm text-gray-400">No sales in this period</li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>
