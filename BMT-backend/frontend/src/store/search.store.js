import { create } from 'zustand';

export const useSearchStore = create((set) => ({
  from: '',
  to: '',
  date: '',
  quota: 'GN', // 'GN' (General), 'TQ' (Tatkal), 'PT' (Premium Tatkal), 'LD' (Ladies), 'SS' (Senior Citizen)
  results: null,
  isSearching: false,

  setSearchParams: (from, to, date, quota = 'GN') => set({ from, to, date, quota }),
  setQuota: (quota) => set({ quota }),
  setResults: (results) => set({ results, isSearching: false }),
  setSearching: (v) => set({ isSearching: v }),
  clearResults: () => set({ results: null }),
}));
