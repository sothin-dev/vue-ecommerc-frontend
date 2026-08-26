<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import ToastContainer from '@/components/common/ToastContainer.vue'

const auth = useAuthStore()
const cart = useCartStore()
const wishlist = useWishlistStore()

onMounted(() => {
  if (auth.isLoggedIn) {
    // Validate the stored token on boot — clears stale/expired sessions
    auth.fetchProfile().catch(() => {
      auth.clearAuth()
      cart.reset()
      wishlist.reset()
    })
    cart.fetchCart().catch(() => {})
    wishlist.fetchWishlist().catch(() => {})
  }
})
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>
