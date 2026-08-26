<script setup>
defineProps({
  title: String,
  description: String
})
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-300">
      <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4l-2 3h-4l-2-3H4" />
      </svg>
    </div>
    <h3 class="mt-4 text-base font-semibold text-gray-900">{{ title || 'Nothing here yet' }}</h3>
    <p v-if="description || $slots.default" class="mt-1 max-w-sm text-sm text-gray-500">
      {{ description }} <slot />
    </p>
  </div>
</template>
