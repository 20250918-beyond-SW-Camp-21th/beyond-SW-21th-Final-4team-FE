import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as walletApi from '@/api/walletApi';
import type { WalletSummary, Transaction } from '@/api/walletApi';

export const useWalletStore = defineStore('wallet', () => {
    const employerWalletSummary = ref<WalletSummary | null>(null);
    const employerTransactions = ref<Transaction[]>([]);
    
    const freelancerWalletSummary = ref<WalletSummary | null>(null);
    const freelancerTransactions = ref<Transaction[]>([]);
    
    const isLoading = ref(false);

    // ==================== Employer Actions ====================
    async function fetchEmployerWalletSummary() {
        isLoading.value = true;
        try {
            const data = await walletApi.getEmployerWalletSummary();
            employerWalletSummary.value = data;
        } catch (error) {
            console.error('Failed to fetch employer wallet summary:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchEmployerTransactions() {
        isLoading.value = true;
        try {
            const data = await walletApi.getEmployerTransactions();
            employerTransactions.value = data.items;
        } catch (error) {
            console.error('Failed to fetch employer transactions:', error);
        } finally {
            isLoading.value = false;
        }
    }

    // ==================== Freelancer Actions ====================
    async function fetchFreelancerWalletSummary() {
        isLoading.value = true;
        try {
            const data = await walletApi.getFreelancerWalletSummary();
            freelancerWalletSummary.value = data;
        } catch (error) {
            console.error('Failed to fetch freelancer wallet summary:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchFreelancerTransactions() {
        isLoading.value = true;
        try {
            const data = await walletApi.getFreelancerTransactions();
            freelancerTransactions.value = data.items;
        } catch (error) {
            console.error('Failed to fetch freelancer transactions:', error);
        } finally {
            isLoading.value = false;
        }
    }

    return {
        employerWalletSummary,
        employerTransactions,
        freelancerWalletSummary,
        freelancerTransactions,
        isLoading,
        fetchEmployerWalletSummary,
        fetchEmployerTransactions,
        fetchFreelancerWalletSummary,
        fetchFreelancerTransactions
    };
});
