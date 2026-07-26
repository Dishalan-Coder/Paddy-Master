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
};
