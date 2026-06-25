<template>
  <header class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container navbar__inner">
      <!-- Logo -->
      <RouterLink to="/" class="navbar__logo">
        <span class="logo-icon">◆</span>
        <span class="logo-text">ShopVue</span>
      </RouterLink>

      <!-- Search bar -->
      <form class="navbar__search" @submit.prevent="search">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Search products..." class="navbar__search-input" />
        <button type="submit" class="navbar__search-btn">Search</button>
      </form>

      <!-- Mobile hamburger -->
      <button class="navbar__hamburger" @click="mobileMenuOpen = !mobileMenuOpen" :class="{ active: mobileMenuOpen }">
        <span></span><span></span><span></span>
      </button>

      <!-- Right actions -->
      <nav class="navbar__actions" :class="{ 'navbar__actions--open': mobileMenuOpen }">
        <RouterLink v-if="auth.isLoggedIn" to="/wishlist" class="navbar__icon-btn" title="Wishlist">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span v-if="wishlist.items.length" class="badge">{{ wishlist.items.length }}</span>
        </RouterLink>

        <RouterLink to="/cart" class="navbar__icon-btn" title="Cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <span v-if="cart.count" class="badge">{{ cart.count }}</span>
        </RouterLink>

        <div v-if="auth.isLoggedIn" class="navbar__user" @click="toggleMenu" ref="userMenu">
          <div class="navbar__avatar">{{ auth.user?.name?.charAt(0)?.toUpperCase() }}</div>
          <span class="navbar__username">{{ auth.user?.name?.split(' ')[0] }}</span>
          <svg class="chevron" :class="{ open: menuOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          <Transition name="dropdown">
            <div v-if="menuOpen" class="dropdown">
              <RouterLink to="/profile" class="dropdown__item" @click="menuOpen=false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
              </RouterLink>
              <RouterLink to="/orders" class="dropdown__item" @click="menuOpen=false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                My Orders
              </RouterLink>
              <RouterLink to="/wishlist" class="dropdown__item" @click="menuOpen=false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                Wishlist
              </RouterLink>
              <div class="dropdown__divider"></div>
              <button class="dropdown__item dropdown__item--danger" @click="handleLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </button>
            </div>
          </Transition>
        </div>

        <template v-else>
          <RouterLink to="/login" class="btn btn-ghost btn-sm nav-login-btn">Log in</RouterLink>
          <RouterLink to="/register" class="btn btn-primary btn-sm nav-signup-btn">Sign Up</RouterLink>
        </template>
      </nav>
    </div>

    <!-- Category nav -->
    <div class="navbar__categories" v-if="categories.length">
      <div class="container navbar__categories-inner">
        <RouterLink
          to="/products"
          class="navbar__cat-link"
          :class="{ active: !$route.query.category }"
        >All</RouterLink>
        <RouterLink
          v-for="cat in categories" :key="cat.id"
          :to="`/products?category=${cat.slug}`"
          class="navbar__cat-link"
          :class="{ active: $route.query.category === cat.slug }"
        >{{ cat.name }}</RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore }     from '@/stores/auth'
import { useCartStore }     from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import api from '@/services/api'

const auth     = useAuthStore()
const cart     = useCartStore()
const wishlist = useWishlistStore()
const router   = useRouter()
const route    = useRoute()

const searchQuery  = ref('')
const menuOpen     = ref(false)
const mobileMenuOpen = ref(false)
const userMenu     = ref(null)
const categories   = ref([])
const isScrolled   = ref(false)

function search() {
  if (!searchQuery.value.trim()) return
  router.push({ name: 'Products', query: { search: searchQuery.value } })
  searchQuery.value = ''
  mobileMenuOpen.value = false
}

function toggleMenu() { menuOpen.value = !menuOpen.value }

function handleClickOutside(e) {
  if (userMenu.value && !userMenu.value.contains(e.target)) {
    menuOpen.value = false
  }
}

function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

async function handleLogout() {
  await auth.logout()
  cart.reset()
  wishlist.reset()
  menuOpen.value = false
  mobileMenuOpen.value = false
  router.push('/')
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, { passive: true })
  try {
    const { data } = await api.get('/categories')
    categories.value = data.data.slice(0, 8)
  } catch (_) {}
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.navbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0,0,0,.06);
  transition: all .3s cubic-bezier(.4,0,.2,1);
}
.navbar.scrolled {
  box-shadow: 0 4px 20px rgba(0,0,0,.08);
}
.navbar__inner {
  display: flex; align-items: center; gap: 1.25rem;
  height: 68px;
}

/* Logo */
.navbar__logo {
  display: flex; align-items: center; gap: .45rem;
  font-size: 1.2rem; font-weight: 800; white-space: nowrap;
  color: var(--gray-900);
  transition: opacity .2s;
}
.navbar__logo:hover { opacity: .8; }
.logo-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 10px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff; font-size: .9rem;
}
.logo-text { letter-spacing: -.03em; }

/* Search */
.navbar__search {
  flex: 1; max-width: 520px; display: flex; align-items: center;
  background: var(--gray-100); border: 1.5px solid transparent;
  border-radius: var(--radius-full); overflow: hidden;
  transition: all .25s cubic-bezier(.4,0,.2,1);
}
.navbar__search:focus-within {
  background: #fff; border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99,102,241,.12);
}
.search-icon {
  margin-left: 1rem; color: var(--gray-400); flex-shrink: 0;
  transition: color .2s;
}
.navbar__search:focus-within .search-icon { color: var(--primary); }
.navbar__search-input {
  flex: 1; border: none; outline: none; padding: .6rem .75rem;
  font-size: .875rem; background: transparent; color: var(--gray-800);
}
.navbar__search-input::placeholder { color: var(--gray-400); }
.navbar__search-btn {
  background: var(--primary); border: none; padding: .55rem 1.25rem;
  color: #fff; font-size: .8125rem; font-weight: 600;
  transition: background .2s; border-radius: 0 var(--radius-full) var(--radius-full) 0;
}
.navbar__search-btn:hover { background: var(--primary-dark); }

/* Hamburger */
.navbar__hamburger {
  display: none; background: none; border: none;
  width: 36px; height: 36px; position: relative;
  z-index: 110;
}
.navbar__hamburger span {
  display: block; width: 20px; height: 2px;
  background: var(--gray-700); border-radius: 2px;
  position: absolute; left: 8px;
  transition: all .3s cubic-bezier(.4,0,.2,1);
}
.navbar__hamburger span:nth-child(1) { top: 11px; }
.navbar__hamburger span:nth-child(2) { top: 17px; }
.navbar__hamburger span:nth-child(3) { top: 23px; }
.navbar__hamburger.active span:nth-child(1) { top: 17px; transform: rotate(45deg); }
.navbar__hamburger.active span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.navbar__hamburger.active span:nth-child(3) { top: 17px; transform: rotate(-45deg); }

/* Actions */
.navbar__actions {
  display: flex; align-items: center; gap: .6rem; margin-left: auto;
}
.navbar__icon-btn {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: var(--radius);
  color: var(--gray-600); transition: all .2s;
}
.navbar__icon-btn:hover {
  background: var(--gray-100); color: var(--gray-900);
}

/* User */
.navbar__user {
  display: flex; align-items: center; gap: .5rem;
  cursor: pointer; position: relative; user-select: none;
  padding: .3rem .6rem .3rem .35rem; border-radius: var(--radius);
  transition: background .2s;
}
.navbar__user:hover { background: var(--gray-100); }
.navbar__avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff; display: grid; place-items: center;
  font-weight: 700; font-size: .8rem;
}
.navbar__username {
  font-size: .85rem; font-weight: 600; color: var(--gray-700);
}
.chevron { transition: transform .2s; color: var(--gray-400); }
.chevron.open { transform: rotate(180deg); }

/* Dropdown */
.dropdown {
  position: absolute; top: calc(100% + 8px); right: 0;
  background: #fff; border-radius: var(--radius-lg);
  box-shadow: 0 12px 40px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.04);
  min-width: 200px; padding: .5rem; z-index: 200;
}
.dropdown__item {
  display: flex; align-items: center; gap: .65rem;
  padding: .6rem .85rem; font-size: .85rem; font-weight: 500;
  width: 100%; border: none; background: none; text-align: left;
  color: var(--gray-600); border-radius: .5rem;
  transition: all .15s;
}
.dropdown__item:hover { background: var(--gray-50); color: var(--gray-900); }
.dropdown__item--danger { color: var(--danger); }
.dropdown__item--danger:hover { background: #fef2f2; color: var(--danger); }
.dropdown__divider { height: 1px; background: var(--gray-100); margin: .35rem .5rem; }

/* Dropdown transition */
.dropdown-enter-active { animation: dropdownIn .2s cubic-bezier(.4,0,.2,1); }
.dropdown-leave-active { animation: dropdownIn .15s cubic-bezier(.4,0,.2,1) reverse; }
@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-8px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Nav buttons in actions */
.nav-login-btn { color: var(--gray-600); }
.nav-login-btn:hover { color: var(--gray-900); background: var(--gray-100); }
.nav-signup-btn { border-radius: var(--radius-full); padding: .45rem 1.25rem; }

/* Categories */
.navbar__categories {
  background: var(--gray-50);
  border-top: 1px solid var(--gray-100);
  overflow-x: auto; white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}
.navbar__categories::-webkit-scrollbar { display: none; }
.navbar__categories-inner { display: flex; gap: 0; }
.navbar__cat-link {
  padding: .6rem 1.15rem; font-size: .8125rem; font-weight: 500;
  color: var(--gray-500);
  border-bottom: 2px solid transparent;
  transition: all .2s;
}
.navbar__cat-link:hover { color: var(--gray-800); }
.navbar__cat-link.active,
.navbar__cat-link.router-link-exact-active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}

/* Mobile */
@media (max-width: 768px) {
  .navbar__hamburger { display: block; }
  .navbar__search { display: none; }

  .navbar__actions {
    position: fixed; top: 0; right: -100%; width: 85%; max-width: 340px;
    height: 100vh; background: #fff; z-index: 105;
    flex-direction: column; align-items: stretch;
    padding: 5rem 1.5rem 2rem; gap: .5rem;
    box-shadow: -8px 0 40px rgba(0,0,0,.15);
    transition: right .3s cubic-bezier(.4,0,.2,1);
    margin-left: 0;
  }
  .navbar__actions--open { right: 0; }
  .navbar__actions--open .navbar__icon-btn,
  .navbar__actions--open .navbar__user {
    width: 100%; padding: .85rem 1rem;
    border-radius: var(--radius); justify-content: flex-start;
  }
  .navbar__actions--open .navbar__icon-btn { font-size: 1rem; }
  .navbar__actions--open .navbar__icon-btn svg { margin-right: .5rem; }
  .navbar__actions--open .nav-login-btn,
  .navbar__actions--open .nav-signup-btn {
    width: 100%; justify-content: center; text-align: center; margin-top: .25rem;
  }
  .navbar__actions--open .dropdown {
    position: static; box-shadow: none; background: var(--gray-50);
    margin-top: .5rem; border-radius: var(--radius);
  }
  .chevron { display: none; }
  .navbar__categories { display: none; }
}
</style>
