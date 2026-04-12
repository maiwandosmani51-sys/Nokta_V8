import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    console.error('AXIOS FULL ERROR:', err);
    console.error('RESPONSE:', err.response?.data);
    console.error('STATUS:', err.response?.status);
    console.error('URL:', err.config?.url);
    console.error('METHOD:', err.config?.method);

    return Promise.reject(err);
  }
);
