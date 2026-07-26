import api from './api';
export default {
  getAll: (c) => api.get('/expenses/', {params:{crop_id:c}}).then(r=>r.data),
  add: (d) => api.post('/expenses/', d).then(r=>r.data),
  getProfitLoss: () => api.get('/expenses/profit-loss').then(r=>r.data)
};
