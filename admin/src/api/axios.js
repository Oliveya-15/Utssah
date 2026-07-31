import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('utsaah_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong.';
    if (error.response?.status === 401) {
      localStorage.removeItem('utsaah_admin_token');
    }
    return Promise.reject({ ...error, message });
  }
);

export const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
export const resolveImage = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}${path}`;
};

export default api;
