import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useCartStore = defineStore('cart', () => {
  const items    = ref([])
  const subtotal = ref(0)
  const loading  = ref(false)

  const count = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))

  async function fetchCart() {
    loading.value = true
    try {
      const { data } = await api.get('/cart')
      items.value    = data.data
      subtotal.value = data.subtotal
    } finally {
      loading.value = false
    }
  }

  async function addToCart(productId, quantity = 1, variantId = null) {
    const payload = { product_id: productId, quantity }
    if (variantId) payload.variant_id = variantId
    await api.post('/cart', payload)
    await fetchCart()
  }

  async function updateItem(id, quantity) {
    await api.patch(`/cart/${id}`, { quantity })
    await fetchCart()
  }

  async function removeItem(id) {
    await api.delete(`/cart/${id}`)
    await fetchCart()
  }

  async function clearCart() {
    await api.delete('/cart')
    items.value    = []
    subtotal.value = 0
  }

  function reset() {
    items.value    = []
    subtotal.value = 0
  }

  return { items, subtotal, count, loading, fetchCart, addToCart, updateItem, removeItem, clearCart, reset }
})
