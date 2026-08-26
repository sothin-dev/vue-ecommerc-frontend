<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { authService } from '@/services/auth.service'

const auth = useAuthStore()
const toast = useToastStore()

const profileForm = ref({ name: '', email: '', phone: '' })
const passwordForm = ref({ current_password: '', password: '', password_confirmation: '' })
const savingProfile = ref(false)
const savingPassword = ref(false)
const uploadingAvatar = ref(false)

onMounted(async () => {
  try {
    await auth.fetchProfile()
    profileForm.value = {
      name: auth.user.name || '',
      email: auth.user.email || '',
      phone: auth.user.phone || ''
    }
  } catch (_) {}
})

async function saveProfile() {
  savingProfile.value = true
  try {
    const { data } = await authService.updateProfile(profileForm.value)
    auth.updateUser(data.data)
    toast.success(data.message || 'Profile updated.')
  } catch (e) {
    const errors = e.response?.data?.errors
    toast.error(errors ? Object.values(errors)[0][0] : 'Could not update profile.')
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  savingPassword.value = true
  try {
    const { data } = await authService.changePassword(passwordForm.value)
    toast.success(data.message || 'Password changed.')
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' }
  } catch (e) {
    toast.error(e.response?.data?.message || 'Could not change password.')
  } finally {
    savingPassword.value = false
  }
}

async function uploadAvatar(event) {
  const file = event.target.files?.[0]
  if (!file) return
  uploadingAvatar.value = true
  try {
    const fd = new FormData()
    fd.append('avatar', file)
    await authService.uploadAvatar(fd)
    await auth.fetchProfile()
    toast.success('Avatar updated.')
  } catch (_) {
    toast.error('Could not upload the image (jpg/png/webp, max 2MB).')
  } finally {
    uploadingAvatar.value = false
    event.target.value = ''
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold tracking-tight text-gray-900">My Profile</h1>

    <div class="mt-8 space-y-6">
      <!-- Avatar card -->
      <div class="flex items-center gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        <div class="relative">
          <img
            v-if="auth.user?.avatar_url"
            :src="auth.user.avatar_url"
            :alt="auth.user.name"
            class="h-20 w-20 rounded-full object-cover ring-4 ring-primary-100"
          />
          <span v-else class="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700 ring-4 ring-primary-50">
            {{ (auth.user?.name || '?')[0]?.toUpperCase() }}
          </span>
          <label
            class="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow-md transition hover:bg-primary-700"
            :class="uploadingAvatar && 'opacity-50 pointer-events-none'"
            title="Change photo"
          >
            <svg v-if="!uploadingAvatar" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="uploadAvatar" />
          </label>
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900">{{ auth.user?.name }}</p>
          <p class="text-sm text-gray-500">Member since {{ new Date(auth.user?.created_at || Date.now()).getFullYear() }}</p>
        </div>
      </div>

      <!-- Account details -->
      <form class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-8" @submit.prevent="saveProfile">
        <h2 class="text-base font-bold text-gray-900">Account Details</h2>
        <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
            <input v-model="profileForm.name" required
              class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input v-model="profileForm.email" type="email" required
              class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
            <input v-model="profileForm.phone" type="tel" placeholder="+1234567890"
              class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
          </div>
        </div>
        <div class="mt-6">
          <button type="submit"
            class="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            :disabled="savingProfile">
            {{ savingProfile ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </form>

      <!-- Password -->
      <form class="rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-8" @submit.prevent="changePassword">
        <h2 class="text-base font-bold text-gray-900">Change Password</h2>
        <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">Current Password</label>
            <input v-model="passwordForm.current_password" type="password" required autocomplete="current-password"
              class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">New Password</label>
            <input v-model="passwordForm.password" type="password" required minlength="8" autocomplete="new-password"
              class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input v-model="passwordForm.password_confirmation" type="password" required autocomplete="new-password"
              class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100" />
          </div>
        </div>
        <div class="mt-6">
          <button type="submit"
            class="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            :disabled="savingPassword">
            {{ savingPassword ? 'Updating…' : 'Update Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
