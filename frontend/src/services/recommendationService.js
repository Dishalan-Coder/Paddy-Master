import api from './api';

export default {
  getAll: () => api.get('/recommendations/').then((response) => response.data),
  chat: (message) =>
    api.post('/recommendations/chat', { message }).then((response) => response.data),
};
