<script setup>
import { ref, onMounted } from 'vue'
import { adminService } from '@/services/admin.service'
import { useAdminAuthStore } from '@/stores/adminAuth'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const adminAuth = useAdminAuthStore()

const profileForm = ref({ name: '', email: '' })
const passwordForm = ref({ current_password: '', password: '', password_confirmation: '' })
const savingProfile = ref(false)
const savingPassword = ref(false)

onMounted(async () => {
  try {
    const { data } = await adminService.getProfile()
    profileForm.value = { name: data.data.name, email: data.data.email }
  } catch (_) {}
})

async function saveProfile() {
  savingProfile.value = true
  try {
    const { data } = await adminService.updateProfile(profileForm.value)
    adminAuth.setAuth(data.data, adminAuth.token)
    toast.success(data.message || 'Profile updated.')
  } catch (e) {
    toast.error(e.response?.data?.message || 'Could not update the profile.')
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  savingPassword.value = true
  try {
    const { data } = await adminService.changePassword(passwordForm.value)
    toast.success(data.message || 'Password changed.')
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' }
  } catch (e) {
    toast.error(e.response?.data?.message || 'Could not change the password.')
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
      <p class="mt-0.5 text-sm text-gray-500">Manage your administrator account</p>
    </div>

    <!-- Profile -->
    <form class="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-8" @submit.prevent="saveProfile">
      <h2 class="text-base font-bold text-gray-900">Administrator Profile</h2>
      <div class="mt-5 space-y-4">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Name</label>
          <input v-model="profileForm.name" required
            class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Email</label>
          <input v-model="profileForm.email" type="email" required
            class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
      </div>
      <button type="submit"
        class="mt-6 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        :disabled="savingProfile">
        {{ savingProfile ? 'Saving…' : 'Save Changes' }}
      </button>
    </form>

    <!-- Password -->
    <form class="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-8" @submit.prevent="changePassword">
      <h2 class="text-base font-bold text-gray-900">Change Password</h2>
      <div class="mt-5 space-y-4">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Current Password</label>
          <input v-model="passwordForm.current_password" type="password" required autocomplete="current-password"
            class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">New Password</label>
            <input v-model="passwordForm.password" type="password" required minlength="8" autocomplete="new-password"
              class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Confirm New Password</label>
            <input v-model="passwordForm.password_confirmation" type="password" required autocomplete="new-password"
              class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
          </div>
        </div>
      </div>
      <button type="submit"
        class="mt-6 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        :disabled="savingPassword">
        {{ savingPassword ? 'Updating…' : 'Update Password' }}
      </button>
    </form>

    <!-- Store info -->
    <div class="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-8">
      <h2 class="text-base font-bold text-gray-900">Store Information</h2>
      <dl class="mt-4 space-y-2 text-sm">
        <div class="flex justify-between"><dt class="text-gray-500">Store name</dt><dd class="font-medium">NovaShop</dd></div>
        <div class="flex justify-between"><dt class="text-gray-500">Free shipping threshold</dt><dd class="font-medium">$50</dd></div>
        <div class="flex justify-between"><dt class="text-gray-500">Standard shipping fee</dt><dd class="font-medium">$5</dd></div>
        <div class="flex justify-between"><dt class="text-gray-500">Payment methods</dt><dd class="font-medium capitalize">COD · Bank Transfer · Card</dd></div>
      </dl>
      <p class="mt-4 text-xs italic text-gray-400">These settings are managed by business rules in the Laravel backend.</p>
    </div>
  </div>
</template>
