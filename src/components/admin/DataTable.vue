<script setup>
import { computed, useSlots, Comment } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true }, // [{ key, label, class? }]
  loading: Boolean,
  emptyText: { type: String, default: 'No records found.' }
})

const slots = useSlots()

/**
 * Count actual row vnodes, unwrapping <template v-for> fragments
 * so the empty state only shows when there are truly no rows.
 */
const rowCount = computed(() => {
  const children = slots.default?.() ?? []
  return children
    .flatMap(child => (child && Array.isArray(child.children) ? child.children : [child]))
    .filter(node => node && node.type !== Comment).length
})
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-100 text-sm">
        <thead>
          <tr class="bg-gray-50/60">
            <th v-for="col in columns" :key="col.key" scope="col"
              class="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              :class="col.class">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-4 py-12">
              <div class="flex justify-center">
                <svg class="h-6 w-6 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
            </td>
          </tr>
          <tr v-else-if="rowCount === 0">
            <td :colspan="columns.length" class="px-4 py-12 text-center text-sm text-gray-400">{{ emptyText }}</td>
          </tr>
          <slot v-else />
        </tbody>
      </table>
    </div>
  </div>
</template>
