<template>
  <div>
    <!-- Welcome Slider -->
    <section class="welcome-slider" @mouseenter="pauseSlider" @mouseleave="resumeSlider">
      <div class="welcome-slider__inner">
        <!-- Slides -->
        <div
          v-for="(slide, i) in welcomeSlides" :key="i"
          class="welcome-slide"
          :class="{ active: currentSlide === i }"
          :style="{ backgroundImage: `url(${slide.image})` }"
        >
          <div class="welcome-slide__overlay"></div>
          <div class="welcome-slide__content">
            <span class="welcome-slide__tag" :style="{ background: slide.tagColor }">{{ slide.tag }}</span>
            <h2 class="welcome-slide__title">{{ slide.title }}</h2>
            <p class="welcome-slide__sub">{{ slide.sub }}</p>
            <RouterLink :to="slide.link" class="btn welcome-slide__btn" :style="{ background: slide.btnColor, borderColor: slide.btnColor }">
              {{ slide.btnText }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </RouterLink>
          </div>
        </div>

        <!-- Dots -->
        <div class="welcome-slider__dots">
          <button
            v-for="(slide, i) in welcomeSlides" :key="i"
            class="welcome-slider__dot"
            :class="{ active: currentSlide === i }"
            @click="goToSlide(i)"
            :aria-label="`Slide ${i + 1}`"
          ></button>
        </div>

        <!-- Arrows -->
        <button class="welcome-slider__arrow welcome-slider__arrow--prev" @click="prevSlide" aria-label="Previous slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="welcome-slider__arrow welcome-slider__arrow--next" @click="nextSlide" aria-label="Next slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </section>


    <!-- Categories -->
    <section class="section">
      <div class="container">
        <div class="section-header animate-fade-in">
          <div>
            <h2 class="section-title">Sports Categories</h2>
            <p class="section-subtitle">Find your sport, find your gear</p>
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
            <div class="feature-card__icon">
              <img :src="f.icon" alt="" class="feature-card__icon-img" />
            </div>
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
          <h2 class="cta-title">Ready to Level Up?</h2>
          <p class="cta-desc">Join SportFlex today and get exclusive gear deals delivered straight to your inbox.</p>
          <RouterLink v-if="!auth.isLoggedIn" to="/register" class="btn btn-primary btn-lg">Join the Team</RouterLink>
          <RouterLink v-else to="/products" class="btn btn-primary btn-lg">Shop Gear</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ProductCard from '@/components/common/ProductCard.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()
const categories   = ref([])
const newProducts  = ref([])
const saleProducts = ref([])
const loadingNew   = ref(true)
const loadingSale  = ref(true)

// Welcome Slider
const currentSlide  = ref(0)
const isPaused      = ref(false)
let slideInterval   = null

const welcomeSlides = [
  {
    image: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=1600&q=80&auto=format&fit=crop',
    tag: '🏆 Welcome to SportFlex',
    tagColor: 'linear-gradient(135deg, #22c55e, #16a34a)',
    title: 'Your Ultimate Sports Destination',
    sub: 'Premium gear for every athlete. From the field to the gym, we have you covered.',
    btnText: 'Explore Gear',
    btnColor: '#22c55e',
    link: '/products',
  },
  {
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80&auto=format&fit=crop',
    tag: '⚡ New Arrivals',
    tagColor: 'linear-gradient(135deg, #f97316, #ea580c)',
    title: 'Fresh Gear Just Landed',
    sub: 'Discover the latest sports equipment and activewear. Be the first to elevate your game.',
    btnText: 'Shop New',
    btnColor: '#f97316',
    link: '/products?sort=newest',
  },
  {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80&auto=format&fit=crop',
    tag: '🔥 Limited Time Offers',
    tagColor: 'linear-gradient(135deg, #ef4444, #dc2626)',
    title: 'Deals That Fuel Your Performance',
    sub: 'Save big on top brands. Exclusive discounts for SportFlex members.',
    btnText: 'View Deals',
    btnColor: '#ef4444',
    link: '/products?sort=on_sale',
  },
  {
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1600&q=80&auto=format&fit=crop',
    tag: '💪 Join the Team',
    tagColor: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    title: 'Become a SportFlex Athlete',
    sub: 'Sign up for exclusive perks — free shipping, members-only deals, and early access.',
    btnText: 'Join Free',
    btnColor: '#8b5cf6',
    link: '/register',
  },
]

function startSlideInterval() {
  slideInterval = setInterval(() => {
    if (!isPaused.value) {
      currentSlide.value = (currentSlide.value + 1) % welcomeSlides.length
    }
  }, 5000)
}

function goToSlide(i) {
  currentSlide.value = i
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % welcomeSlides.length
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + welcomeSlides.length) % welcomeSlides.length
}

function pauseSlider() {
  isPaused.value = true
}

function resumeSlider() {
  isPaused.value = false
}

const features = [
  { icon: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?w=80&q=80&auto=format&fit=crop', title: 'Free Shipping', desc: 'Free delivery on all orders over $50. Fast and reliable shipping worldwide.' },
  { icon: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=80&q=80&auto=format&fit=crop', title: 'Easy Returns',  desc: '30-day hassle-free return policy. Not satisfied? Send it back, no questions asked.' },
  { icon: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&q=80&auto=format&fit=crop', title: 'Secure Payment', desc: 'Your payment information is processed securely with industry-standard encryption.' },
  { icon: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=80&q=80&auto=format&fit=crop', title: '24/7 Support',  desc: 'Our dedicated support team is available around the clock to help you anytime.' },
]

onMounted(async () => {
  startSlideInterval()
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

onBeforeUnmount(() => {
  if (slideInterval) clearInterval(slideInterval)
})
</script>

<style scoped>
/* ===== Welcome Slider ===== */
.welcome-slider {
  position: relative; width: 100%; overflow: hidden;
}
.welcome-slider__inner {
  position: relative; width: 100%; height: 520px;
}
.welcome-slide {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  background-color: #0f172a;
  opacity: 0; transition: opacity .8s cubic-bezier(.4,0,.2,1);
  z-index: 0;
}
.welcome-slide.active {
  opacity: 1; z-index: 1;
}
.welcome-slide__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,.4) 50%, rgba(0,0,0,.2) 100%);
}
.welcome-slide__content {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 4rem 2rem 3.5rem;
  background: linear-gradient(0deg, rgba(0,0,0,.6) 0%, transparent 100%);
  max-width: 1280px; margin: 0 auto;
}
.welcome-slide__tag {
  display: inline-block; padding: .35rem 1rem;
  border-radius: var(--radius-full);
  font-size: .8125rem; font-weight: 700; color: #fff;
  margin-bottom: 1rem; letter-spacing: .02em;
}
.welcome-slide__title {
  font-size: 2.75rem; font-weight: 800; color: #fff;
  line-height: 1.1; margin-bottom: .6rem;
  letter-spacing: -.02em; text-shadow: 0 2px 10px rgba(0,0,0,.3);
}
.welcome-slide__sub {
  font-size: 1.05rem; color: rgba(255,255,255,.8);
  max-width: 520px; line-height: 1.6; margin-bottom: 1.5rem;
  text-shadow: 0 1px 6px rgba(0,0,0,.3);
}
.welcome-slide__btn {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .7rem 1.75rem; border-radius: var(--radius-full);
  color: #fff; font-weight: 700; font-size: .9rem;
  border: none; transition: all .25s ease;
  text-decoration: none; box-shadow: 0 4px 16px rgba(0,0,0,.2);
}
.welcome-slide__btn:hover {
  transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,.3);
}

/* Dots */
.welcome-slider__dots {
  position: absolute; bottom: 1.25rem; left: 50%;
  transform: translateX(-50%); display: flex; gap: .5rem;
  z-index: 5;
}
.welcome-slider__dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: rgba(255,255,255,.4); border: 2px solid transparent;
  cursor: pointer; transition: all .3s ease; padding: 0;
}
.welcome-slider__dot.active {
  background: #22c55e; border-color: rgba(255,255,255,.6);
  transform: scale(1.25); box-shadow: 0 0 12px rgba(34,197,94,.5);
}
.welcome-slider__dot:hover { background: rgba(255,255,255,.7); }

/* Arrows */
.welcome-slider__arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  z-index: 5; width: 44px; height: 44px;
  border-radius: 50%; background: rgba(255,255,255,.15);
  backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.2);
  color: #fff; display: grid; place-items: center;
  cursor: pointer; transition: all .25s ease; opacity: 0;
}
.welcome-slider:hover .welcome-slider__arrow { opacity: 1; }
.welcome-slider__arrow:hover {
  background: rgba(255,255,255,.3);
  transform: translateY(-50%) scale(1.08);
}
.welcome-slider__arrow--prev { left: 1.25rem; }
.welcome-slider__arrow--next { right: 1.25rem; }

@media (max-width: 768px) {
  .welcome-slider__inner { height: 380px; }
  .welcome-slide__content { padding: 3rem 1.5rem 3rem; }
  .welcome-slide__title { font-size: 1.85rem; }
  .welcome-slide__sub { font-size: .9rem; }
  .welcome-slider__arrow { display: none; }
}
@media (max-width: 480px) {
  .welcome-slider__inner { height: 320px; }
  .welcome-slide__title { font-size: 1.5rem; }
  .welcome-slide__sub { font-size: .85rem; }
}

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
  background: rgba(34,197,94,.2); border: 1px solid rgba(34,197,94,.3);
  border-radius: var(--radius-full); font-size: .8125rem;
  font-weight: 600; color: #86efac; margin-bottom: 1.5rem;
  backdrop-filter: blur(8px);
}
.hero__title {
  font-size: 3.25rem; font-weight: 800; line-height: 1.1;
  margin-bottom: 1.25rem; letter-spacing: -.03em;
}
.hero__title-accent {
  background: linear-gradient(135deg, #4ade80, #22c55e, #f97316);
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
  border-radius: var(--radius-xl); overflow: hidden;
  animation: float 5s ease-in-out infinite;
}
.hero__card--1 {
  width: 140px; height: 140px; top: 10px; right: 0;
  background: rgba(34,197,94,.15); border: 1px solid rgba(34,197,94,.2);
  animation-delay: 0s; overflow: hidden;
}
.hero__card--2 {
  width: 120px; height: 120px; bottom: 20px; left: 20px;
  background: rgba(22,163,74,.15); border: 1px solid rgba(22,163,74,.2);
  animation-delay: 1s; overflow: hidden;
}
.hero__card--3 {
  width: 100px; height: 100px; top: 60px; left: 80px;
  background: rgba(249,115,22,.15); border: 1px solid rgba(249,115,22,.2);
  animation-delay: 2s; overflow: hidden;
}
.hero__card-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform .4s ease;
}
.hero__card:hover .hero__card-img { transform: scale(1.1); }

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
  display: grid; place-items: center; overflow: hidden;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-radius: var(--radius-lg);
}
.feature-card__icon-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform .3s ease;
}
.feature-card:hover .feature-card__icon-img { transform: scale(1.1); }
.feature-card__title { font-weight: 700; margin-bottom: .4rem; font-size: 1rem; }
.feature-card__desc { font-size: .85rem; color: var(--gray-500); line-height: 1.6; }

/* CTA */
.cta-section { padding: 2rem 0 4rem; }
.cta-card {
  background: linear-gradient(135deg, #16a34a, #15803d, #14532d);
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
