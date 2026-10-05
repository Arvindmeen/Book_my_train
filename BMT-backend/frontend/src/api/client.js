import axios from 'axios';

// When running on Vercel, use same-domain relative '/api' to proxy via vercel.json (bypasses ISP/campus firewall blocks and cross-domain cookie limits)
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
const API_BASE = isVercel ? '/api' : (import.meta.env.VITE_API_BASE_URL || '/api');

const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Authorization Bearer token to all requests if present in localStorage
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bmt_access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Do NOT attempt token refresh for public auth endpoints (login, register, forgot-password, reset-password, send-otp, verify-otp, or refresh itself)
    const isAuthEndpoint = originalRequest?.url?.includes('/users/auth/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => client(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('bmt_refresh_token') : null;

      try {
        const refreshRes = await axios.post(
          `${API_BASE}/users/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data?.accessToken;
        const newRefreshToken = refreshRes.data?.refreshToken;

        if (newAccessToken && typeof window !== 'undefined') {
          localStorage.setItem('bmt_access_token', newAccessToken);
          if (newRefreshToken) localStorage.setItem('bmt_refresh_token', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null);
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Clear auth tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bmt_access_token');
          localStorage.removeItem('bmt_refresh_token');
          localStorage.removeItem('bmt_auth_user');
          window.dispatchEvent(new Event('auth:logout'));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract real error message from backend response
    let msg = error.response?.data?.message || error.response?.data?.error;

    // Provide clean, human-friendly fallbacks instead of technical Axios error strings
    if (!msg || (typeof msg === 'string' && msg.includes('status code'))) {
      if (error.response?.status === 401) {
        msg = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.response?.status === 403) {
        msg = 'You do not have permission to access this resource.';
      } else if (error.response?.status === 404) {
        msg = 'The requested account or resource was not found.';
      } else if (error.response?.status === 429) {
        msg = 'Too many requests. Please wait a moment and try again.';
      } else {
        msg = error.message || 'Something went wrong. Please try again.';
      }
    }

    // Detect service down, network disconnection, or 5xx outage
    const isServiceDown =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.response.status >= 500 ||
      (typeof msg === 'string' && (
        msg.includes('Network Error') ||
        msg.includes('Failed to fetch') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('ENOTFOUND') ||
        msg.includes('502') ||
        msg.includes('503') ||
        msg.includes('504')
      ));

    if (isServiceDown) {
      msg = 'Currently this service is temporarily undergoing maintenance. We will connect back soon!';
    }

    const enhancedError = new Error(msg);
    enhancedError.status = error.response?.status;
    enhancedError.code = error.response?.data?.code;
    enhancedError.data = error.response?.data;
    enhancedError.response = error.response;
    return Promise.reject(enhancedError);
  }
);

export default client;
