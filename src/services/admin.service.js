import adminApi from './adminApi'

export const adminService = {
  // Auth
  login: (email, password) => adminApi.post('/login', { email, password }),
  logout: () => adminApi.post('/logout'),
  me: () => adminApi.get('/me'),
  getProfile: () => adminApi.get('/profile'),
  updateProfile: payload => adminApi.patch('/profile', payload),
  changePassword: payload => adminApi.patch('/profile/password', payload),

  // Dashboard & reports
  dashboard: () => adminApi.get('/dashboard'),
  reportSummary: days => adminApi.get('/reports/summary', { params: { days } }),

  // Categories
  categories: (params = {}) => adminApi.get('/categories', { params }),
  allCategories: () => adminApi.get('/categories', { params: { all: 1 } }),
  category: id => adminApi.get(`/categories/${id}`),
  createCategory: formData => adminApi.post('/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCategory: (id, formData) => adminApi.post(`/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCategory: id => adminApi.delete(`/categories/${id}`),

  // Products
  products: (params = {}) => adminApi.get('/products', { params }),
  product: id => adminApi.get(`/products/${id}`),
  createProduct: formData => adminApi.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id, formData) => adminApi.post(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: id => adminApi.delete(`/products/${id}`),

  // Orders
  orders: (params = {}) => adminApi.get('/orders', { params }),
  order: id => adminApi.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => adminApi.post(`/orders/${id}/status`, { status }),

  // Customers
  customers: (params = {}) => adminApi.get('/customers', { params }),
  customer: id => adminApi.get(`/customers/${id}`),
  toggleCustomerStatus: id => adminApi.post(`/customers/${id}/toggle-status`),

  // Coupons
  coupons: (params = {}) => adminApi.get('/coupons', { params }),
  coupon: id => adminApi.get(`/coupons/${id}`),
  createCoupon: payload => adminApi.post('/coupons', payload),
  updateCoupon: (id, payload) => adminApi.put(`/coupons/${id}`, payload),
  deleteCoupon: id => adminApi.delete(`/coupons/${id}`),

  // Inventory
  inventory: (params = {}) => adminApi.get('/inventory', { params }),
  adjustStock: (productId, payload) => adminApi.post(`/inventory/${productId}/stock`, payload),

  // Reviews
  reviews: (params = {}) => adminApi.get('/reviews', { params }),
  approveReview: id => adminApi.post(`/reviews/${id}/approve`),
  hideReview: id => adminApi.post(`/reviews/${id}/hide`),
  deleteReview: id => adminApi.delete(`/reviews/${id}`)
}
