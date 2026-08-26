<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, required: true }, // { status: count }
  colors: { type: Object, required: true }
})

const entries = computed(() => {
  const list = Object.entries(props.data).map(([label, value]) => ({ label, value: Number(value) }))
  const total = list.reduce((s, e) => s + e.value, 0) || 1

  const R = 60
  const C = 2 * Math.PI * R
  let offset = 0

  return list.map(e => {
    const frac = e.value / total
    const seg = { ...e, pct: Math.round(frac * 100), dasharray: `${frac * C} ${C}`, offset }
    offset -= frac * C
    return seg
  })
})

const total = computed(() => Object.values(props.data).reduce((s, v) => s + Number(v), 0))

function colorFor(label) {
  return props.colors[label] || '#9ca3af'
}
</script>

<template>
  <div class="flex items-center gap-6">
    <svg viewBox="0 0 160 160" class="h-36 w-36 shrink-0 -rotate-90">
      <circle cx="80" cy="80" :r="60" fill="none" stroke="#f3f4f6" stroke-width="22" />
      <circle
        v-for="(seg, i) in entries"
        :key="seg.label"
        cx="80" cy="80" r="60"
        fill="none"
        :stroke="colorFor(seg.label)"
        stroke-width="22"
        :stroke-dasharray="seg.dasharray"
        :stroke-dashoffset="seg.offset"
        stroke-linecap="butt"
      />
    </svg>
    <ul class="min-w-0 flex-1 space-y-2">
      <li v-for="seg in entries" :key="seg.label" class="flex items-center gap-2.5">
        <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: colorFor(seg.label) }" />
        <span class="flex-1 truncate text-xs font-medium capitalize text-gray-600">{{ seg.label }}</span>
        <span class="text-xs font-bold text-gray-900">{{ seg.value }}</span>
        <span class="text-[10px] text-gray-400">({{ seg.pct }}%)</span>
      </li>
      <li v-if="!entries.length" class="text-xs text-gray-400">No orders yet</li>
    </ul>
  </div>
</template>
