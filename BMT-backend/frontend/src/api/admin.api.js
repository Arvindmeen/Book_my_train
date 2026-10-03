import client from './client';

export const adminApi = {
  createStation: (data) => client.post('/admins/stations/station', data).then((r) => r.data),
  getStations: (page = 1, limit = 20, search = '') => {
    let url = `/admins/stations/station?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return client.get(url).then((r) => r.data);
  },

  createTrain: (data) => client.post('/admins/trains/train', data).then((r) => r.data),
  getTrains: () => client.get('/admins/trains/train').then((r) => r.data),
  getTrainById: (id) => client.get(`/admins/trains/train/${id}`).then((r) => r.data),

  createRoute: (data) => client.post('/admins/trains/route', data).then((r) => r.data),

  createSchedule: (data) => client.post('/admins/schedules/schedule', data).then((r) => r.data),
  getSchedules: (query = '') => client.get(`/admins/schedules/schedule${query ? '?' + query : ''}`).then((r) => r.data),
  cancelSchedule: (id) => client.put(`/admins/schedules/schedule/${id}`).then((r) => r.data),

  getSystemHealth: () => client.get('/admin/system-health').then((r) => r.data),
  getBookings: (status, page = 1, limit = 50, search = '') => {
    const qs = new URLSearchParams();
    if (status && status !== 'ALL') qs.set('status', status);
    qs.set('page', page);
    qs.set('limit', limit);
    qs.set('all', 'true');
    if (search) qs.set('search', search);
    return client.get(`/bookings/bookings?${qs.toString()}`).then((r) => r.data);
  },
};
