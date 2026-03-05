import axiosInstance from './axiosInstance';
import type { User } from '@/types';

export const authApi = {
    login: async (credentials: any) => {
        const response = await axiosInstance.post('/api/users/login', credentials);
        return response.data.data; // Expected { accessToken: "...", user: User, grade: "..." }
    },
    signup: async (userData: User) => {
        const response = await axiosInstance.post('/auth/signup', userData);
        return response.data;
    },
    verifyEmail: async (email: string, code: string) => {
        const response = await axiosInstance.post('/auth/verify-email', { email, code });
        return response.data;
    },
    resendVerification: async (email: string) => {
        const response = await axiosInstance.post('/auth/resend-verification', { email });
        return response.data;
    },
    checkEmail: async (email: string) => {
        const response = await axiosInstance.post('/auth/check-email', { email });
        return response.data;
    }
};
