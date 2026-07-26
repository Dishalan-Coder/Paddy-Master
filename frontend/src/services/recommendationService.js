import api from './api';

export default {
  getAll: () => api.get('/recommendations/').then((response) => response.data),
};
