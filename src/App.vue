<template>
  <div id="app">
    <TheNavbar />
    <main>
      <RouterView />
    </main>
    <TheFooter />
  </div>
</template>

<script setup>
import TheNavbar from '@/components/layout/TheNavbar.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import { useAuthStore }     from '@/stores/auth'
import { useCartStore }     from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { onMounted }        from 'vue'

const auth     = useAuthStore()
const cart     = useCartStore()
const wishlist = useWishlistStore()

onMounted(async () => {
  if (auth.isLoggedIn) {
    cart.fetchCart()
    wishlist.fetchWishlist()
  }
})
</script>
