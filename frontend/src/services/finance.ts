import { api } from './api';

export const financeService = {
  summary: () => api.get('/finance/summary').then((res) => res.data)
};
