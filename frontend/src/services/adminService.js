import api from './api';

export default {
  getAnalytics: () => api.get('/dashboard/admin').then((response) => response.data),
  getUsers: (params) => api.get('/admin/users', { params }).then((response) => response.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((response) => response.data),
  verifyUser: (id) => api.patch(`/admin/users/${id}/verify`).then((response) => response.data),
  getProducts: (params) => api.get('/admin/products', { params }).then((response) => response.data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`).then((response) => response.data),
  getOrders: (params) => api.get('/admin/orders', { params }).then((response) => response.data),
};
