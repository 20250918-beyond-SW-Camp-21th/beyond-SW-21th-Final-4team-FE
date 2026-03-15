import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import { uploadEmployerLogo } from '@/api/MyPage/employer';
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
        job: '',
        hope_salary: undefined,
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
            const payload = {
                job: freelancerData.value.job ?? '',
                introduction: freelancerData.value.introduction ?? '',
                careerYears: freelancerData.value.career_years ?? 0,
                wage: freelancerData.value.hope_salary ?? 0,
                skills: freelancerData.value.freelancer_skills ?? [],
                workType: freelancerData.value.work_type ?? '',
                availableStartDate: freelancerData.value.start_date ?? null,
                workStyle: freelancerData.value.work_style ?? '',
                workLocation: freelancerData.value.location ?? ''
            };

            const res = await apiClient.put('/api/freelancer/mypage/profile', payload);
            if (res.data?.success === true) {
                return true;
            }
            console.error(res.data?.message ?? 'Failed to submit freelancer onboarding');
            return false;
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
