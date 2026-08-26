<script setup>
defineProps({
  status: { type: String, required: true },
  colors: { type: Object, default: null }
})

const defaults = {
  pending:    'bg-amber-100 text-amber-800 ring-amber-200',
  confirmed:  'bg-sky-100 text-sky-800 ring-sky-200',
  processing: 'bg-violet-100 text-violet-800 ring-violet-200',
  shipped:    'bg-blue-100 text-blue-800 ring-blue-200',
  delivered:  'bg-emerald-100 text-emerald-800 ring-emerald-200',
  cancelled:  'bg-red-100 text-red-800 ring-red-200',
  paid:       'bg-emerald-100 text-emerald-800 ring-emerald-200',
  unpaid:     'bg-gray-100 text-gray-700 ring-gray-200',
  active:     'bg-emerald-100 text-emerald-800 ring-emerald-200',
  inactive:   'bg-gray-100 text-gray-600 ring-gray-200',
  approved:   'bg-emerald-100 text-emerald-800 ring-emerald-200',
  hidden:     'bg-gray-100 text-gray-600 ring-gray-200',
  expired:    'bg-red-100 text-red-800 ring-red-200'
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset"
    :class="(colors && colors[status]) || defaults[status] || 'bg-gray-100 text-gray-700 ring-gray-200'"
  >
    {{ status.replace(/_/g, ' ') }}
  </span>
</template>
