import axios from "axios";

const AUTH_STORAGE_KEY = "academy_lms_auth";
let isRefreshing = false;
let refreshSubscribers = [];

const getStoredToken = () => {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedAuth) return null;
    const parsed = JSON.parse(storedAuth);
    return parsed?.token || null;
  } catch (error) {
    return null;
  }
};

const setStoredToken = (token) => {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = storedAuth ? JSON.parse(storedAuth) : {};
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...parsed, token }));
  } catch (error) {
    // ignore
  }
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    // ignore
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      error.response.data?.message?.toLowerCase().includes("access token")
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse = await axios.post(
            `${api.defaults.baseURL}/auth/refresh-token`,
            {},
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const newAccessToken = refreshResponse.data?.data?.accessToken;
          if (newAccessToken) {
            setStoredToken(newAccessToken);
            onTokenRefreshed(newAccessToken);
          } else {
            clearStoredAuth();
            window.location.href = "/login";
            return Promise.reject(error);
          }
        } catch (refreshError) {
          clearStoredAuth();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
