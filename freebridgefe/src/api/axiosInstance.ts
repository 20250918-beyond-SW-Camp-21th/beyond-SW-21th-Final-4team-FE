import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach JWT token
axiosInstance.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        const token = authStore.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const authStore = useAuthStore();
        const originalRequest = error.config;

        // Skip interceptor for auth-related endpoints to avoid infinite loops
        const authEndpoints = ['/api/users/login', '/auth/login', '/auth/signup', '/auth/refresh'];
        const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

        if (error.response?.status === 401 && !isAuthEndpoint) {
            // Clear auth state and potentially redirect to login
            authStore.logout();
            // Optional: window.location.href = '/login'; 
            // Better to let the router handle this or use a global navigation guard
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
