<template>
  <div class="product-image" :class="[wrapperClass, sizeClass]">
    <img
      v-if="showImage"
      :src="src"
      :alt="alt"
      :class="imgClass"
      :loading="loading"
      @error="onError"
    />
    <div v-else class="placeholder-fallback">
      <!-- Image/photo icon -->
      <svg
        class="placeholder-icon"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="8" y="16" width="64" height="48" rx="6" stroke="currentColor" stroke-width="3.5" fill="none"/>
        <circle cx="28" cy="34" r="6" stroke="currentColor" stroke-width="3.5" fill="none"/>
        <path d="M10 58L28 40L44 54L52 46L70 62" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="placeholder-text" v-if="showText">No image available</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  size: { type: String, default: 'md', validator: v => ['sm', 'md', 'lg', 'xl'].includes(v) },
  imgClass: { type: String, default: '' },
  wrapperClass: { type: String, default: '' },
  showText: { type: Boolean, default: false },
  loading: { type: String, default: 'lazy' },
})


const imgError = ref(false)

const sizeClass = computed(() => `product-image--${props.size}`)

// Show the image only if src is provided and hasn't errored
const showImage = computed(() => !!props.src && !imgError.value)

function onError() {
  imgError.value = true
}
</script>

<style scoped>
.product-image {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Size variants with min-height to ensure placeholder shows properly */
.product-image--sm { min-height: 72px; }
.product-image--md { min-height: 120px; }
.product-image--lg { min-height: 240px; }
.product-image--xl { min-height: 480px; }

.placeholder-fallback {
  width: 100%;
  min-height: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
  background-size: 200% 200%;
  animation: shimmer 3s ease-in-out infinite;
  border-radius: inherit;
  padding: 1rem;
  box-sizing: border-box;
}

@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.placeholder-icon {
  color: #94a3b8;
  opacity: 0.5;
  flex-shrink: 0;
  max-width: 100%;
}

/* Size variants for icon */
.product-image--sm .placeholder-icon { width: 32px; height: 32px; }
.product-image--md .placeholder-icon { width: 48px; height: 48px; }
.product-image--lg .placeholder-icon { width: 64px; height: 64px; }
.product-image--xl .placeholder-icon { width: 80px; height: 80px; }

.placeholder-text {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
}

/* Default icon size fallback */
.placeholder-icon { width: 48px; height: 48px; }
</style>
