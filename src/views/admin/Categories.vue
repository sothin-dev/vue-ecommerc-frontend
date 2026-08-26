<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import DataTable from '@/components/admin/DataTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'

const toast = useToastStore()

const categories = ref([])
const parentOptions = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)
const filters = reactive({ search: '', status: '' })

const showForm = ref(false)
const editingId = ref(null)
const saving = ref(false)
const formErrors = ref({})
const imageFile = ref(null)
const imagePreview = ref(null)
const removeImage = ref(false)

const emptyForm = () => ({ name: '', slug: '', description: '', parent_id: '', is_active: true })
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
    const { data } = await adminService.category(id)
    detail.value = { ...data.data, parent_options: data.parent_options }
  } catch (_) {
    toast.error('Failed to load category details.')
    showDetail.value = false
  } finally {
    detailLoading.value = false
  }
}

async function load(page = 1) {
  loading.value = true
  try {
    const { data } = await adminService.categories({ ...filters, page })
    categories.value = data.data
    meta.value = data.meta
  } catch (_) {
    toast.error('Failed to load categories.')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  formErrors.value = {}
  imageFile.value = null
  imagePreview.value = null
  removeImage.value = false

  adminService.allCategories().then(({ data }) => {
    parentOptions.value = data.data.filter(c => c.is_active && c.parent_id === null)
  }).catch(() => {})
  showForm.value = true
}

async function openEdit(id) {
  formErrors.value = {}
  try {
    const { data } = await adminService.category(id)
    const c = data.data
    editingId.value = c.id
    Object.assign(form, {
      name: c.name, slug: c.slug, description: c.description || '',
      parent_id: c.parent_id ?? '', is_active: c.is_active
    })
    parentOptions.value = data.parent_options
    imagePreview.value = c.image_url
    imageFile.value = null
    removeImage.value = false
    showForm.value = true
  } catch (_) {
    toast.error('Failed to load the category.')
  }
}

function autoSlug() {
  if (editingId.value) return
  form.slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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
    fd.append('name', form.name)
    fd.append('slug', form.slug)
    fd.append('description', form.description || '')
    if (form.parent_id) fd.append('parent_id', form.parent_id)
    fd.append('is_active', form.is_active ? '1' : '0')
    if (imageFile.value) fd.append('image', imageFile.value)
    if (editingId.value && removeImage.value) fd.append('remove_image', '1')

    if (editingId.value) {
      fd.append('_method', 'PATCH')
      await adminService.updateCategory(editingId.value, fd)
      toast.success('Category updated successfully.')
    } else {
      await adminService.createCategory(fd)
      toast.success('Category created successfully.')
    }
    showForm.value = false
    await load(meta.value.current_page)
  } catch (e) {
    if (e.response?.status === 422 && e.response.data?.errors) {
      const errs = e.response.data.errors
      formErrors.value = errs
      toast.error(Object.values(errs)[0][0])
    } else {
      toast.error(e.response?.data?.message || 'Could not save the category.')
    }
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  deleting.value = true
  try {
    const { data } = await adminService.deleteCategory(deleteTarget.value.id)
    toast.success(data.message)
    await load(meta.value.current_page)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Could not delete the category.')
  } finally {
    deleting.value = false
    deleteTarget.value = null
  }
}

onMounted(() => load())
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Categories</h1>
        <p class="mt-0.5 text-sm text-gray-500">{{ meta.total }} categor(ies)</p>
      </div>
      <button class="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700" @click="openCreate">
        + New Category
      </button>
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <input v-model="filters.search" placeholder="Search…" @keyup.enter="load(1)"
        class="w-full max-w-xs rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none sm:w-64" />
      <select v-model="filters.status" @change="load(1)"
        class="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-primary-500 focus:outline-none">
        <option value="">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700" @click="load(1)">Search</button>
    </div>

    <div class="mt-5">
      <DataTable :columns="[
        { key: 'name', label: 'Category' },
        { key: 'parent', label: 'Parent' },
        { key: 'products', label: 'Products' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: '' }
      ]" :loading="loading">
        <tr v-for="c in categories" :key="c.id" class="hover:bg-gray-50/50">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <img v-if="c.image_url" :src="c.image_url" class="h-10 w-10 rounded-lg object-cover" alt="" />
              <div v-else class="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <ImagePlaceholder type="category" />
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ c.name }}</p>
                <p class="text-xs text-gray-400">{{ c.slug }}</p>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-gray-600">{{ c.parent_name || '—' }}</td>
          <td class="px-4 py-3 font-semibold text-gray-900">{{ c.products_count }}</td>
          <td class="px-4 py-3"><StatusBadge :status="c.is_active ? 'active' : 'inactive'" /></td>
          <td class="px-4 py-3 text-right">
            <button class="mr-0.5 rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="View details" @click="openDetail(c.id)">
              <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
            <button class="rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="Edit" @click="openEdit(c.id)">
              <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Delete" @click="deleteTarget = c">
              <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </td>
        </tr>
      </DataTable>

      <div class="mt-5 flex justify-center">
        <AppPagination :current-page="meta.current_page" :last-page="meta.last_page" :total="meta.total" @change="load($event)" />
      </div>
    </div>

    <!-- Modal -->
    <BaseModal :open="showForm" :title="editingId ? 'Edit Category' : 'New Category'" @close="!saving && (showForm = false)">
      <form class="space-y-4" @submit.prevent="save">
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
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Parent Category</label>
          <select v-model="form.parent_id"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">None (top level)</option>
            <option v-for="p in parentOptions" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Description *</label>
          <textarea v-model="form.description" rows="3" required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Image</label>
          <div class="flex items-center gap-4">
            <img v-if="imagePreview" :src="imagePreview" class="h-14 w-14 rounded-xl object-cover ring-1 ring-gray-200" alt="" />
            <input type="file" accept="image/jpeg,image/png,image/webp" @change="onImageChange"
              class="text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100" />
          </div>
        </div>
        <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
          <input v-model="form.is_active" type="checkbox" class="h-4 w-4 accent-primary-600" />
          Active
        </label>
      </form>
      <template #footer>
        <button class="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700" :disabled="saving" @click="showForm = false">Cancel</button>
        <button class="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : editingId ? 'Update' : 'Create' }}
        </button>
      </template>
    </BaseModal>

    <!-- Detail Modal -->
    <BaseModal :open="showDetail" size="sm" title="Category Details" @close="showDetail = false">
      <div v-if="detailLoading" class="py-10 text-center text-sm text-gray-400">Loading…</div>
      <div v-else-if="detail" class="space-y-4">
        <div class="flex items-center gap-4">
          <img v-if="detail.image_url" :src="detail.image_url" class="h-16 w-16 rounded-xl object-cover ring-1 ring-gray-200" alt="" />
          <div v-else class="h-16 w-16 overflow-hidden rounded-xl">
            <ImagePlaceholder type="category" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-bold text-gray-900">{{ detail.name }}</h3>
              <StatusBadge :status="detail.is_active ? 'active' : 'inactive'" />
            </div>
            <p class="font-mono text-xs text-gray-400">/{{ detail.slug }}</p>
          </div>
        </div>

        <dl class="space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
          <div class="flex justify-between"><dt class="text-gray-500">Parent</dt><dd>{{ detail.parent_name || 'Top level' }}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Products</dt><dd class="font-medium">{{ detail.products_count }}</dd></div>
          <div><dt class="text-xs text-gray-400 uppercase tracking-wide">Description</dt>
            <dd class="mt-1 text-gray-600">{{ detail.description || '—' }}</dd>
          </div>
        </dl>

        <a :href="'/category/' + detail.slug" target="_blank"
          class="block rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-center text-sm font-semibold text-primary-700 hover:bg-primary-100">
          View in store ↗
        </a>
      </div>
    </BaseModal>

    <ConfirmDialog :open="!!deleteTarget" danger title="Delete this category?"
      :message="`'${deleteTarget?.name}' will be permanently removed.`"
      confirm-text="Delete" :loading="deleting"
      @close="deleteTarget = null" @confirm="doDelete" />
  </div>
</template>
