import client from './client';

const FALLBACK_STATIONS = [
  { stationId: '1', name: 'New Delhi', code: 'NDLS' },
  { stationId: '2', name: 'Anand Vihar Terminal', code: 'ANVT' },
  { stationId: '3', name: 'Hazrat Nizamuddin', code: 'NZM' },
  { stationId: '4', name: 'Old Delhi Junction', code: 'DLI' },
  { stationId: '5', name: 'Varanasi Jn', code: 'BSB' },
  { stationId: '6', name: 'Howrah Jn', code: 'HWH' },
  { stationId: '7', name: 'Mumbai Central', code: 'MMCT' },
  { stationId: '8', name: 'KSR Bengaluru', code: 'SBC' },
  { stationId: '9', name: 'Chennai Central', code: 'MAS' },
  { stationId: '10', name: 'Bhopal Jn', code: 'BPL' },
  { stationId: '11', name: 'Agra Cantt', code: 'AGC' },
  { stationId: '12', name: 'Kanpur Central', code: 'CNB' },
  { stationId: '13', name: 'Prayagraj Jn', code: 'PRYJ' },
  { stationId: '14', name: 'Patna Jn', code: 'PNBE' },
  { stationId: '15', name: 'Jaipur Jn', code: 'JP' },
  { stationId: '16', name: 'Ahmedabad Jn', code: 'ADI' },
  { stationId: '17', name: 'Pune Jn', code: 'PUNE' },
  { stationId: '18', name: 'Lucknow Charbagh', code: 'LKO' },
  { stationId: '19', name: 'Gorakhpur Jn', code: 'GKP' },
  { stationId: '20', name: 'Amritsar Jn', code: 'ASR' },
];

export const searchApi = {
  search: async (from, to, date) => {
    let url = `/search/trains?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    if (date) url += `&date=${date}`;
    try {
      const res = await client.get(url);
      const data = res.data?.data || res.data;
      if (data) {
        return {
          from: data.from || { resolved: from },
          to: data.to || { resolved: to },
          date: data.date || date,
          count: Array.isArray(data.trains) ? data.trains.length : 0,
          trains: Array.isArray(data.trains) ? data.trains : [],
          message: data.message || (data.trains?.length === 0 ? 'No trains found for this route on the selected date.' : null)
        };
      }
      return { trains: [], count: 0, from: { resolved: from }, to: { resolved: to }, date };
    } catch (err) {
      console.error('Search API error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Search request failed';
      return { 
        trains: [], 
        count: 0, 
        from: { resolved: from }, 
        to: { resolved: to }, 
        date, 
        error: errMsg 
      };
    }
  },

  autocomplete: async (q) => {
    try {
      const res = await client.get(`/search/autocomplete?q=${encodeURIComponent(q)}`);
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        return { data };
      }
    } catch {
      // Fallback to local station list on network failure
    }

    const query = String(q || '').toLowerCase();
    const filtered = FALLBACK_STATIONS.filter(
      (s) => s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query)
    );
    return { data: filtered.length > 0 ? filtered : FALLBACK_STATIONS.slice(0, 8) };
  },
};
