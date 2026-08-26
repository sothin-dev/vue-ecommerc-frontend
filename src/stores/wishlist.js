import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useWishlistStore = defineStore('wishlist', () => {
  const items   = ref([])
  const ids     = ref([])
  const loading = ref(false)

  async function fetchWishlist() {
    loading.value = true
    try {
      const { data } = await api.get('/wishlist')
      items.value = data.data
      ids.value   = data.data.map(p => p.product_id)
    } finally {
      loading.value = false
    }
  }

  async function toggle(productId) {
    await api.post(`/wishlist/${productId}`)
    await fetchWishlist()
  }

  function isInWishlist(productId) {
    return ids.value.includes(Number(productId))
  }

  function reset() {
    items.value = []
    ids.value   = []
  }

  return { items, ids, loading, fetchWishlist, toggle, isInWishlist, reset }
})
