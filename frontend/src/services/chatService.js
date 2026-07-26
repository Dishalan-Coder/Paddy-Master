import api from './api';
export default {
  send: (c, r, con) =>
    api
      .post(`/messages/${c}`, { receiver_id: r, content: con })
      .then((r) => r.data),
  getMessages: (c) => api.get(`/messages/${c}`).then((r) => r.data),
};
