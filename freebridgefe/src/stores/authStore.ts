import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';
import { authApi } from '@/api/authApi';

function maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***';
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.length > 1 ? `${localPart.charAt(0)}***` : '***';
    return `${maskedLocal}@${domain}`;
}

export const useAuthStore = defineStore('auth', () => {
    // Initialize from localStorage if available
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('access_token');
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
    const token = ref<string | null>(savedToken);
    const isLoading = ref(false);

    const isAuthenticated = computed(() => !!user.value && !!token.value);

    function setAuth(userData: User, accessToken: string) {
        user.value = userData;
        token.value = accessToken;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('access_token', accessToken);
    }

    async function login(credentials: any) {
        isLoading.value = true;
        try {
            const data = await authApi.login(credentials);
            setAuth(data.user, data.accessToken);
            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    function logout() {
        user.value = null;
        token.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
    }

    async function checkEmailDuplicate(email: string): Promise<boolean> {
        console.log(`Checking duplicate for: ${maskEmail(email)}`);
        try {
            const isAvailable = await authApi.checkEmail(email);
            return isAvailable;
        } catch (error) {
            console.error('Failed to check email duplicate:', error);
            // Fallback or handle accordingly
            return false;
        }
    }

    async function startSignup(userData: User) {
        isLoading.value = true;
        try {
            await authApi.signup(userData);
            // Store temp user data for verification step
            sessionStorage.setItem('temp_signup_user', JSON.stringify(userData));
        } catch (error) {
            console.error('Failed to start signup:', error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    async function verifyEmail(email: string, code: string): Promise<boolean> {
        console.log(`Verifying ${maskEmail(email)}`);
        isLoading.value = true;
        try {
            const response = await authApi.verifyEmail(email, code);

            // Assuming response contains the user and token upon successful verification
            // Adjust based on actual backend contract
            if (response.user && response.token) {
                setAuth(response.user, response.token);
                sessionStorage.removeItem('temp_signup_user');
                return true;
            }

            // If it just returns success but not the full session
            return true;
        } catch (error) {
            console.error('Verification failed:', error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    async function resendVerificationCode(email: string) {
        console.log(`Resending verification code to ${maskEmail(email)}`);
        isLoading.value = true;
        try {
            await authApi.resendVerification(email);
        } catch (error) {
            console.error('Failed to resend code:', error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        user,
        token,
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
