<script setup>
defineProps({
  open: Boolean,
  title: String,
  size: { type: String, default: 'md' } // sm | md | lg
})

const emit = defineEmits(['close'])

const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl' }
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm" @click="emit('close')" />
    </Transition>
    <Transition name="scale">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <div
          :class="widths[size]"
          class="flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <!-- Header (always visible) -->
          <div class="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
            <button class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" @click="emit('close')">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body (scrolls when tall) -->
          <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <slot />
          </div>

          <!-- Footer (always visible) -->
          <div v-if="$slots.footer" class="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
