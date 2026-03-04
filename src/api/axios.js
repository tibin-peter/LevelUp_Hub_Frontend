import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://levelup-hub-backend.onrender.com/api",
  withCredentials: true, // REQUIRED for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach token if available (cookie fallback)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("levelHubToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    // If 401, try to refresh
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("levelHubRefreshToken");
        
        // Go backend reads refresh_token from cookies OR body
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true },
        );

        if (response.data.success) {
          const { accessToken, refreshToken: newRefresh } = response.data.data;
          if (accessToken) localStorage.setItem("levelHubToken", accessToken);
          if (newRefresh) localStorage.setItem("levelHubRefreshToken", newRefresh);
          
          return api(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  },
);

export default api;
