<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  lastPage: { type: Number, required: true },
  total: { type: Number, default: 0 }
})

const emit = defineEmits(['change'])

const visiblePages = computed(() => {
  const range = []
  const start = Math.max(1, props.currentPage - 1)
  const end = Math.min(props.lastPage, props.currentPage + 1)
  for (let i = start; i <= end; i++) range.push(i)
  return range
})
</script>

<template>
  <nav v-if="lastPage > 1" class="flex items-center justify-between gap-4" aria-label="Pagination">
    <p class="hidden text-sm text-gray-500 sm:block">
      Page <span class="font-medium">{{ currentPage }}</span> of {{ lastPage }}
      <span v-if="total"> · {{ total }} results</span>
    </p>
    <div class="flex items-center gap-1">
      <button
        :disabled="currentPage <= 1"
        class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
        @click="emit('change', currentPage - 1)"
      >
        Previous
      </button>
      <button
        v-for="p in visiblePages"
        :key="p"
        class="min-w-[36px] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        :class="p === currentPage ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
        @click="emit('change', p)"
      >
        {{ p }}
      </button>
      <button
        :disabled="currentPage >= lastPage"
        class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
        @click="emit('change', currentPage + 1)"
      >
        Next
      </button>
    </div>
  </nav>
</template>
