<template>
  <div class="auth-page">
    <div class="auth-split">
      <!-- Left panel -->
      <div class="auth-left">
        <div class="auth-left__content">
          <RouterLink to="/" class="auth-logo">
            <span class="auth-logo__icon">◆</span>
            ShopVue
          </RouterLink>
          <h1 class="auth-left__title">Join ShopVue today</h1>
          <p class="auth-left__desc">Create an account to unlock exclusive deals, track orders, and build your wishlist.</p>
          <div class="auth-left__features">
            <div class="auth-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Exclusive member discounts</span>
            </div>
            <div class="auth-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Order tracking & history</span>
            </div>
            <div class="auth-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Personalized recommendations</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right form -->
      <div class="auth-right">
        <div class="auth-card animate-fade-in">
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-sub">Fill in your details to get started</p>

          <div v-if="error" class="alert alert-error" style="margin-bottom:1.25rem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {{ error }}
          </div>

          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label>Full Name</label>
              <div class="input-wrap">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input v-model="form.name" type="text" class="form-control" placeholder="John Doe" required />
              </div>
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <div class="input-wrap">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input v-model="form.email" type="email" class="form-control" placeholder="you@example.com" required />
              </div>
            </div>
            <div class="form-group">
              <label>Phone <span style="color:var(--gray-400);font-weight:400">(optional)</span></label>
              <div class="input-wrap">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                <input v-model="form.phone" type="tel" class="form-control" placeholder="+1 555 000 0000" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Password</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  <input v-model="form.password" type="password" class="form-control" placeholder="Min. 8 characters" required />
                </div>
              </div>
              <div class="form-group">
                <label>Confirm Password</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  <input v-model="form.password_confirmation" type="password" class="form-control" placeholder="Repeat password" required />
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-full btn-lg" :disabled="loading" style="margin-top:.5rem">
              {{ loading ? 'Creating account…' : 'Create Account' }}
            </button>
          </form>

          <p class="auth-switch">
            Already have an account?
            <RouterLink to="/login">Sign in</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter }     from 'vue-router'
import { useAuthStore }     from '@/stores/auth'
import { useCartStore }     from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'

const auth     = useAuthStore()
const cart     = useCartStore()
const wishlist = useWishlistStore()
const router   = useRouter()
const loading  = ref(false)
const error    = ref('')

const form = reactive({ name: '', email: '', phone: '', password: '', password_confirmation: '' })

async function handleRegister() {
  error.value = ''
  if (form.password !== form.password_confirmation) {
    error.value = 'Passwords do not match.'; return
  }
  loading.value = true
  try {
    await auth.register(form)
    await Promise.all([cart.fetchCart(), wishlist.fetchWishlist()])
    router.push('/')
  } catch (e) {
    const errs = e.response?.data?.errors
    if (errs) {
      error.value = Object.values(errs).flat().join(' ')
    } else {
      error.value = e.response?.data?.message || 'Registration failed.'
    }
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
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #fff; padding: 3rem; position: relative; overflow: hidden;
}
.auth-left::before {
  content: ''; position: absolute; width: 400px; height: 400px;
  border-radius: 50%; background: rgba(168,85,247,.15);
  top: -100px; right: -100px; filter: blur(60px);
}
.auth-left::after {
  content: ''; position: absolute; width: 300px; height: 300px;
  border-radius: 50%; background: rgba(99,102,241,.1);
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
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff; font-size: .9rem;
}
.auth-left__title { font-size: 2.5rem; font-weight: 800; line-height: 1.15; margin-bottom: 1rem; letter-spacing: -.02em; }
.auth-left__desc { color: #94a3b8; font-size: 1rem; line-height: 1.6; margin-bottom: 2rem; }
.auth-left__features { display: flex; flex-direction: column; gap: .85rem; }
.auth-feature {
  display: flex; align-items: center; gap: .75rem;
  font-size: .9rem; color: #cbd5e1;
}
.auth-feature svg { color: var(--success); flex-shrink: 0; }

.auth-right {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 3rem; background: var(--gray-50); overflow-y: auto;
}

.auth-card { width: 100%; max-width: 440px; }
.auth-title { font-size: 1.6rem; font-weight: 800; letter-spacing: -.02em; margin-bottom: .35rem; }
.auth-sub { color: var(--gray-500); font-size: .9rem; margin-bottom: 1.5rem; }

.input-wrap { position: relative; }
.input-icon {
  position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
  color: var(--gray-400); pointer-events: none;
}
.input-wrap .form-control { padding-left: 2.75rem; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }

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
  .form-row { grid-template-columns: 1fr; }
}
</style>
