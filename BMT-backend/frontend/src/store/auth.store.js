import { create } from 'zustand';
import { authApi } from '../api/auth.api';

const ADMIN_EMAIL = 'arvindmeena8171@gmail.com';

const enrichUserRole = (rawUser) => {
  if (!rawUser) return null;
  const email = (rawUser.email || '').trim().toLowerCase();
  const isAdmin = email === ADMIN_EMAIL;
  return {
    ...rawUser,
    email: rawUser.email || email,
    role: isAdmin ? 'ADMIN' : 'USER',
    isAdmin: isAdmin,
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

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('bmt_auth_user');
    if (!saved) return null;
    return mergeExtendedProfile(JSON.parse(saved));
  } catch {
    return null;
  }
};

const initialUser = getStoredUser();

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  isLoading: false,

  setUser: (rawUser) => {
    const user = mergeExtendedProfile(rawUser);
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem('bmt_auth_user', JSON.stringify(user));
    }
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  fetchProfile: async () => {
    try {
      const res = await authApi.getProfile();
      const rawUser = res.data?.user || res.data;
      const user = mergeExtendedProfile(rawUser);
      if (typeof window !== 'undefined' && user) {
        localStorage.setItem('bmt_auth_user', JSON.stringify(user));
      }
      set({ user, isAuthenticated: !!user, isLoading: false });
      return user;
    } catch (err) {
      // Only clear user session if the server definitively rejected with 401 or 403
      if (err.response?.status === 401 || err.response?.status === 403) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bmt_auth_user');
          localStorage.removeItem('bmt_access_token');
          localStorage.removeItem('bmt_refresh_token');
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
      } else {
        // Network error, 500, or proxy delay: KEEP cached authenticated session so user is not logged out!
        set({ isLoading: false });
      }
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

    if (typeof window !== 'undefined' && merged) {
      localStorage.setItem('bmt_auth_user', JSON.stringify(merged));
    }

    set({ user: merged });
    return merged;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bmt_auth_user');
      localStorage.removeItem('bmt_access_token');
      localStorage.removeItem('bmt_refresh_token');
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
