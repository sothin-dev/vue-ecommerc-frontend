<template>
  <div class="auth-page">
    <div class="auth-split">
      <!-- Left panel -->
      <div class="auth-left">
        <div class="auth-left__content">
          <RouterLink to="/" class="auth-logo">
            <span class="auth-logo__icon">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="18" height="18"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>
            </span>
            SportFlex
          </RouterLink>
          <h1 class="auth-left__title">Welcome back, athlete</h1>
          <p class="auth-left__desc">Sign in to track your orders, manage your gear, and stay in the game.</p>
          <div class="auth-left__features">
            <div class="auth-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Track orders on the go</span>
            </div>
            <div class="auth-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Save your favorite gear</span>
            </div>
            <div class="auth-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Lightning-fast checkout</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right form -->
      <div class="auth-right">
        <div class="auth-card animate-fade-in">
          <h1 class="auth-title">Sign In</h1>
          <p class="auth-sub">Enter your credentials to access your SportFlex account</p>

          <div v-if="error" class="alert alert-error" style="margin-bottom:1.25rem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {{ error }}
          </div>

          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label>Email Address</label>
              <div class="input-wrap">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input v-model="form.email" type="email" class="form-control" placeholder="you@example.com" required />
              </div>
            </div>
            <div class="form-group">
              <label>Password</label>
              <div class="input-wrap">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <input v-model="form.password" type="password" class="form-control" placeholder="Enter your password" required />
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="loading" style="margin-top:.5rem">
              {{ loading ? 'Signing in…' : 'Sign In' }}
            </button>
          </form>

          <p class="auth-switch">
            Don't have an account?
            <RouterLink to="/register">Create one for free</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'

const auth     = useAuthStore()
const cart     = useCartStore()
const wishlist = useWishlistStore()
const router   = useRouter()
const route    = useRoute()
const loading  = ref(false)
const error    = ref('')

const form = reactive({ email: '', password: '' })

async function handleLogin() {
  error.value   = ''
  loading.value = true
  try {
    await auth.login(form.email, form.password)
    await Promise.all([cart.fetchCart(), wishlist.fetchWishlist()])
    router.push(route.query.redirect || '/')
  } catch (e) {
    error.value = e.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; }
.auth-split { display: flex; min-height: 100vh; }

.auth-left {
  flex: 0 0 45%; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #052e16 0%, #14532d 100%);
  color: #fff; padding: 3rem; position: relative; overflow: hidden;
}
.auth-left::before {
  content: ''; position: absolute; width: 400px; height: 400px;
  border-radius: 50%;  background: rgba(34,197,94,.15);
  top: -100px; right: -100px; filter: blur(60px);
}
.auth-left::after {
  content: ''; position: absolute; width: 300px; height: 300px;
  border-radius: 50%; background: rgba(249,115,22,.1);
  bottom: -80px; left: -80px; filter: blur(60px);
}
.auth-left__content { position: relative; z-index: 1; max-width: 400px; }
.auth-logo {
  display: inline-flex; align-items: center; gap: .45rem;
  font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 3rem;
}
.auth-logo__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff; font-size: .9rem;
  box-shadow: 0 2px 8px rgba(34,197,94,.3);
}
.auth-left__title { font-size: 2.5rem; font-weight: 800; line-height: 1.15; margin-bottom: 1rem; letter-spacing: -.02em; }
.auth-left__desc { color: #94a3b8; font-size: 1rem; line-height: 1.6; margin-bottom: 2rem; }
.auth-left__features { display: flex; flex-direction: column; gap: .85rem; }
.auth-feature {
  display: flex; align-items: center; gap: .75rem;
  font-size: .9rem; color: #cbd5e1;
}
.auth-feature svg { color: #22c55e; flex-shrink: 0; }

.auth-right {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 3rem; background: var(--gray-50);
}

.auth-card { width: 100%; max-width: 400px; }
.auth-title { font-size: 1.6rem; font-weight: 800; letter-spacing: -.02em; margin-bottom: .35rem; }
.auth-sub { color: var(--gray-500); font-size: .9rem; margin-bottom: 1.75rem; }

.input-wrap { position: relative; }
.input-icon {
  position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
  color: var(--gray-400); pointer-events: none;
}
.input-wrap .form-control { padding-left: 2.75rem; }

.auth-switch {
  text-align: center; margin-top: 1.5rem; font-size: .875rem; color: var(--gray-500);
}
.auth-switch a {
  color: var(--primary); font-weight: 600; transition: color .2s;
}
.auth-switch a:hover { color: var(--primary-dark); }

@media (max-width: 768px) {
  .auth-left { display: none; }
  .auth-right { padding: 2rem 1.5rem; }
}
</style>
