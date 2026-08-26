import api from './api'

export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
  register: payload => api.post('/register', payload),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/profile'),
  updateProfile: payload => api.patch('/profile', payload),
  uploadAvatar: formData => api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: payload => api.patch('/profile/password', payload),
  forgotPassword: email => api.post('/forgot-password', { email }),
  resetPassword: payload => api.post('/reset-password', payload)
}
