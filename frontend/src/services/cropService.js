import api from './api';
export default {
  getAll: () => api.get('/crops/').then((r) => r.data),
  create: (d) => api.post('/crops/', d).then((r) => r.data),
  update: (i, d) => api.put(`/crops/${i}`, d).then((r) => r.data),
  delete: (i) => api.delete(`/crops/${i}`).then((r) => r.data),
};
