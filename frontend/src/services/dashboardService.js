import api from './api';

export default {
  getFarmerData: () => api.get('/dashboard/').then((response) => response.data),
  getBuyerData: () => api.get('/dashboard/buyer').then((response) => response.data),
};
