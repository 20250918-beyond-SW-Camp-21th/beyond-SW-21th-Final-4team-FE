import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import type { EmployerProfile, FreelancerProfile } from '@/types/onboarding';

export const useOnboardingStore = defineStore('onboarding', () => {
    const currentStep = ref(1);
    const totalSteps = ref(2); // Fixed 2-step flow
    const isLoading = ref(false);

    // Initial Data State
    const employerData = ref<Partial<EmployerProfile>>({
        size: 'S1_4' // Default enum value aligned with BE Scale
    });

    const freelancerData = ref<Partial<FreelancerProfile>>({
        grade: 'JUNIOR', // Default enum value
        work_type: 'PERSONAL',
        work_style: 'REMOTE'
    });

    function setStep(step: number) {
        currentStep.value = step;
    }

    function nextStep() {
        if (currentStep.value < totalSteps.value) {
            currentStep.value++;
        }
    }

    function prevStep() {
        if (currentStep.value > 1) {
            currentStep.value--;
        }
    }

    function updateEmployerData(data: Partial<EmployerProfile>) {
        employerData.value = { ...employerData.value, ...data };
    }

    function updateFreelancerData(data: Partial<FreelancerProfile>) {
        freelancerData.value = { ...freelancerData.value, ...data };
    }

    async function submitEmployerOnboarding() {
        isLoading.value = true;
        try {
            const payload = {
                companyName: employerData.value.company_name ?? '',
                industry: employerData.value.industry ?? '',
                scale: employerData.value.size ?? '',
                location: employerData.value.location ?? '',
                websiteUrl: employerData.value.website ?? '',
                description: employerData.value.description ?? ''
            };

            await apiClient.put('/api/employer/mypage/profile', payload);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    async function submitFreelancerOnboarding() {
        isLoading.value = true;
        try {
            // TODO: API call to save profile
            // await api.post('/freelancers/onboarding', freelancerData.value);

            await new Promise(resolve => setTimeout(resolve, 1500));
            return true;
        } catch (e) {
            console.error(e);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        currentStep,
        totalSteps,
        isLoading,
        employerData,
        freelancerData,
        setStep,
        nextStep,
        prevStep,
        updateEmployerData,
        updateFreelancerData,
        submitEmployerOnboarding,
        submitFreelancerOnboarding
    };
});
