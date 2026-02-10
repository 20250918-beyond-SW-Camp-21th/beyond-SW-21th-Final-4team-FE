import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
    // Initialize from localStorage if available
    const savedUser = localStorage.getItem('user');
    let initialUser: User | null = null;
    if (savedUser) {
        try {
            initialUser = JSON.parse(savedUser);
            if (initialUser?.createdAt) {
                initialUser.createdAt = new Date(initialUser.createdAt);
            }
            if (initialUser?.agreedToTermsAt) {
                initialUser.agreedToTermsAt = new Date(initialUser.agreedToTermsAt);
            }
        } catch (e) {
            console.error('Failed to restore user from localStorage', e);
        }
    }
    const user = ref<User | null>(initialUser);
    const isLoading = ref(false);

    const isAuthenticated = computed(() => !!user.value);

    function login(userData: User) {
        user.value = userData;
        localStorage.setItem('user', JSON.stringify(userData));
    }

    function logout() {
        user.value = null;
        localStorage.removeItem('user');
    }

    async function checkEmailDuplicate(email: string): Promise<boolean> {
        // TODO: Replace with actual API call
        // return await api.post('/auth/check-email', { email });

        // Mock: Always available
        return new Promise(resolve => setTimeout(() => resolve(true), 500));
    }

    async function startSignup(userData: User) {
        isLoading.value = true;
        try {
            // TODO: Replace with actual API call to send verification email
            // await api.post('/auth/signup-request', userData);

            // Mock: Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Store temp user data for verification step
            // In a real app, this might be handled by the backend session or a temporary token
            sessionStorage.setItem('temp_signup_user', JSON.stringify(userData));
        } catch (error) {
            console.error('Failed to start signup:', error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    async function verifyEmail(email: string, code: string): Promise<boolean> {
        isLoading.value = true;
        try {
            // TODO: Replace with actual API call
            // const response = await api.post('/auth/verify-email', { email, code });

            // Mock: Simulate network delay & check code
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (code !== '123456') { // Mock verification code
                throw new Error('Invalid verification code');
            }

            // Retrieve temp user data
            const storedData = sessionStorage.getItem('temp_signup_user');
            if (storedData) {
                const userData = JSON.parse(storedData);
                // Complete signup
                user.value = userData;
                localStorage.setItem('user', JSON.stringify(userData));
                sessionStorage.removeItem('temp_signup_user');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Verification failed:', error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    async function resendVerificationCode(email: string) {
        isLoading.value = true;
        try {
            // TODO: Replace with actual API call
            // await api.post('/auth/resend-verification', { email });

            // Mock: Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Failed to resend code:', error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        startSignup,
        verifyEmail,
        resendVerificationCode,
        checkEmailDuplicate
    };
});
