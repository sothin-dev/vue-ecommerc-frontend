<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { formatCurrency } from '@/composables/useFormat'

const props = defineProps({
  // [{ image_url, title, subtitle?, price?, sale_price?, link }]
  slides: { type: Array, default: () => [] },
  interval: { type: Number, default: 5000 }
})

const current = ref(0)
const timer = ref(null)
const paused = ref(false)

const hasSlides = computed(() => props.slides.length > 0)

function next() {
  if (!hasSlides.value) return
  current.value = (current.value + 1) % props.slides.length
}

function prev() {
  if (!hasSlides.value) return
  current.value = (current.value - 1 + props.slides.length) % props.slides.length
}

function goTo(i) {
  current.value = i
}

function startTimer() {
  stopTimer()
  if (props.slides.length > 1 && !paused.value) {
    timer.value = setInterval(next, props.interval)
  }
}

function stopTimer() {
  if (timer.value) clearInterval(timer.value)
  timer.value = null
}

watch(() => props.slides, startTimer)
watch(paused, () => (paused.value ? stopTimer() : startTimer()))

onMounted(startTimer)
onBeforeUnmount(stopTimer)

const discountPercent = (slide) => {
  if (!slide.sale_price || !slide.price) return 0
  return Math.round((1 - slide.sale_price / slide.price) * 100)
}
</script>

<template>
  <!-- Static gradient fallback while loading / no slides -->
  <section v-if="!hasSlides" class="relative overflow-hidden bg-gray-900">
    <div class="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900" />
    <div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Upgrade your everyday.</h1>
      <p class="mt-4 max-w-xl text-lg text-gray-300">Discover premium products with free shipping over $50.</p>
    </div>
  </section>

  <!-- Carousel -->
  <section
    v-else
    class="relative h-[420px] overflow-hidden bg-gray-900 sm:h-[480px] lg:h-[560px]"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <TransitionGroup name="slide-fade">
      <div
        v-for="(slide, i) in slides"
        v-show="i === current"
        :key="i"
        class="absolute inset-0"
      >
        <img
          :src="slide.image_url"
          :alt="slide.title"
          class="h-full w-full object-cover"
          :class="i === current ? 'scale-100' : 'scale-105'"
        />
        <!-- Overlays -->
        <div class="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-900/50 to-transparent" />
        <div class="absolute inset-0 flex items-center">
          <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="max-w-xl">
              <span v-if="discountPercent(slide)"
                class="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                🔥 {{ discountPercent(slide) }}% OFF
              </span>
              <h2 class="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl">
                {{ slide.title }}
              </h2>
              <p v-if="slide.subtitle" class="mt-3 line-clamp-2 max-w-md text-sm leading-relaxed text-gray-200 sm:text-base">
                {{ slide.subtitle }}
              </p>
              <div v-if="slide.price" class="mt-4 flex items-baseline gap-3">
                <span class="text-3xl font-extrabold text-white">{{ formatCurrency(slide.sale_price ?? slide.price) }}</span>
                <span v-if="slide.sale_price" class="text-lg text-gray-400 line-through">{{ formatCurrency(slide.price) }}</span>
              </div>
              <RouterLink :to="slide.link"
                class="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-gray-900 shadow-xl transition hover:bg-primary-50">
                Shop Now
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- Arrows -->
    <button
      aria-label="Previous slide"
      class="absolute left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 sm:flex"
      @click="prev"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
    </button>
    <button
      aria-label="Next slide"
      class="absolute right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 sm:flex"
      @click="next"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
    </button>

    <!-- Dots -->
    <div class="absolute inset-x-0 bottom-5 z-10 flex justify-center gap-2">
      <button
        v-for="(s, i) in slides"
        :key="'dot-' + i"
        :aria-label="`Go to slide ${i + 1}`"
        class="h-2 rounded-full transition-all duration-300"
        :class="i === current ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'"
        @click="goTo(i)"
      />
    </div>
  </section>
</template>

<style scoped>
.slide-fade-enter-active { transition: all .7s ease; }
.slide-fade-leave-active { transition: all .7s ease; position: absolute; }
.slide-fade-enter-from { opacity: 0; transform: scale(1.04); }
.slide-fade-leave-to { opacity: 0; }
</style>
