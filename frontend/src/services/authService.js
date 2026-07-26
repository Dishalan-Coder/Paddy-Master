import api from './api';

export default {
  login: (data) =>
    api.post('/auth/login', data).then((response) => response.data),
  register: (data) =>
    api.post('/auth/register', data).then((response) => response.data),
  getProfile: () => api.get('/users/me').then((response) => response.data),
};
