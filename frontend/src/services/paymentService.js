import api from './api';

export default {
  payOrder: (orderId, data) =>
    api
      .post(`/payments/orders/${orderId}`, data)
      .then((response) => response.data),
  confirmBankTransfer: (orderId) =>
    api
      .patch(`/payments/orders/${orderId}/confirm-bank-transfer`)
      .then((response) => response.data),
  getSubscription: () =>
    api.get('/payments/subscription').then((response) => response.data),
  createSubscriptionCheckout: (data) =>
    api
      .post('/payments/subscription/checkout', data)
      .then((response) => response.data),
  createBillingPortal: () =>
    api.post('/payments/subscription/portal').then((response) => response.data),
};
