import api from './api';
export default {
  getAll: (p) => api.get('/products/', {params:p}).then(r=>r.data),
  getById: (i) => api.get(`/products/${i}`).then(r=>r.data),
  getMy: () => api.get('/products/my').then(r=>r.data),
  create: (d) => api.post('/products/', d).then(r=>r.data),
  delete: (i) => api.delete(`/products/${i}`).then(r=>r.data)
};
