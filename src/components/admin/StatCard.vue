<script setup>
defineProps({
  title: String,
  value: String,
  sub: String,
  icon: String,
  tone: { type: String, default: 'primary' } // primary | amber | emerald | sky | violet
})

const tones = {
  primary: 'bg-primary-50 text-primary-600',
  amber:   'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  sky:     'bg-sky-50 text-sky-600',
  violet:  'bg-violet-50 text-violet-600'
}
</script>

<template>
  <div class="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
    <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" :class="tones[tone]">
      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" :d="icon" />
      </svg>
    </span>
    <div class="min-w-0">
      <p class="truncate text-xs font-medium uppercase tracking-wide text-gray-400">{{ title }}</p>
      <p class="text-xl font-extrabold tracking-tight text-gray-900">{{ value }}</p>
      <p v-if="sub" class="truncate text-xs text-gray-400">{{ sub }}</p>
    </div>
  </div>
</template>
