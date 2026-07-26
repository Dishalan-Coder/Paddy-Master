import api from './api';
export default {
  getWeather: (d='anuradhapura') => api.get('/weather/', {params:{district:d}}).then(r=>r.data)
};
