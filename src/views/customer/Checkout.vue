<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'
import { orderService } from '@/services/order.service'
import { formatCurrency } from '@/composables/useFormat'
import EmptyState from '@/components/common/EmptyState.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'

const router = useRouter()
const cart = useCartStore()
const toast = useToastStore()

const step = ref(1) // 1 info → 2 shipping/payment → 3 review
const placing = ref(false)

// ── Form state ──
const form = ref({
  full_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postal_code: '',
  country: 'United States',
  delivery_method: 'standard', // standard | express
  payment_method: 'cash_on_delivery',
  notes: ''
})

const couponCode = ref('')
const couponLoading = ref(false)
const coupon = ref(null) // { code, discount, message }

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', eta: '3–5 business days', price: 0 },
  { id: 'express',  label: 'Express Delivery',  eta: '1–2 business days', price: 10 }
]

const PAYMENT_METHODS = [
  { id: 'cash_on_delivery', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
  { id: 'bank_transfer',    label: 'Bank Transfer',    desc: 'Transfer to our bank account' },
  { id: 'credit_card',      label: 'Credit / Debit Card', desc: 'Secure card payment' }
]

const shippingFee = computed(() => {
  const base = cart.subtotal >= 50 ? 0 : 5
  const express = DELIVERY_OPTIONS.find(d => d.id === form.value.delivery_method)
  return base + (express?.price ?? 0)
})

const total = computed(() =>
  Math.max(0, cart.subtotal + shippingFee.value - (coupon.value?.discount ?? 0))
)

function goStep(n) {
  if (n === 2 && step.value === 1) {
    const f = form.value
    if (!f.full_name.trim() || !f.email.trim() || !f.address.trim() || !f.city.trim()) {
      toast.error('Please fill in your name, email, address and city.')
      return
    }
  }
  step.value = n
}

async function applyCoupon() {
  if (!couponCode.value.trim()) return
  couponLoading.value = true
  try {
    const { data } = await orderService.validateCoupon({
      code: couponCode.value.trim(),
      subtotal: Number(cart.subtotal)
    })
    if (data.valid) {
      coupon.value = { code: data.code ?? couponCode.value.toUpperCase(), discount: data.discount, message: data.message }
      toast.success(data.message || 'Coupon applied!')
    } else {
      toast.error(data.message || 'Invalid coupon.')
    }
  } catch (e) {
    toast.error(e.response?.data?.message || 'Could not validate this coupon.')
  } finally {
    couponLoading.value = false
  }
}

function removeCoupon() {
  coupon.value = null
  couponCode.value = ''
}

async function placeOrder() {
  placing.value = true
  try {
    const f = form.value
    const addressParts = [
      f.address,
      f.city,
      f.postal_code,
      f.country,
      `Contact: ${f.full_name} · ${f.phone || f.email}`
    ].filter(Boolean)

    const payload = {
      shipping_address: addressParts.join(', ') + (f.notes ? ` — Note: ${f.notes}` : ''),
      payment_method: f.payment_method,
      ...(coupon.value ? { coupon_code: coupon.value.code } : {})
    }

    const { data } = await orderService.checkout(payload)
    toast.success('Order placed successfully!')
    await cart.fetchCart()
    router.push({ name: 'OrderDetail', params: { number: data.data.order_number }, query: { placed: 1 } })
  } catch (e) {
    toast.error(e.response?.data?.message || 'Checkout failed. Please try again.')
  } finally {
    placing.value = false
  }
}

const steps = ['Information', 'Delivery & Payment', 'Review']
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold tracking-tight text-gray-900">Checkout</h1>

    <EmptyState v-if="!cart.loading && !cart.items.length" title="Your cart is empty"
      description="You need items in your cart before checking out.">
      <RouterLink to="/products" class="mt-4 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
        Browse Products
      </RouterLink>
    </EmptyState>

    <div v-else class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <!-- Main -->
      <div class="lg:col-span-2">
        <!-- Step indicator -->
        <ol class="mb-8 flex items-center gap-2">
          <li v-for="(label, i) in steps" :key="label" class="flex flex-1 items-center gap-2">
            <button
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition"
              :class="step > i ? 'bg-primary-600 text-white' : step === i + 1 ? 'border-2 border-primary-600 text-primary-600' : 'border border-gray-300 text-gray-400'"
              @click="step > i + 1 && goStep(i + 1)"
            >
              {{ i + 1 }}
            </button>
            <span class="hidden text-xs font-semibold sm:block" :class="step >= i + 1 ? 'text-gray-900' : 'text-gray-400'">{{ label }}</span>
            <div v-if="i < steps.length - 1" class="h-px flex-1 bg-gray-200" />
          </li>
        </ol>

        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-8">
          <!-- Step 1: Information -->
          <div v-if="step === 1">
            <h2 class="text-base font-bold text-gray-900">Customer Information</h2>
            <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Full Name *</label>
                <input v-model="form.full_name" type="text" autocomplete="name"
                  class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Email *</label>
                <input v-model="form.email" type="email" autocomplete="email"
                  class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
                <input v-model="form.phone" type="tel" autocomplete="tel"
                  class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Country</label>
                <input v-model="form.country" type="text"
                  class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
              </div>
              <div class="sm:col-span-2">
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Street Address *</label>
                <input v-model="form.address" type="text" autocomplete="street-address"
                  class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">City *</label>
                <input v-model="form.city" type="text"
                  class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">Postal Code</label>
                <input v-model="form.postal_code" type="text" autocomplete="postal-code"
                  class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button class="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700" @click="goStep(2)">
                Continue to Delivery
              </button>
            </div>
          </div>

          <!-- Step 2: Delivery & Payment -->
          <div v-else-if="step === 2">
            <h2 class="text-base font-bold text-gray-900">Delivery Method</h2>
            <div class="mt-4 space-y-3">
              <label v-for="opt in DELIVERY_OPTIONS" :key="opt.id"
                class="flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition"
                :class="form.delivery_method === opt.id ? 'border-primary-500 bg-primary-50/50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'">
                <input v-model="form.delivery_method" type="radio" :value="opt.id" class="h-4 w-4 accent-primary-600" />
                <div class="flex-1">
                  <p class="text-sm font-semibold text-gray-900">{{ opt.label }}</p>
                  <p class="text-xs text-gray-500">{{ opt.eta }}</p>
                </div>
                <span class="text-sm font-bold text-gray-900">{{ opt.price ? formatCurrency(opt.price) : 'Free' }}</span>
              </label>
            </div>

            <h2 class="mt-8 text-base font-bold text-gray-900">Payment Method</h2>
            <div class="mt-4 space-y-3">
              <label v-for="m in PAYMENT_METHODS" :key="m.id"
                class="flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition"
                :class="form.payment_method === m.id ? 'border-primary-500 bg-primary-50/50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'">
                <input v-model="form.payment_method" type="radio" :value="m.id" class="h-4 w-4 accent-primary-600" />
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ m.label }}</p>
                  <p class="text-xs text-gray-500">{{ m.desc }}</p>
                </div>
              </label>
            </div>

            <div class="mt-6">
              <label class="mb-1.5 block text-sm font-medium text-gray-700">Order Notes (optional)</label>
              <textarea v-model="form.notes" rows="2" placeholder="Special instructions for delivery…"
                class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
            </div>

            <div class="mt-6 flex justify-between">
              <button class="rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 hover:text-gray-900" @click="step = 1">← Back</button>
              <button class="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700" @click="goStep(3)">
                Review Order
              </button>
            </div>
          </div>

          <!-- Step 3: Review -->
          <div v-else>
            <h2 class="text-base font-bold text-gray-900">Review Your Order</h2>

            <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="rounded-xl bg-gray-50 p-4 text-sm">
                <p class="font-semibold text-gray-900">Ship To</p>
                <p class="mt-1 text-gray-600">{{ form.full_name }}</p>
                <p class="text-gray-600">{{ form.address }}, {{ form.city }} {{ form.postal_code }}</p>
                <p class="text-gray-600">{{ form.country }}</p>
                <button class="mt-2 text-xs font-semibold text-primary-600 hover:underline" @click="step = 1">Edit</button>
              </div>
              <div class="rounded-xl bg-gray-50 p-4 text-sm">
                <p class="font-semibold text-gray-900">Method</p>
                <p class="mt-1 text-gray-600">{{ DELIVERY_OPTIONS.find(d => d.id === form.delivery_method)?.label }}</p>
                <p class="mt-2 font-semibold text-gray-900">Payment</p>
                <p class="text-gray-600">{{ PAYMENT_METHODS.find(m => m.id === form.payment_method)?.label }}</p>
                <button class="mt-2 text-xs font-semibold text-primary-600 hover:underline" @click="step = 2">Edit</button>
              </div>
            </div>

            <div class="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-100">
              <div v-for="item in cart.items" :key="item.id" class="flex items-center gap-3 p-3">
                <img v-if="item.image_url" :src="item.image_url" class="h-12 w-12 shrink-0 overflow-hidden rounded-lg object-cover" alt="" />
                <div v-else class="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <ImagePlaceholder type="product" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-gray-900">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">Qty {{ item.quantity }}<template v-if="item.variant"> · {{ item.variant.value }}</template></p>
                </div>
                <p class="text-sm font-semibold">{{ formatCurrency(item.subtotal) }}</p>
              </div>
            </div>

            <div class="mt-6 flex justify-between">
              <button class="rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 hover:text-gray-900" @click="step = 2">← Back</button>
              <button
                class="rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50"
                :disabled="placing"
                @click="placeOrder"
              >
                {{ placing ? 'Placing Order…' : `Place Order · ${formatCurrency(total)}` }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary sidebar -->
      <aside class="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <h2 class="text-base font-bold text-gray-900">Order Summary</h2>

        <!-- Coupon -->
        <div class="mt-4">
          <div v-if="coupon" class="flex items-center justify-between rounded-lg bg-emerald-50 px-3.5 py-2.5 ring-1 ring-inset ring-emerald-200">
            <p class="text-sm"><span class="font-bold text-emerald-700">{{ coupon.code }}</span> applied</p>
            <button class="text-xs font-medium text-emerald-700 hover:underline" @click="removeCoupon">Remove</button>
          </div>
          <div v-else class="flex gap-2">
            <input v-model="couponCode" placeholder="Coupon code"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-primary-500 focus:outline-none" />
            <button
              class="shrink-0 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              :disabled="couponLoading"
              @click="applyCoupon"
            >
              Apply
            </button>
          </div>
        </div>

        <dl class="mt-5 space-y-3 text-sm">
          <div class="flex justify-between text-gray-600">
            <dt>Subtotal</dt>
            <dd class="font-semibold text-gray-900">{{ formatCurrency(cart.subtotal) }}</dd>
          </div>
          <div class="flex justify-between text-gray-600">
            <dt>Shipping</dt>
            <dd class="font-semibold text-gray-900">{{ shippingFee === 0 ? 'Free' : formatCurrency(shippingFee) }}</dd>
          </div>
          <div v-if="coupon" class="flex justify-between text-emerald-600">
            <dt>Discount</dt>
            <dd class="font-semibold">−{{ formatCurrency(coupon.discount) }}</dd>
          </div>
          <div class="flex justify-between border-t border-gray-100 pt-3 text-base font-extrabold text-gray-900">
            <dt>Total</dt>
            <dd>{{ formatCurrency(total) }}</dd>
          </div>
        </dl>
      </aside>
    </div>
  </div>
</template>
