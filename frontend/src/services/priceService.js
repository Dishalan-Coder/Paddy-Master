import api from './api';

export default {
  getPrices: () => api.get('/prices/').then((response) => response.data),
  updatePrices: ({ prices, region = 'national', price_date: priceDate }) =>
    api
      .put('/prices/', prices, {
        params: {
          region,
          ...(priceDate ? { price_date: priceDate } : {}),
        },
      })
      .then((response) => response.data),
};
