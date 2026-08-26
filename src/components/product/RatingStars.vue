<script setup>
import { computed } from 'vue'

const props = defineProps({
  rating: { type: Number, default: 0 },
  count: { type: Number, default: 0 },
  size: { type: String, default: 'sm' }
})

const stars = computed(() => {
  return Array.from({ length: 5 }, (_, i) => {
    const diff = props.rating - i
    if (diff >= 1) return 'full'
    if (diff > 0) return 'half'
    return 'empty'
  })
})
</script>

<template>
  <div class="flex items-center gap-1">
    <div class="flex" :class="size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'">
      <svg
        v-for="(star, i) in stars"
        :key="i"
        viewBox="0 0 20 20"
        class="w-full"
        :class="star === 'empty' ? 'text-gray-200' : 'text-amber-400'"
        fill="currentColor"
      >
        <defs v-if="star === 'half'">
          <linearGradient :id="`half-${i}-${Math.round(rating * 10)}`">
            <stop offset="50%" stop-color="currentColor" />
            <stop offset="50%" stop-color="#e5e7eb" />
          </linearGradient>
        </defs>
        <path
          :fill="star === 'half' ? `url(#half-${i}-${Math.round(rating * 10)})` : undefined"
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.358 2.44a1 1 0 00-.364 1.118l1.287 3.95c.3.922-.755 1.688-1.539 1.118l-3.357-2.44a1 1 0 00-1.176 0l-3.357 2.44c-.783.57-1.838-.196-1.538-1.118l1.286-3.95a1 1 0 00-.364-1.118L2.075 9.377c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.95z"
        />
      </svg>
    </div>
    <span v-if="count > 0 || rating" class="text-xs text-gray-500" :class="size !== 'sm' && 'text-sm'">
      {{ rating ? rating.toFixed(1) : '' }} {{ count ? `(${count})` : '' }}
    </span>
  </div>
</template>
