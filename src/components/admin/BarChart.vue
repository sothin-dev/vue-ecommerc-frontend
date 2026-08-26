<script setup>
import { computed } from 'vue'

const props = defineProps({
  labels: { type: Array, required: true },
  values: { type: Array, required: true },
  color: { type: String, default: '#4f46e5' },
  formatValue: { type: Function, default: v => v }
})

const max = computed(() => Math.max(...props.values, 1))
const points = computed(() =>
  props.values.map((v, i) => ({
    x: (i + 0.5) / props.values.length,
    h: v / max.value
  }))
)
</script>

<template>
  <div class="flex h-44 items-end gap-2 sm:gap-3">
    <div v-for="(p, i) in points" :key="i" class="group relative flex flex-1 flex-col items-center justify-end self-stretch">
      <!-- Tooltip -->
      <div class="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs text-white group-hover:block">
        {{ labels[i] }}: {{ formatValue(values[i]) }}
      </div>
      <div
        class="w-full rounded-t-md transition-all duration-300 hover:opacity-80"
        :style="{
          height: `${Math.max(p.h * 100, values[i] > 0 ? 3 : 1)}%`,
          backgroundColor: color,
          opacity: 0.55 + p.h * 0.45
        }"
      />
      <span class="mt-1.5 truncate text-[10px] font-medium text-gray-400">{{ labels[i] }}</span>
    </div>
  </div>
</template>
