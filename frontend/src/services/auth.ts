import { api } from './api';

export const authService = {
  login: (payload: { email: string; password: string }) => api.post('/auth/login', payload).then((res) => res.data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }).then((res) => res.data),
  profile: () => api.get('/auth/profile').then((res) => res.data)
};
