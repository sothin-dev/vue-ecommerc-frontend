<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <div class="hero__bg">
        <div class="hero__circle hero__circle--1"></div>
        <div class="hero__circle hero__circle--2"></div>
        <div class="hero__circle hero__circle--3"></div>
      </div>
      <div class="container hero__inner">
        <div class="hero__content animate-fade-in">
          <div class="hero__badge">✨ New Collection 2026</div>
          <h1 class="hero__title">
            Discover the
            <span class="hero__title-accent">Future</span>
            of Shopping
          </h1>
          <p class="hero__sub">
            Explore thousands of curated products with fast shipping, easy returns, and the best prices guaranteed.
          </p>
          <div class="hero__btns">
            <RouterLink to="/products" class="btn btn-primary btn-lg">
              Shop Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </RouterLink>
            <RouterLink to="/products?sort=newest" class="btn btn-outline btn-lg hero__btn-outline">
              New Arrivals
            </RouterLink>
          </div>
          <div class="hero__stats">
            <div class="hero__stat">
              <span class="hero__stat-num">10K+</span>
              <span class="hero__stat-label">Products</span>
            </div>
            <div class="hero__stat-divider"></div>
            <div class="hero__stat">
              <span class="hero__stat-num">50K+</span>
              <span class="hero__stat-label">Happy Customers</span>
            </div>
            <div class="hero__stat-divider"></div>
            <div class="hero__stat">
              <span class="hero__stat-num">4.9★</span>
              <span class="hero__stat-label">Average Rating</span>
            </div>
          </div>
        </div>
        <div class="hero__visual animate-fade-in-delay-2">
          <div class="hero__card hero__card--1">🛍️</div>
          <div class="hero__card hero__card--2">📦</div>
          <div class="hero__card hero__card--3">🎁</div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="section">
      <div class="container">
        <div class="section-header animate-fade-in">
          <div>
            <h2 class="section-title">Shop by Category</h2>
            <p class="section-subtitle">Browse our curated collections</p>
          </div>
          <RouterLink to="/products" class="btn btn-ghost btn-sm">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </RouterLink>
        </div>
        <div class="category-grid">
          <RouterLink
            v-for="(cat, i) in categories" :key="cat.id"
            :to="`/products?category=${cat.slug}`"
            class="category-card animate-fade-in"
            :style="{ animationDelay: `${i * 0.05}s` }"
          >
            <div class="category-card__icon-wrap">
              <img v-if="cat.image_url" :src="cat.image_url" :alt="cat.name" class="category-card__img" />
              <span v-else class="category-card__icon-emoji">🏷️</span>
            </div>
            <h3 class="category-card__name">{{ cat.name }}</h3>
            <p class="category-card__count">{{ cat.products_count }} items</p>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- New Arrivals -->
    <section class="section section--alt">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">New Arrivals</h2>
            <p class="section-subtitle">Fresh picks just for you</p>
          </div>
          <RouterLink to="/products?sort=newest" class="btn btn-ghost btn-sm">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </RouterLink>
        </div>
        <div v-if="loadingNew" class="loading-center"><div class="spinner"></div></div>
        <div v-else class="product-grid">
          <ProductCard v-for="p in newProducts" :key="p.id" :product="p" />
        </div>
      </div>
    </section>

    <!-- On Sale -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">🔥 On Sale</h2>
            <p class="section-subtitle">Limited time deals you don't want to miss</p>
          </div>
          <RouterLink to="/products?sort=on_sale" class="btn btn-ghost btn-sm">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </RouterLink>
        </div>
        <div v-if="loadingSale" class="loading-center"><div class="spinner"></div></div>
        <div v-else-if="saleProducts.length" class="product-grid">
          <ProductCard v-for="p in saleProducts" :key="p.id" :product="p" />
        </div>
        <div v-else class="empty-state" style="padding:3rem">
          <p style="font-size:2.5rem">🏷️</p>
          <p style="margin-top:.75rem;color:var(--gray-500)">No sale items at the moment. Check back soon!</p>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="section features-section">
      <div class="container">
        <div class="features-grid">
          <div v-for="f in features" :key="f.title" class="feature-card">
            <div class="feature-card__icon">{{ f.icon }}</div>
            <h3 class="feature-card__title">{{ f.title }}</h3>
            <p class="feature-card__desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <h2 class="cta-title">Ready to Start Shopping?</h2>
          <p class="cta-desc">Create an account and get exclusive deals delivered straight to you.</p>
          <RouterLink v-if="!auth.isLoggedIn" to="/register" class="btn btn-primary btn-lg">Create Free Account</RouterLink>
          <RouterLink v-else to="/products" class="btn btn-primary btn-lg">Browse Products</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProductCard from '@/components/common/ProductCard.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()
const categories   = ref([])
const newProducts  = ref([])
const saleProducts = ref([])
const loadingNew   = ref(true)
const loadingSale  = ref(true)

const features = [
  { icon: '🚚', title: 'Free Shipping', desc: 'Free delivery on all orders over $50. Fast and reliable shipping worldwide.' },
  { icon: '↩️', title: 'Easy Returns',  desc: '30-day hassle-free return policy. Not satisfied? Send it back, no questions asked.' },
  { icon: '🔒', title: 'Secure Payment', desc: 'Your payment information is processed securely with industry-standard encryption.' },
  { icon: '🎧', title: '24/7 Support',  desc: 'Our dedicated support team is available around the clock to help you anytime.' },
]

onMounted(async () => {
  const [cats, newest, sale] = await Promise.all([
    api.get('/categories'),
    api.get('/products', { params: { sort: 'newest', per_page: 8 } }),
    api.get('/products', { params: { sort: 'on_sale', per_page: 8 } }),
  ])
  categories.value   = cats.data.data
  newProducts.value  = newest.data.data
  loadingNew.value   = false
  saleProducts.value = sale.data.data.filter(p => p.on_sale)
  loadingSale.value  = false
})
</script>

<style scoped>
/* Hero */
.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: #fff; padding: 5rem 0 4rem;
}
.hero__bg { position: absolute; inset: 0; overflow: hidden; }
.hero__circle {
  position: absolute; border-radius: 50%;
  filter: blur(80px); opacity: .15;
}
.hero__circle--1 {
  width: 500px; height: 500px;
  background: var(--primary);
  top: -150px; right: -100px;
  animation: float 6s ease-in-out infinite;
}
.hero__circle--2 {
  width: 300px; height: 300px;
  background: #a855f7;
  bottom: -80px; left: -50px;
  animation: float 8s ease-in-out infinite 1s;
}
.hero__circle--3 {
  width: 200px; height: 200px;
  background: var(--secondary);
  top: 50%; left: 40%;
  animation: float 7s ease-in-out infinite 2s;
}
.hero__inner {
  display: flex; align-items: center; gap: 3rem;
  position: relative; z-index: 1;
}
.hero__content { flex: 1; }
.hero__badge {
  display: inline-block; padding: .4rem 1rem;
  background: rgba(99,102,241,.2); border: 1px solid rgba(99,102,241,.3);
  border-radius: var(--radius-full); font-size: .8125rem;
  font-weight: 600; color: #a5b4fc; margin-bottom: 1.5rem;
  backdrop-filter: blur(8px);
}
.hero__title {
  font-size: 3.25rem; font-weight: 800; line-height: 1.1;
  margin-bottom: 1.25rem; letter-spacing: -.03em;
}
.hero__title-accent {
  background: linear-gradient(135deg, var(--primary-light), #a855f7, var(--secondary));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero__sub {
  font-size: 1.1rem; opacity: .7; margin-bottom: 2rem;
  max-width: 500px; line-height: 1.7;
}
.hero__btns { display: flex; gap: .75rem; flex-wrap: wrap; margin-bottom: 2.5rem; }
.hero__btn-outline {
  border-color: rgba(255,255,255,.2) !important; color: #fff !important;
}
.hero__btn-outline:hover {
  background: rgba(255,255,255,.1) !important;
  border-color: rgba(255,255,255,.4) !important;
}
.hero__stats {
  display: flex; align-items: center; gap: 1.5rem;
}
.hero__stat { text-align: center; }
.hero__stat-num { display: block; font-size: 1.35rem; font-weight: 800; color: #fff; }
.hero__stat-label { font-size: .75rem; color: #64748b; margin-top: .1rem; display: block; }
.hero__stat-divider { width: 1px; height: 32px; background: #334155; }

/* Hero visual */
.hero__visual {
  position: relative; width: 300px; height: 300px; flex-shrink: 0;
}
.hero__card {
  position: absolute; display: grid; place-items: center;
  border-radius: var(--radius-xl); backdrop-filter: blur(12px);
  font-size: 2.5rem;
  animation: float 5s ease-in-out infinite;
}
.hero__card--1 {
  width: 140px; height: 140px; top: 10px; right: 0;
  background: rgba(99,102,241,.15); border: 1px solid rgba(99,102,241,.2);
  animation-delay: 0s;
}
.hero__card--2 {
  width: 120px; height: 120px; bottom: 20px; left: 20px;
  background: rgba(168,85,247,.15); border: 1px solid rgba(168,85,247,.2);
  animation-delay: 1s;
}
.hero__card--3 {
  width: 100px; height: 100px; top: 60px; left: 80px;
  background: rgba(245,158,11,.15); border: 1px solid rgba(245,158,11,.2);
  font-size: 2rem; animation-delay: 2s;
}

/* Section */
.section-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 2rem; gap: 1rem;
}
.section-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -.02em; color: var(--gray-900); }
.section-subtitle { font-size: .9rem; color: var(--gray-500); margin-top: .25rem; }
.section--alt { background: var(--gray-100); border-top: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200); }

/* Categories */
.category-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr)); gap: 1rem;
}
.category-card {
  text-align: center; background: #fff;
  border-radius: var(--radius-lg); border: 1px solid var(--gray-100);
  padding: 1.5rem 1rem; transition: all .3s cubic-bezier(.4,0,.2,1);
}
.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,.08);
  border-color: var(--gray-200);
}
.category-card__icon-wrap {
  width: 72px; height: 72px; border-radius: 50%; overflow: hidden;
  margin: 0 auto .85rem;
  background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
  display: grid; place-items: center;
  transition: transform .3s;
}
.category-card:hover .category-card__icon-wrap { transform: scale(1.08); }
.category-card__img { width: 100%; height: 100%; object-fit: cover; }
.category-card__icon-emoji { font-size: 1.75rem; }
.category-card__name { font-weight: 600; font-size: .9rem; color: var(--gray-800); }
.category-card__count { font-size: .75rem; color: var(--gray-400); margin-top: .2rem; }

/* Features */
.features-section { background: var(--gray-50); }
.features-grid {
  display: grid; grid-template-columns: repeat(4,1fr); gap: 1.25rem;
}
.feature-card {
  text-align: center; padding: 2rem 1.25rem;
  background: #fff; border-radius: var(--radius-lg);
  border: 1px solid var(--gray-100);
  transition: all .3s cubic-bezier(.4,0,.2,1);
}
.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,.06);
}
.feature-card__icon {
  font-size: 2.5rem; margin-bottom: 1rem;
  width: 64px; height: 64px; margin-left: auto; margin-right: auto;
  display: grid; place-items: center;
  background: var(--gray-50); border-radius: var(--radius-lg);
}
.feature-card__title { font-weight: 700; margin-bottom: .4rem; font-size: 1rem; }
.feature-card__desc { font-size: .85rem; color: var(--gray-500); line-height: 1.6; }

/* CTA */
.cta-section { padding: 2rem 0 4rem; }
.cta-card {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark), #4338ca);
  border-radius: var(--radius-xl); padding: 3.5rem;
  text-align: center; color: #fff; position: relative; overflow: hidden;
}
.cta-card::before {
  content: ''; position: absolute; top: -50%; right: -20%;
  width: 400px; height: 400px; border-radius: 50%;
  background: rgba(255,255,255,.06);
}
.cta-title { font-size: 1.75rem; font-weight: 800; margin-bottom: .75rem; position: relative; }
.cta-desc { opacity: .8; margin-bottom: 1.5rem; position: relative; font-size: 1rem; }

/* Responsive */
@media (max-width: 768px) {
  .hero { padding: 3.5rem 0 3rem; }
  .hero__inner { flex-direction: column; }
  .hero__title { font-size: 2.2rem; }
  .hero__visual { display: none; }
  .hero__stats { gap: 1rem; }
  .hero__stat-num { font-size: 1.1rem; }
  .features-grid { grid-template-columns: repeat(2,1fr); }
  .cta-card { padding: 2.5rem 1.5rem; }
}
@media (max-width: 480px) {
  .hero__stats { flex-wrap: wrap; justify-content: center; }
  .features-grid { grid-template-columns: 1fr; }
}
</style>
