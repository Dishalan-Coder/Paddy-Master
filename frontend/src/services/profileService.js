import api from './api';

export const PROFILE_FIELDS = [
  'full_name',
  'phone',
  'email',
  'district',
  'address',
  'bio',
];

export const buildProfileUpdatePayload = (data = {}) =>
  PROFILE_FIELDS.reduce((payload, field) => {
    if (!(field in data)) return payload;

    const value = data[field];
    if (typeof value === 'string') {
      payload[field] =
        field === 'email' ? value.trim().toLowerCase() : value.trim();
    } else if (value !== undefined && value !== null) {
      payload[field] = value;
    }

    return payload;
  }, {});

export default {
  get: () => api.get('/users/me').then((response) => response.data),
  update: (data) =>
    api
      .put('/users/me', buildProfileUpdatePayload(data))
      .then((response) => response.data),
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api
      .post('/users/me/photo', formData)
      .then((response) => response.data);
  },
};
