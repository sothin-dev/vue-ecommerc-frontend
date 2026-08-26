<script setup>
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const icons = {
  success: 'M5 13l4 4L19 7',
  error:   'M6 18L18 6M6 6l12 12',
  info:    'M13 16h-1v-4h-1m1-4h.01M12 3l9.66 16.5H2.34L12 3z'
}

const styles = {
  success: 'bg-white border-emerald-200 text-emerald-600',
  error:   'bg-white border-red-200 text-red-600',
  info:    'bg-white border-sky-200 text-sky-600'
}
</script>

<template>
  <div class="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2">
    <TransitionGroup name="slide-up">
      <div
        v-for="t in toast.toasts"
        :key="t.id"
        class="pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg"
        :class="styles[t.type] || styles.info"
      >
        <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" :d="icons[t.type] || icons.info" />
        </svg>
        <p class="flex-1 text-sm font-medium text-gray-800">{{ t.message }}</p>
        <button class="text-gray-400 hover:text-gray-600" @click="toast.dismiss(t.id)">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
