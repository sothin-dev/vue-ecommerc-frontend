import api from './api'

export const orderService = {
  list: (params = {}) => api.get('/orders', { params }),
  show: orderNumber => api.get(`/orders/${orderNumber}`),
  checkout: payload => api.post('/checkout', payload),
  cancel: orderNumber => api.post(`/orders/${orderNumber}/cancel`),
  reorder: orderNumber => api.post(`/orders/${orderNumber}/reorder`),
  validateCoupon: payload => api.post('/coupon/validate', payload)
}
