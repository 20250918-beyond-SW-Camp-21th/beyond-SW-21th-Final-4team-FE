import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import { uploadEmployerLogo } from '@/api/MyPage/employer';
import type { EmployerProfile, FreelancerProfile } from '@/types/onboarding';

export const useOnboardingStore = defineStore('onboarding', () => {
    type OnboardingRole = 'EMPLOYER' | 'FREELANCER';

    const createInitialEmployerData = (): Partial<EmployerProfile> => ({
        size: 'S1_4'
    });

    const createInitialFreelancerData = (): Partial<FreelancerProfile> => ({
        grade: 'JUNIOR',
        work_type: 'PERSONAL',
        work_style: 'REMOTE'
    });

    const currentStep = ref(1);
    const totalSteps = ref(2); // Fixed 2-step flow
    const isLoading = ref(false);
    const draftOwnerKey = ref<string | null>(null);

    // Initial Data State
    const employerData = ref<Partial<EmployerProfile>>(createInitialEmployerData());

    const freelancerData = ref<Partial<FreelancerProfile>>(createInitialFreelancerData());

    function resetOnboardingState() {
        currentStep.value = 1;
        employerData.value = createInitialEmployerData();
        freelancerData.value = createInitialFreelancerData();
        draftOwnerKey.value = null;
    }

    function ensureDraftForUser(userId: string | number | null | undefined, role: OnboardingRole) {
        const normalizedUserId =
            userId === null || userId === undefined || String(userId).trim() === ''
                ? 'anonymous'
                : String(userId).trim();
        const nextOwnerKey = `${role}:${normalizedUserId}`;

        if (draftOwnerKey.value !== nextOwnerKey) {
            resetOnboardingState();
            draftOwnerKey.value = nextOwnerKey;
        }
    }

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
            const logoFile = employerData.value.logo_file;
            if (logoFile) {
                await uploadEmployerLogo(logoFile);
            }
            const payload = {
                companyName: employerData.value.company_name ?? '',
                industry: employerData.value.industry ?? '',
                scale: employerData.value.size ?? '',
                location: employerData.value.location ?? '',
                websiteUrl: employerData.value.website ?? '',
                description: employerData.value.description ?? ''
            };

            const res = await apiClient.put('/api/employer/mypage/profile', payload);
            if (res.data?.success === true) {
                return true;
            }
            console.error(res.data?.message ?? 'Failed to submit employer onboarding');
            return false;
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
        resetOnboardingState,
        ensureDraftForUser,
        submitEmployerOnboarding,
        submitFreelancerOnboarding
    };
});
