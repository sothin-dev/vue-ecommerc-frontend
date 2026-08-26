<script setup>
defineProps({
  // product | category | user | cart
  type: { type: String, default: 'product' },
  label: { type: String, default: '' }
})

const icons = {
  product: {
    d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    gradient: 'from-primary-50 via-primary-50 to-indigo-100',
    icon: 'text-primary-300'
  },
  category: {
    d: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
    gradient: 'from-amber-50 via-orange-50 to-amber-100',
    icon: 'text-amber-400'
  },
  user: {
    d: 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z',
    gradient: 'from-sky-50 via-sky-50 to-blue-100',
    icon: 'text-sky-300'
  },
  cart: {
    d: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
    gradient: 'from-violet-50 via-violet-50 to-purple-100',
    icon: 'text-violet-300'
  }
}
</script>

<template>
  <div
    class="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br"
    :class="icons[type].gradient"
    :title="label || undefined"
  >
    <svg class="h-1/3 max-h-10 w-auto" :class="icons[type].icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.4">
      <path stroke-linecap="round" stroke-linejoin="round" :d="icons[type].d" />
    </svg>
    <span v-if="label" class="px-2 text-center text-[10px] font-medium uppercase tracking-wide text-gray-400">
      {{ label }}
    </span>
  </div>
</template>
