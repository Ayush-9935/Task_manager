import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to add token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear sessionStorage or handle redirect if needed
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const fetcher = url => api.get(url).then(res => res.data.data || res.data);

export default api;
