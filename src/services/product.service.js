import api from './api'

export const productService = {
  list: params => api.get('/products', { params }),
  show: slug => api.get(`/products/${slug}`),
  categories: () => api.get('/categories'),
  category: slug => api.get(`/categories/${slug}`),
  reviews: productId => api.get(`/products/${productId}/reviews`),
  createReview: (productId, payload) => api.post(`/products/${productId}/reviews`, payload),
  updateReview: (productId, reviewId, payload) => api.put(`/products/${productId}/reviews/${reviewId}`, payload),
  deleteReview: (productId, reviewId) => api.delete(`/products/${productId}/reviews/${reviewId}`)
}
