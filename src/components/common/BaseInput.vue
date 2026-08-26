<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  error: String,
  hint: String,
  required: Boolean,
  disabled: Boolean,
  autocomplete: String
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-gray-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="block w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500"
      :class="error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error" class="mt-1.5 text-xs text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>
