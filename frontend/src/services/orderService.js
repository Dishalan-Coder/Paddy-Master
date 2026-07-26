import api from './api';
export default {
  create: (d) => api.post('/orders/', d).then((r) => r.data),
  getBuyerOrders: () => api.get('/orders/buyer').then((r) => r.data),
  getFarmerOrders: () => api.get('/orders/farmer').then((r) => r.data),
  updateStatus: (i, s) =>
    api.patch(`/orders/${i}/status`, { status: s }).then((r) => r.data),
};
