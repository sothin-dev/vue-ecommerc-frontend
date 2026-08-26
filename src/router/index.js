import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAdminAuthStore } from '@/stores/adminAuth'

const routes = [
  // ── Customer ──────────────────────────────────────────────
  {
    path: '/',
    component: () => import('@/layouts/CustomerLayout.vue'),
    children: [
      { path: '',                    name: 'Home',          component: () => import('@/views/customer/Home.vue') },
      { path: 'products',            name: 'Products',      component: () => import('@/views/customer/Products.vue') },
      { path: 'products/:slug',      name: 'ProductDetail', component: () => import('@/views/customer/ProductDetails.vue') },
      { path: 'categories',          name: 'Categories',    component: () => import('@/views/customer/Categories.vue') },
      { path: 'category/:slug',      name: 'CategoryProducts', component: () => import('@/views/customer/Products.vue') },
      { path: 'search',              name: 'Search',        component: () => import('@/views/customer/Products.vue') },
      { path: 'cart',                name: 'Cart',          component: () => import('@/views/customer/Cart.vue'),       meta: { auth: true } },
      { path: 'checkout',            name: 'Checkout',      component: () => import('@/views/customer/Checkout.vue'),   meta: { auth: true } },
      { path: 'wishlist',            name: 'Wishlist',      component: () => import('@/views/customer/Wishlist.vue'),   meta: { auth: true } },
      { path: 'orders',              name: 'Orders',        component: () => import('@/views/customer/Orders.vue'),     meta: { auth: true } },
      { path: 'orders/:number',      name: 'OrderDetail',   component: () => import('@/views/customer/OrderDetails.vue'), meta: { auth: true } },
      { path: 'profile',             name: 'Profile',       component: () => import('@/views/customer/Profile.vue'),    meta: { auth: true } }
    ]
  },

  // ── Customer auth (standalone layout) ────────────────────
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: 'login',               name: 'Login',         component: () => import('@/views/customer/auth/Login.vue'),     meta: { guest: true } },
      { path: 'register',            name: 'Register',      component: () => import('@/views/customer/auth/Register.vue'),  meta: { guest: true } },
      { path: 'forgot-password',     name: 'ForgotPassword', component: () => import('@/views/customer/auth/ForgotPassword.vue'), meta: { guest: true } },
      { path: 'reset-password',      name: 'ResetPassword', component: () => import('@/views/customer/auth/ResetPassword.vue'), meta: { guest: true } }
    ]
  },

  // ── Admin ─────────────────────────────────────────────────
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/Login.vue')
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { admin: true },
    children: [
      { path: '',             name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'products',     name: 'AdminProducts',   component: () => import('@/views/admin/Products.vue') },
      { path: 'categories',   name: 'AdminCategories', component: () => import('@/views/admin/Categories.vue') },
      { path: 'orders',       name: 'AdminOrders',     component: () => import('@/views/admin/Orders.vue') },
      { path: 'customers',    name: 'AdminCustomers',  component: () => import('@/views/admin/Customers.vue') },
      { path: 'inventory',    name: 'AdminInventory',  component: () => import('@/views/admin/Inventory.vue') },
      { path: 'coupons',      name: 'AdminCoupons',    component: () => import('@/views/admin/Coupons.vue') },
      { path: 'reviews',      name: 'AdminReviews',    component: () => import('@/views/admin/Reviews.vue') },
      { path: 'reports',      name: 'AdminReports',    component: () => import('@/views/admin/Reports.vue') },
      { path: 'settings',     name: 'AdminSettings',   component: () => import('@/views/admin/Settings.vue') }
    ]
  },

  // ── 404 ───────────────────────────────────────────────────
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/customer/NotFound.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const adminAuth = useAdminAuthStore()

  if (to.meta.admin && to.name !== 'AdminLogin' && !adminAuth.isLoggedIn) {
    return { name: 'AdminLogin', query: { redirect: to.fullPath } }
  }

  if (to.meta.auth && !auth.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // Guest pages (login/register): verify the token is actually valid
  // before redirecting away — stale tokens fall through to the form.
  if (to.meta.guest && auth.isLoggedIn) {
    try {
      await auth.fetchProfile()
      return { name: 'Home' }
    } catch (_) {
      auth.clearAuth()
    }
  }

  if (to.name === 'AdminLogin' && adminAuth.isLoggedIn) {
    const ok = await adminAuth.verify()
    if (ok) return { name: 'AdminDashboard' }
  }
})

export default router
