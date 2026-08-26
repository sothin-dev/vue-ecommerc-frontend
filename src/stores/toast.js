import { defineStore } from 'pinia'
import { ref } from 'vue'

let nextId = 1

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function push(type, message, timeout = 3500) {
    const id = nextId++
    toasts.value.push({ id, type, message })
    setTimeout(() => dismiss(id), timeout)
    return id
  }

  function success(message) { return push('success', message) }
  function error(message)   { return push('error', message, 5000) }
  function info(message)    { return push('info', message) }

  function dismiss(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, push, success, error, info, dismiss }
})
