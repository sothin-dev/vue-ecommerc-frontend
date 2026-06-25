import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref([])

  const ids = computed(() => new Set(items.value.map(i => i.product_id)))

  function isWishlisted(productId) {
    return ids.value.has(productId)
  }

  async function fetchWishlist() {
    const { data } = await api.get('/wishlist')
    items.value = data.data
  }

  async function toggle(productId) {
    const { data } = await api.post(`/wishlist/${productId}`)
    if (data.wishlisted) {
      await fetchWishlist()
    } else {
      items.value = items.value.filter(i => i.product_id !== productId)
    }
    return data.wishlisted
  }

  function reset() {
    items.value = []
  }

  return { items, ids, isWishlisted, fetchWishlist, toggle, reset }
})
