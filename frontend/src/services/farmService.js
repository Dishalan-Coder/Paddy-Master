import api from './api';

export default {
  getAll: () => api.get('/farms/').then((response) => response.data),
  create: (data) => api.post('/farms/', data).then((response) => response.data),
  update: (id, data) => api.put(`/farms/${id}`, data).then((response) => response.data),
  delete: (id) => api.delete(`/farms/${id}`).then((response) => response.data),
};
