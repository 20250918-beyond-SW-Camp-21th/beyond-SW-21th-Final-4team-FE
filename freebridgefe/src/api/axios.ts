import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management
export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export const getAccessToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken?: string): void => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
};

export const clearTokens = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401 errors (redirect to login)
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // If error is 401, clear tokens and redirect to login
        if (error.response?.status === 401) {
            clearTokens();
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default apiClient;