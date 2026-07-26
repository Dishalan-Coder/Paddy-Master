import api from './api';

export default {
  getAll: (params = {}) => api.get('/notifications/', { params }).then((response) => response.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((response) => response.data),
  markAllRead: () => api.patch('/notifications/read-all').then((response) => response.data),
};
