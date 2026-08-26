<script setup>
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

defineProps({
  open: Boolean,
  title: { type: String, default: 'Are you sure?' },
  message: String,
  confirmText: { type: String, default: 'Confirm' },
  danger: Boolean,
  loading: Boolean
})

const emit = defineEmits(['confirm', 'close'])
</script>

<template>
  <BaseModal :open="open" size="sm" @close="!loading && emit('close')">
    <div class="flex items-start gap-4">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        :class="danger ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3l9.66 16.5H2.34L12 3z" />
        </svg>
      </div>
      <div>
        <h3 class="font-semibold text-gray-900">{{ title }}</h3>
        <p class="mt-1 text-sm text-gray-500">{{ message }}</p>
      </div>
    </div>
    <template #footer>
      <BaseButton variant="outline" :disabled="loading" @click="emit('close')">Cancel</BaseButton>
      <BaseButton :variant="danger ? 'danger' : 'primary'" :loading="loading" @click="emit('confirm')">
        {{ confirmText }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
