import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
    // Initialize from localStorage if available
    const savedUser = localStorage.getItem('user');
    const user = ref<User | null>(savedUser ? JSON.parse(savedUser) : null);
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

    async function signup(userData: User) {
        isLoading.value = true;
        try {
            // TODO: Replace with actual API call
            // const response = await api.post('/auth/signup', userData);
            // user.value = response.data;

            // Mock: Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            user.value = userData;
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Signup failed:', error);
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
        signup,
        checkEmailDuplicate
    };
});
