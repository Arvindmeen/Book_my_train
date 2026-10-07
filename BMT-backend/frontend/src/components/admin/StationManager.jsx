import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Pagination from '../ui/Pagination';

export default function StationManager() {
  const [stations, setStations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', city: '', state: '' });
  const [creating, setCreating] = useState(false);
  const showToast = useToast();

  const fetchStations = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getStations(page, 20, search);
      setStations(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStations(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminApi.createStation(form);
      showToast('Station created!', 'success');
      setForm({ name: '', code: '', city: '', state: '' });
      fetchStations();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStations(1);
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="card mb-6">
        <h3 className="font-semibold mb-4">Create Station</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required maxLength={10} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
        </div>
        <Button type="submit" loading={creating} className="mt-4 w-full sm:w-auto">Create Station</Button>
      </form>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">Stations Directory</h3>
            <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {stations.length} Listed
            </span>
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search station name or code..."
                className="input-field w-full text-xs py-2 pl-3 pr-8 font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); fetchStations(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary" className="px-4 py-2 text-xs font-bold whitespace-nowrap">
              Search
            </Button>
          </form>
        </div>

        {loading ? (
          <p className="text-center py-8 text-gray-400">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Name</th>
                  <th className="py-2 text-left">Code</th>
                  <th className="py-2 text-left">City</th>
                  <th className="py-2 text-left">State</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2">{s.name}</td>
                    <td className="py-2 font-mono">{s.code}</td>
                    <td className="py-2">{s.city}</td>
                    <td className="py-2">{s.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchStations} />
      </div>
    </div>
  );
}
