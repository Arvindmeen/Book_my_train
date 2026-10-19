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
    let merged = { ...enriched };
    if (saved) {
      const parsed = JSON.parse(saved);
      // Database (enriched) is authoritative. If DB returned a field, DB wins.
      // parsed is only a fallback for any client-only temporary flags if any.
      merged = {
        ...parsed,
        ...enriched,
      };
      // Ensure all fields present in enriched take strict precedence over stale local storage
      Object.keys(enriched).forEach((k) => {
        merged[k] = enriched[k];
      });
    }
    const finalUser = enrichUserRole(merged);
    try {
      localStorage.setItem(key, JSON.stringify(finalUser));
    } catch {}
    return finalUser;
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
    // If user has no tokens and no stored session, they are a guest / logged out.
    // NEVER fetch or revive a stale session from cookies.
    if (typeof window !== 'undefined') {
      const hasToken = localStorage.getItem('bmt_access_token');
      const hasStoredUser = localStorage.getItem('bmt_auth_user');
      if (!hasToken && !hasStoredUser) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return null;
      }
    }

    try {
      const res = await authApi.getProfile();
      const rawUser = res.data?.user || res.data?.data?.user || res.data;
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
          localStorage.removeItem('bmt_admin_session');
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

    let backendUser = null;
    try {
      const res = await authApi.updateProfile(updatedFields);
      backendUser = res.data?.user || res.data?.data?.user || res.data;
    } catch (err) {
      console.error('Backend profile update failed:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save to cloud database';
      throw new Error(errMsg);
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

  logout: async () => {
    // 1. Immediately purge local credentials & storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bmt_auth_user');
      localStorage.removeItem('bmt_access_token');
      localStorage.removeItem('bmt_refresh_token');
      localStorage.removeItem('bmt_admin_session');
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('bmt_user_profile_')) {
            localStorage.removeItem(k);
          }
        });
        sessionStorage.clear();
      } catch (_) {}
    }

    // 2. Immediately reset memory state so navbar & all components switch to guest instantly
    set({ user: null, isAuthenticated: false, isLoading: false });

    // 3. Clear server httpOnly cookies & Redis tokens
    try {
      await authApi.logout();
    } catch (_) {}
  },
}));

// Listen for forced logout from API interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  });
}
