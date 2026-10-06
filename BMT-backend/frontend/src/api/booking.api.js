import client from './client';

export const bookingApi = {
  create: (data) => client.post('/bookings/bookings', data).then((r) => r.data),

  list: (status, page = 1, limit = 10, search = '') => {
    const qs = new URLSearchParams();
    if (status) qs.set('status', status);
    qs.set('page', page);
    qs.set('limit', limit);
    if (search) qs.set('search', search);
    return client.get(`/bookings/bookings?${qs.toString()}`).then((r) => r.data);
  },

  getById: (id) => client.get(`/bookings/bookings/${id}`).then((r) => r.data),

  verifyPayment: (id, data) => client.post(`/bookings/bookings/${id}/verify-payment`, data).then((r) => r.data),

  cancel: (id) => client.post(`/bookings/bookings/${id}/cancel`).then((r) => r.data),

  getPnrStatus: async (pnr) => {
    const cleanPnr = String(pnr || '').trim().replace(/\D/g, '');
    try {
      const res = await client.get(`/bookings/pnr/${cleanPnr}`);
      return res.data;
    } catch (err) {
      if (err.response?.status === 404 || err.status === 404) {
        try {
          const res2 = await client.get(`/bookings/bookings/pnr/${cleanPnr}`);
          return res2.data;
        } catch (_) {}
      }
      throw err;
    }
  },

  getScheduleWaitlist: async (scheduleId) => {
    if (!scheduleId) return { waitlistCount: 0, nextWlPosition: 1 };
    try {
      const res = await client.get(`/bookings/schedules/${scheduleId}/waitlist`);
      return res.data;
    } catch (err) {
      if (err.response?.status === 404 || err.status === 404) {
        try {
          const res2 = await client.get(`/schedules/${scheduleId}/waitlist`);
          return res2.data;
        } catch (_) {}
      }
      return { waitlistCount: 0, nextWlPosition: 1 };
    }
  },
};

