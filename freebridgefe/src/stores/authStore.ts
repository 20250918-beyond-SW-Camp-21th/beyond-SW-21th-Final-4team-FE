import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
    // Initialize from localStorage if available
    const savedUser = localStorage.getItem('user');
    const user = ref<User | null>(savedUser ? JSON.parse(savedUser) : null);

    const isAuthenticated = computed(() => !!user.value);

    function login(userData: User) {
        user.value = userData;
        localStorage.setItem('user', JSON.stringify(userData));
    }

    function logout() {
        user.value = null;
        localStorage.removeItem('user');
    }

    function signup(userData: User) {
        user.value = userData;
        localStorage.setItem('user', JSON.stringify(userData));
    }

    return {
        user,
        isAuthenticated,
        login,
        logout,
        signup
    };
});
