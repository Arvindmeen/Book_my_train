import { create } from 'zustand';
import { authApi } from '../api/auth.api';

const ADMIN_EMAIL = 'arvindmeena8171@gmail.com';

const enrichUserRole = (rawUser) => {
  if (!rawUser) return null;
  const email = (rawUser.email || '').trim().toLowerCase();
  const isAdmin = email === ADMIN_EMAIL;
  return {
    ...rawUser,
    email: rawUser.email || (isAdmin ? ADMIN_EMAIL : ''),
    role: isAdmin ? 'ADMIN' : 'USER',
    isAdmin: isAdmin,
    ...(isAdmin ? {
      firstName: rawUser.firstName || 'Arvind',
      lastName: rawUser.lastName || 'Meena',
    } : {})
  };
};

const getExtendedKey = (user) => {
  if (!user) return null;
  return `bmt_user_profile_${user.id || user.email}`;
};

const mergeExtendedProfile = (rawUser) => {
  if (!rawUser) return null;
  const enriched = enrichUserRole(rawUser);
  const key = getExtendedKey(enriched);
  if (!key || typeof window === 'undefined') return enriched;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return enrichUserRole({ ...enriched, ...JSON.parse(saved) });
    }
  } catch (e) {
    console.error('Failed to parse local profile:', e);
  }
  return enriched;
};

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (rawUser) => {
    const user = mergeExtendedProfile(rawUser);
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  fetchProfile: async () => {
    try {
      const res = await authApi.getProfile();
      const rawUser = res.data?.user || res.data;
      const user = mergeExtendedProfile(rawUser);
      set({ user, isAuthenticated: !!user, isLoading: false });
      return user;
    } catch {
      // Check if previously logged in as admin locally
      const savedAdmin = typeof window !== 'undefined' ? localStorage.getItem('bmt_admin_session') : null;
      if (savedAdmin) {
        try {
          const parsed = JSON.parse(savedAdmin);
          const user = mergeExtendedProfile(parsed);
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch {}
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  updateProfile: async (updatedFields) => {
    const currentUser = get().user || {};
    const { firstName, lastName, email } = updatedFields;

    let backendUser = null;
    try {
      if (firstName !== undefined || lastName !== undefined || email !== undefined) {
        const res = await authApi.updateProfile({ firstName, lastName, email });
        backendUser = res.data?.user || res.data;
      }
    } catch (err) {
      console.warn('Backend update failed, persisting locally:', err);
    }

    const merged = enrichUserRole({
      ...currentUser,
      ...(backendUser || {}),
      ...updatedFields,
    });

    const key = getExtendedKey(merged);
    if (key && typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(merged));
      } catch (e) {
        console.error('Failed to persist local profile:', e);
      }
    }

    set({ user: merged });
    return merged;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bmt_admin_session');
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));

// Listen for forced logout from API interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout();
  });
}
