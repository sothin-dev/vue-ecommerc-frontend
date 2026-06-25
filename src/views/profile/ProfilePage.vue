<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1>My Profile</h1>
        <div class="breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span class="breadcrumb__sep">/</span>
          <span>Profile</span>
        </div>
      </div>
    </div>

    <div class="container profile-layout">
      <!-- Sidebar nav -->
      <aside class="profile-nav card" style="padding:1.75rem">
        <div class="profile-avatar">
          {{ auth.user?.name?.charAt(0)?.toUpperCase() }}
        </div>
        <p class="profile-name">{{ auth.user?.name }}</p>
        <p class="profile-email">{{ auth.user?.email }}</p>
        <nav class="profile-nav__list">
          <button
            v-for="tab in tabs" :key="tab.key"
            class="profile-nav__item"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <span v-html="tab.icon"></span>
            {{ tab.label }}
          </button>
        </nav>
      </aside>

      <!-- Content -->
      <div class="profile-content">
        <!-- Profile Info -->
        <div v-if="activeTab === 'info'" class="card animate-fade-in" style="padding:2rem">
          <h2 class="tab-title">Personal Information</h2>
          <p class="tab-desc">Update your account details and profile picture.</p>

          <Transition name="fade">
            <div v-if="infoSuccess" class="alert alert-success" style="margin-bottom:1.25rem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {{ infoSuccess }}
            </div>
          </Transition>
          <Transition name="fade">
            <div v-if="infoError" class="alert alert-error" style="margin-bottom:1.25rem">{{ infoError }}</div>
          </Transition>

          <form @submit.prevent="updateProfile">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input v-model="infoForm.name" type="text" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input v-model="infoForm.email" type="email" class="form-control" required />
              </div>
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input v-model="infoForm.phone" type="tel" class="form-control" placeholder="Optional" />
            </div>
            <div class="form-group">
              <label>Avatar Image</label>
              <div class="file-upload">
                <input type="file" class="file-upload__input" accept="image/*" @change="onAvatarChange" />
                <div class="file-upload__content">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span>Click to upload or drag and drop</span>
                  <span class="file-upload__hint">PNG, JPG up to 2MB</span>
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="savingInfo">
              {{ savingInfo ? 'Saving…' : 'Save Changes' }}
            </button>
          </form>
        </div>

        <!-- Change Password -->
        <div v-if="activeTab === 'password'" class="card animate-fade-in" style="padding:2rem">
          <h2 class="tab-title">Change Password</h2>
          <p class="tab-desc">Ensure your account stays secure with a strong password.</p>

          <Transition name="fade">
            <div v-if="pwSuccess" class="alert alert-success" style="margin-bottom:1.25rem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {{ pwSuccess }}
            </div>
          </Transition>
          <Transition name="fade">
            <div v-if="pwError" class="alert alert-error" style="margin-bottom:1.25rem">{{ pwError }}</div>
          </Transition>

          <form @submit.prevent="changePassword" style="max-width:440px">
            <div class="form-group">
              <label>Current Password</label>
              <input v-model="pwForm.current_password" type="password" class="form-control" required />
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input v-model="pwForm.password" type="password" class="form-control" placeholder="Min. 8 characters" required />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input v-model="pwForm.password_confirmation" type="password" class="form-control" required />
            </div>
            <button type="submit" class="btn btn-primary" :disabled="savingPw">
              {{ savingPw ? 'Updating…' : 'Update Password' }}
            </button>
          </form>
        </div>

        <!-- Quick Links -->
        <div v-if="activeTab === 'orders'" class="card animate-fade-in" style="padding:2rem">
          <h2 class="tab-title">My Orders</h2>
          <p class="tab-desc">View and track all your past orders.</p>
          <RouterLink to="/orders" class="btn btn-primary">
            View All Orders
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth      = useAuthStore()
const activeTab = ref('info')

const tabs = [
  {
    key: 'info',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    label: 'Personal Info'
  },
  {
    key: 'password',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
    label: 'Password'
  },
  {
    key: 'orders',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    label: 'My Orders'
  },
]

// Info form
const infoForm   = reactive({ name: '', email: '', phone: '' })
const avatarFile = ref(null)
const savingInfo = ref(false)
const infoSuccess= ref('')
const infoError  = ref('')

// Password form
const pwForm   = reactive({ current_password: '', password: '', password_confirmation: '' })
const savingPw = ref(false)
const pwSuccess= ref('')
const pwError  = ref('')

function onAvatarChange(e) {
  avatarFile.value = e.target.files[0] || null
}

async function updateProfile() {
  infoSuccess.value = ''
  infoError.value   = ''
  savingInfo.value  = true
  try {
    const fd = new FormData()
    fd.append('name',  infoForm.name)
    fd.append('email', infoForm.email)
    if (infoForm.phone) fd.append('phone', infoForm.phone)
    if (avatarFile.value) fd.append('avatar', avatarFile.value)

    const { data } = await api.patch('/profile', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    auth.setAuth(data.data, auth.token)
    infoSuccess.value = 'Profile updated successfully!'
    setTimeout(() => infoSuccess.value = '', 4000)
  } catch (e) {
    const errs = e.response?.data?.errors
    infoError.value = errs
      ? Object.values(errs).flat().join(' ')
      : (e.response?.data?.message || 'Update failed.')
    setTimeout(() => infoError.value = '', 4000)
  } finally {
    savingInfo.value = false
  }
}

async function changePassword() {
  pwSuccess.value = ''
  pwError.value   = ''
  if (pwForm.password !== pwForm.password_confirmation) {
    pwError.value = 'Passwords do not match.'; return
  }
  savingPw.value = true
  try {
    await api.patch('/profile/password', pwForm)
    pwSuccess.value = 'Password changed successfully!'
    Object.assign(pwForm, { current_password: '', password: '', password_confirmation: '' })
    setTimeout(() => pwSuccess.value = '', 4000)
  } catch (e) {
    pwError.value = e.response?.data?.message || 'Failed to change password.'
    setTimeout(() => pwError.value = '', 4000)
  } finally {
    savingPw.value = false
  }
}

onMounted(async () => {
  const user = await auth.fetchProfile()
  infoForm.name  = user.name
  infoForm.email = user.email
  infoForm.phone = user.phone || ''
})
</script>

<style scoped>
.profile-layout {
  display: grid; grid-template-columns: 260px 1fr;
  gap: 1.5rem; align-items: flex-start; padding-bottom: 3rem;
}

.profile-nav { text-align: center; position: sticky; top: 88px; }
.profile-avatar {
  width: 76px; height: 76px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff; display: grid; place-items: center;
  font-size: 1.8rem; font-weight: 700;
  margin: 0 auto .85rem;
  box-shadow: 0 4px 12px rgba(99,102,241,.3);
}
.profile-name { font-weight: 700; font-size: 1.05rem; color: var(--gray-900); }
.profile-email { font-size: .8rem; color: var(--gray-500); margin-top: .2rem; }

.profile-nav__list { margin-top: 1.5rem; display: flex; flex-direction: column; gap: .3rem; }
.profile-nav__item {
  display: flex; align-items: center; gap: .65rem; width: 100%;
  text-align: left; padding: .7rem 1rem; border: none; background: none;
  border-radius: var(--radius); font-size: .875rem; font-weight: 500;
  color: var(--gray-600); cursor: pointer; transition: all .2s;
}
.profile-nav__item:hover { background: var(--gray-100); color: var(--gray-800); }
.profile-nav__item.active {
  background: var(--primary-50); color: var(--primary); font-weight: 600;
}
.profile-nav__item.active svg { stroke: var(--primary); }

.tab-title { font-size: 1.15rem; font-weight: 700; margin-bottom: .3rem; }
.tab-desc { font-size: .875rem; color: var(--gray-500); margin-bottom: 1.5rem; line-height: 1.5; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.file-upload {
  border: 2px dashed var(--gray-200); border-radius: var(--radius-lg);
  padding: 2rem; text-align: center; cursor: pointer;
  transition: all .2s; position: relative;
}
.file-upload:hover { border-color: var(--primary); background: var(--primary-50); }
.file-upload__input {
  position: absolute; inset: 0; opacity: 0; cursor: pointer;
}
.file-upload__content {
  display: flex; flex-direction: column; align-items: center;
  gap: .5rem; color: var(--gray-500);
}
.file-upload__content svg { color: var(--gray-400); }
.file-upload__hint { font-size: .75rem; color: var(--gray-400); }

/* Fade transition */
.fade-enter-active { animation: fadeInUp .3s var(--ease); }
.fade-leave-active { animation: fadeInUp .2s var(--ease) reverse; }

@media (max-width: 768px) {
  .profile-layout { grid-template-columns: 1fr; }
  .profile-nav { position: static; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
