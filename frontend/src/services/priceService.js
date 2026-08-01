import api from './api';

export default {
  getPrices: ({ price_unit_kg: priceUnitKg } = {}) =>
    api
      .get('/prices/', {
        params: {
          ...(priceUnitKg ? { price_unit_kg: priceUnitKg } : {}),
        },
      })
      .then((response) => response.data),
  updatePrices: ({
    prices,
    region = 'national',
    price_date: priceDate,
    price_unit_kg: priceUnitKg,
  }) =>
    api
      .put('/prices/', prices, {
        params: {
          region,
          ...(priceDate ? { price_date: priceDate } : {}),
          ...(priceUnitKg ? { price_unit_kg: priceUnitKg } : {}),
        },
      })
      .then((response) => response.data),
};
