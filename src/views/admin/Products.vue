<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { formatCurrency } from '@/composables/useFormat'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import DataTable from '@/components/admin/DataTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'

const toast = useToastStore()

const products = ref([])
const categories = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)

const filters = reactive({ search: '', category_id: '', status: '', sort: 'newest' })

// ── Form modal ──
const showForm = ref(false)
const editingId = ref(null)
const saving = ref(false)
const imagePreview = ref(null)
const imageFile = ref(null)
const removeImage = ref(false)
const formErrors = ref({})

const emptyForm = () => ({
  category_id: '',
  name: '',
  slug: '',
  description: '',
  price: '',
  sale_price: '',
  stock: 0,
  sku: '',
  is_active: true,
  variants: []
})

const form = reactive(emptyForm())

const deleteTarget = ref(null)
const deleting = ref(false)

// Detail view
const showDetail = ref(false)
const detail = ref(null)
const detailLoading = ref(false)

async function openDetail(id) {
  showDetail.value = true
  detailLoading.value = true
  detail.value = null
  try {
    const { data } = await adminService.product(id)
    detail.value = data.data
  } catch (_) {
    toast.error('Failed to load product details.')
    showDetail.value = false
  } finally {
    detailLoading.value = false
  }
}

function autoSlug() {
  if (editingId.value) return
  form.slug = form.name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function addVariant() {
  form.variants.push({ type: '', value: '', sku: null, price: null, stock: 0 })
}
function removeVariant(i) {
  form.variants.splice(i, 1)
}

async function load(page = 1) {
  loading.value = true
  try {
    const { data } = await adminService.products({ ...filters, page })
    products.value = data.data
    meta.value = data.meta
  } catch (_) {
    toast.error('Failed to load products.')
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    const { data } = await adminService.allCategories()
    categories.value = data.data
  } catch (_) {}
}

function openCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  formErrors.value = {}
  imageFile.value = null
  imagePreview.value = null
  removeImage.value = false
  showForm.value = true
}

async function openEdit(id) {
  formErrors.value = {}
  try {
    const { data } = await adminService.product(id)
    const p = data.data
    editingId.value = p.id
    Object.assign(form, {
      category_id: p.category_id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      price: p.price,
      sale_price: p.sale_price ?? '',
      stock: p.stock,
      sku: p.sku,
      is_active: p.is_active,
      variants: (p.variants || []).map(v => ({ ...v }))
    })
    imagePreview.value = p.image_url
    imageFile.value = null
    removeImage.value = false
    showForm.value = true
  } catch (_) {
    toast.error('Failed to load the product.')
  }
}

function onImageChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  imageFile.value = file
  removeImage.value = false
  imagePreview.value = URL.createObjectURL(file)
}

async function save() {
  saving.value = true
  formErrors.value = {}
  try {
    const fd = new FormData()
    fd.append('category_id', form.category_id)
    fd.append('name', form.name)
    fd.append('slug', form.slug)
    fd.append('description', form.description || '')
    fd.append('price', form.price)
    if (form.sale_price !== '' && form.sale_price !== null) fd.append('sale_price', form.sale_price)
    fd.append('stock', form.stock)
    fd.append('sku', form.sku)
    fd.append('is_active', form.is_active ? '1' : '0')
    if (imageFile.value) fd.append('image', imageFile.value)
    if (editingId.value && removeImage.value) fd.append('remove_image', '1')

    form.variants.forEach((v, i) => {
      fd.append(`variants[${i}][type]`, v.type || '')
      fd.append(`variants[${i}][value]`, v.value || '')
      fd.append(`variants[${i}][sku]`, v.sku ?? '')
      fd.append(`variants[${i}][price]`, v.price ?? '')
      fd.append(`variants[${i}][stock]`, v.stock ?? 0)
      if (v.id) fd.append(`variants[${i}][id]`, v.id)
    })

    if (editingId.value) {
      fd.append('_method', 'PATCH')
      await adminService.updateProduct(editingId.value, fd)
      toast.success('Product updated successfully.')
    } else {
      await adminService.createProduct(fd)
      toast.success('Product created successfully.')
    }
    showForm.value = false
    await load(meta.value.current_page)
  } catch (e) {
    if (e.response?.status === 422 && e.response.data?.errors) {
      formErrors.value = e.response.data.errors
    } else {
      toast.error(e.response?.data?.message || 'Could not save the product.')
    }
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  deleting.value = true
  try {
    const { data } = await adminService.deleteProduct(deleteTarget.value.id)
    toast.success(data.message)
    await load(meta.value.current_page)
  } catch (_) {
    toast.error('Could not delete the product.')
  } finally {
    deleting.value = false
    deleteTarget.value = null
  }
}

const hasVariants = computed(() => form.variants.length > 0)

onMounted(() => {
  load()
  loadCategories()
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Products</h1>
        <p class="mt-0.5 text-sm text-gray-500">{{ meta.total }} product(s) in catalog</p>
      </div>
      <button class="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700" @click="openCreate">
        + New Product
      </button>
    </div>

    <!-- Filters -->
    <div class="mt-6 flex flex-wrap items-center gap-3">
      <input v-model="filters.search" placeholder="Search by name or SKU…" @keyup.enter="load(1)"
        class="w-full max-w-xs rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 sm:w-64" />
      <select v-model="filters.category_id" @change="load(1)"
        class="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-primary-500 focus:outline-none">
        <option value="">All Categories</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select v-model="filters.status" @change="load(1)"
        class="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-primary-500 focus:outline-none">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select v-model="filters.sort" @change="load(1)"
        class="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-primary-500 focus:outline-none">
        <option value="newest">Newest</option>
        <option value="name">Name A–Z</option>
        <option value="price_asc">Price ↑</option>
        <option value="price_desc">Price ↓</option>
        <option value="stock_asc">Stock ↑</option>
      </select>
      <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700" @click="load(1)">Search</button>
    </div>

    <!-- Table -->
    <div class="mt-5">
      <DataTable :columns="[
        { key: 'product', label: 'Product' },
        { key: 'category', label: 'Category' },
        { key: 'price', label: 'Price' },
        { key: 'stock', label: 'Stock' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: '' }
      ]" :loading="loading">
        <tr v-for="p in products" :key="p.id" class="hover:bg-gray-50/50">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <img v-if="p.image_url" :src="p.image_url" class="h-10 w-10 rounded-lg object-cover" alt="" />
              <div v-else class="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <ImagePlaceholder type="product" />
              </div>
              <div class="min-w-0">
                <p class="truncate font-medium text-gray-900">{{ p.name }}</p>
                <p class="text-xs text-gray-400">{{ p.sku }}</p>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-gray-600">{{ p.category?.name }}</td>
          <td class="px-4 py-3">
            <template v-if="p.sale_price">
              <span class="font-semibold text-gray-900">{{ formatCurrency(p.sale_price) }}</span>
              <span class="ml-1 text-xs text-gray-400 line-through">{{ formatCurrency(p.price) }}</span>
            </template>
            <span v-else class="font-semibold text-gray-900">{{ formatCurrency(p.price) }}</span>
          </td>
          <td class="px-4 py-3">
            <span class="inline-flex min-w-[36px] justify-center rounded-full px-2 py-0.5 text-xs font-bold"
              :class="p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
              {{ p.stock }}
            </span>
          </td>
          <td class="px-4 py-3"><StatusBadge :status="p.is_active ? 'active' : 'inactive'" /></td>
          <td class="px-4 py-3 text-right">
            <button class="mr-0.5 rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="View details" @click="openDetail(p.id)">
              <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
            <button class="rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="Edit" @click="openEdit(p.id)">
              <svg class="h-4.5 w-4.5 h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Delete" @click="deleteTarget = p">
              <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </td>
        </tr>
      </DataTable>

      <div class="mt-5 flex justify-center">
        <AppPagination :current-page="meta.current_page" :last-page="meta.last_page" :total="meta.total" @change="load($event)" />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal :open="showForm" size="lg" :title="editingId ? 'Edit Product' : 'New Product'" @close="!saving && (showForm = false)">
      <form class="space-y-4" @submit.prevent="save">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Name *</label>
            <input v-model="form.name" required @input="autoSlug"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
            <p v-if="formErrors.name" class="mt-1 text-xs text-red-600">{{ formErrors.name[0] }}</p>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Slug *</label>
            <input v-model="form.slug" required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
            <p v-if="formErrors.slug" class="mt-1 text-xs text-red-600">{{ formErrors.slug[0] }}</p>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Category *</label>
            <select v-model="form.category_id" required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
              <option value="" disabled>Select category…</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">SKU *</label>
            <input v-model="form.sku" required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
            <p v-if="formErrors.sku" class="mt-1 text-xs text-red-600">{{ formErrors.sku[0] }}</p>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Price ($) *</label>
            <input v-model.number="form.price" type="number" step="0.01" min="0" required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
            <p v-if="formErrors.price" class="mt-1 text-xs text-red-600">{{ formErrors.price[0] }}</p>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Sale Price ($)</label>
            <input v-model.number="form.sale_price" type="number" step="0.01" min="0"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
            <p v-if="formErrors.sale_price" class="mt-1 text-xs text-red-600">{{ formErrors.sale_price[0] }}</p>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Stock *</label>
            <input v-model.number="form.stock" type="number" min="0" required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
          </div>
          <div class="flex items-end pb-1">
            <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
              <input v-model="form.is_active" type="checkbox" class="h-4 w-4 accent-primary-600" />
              Active (visible in store)
            </label>
          </div>
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Description *</label>
            <textarea v-model="form.description" rows="3" required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
          </div>
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Image</label>
            <div class="flex items-center gap-4">
              <img v-if="imagePreview" :src="imagePreview" class="h-16 w-16 rounded-xl object-cover ring-1 ring-gray-200" alt="" />
              <input type="file" accept="image/jpeg,image/png,image/webp" @change="onImageChange"
                class="text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100" />
              <label v-if="imagePreview && !imageFile" class="flex items-center gap-1.5 text-xs text-red-500">
                <input v-model="removeImage" type="checkbox" class="h-3.5 w-3.5 accent-red-600" /> Remove image
              </label>
            </div>
          </div>
        </div>

        <!-- Variants -->
        <div class="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-800">Variants <span class="font-normal text-gray-400">(optional)</span></h3>
            <button type="button" class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50" @click="addVariant">
              + Add Variant
            </button>
          </div>
          <div v-for="(v, i) in form.variants" :key="i" class="mt-3 grid grid-cols-12 items-center gap-2">
            <input v-model="v.type" placeholder="Type (e.g. Size)" required
              class="col-span-3 rounded-lg border border-gray-300 px-2.5 py-2 text-sm focus:border-primary-500 focus:outline-none" />
            <input v-model="v.value" placeholder="Value (e.g. XL)" required
              class="col-span-3 rounded-lg border border-gray-300 px-2.5 py-2 text-sm focus:border-primary-500 focus:outline-none" />
            <input v-model.number="v.price" type="number" step="0.01" min="0" placeholder="Price override"
              class="col-span-3 rounded-lg border border-gray-300 px-2.5 py-2 text-sm focus:border-primary-500 focus:outline-none" />
            <input v-model.number="v.stock" type="number" min="0" placeholder="Stock" required
              class="col-span-2 rounded-lg border border-gray-300 px-2.5 py-2 text-sm focus:border-primary-500 focus:outline-none" />
            <button type="button" class="col-span-1 justify-self-end rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" @click="removeVariant(i)">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <p v-if="!hasVariants" class="mt-2 text-xs italic text-gray-400">No variants — the main stock and price will be used.</p>
        </div>
      </form>

      <template #footer>
        <button class="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700" :disabled="saving" @click="showForm = false">Cancel</button>
        <button
          class="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Saving…' : editingId ? 'Update Product' : 'Create Product' }}
        </button>
      </template>
    </BaseModal>

    <!-- Detail Modal -->
    <BaseModal :open="showDetail" size="lg" title="Product Details" @close="showDetail = false">
      <div v-if="detailLoading" class="py-10 text-center text-sm text-gray-400">Loading…</div>
      <div v-else-if="detail" class="space-y-5">
        <div class="flex flex-wrap items-start gap-5">
          <img v-if="detail.image_url" :src="detail.image_url" class="h-36 w-36 rounded-2xl object-cover ring-1 ring-gray-200" alt="" />
          <div v-else class="h-36 w-36 overflow-hidden rounded-2xl">
            <ImagePlaceholder type="product" label="No photo" />
          </div>
          <div class="min-w-0 flex-1 space-y-1.5">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-lg font-bold text-gray-900">{{ detail.name }}</h3>
              <StatusBadge :status="detail.is_active ? 'active' : 'inactive'" />
            </div>
            <p class="font-mono text-xs text-gray-400">SKU: {{ detail.sku }} · Slug: {{ detail.slug }}</p>
            <p class="text-sm text-gray-500">Category: <span class="font-medium text-gray-800">{{ detail.category?.name }}</span></p>
            <div class="flex items-baseline gap-2 pt-1">
              <span class="text-2xl font-extrabold text-gray-900">{{ formatCurrency(detail.sale_price ?? detail.price) }}</span>
              <span v-if="detail.sale_price" class="text-sm text-gray-400 line-through">{{ formatCurrency(detail.price) }}</span>
            </div>
            <p class="text-sm">
              <span class="inline-flex min-w-[44px] justify-center rounded-full px-2 py-0.5 text-xs font-bold"
                :class="detail.stock === 0 ? 'bg-red-100 text-red-700' : detail.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
                {{ detail.stock }} in stock
              </span>
            </p>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-bold uppercase tracking-wide text-gray-400">Description</h4>
          <p class="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-gray-600">{{ detail.description || '—' }}</p>
        </div>

        <div v-if="detail.variants && detail.variants.length">
          <h4 class="text-xs font-bold uppercase tracking-wide text-gray-400">Variants ({{ detail.variants.length }})</h4>
          <ul class="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-100">
            <li v-for="v in detail.variants" :key="v.id" class="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{{ v.type }}</span>
              <span class="font-medium text-gray-900">{{ v.value }}</span>
              <span v-if="v.sku" class="font-mono text-xs text-gray-400">{{ v.sku }}</span>
              <span v-if="v.price !== null" class="ml-auto text-sm font-semibold">{{ formatCurrency(v.price) }}</span>
              <span class="ml-auto inline-flex min-w-[40px] justify-center rounded-full px-2 py-0.5 text-xs font-bold"
                :class="v.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'">
                {{ v.stock }}
              </span>
            </li>
          </ul>
        </div>

        <dl class="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-3">
          <div><dt class="text-xs text-gray-400">Created</dt><dd>{{ detail.created_at || '—' }}</dd></div>
          <div><dt class="text-xs text-gray-400">Variants</dt><dd class="font-medium">{{ detail.variants_count }}</dd></div>
          <div><dt class="text-xs text-gray-400">Store link</dt>
            <dd><a :href="'/products/' + detail.slug" target="_blank" class="font-medium text-primary-600 hover:underline">View in store ↗</a></dd>
          </div>
        </dl>
      </div>
    </BaseModal>

    <ConfirmDialog
      :open="!!deleteTarget"
      danger
      title="Delete this product?"
      :message="`'${deleteTarget?.name}' will be permanently removed (or deactivated if it has orders).`"
      confirm-text="Delete"
      :loading="deleting"
      @close="deleteTarget = null"
      @confirm="doDelete"
    />
  </div>
</template>
