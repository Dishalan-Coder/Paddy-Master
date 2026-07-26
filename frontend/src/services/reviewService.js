import api from './api';

export default {
  getForProduct: (productId) =>
    api.get(`/reviews/products/${productId}`).then((response) => response.data),
  create: (productId, data) =>
    api
      .post(`/reviews/products/${productId}`, data)
      .then((response) => response.data),
};
