import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { clearAuthSession, getCurrentAuthStorage, getStoredAuthValue, isRememberedSession, persistAuthSession } from '@/features/auth/utils/authStorage';

const defaultApiBaseUrl =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8081/api`
    : 'http://127.0.0.1:8081/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || defaultApiBaseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let refreshPromise: Promise<string | null> | null = null;
const offlineCachePrefix = 'nokta-api-cache:';
const offlineCacheVersion = 'v1';

function isGetRequest(config?: AxiosRequestConfig) {
  return String(config?.method ?? 'get').toLowerCase() === 'get';
}

function buildOfflineCacheKey(config?: AxiosRequestConfig) {
  if (typeof window === 'undefined' || !config?.url) {
    return null;
  }

  const url = new URL(config.url, config.baseURL || API_BASE_URL);
  const params = new URLSearchParams(url.search);

  if (config.params && typeof config.params === 'object') {
    Object.entries(config.params as Record<string, unknown>).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      params.set(key, String(value));
    });
  }

  params.sort();
  const query = params.toString();
  return `${offlineCachePrefix}${offlineCacheVersion}:${url.pathname}${query ? `?${query}` : ''}`;
}

function cacheGetResponse(response: AxiosResponse) {
  const key = buildOfflineCacheKey(response.config);
  if (!key || !isGetRequest(response.config) || response.status !== 200) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify({
      cachedAt: Date.now(),
      data: response.data,
      status: response.status,
      statusText: response.statusText
    }));
  } catch {
    // Cache quota/private-mode failures should never break live API responses.
  }
}

function readCachedGetResponse(error: AxiosError) {
  const config = error.config;
  const key = buildOfflineCacheKey(config);
  if (!key || !isGetRequest(config) || error.response?.status === 401 || error.response?.status === 403) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const cached = JSON.parse(raw) as { data: unknown; status?: number; statusText?: string };
    return {
      data: cached.data,
      status: cached.status ?? 200,
      statusText: cached.statusText ?? 'OK (offline cache)',
      headers: {},
      config: config!,
      request: error.request
    } as AxiosResponse;
  } catch {
    return null;
  }
}

async function refreshAccessToken() {
  const storedRefreshToken = getStoredAuthValue('refreshToken');
  if (!storedRefreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = apiClient
      .post('/auth/refresh', { refreshToken: storedRefreshToken })
      .then((response) => {
        const payload = response.data?.data ?? {};
        const nextAccessToken = payload.tokens?.accessToken ?? payload.accessToken ?? null;
        const nextRefreshToken = payload.tokens?.refreshToken ?? payload.refreshToken ?? storedRefreshToken;
        const nextUser = payload.user ?? null;

        persistAuthSession({
          accessToken: nextAccessToken,
          refreshToken: nextRefreshToken,
          user: nextUser,
          rememberMe: getCurrentAuthStorage() === window.localStorage || isRememberedSession()
        });

        return nextAccessToken;
      })
      .catch(() => {
        clearAuthSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use(
  (config) => {
    const url = config.url ?? '';
    if (!url.includes('/auth/login') && !url.includes('/auth/refresh')) {
      const token = getStoredAuthValue('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    cacheGetResponse(response);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const requestUrl = originalRequest?.url ?? '';
    const serverMessage =
      typeof error.response?.data === 'object' && error.response?.data && 'message' in error.response.data
        ? String((error.response.data as { message?: unknown }).message ?? '')
        : '';

    if (serverMessage) {
      error.message = serverMessage;
    }

    if (error.response?.status === 401 && !originalRequest?._retry && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/refresh')) {
      originalRequest._retry = true;
      const nextAccessToken = await refreshAccessToken();
      if (nextAccessToken) {
        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${nextAccessToken}`
        };
        return apiClient(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      clearAuthSession();
      window.location.href = '/login';
    }

    const cachedResponse = readCachedGetResponse(error);
    if (cachedResponse) {
      return cachedResponse;
    }

    return Promise.reject(error);
  }
);

export const api = apiClient;
export default apiClient;

