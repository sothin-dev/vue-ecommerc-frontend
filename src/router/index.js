import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Public
  { path: '/',                  name: 'Home',        component: () => import('@/views/HomePage.vue') },
  { path: '/products',          name: 'Products',    component: () => import('@/views/product/ProductList.vue') },
  { path: '/products/:slug',    name: 'ProductDetail', component: () => import('@/views/product/ProductDetail.vue') },
  { path: '/search',            name: 'Search',      component: () => import('@/views/product/ProductList.vue') },
  { path: '/login',             name: 'Login',       component: () => import('@/views/auth/LoginPage.vue'),    meta: { guest: true } },
  { path: '/register',          name: 'Register',    component: () => import('@/views/auth/RegisterPage.vue'), meta: { guest: true } },

  // Protected
  { path: '/wishlist',          name: 'Wishlist',    component: () => import('@/views/wishlist/WishlistPage.vue'), meta: { auth: true } },
  { path: '/cart',              name: 'Cart',        component: () => import('@/views/cart/CartPage.vue'),         meta: { auth: true } },
  { path: '/checkout',          name: 'Checkout',    component: () => import('@/views/cart/CheckoutPage.vue'),     meta: { auth: true } },
  { path: '/orders',            name: 'Orders',      component: () => import('@/views/order/OrderHistory.vue'),    meta: { auth: true } },
  { path: '/orders/:number',    name: 'OrderDetail', component: () => import('@/views/order/OrderDetail.vue'),     meta: { auth: true } },
  { path: '/profile',           name: 'Profile',     component: () => import('@/views/profile/ProfilePage.vue'),   meta: { auth: true } },

  // 404
  { path: '/:pathMatch(.*)*',   name: 'NotFound',    component: () => import('@/views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.auth && !auth.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guest && auth.isLoggedIn) {
    return { name: 'Home' }
  }
})

export default router
