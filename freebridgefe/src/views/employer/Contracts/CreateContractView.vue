<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    FilePlus,
    Building2,
    User,
    FolderOpen,
    Calendar,
    DollarSign,
    CheckCircle,
    ArrowLeft,
    ArrowRight,
    FileText,
    Send,
    CreditCard,
    Clock,
    Briefcase,
    MapPin,
    Phone,
    AlertCircle,
    Loader2,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useContractStore, type ContractWithDetails } from '@/stores/contractStore';
import { createContract } from '@/api/contractApi';
import { authApi } from '@/api/authApi';
import SignaturePadModal from './components/SignaturePadModal.vue';
import ContractPreview from '@/components/contract/ContractPreview.vue';

type CreateContractState = 'form' | 'preview' | 'signing' | 'success';

const router = useRouter();
const authStore = useAuthStore();
const contractStore = useContractStore();

const state = ref<CreateContractState>('form');
const currentStep = ref(1);
const totalSteps = 2;
const isSubmitting = ref(false);
const submitError = ref('');

// Freelancer list from API
interface FreelancerOption {
    id: number;
    name: string;
}
const freelancerOptions = ref<FreelancerOption[]>([]);
const isLoadingFreelancers = ref(false);

onMounted(async () => {
    isLoadingFreelancers.value = true;
    try {
        const users = await authApi.getUsers({ role: 'FREELANCER' });
        freelancerOptions.value = users
            .filter((u: any) => u.role === 'FREELANCER' || u.role === 'freelancer')
            .map((u: any) => ({ id: Number(u.id), name: u.name }));
    } catch (e) {
        console.error('Failed to load freelancers:', e);
    } finally {
        isLoadingFreelancers.value = false;
    }
});

// Step 1: Basic Info
const selectedFreelancerId = ref<number | ''>('');
const projectName = ref('');
const jobDescription = ref('');
const startDate = ref('');
const endDate = ref('');
const budget = ref('');
const paymentDay = ref<number>(25);

// Freelancer contact info (required by API)
const freelancerAddress = ref('');
const freelancerPhone = ref('');

// Step 2: Work Schedule
type WorkScheduleType = 'FLEXIBLE' | 'FIXED';
const workScheduleType = ref<WorkScheduleType>('FLEXIBLE');
const workStartTime = ref('09:00');
const workEndTime = ref('18:00');
const breakStartTime = ref('12:00');
const breakEndTime = ref('13:00');
const workDaysPerWeek = ref<number>(5);
const weeklyHoliday = ref('토, 일');

// Employer Info (editable, pre-filled from user profile)
const employerBusinessName = ref(authStore.user?.companyName || authStore.user?.name || '');
const employerAddress = ref(authStore.user?.companyAddress || '');
const employerCEO = ref(authStore.user?.representativeName || '');

// Created contract reference
const createdContract = ref<ContractWithDetails | null>(null);

const selectedFreelancer = computed(() =>
    freelancerOptions.value.find((f) => f.id === Number(selectedFreelancerId.value))
);

// Validation
const isStep1Valid = computed(
    () =>
        selectedFreelancerId.value !== '' &&
        projectName.value.trim() &&
        jobDescription.value.trim() &&
        startDate.value &&
        endDate.value &&
        budget.value &&
        paymentDay.value &&
        freelancerAddress.value.trim() &&
        freelancerPhone.value.trim()
);

const isStep2Valid = computed(() => {
    if (!employerBusinessName.value.trim() || !employerAddress.value.trim() || !employerCEO.value.trim()) {
        return false;
    }
    if (workScheduleType.value === 'FIXED') {
        return (
            workStartTime.value &&
            workEndTime.value &&
            breakStartTime.value &&
            breakEndTime.value &&
            workDaysPerWeek.value &&
            weeklyHoliday.value
        );
    }
    return true;
});

const isFormValid = computed(() => isStep1Valid.value && isStep2Valid.value);

// Preview contract data
const previewContract = computed(() => {
    const isFlexible = workScheduleType.value === 'FLEXIBLE';
    return {
        projectName: projectName.value,
        freelancerId: Number(selectedFreelancerId.value),
        employerId: Number(authStore.user?.id),
        startDate: startDate.value ? new Date(startDate.value) : undefined,
        endDate: endDate.value ? new Date(endDate.value) : undefined,
        budget: Number(budget.value),
        paymentDay: paymentDay.value,
        jobDescription: jobDescription.value,
        workLocation: '원격근무',
        workStartTime: isFlexible ? '자율' : workStartTime.value,
        workEndTime: isFlexible ? '자율' : workEndTime.value,
        breakStartTime: breakStartTime.value,
        breakEndTime: breakEndTime.value,
        workDaysPerWeek: isFlexible ? 5 : workDaysPerWeek.value,
        weeklyHoliday: isFlexible ? '토, 일' : weeklyHoliday.value,
        employerBusinessName: employerBusinessName.value,
        employerAddress: employerAddress.value,
        employerCEO: employerCEO.value,
        freelancerAddress: freelancerAddress.value,
        freelancerPhone: freelancerPhone.value,
        freelancerName: selectedFreelancer.value?.name || '',
        employerName: employerBusinessName.value,
    };
});

const nextStep = () => {
    if (currentStep.value < totalSteps) {
        currentStep.value++;
    }
};

const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};

const handlePreview = () => {
    if (!isFormValid.value) return;
    state.value = 'preview';
};

const handleStartSigning = () => {
    state.value = 'signing';
};

const handleSign = async (signatureDataUrl: string) => {
    if (!selectedFreelancer.value || !authStore.user) return;

    isSubmitting.value = true;
    submitError.value = '';

    const isFlexible = workScheduleType.value === 'FLEXIBLE';

    try {
        const response = await createContract({
            projectName: projectName.value,
            freelancerId: selectedFreelancer.value.id,
            startDate: startDate.value,
            endDate: endDate.value,
            budget: Number(budget.value),
            paymentDay: paymentDay.value,
            jobDescription: jobDescription.value,
            workLocation: '원격근무',
            workStartTime: isFlexible ? '자율' : workStartTime.value,
            workEndTime: isFlexible ? '자율' : workEndTime.value,
            breakStartTime: breakStartTime.value,
            breakEndTime: breakEndTime.value,
            workDaysPerWeek: isFlexible ? 5 : workDaysPerWeek.value,
            weeklyHoliday: isFlexible ? '토, 일' : weeklyHoliday.value,
            employerBusinessName: employerBusinessName.value,
            employerAddress: employerAddress.value,
            employerCEO: employerCEO.value,
            freelancerAddress: freelancerAddress.value,
            freelancerPhone: freelancerPhone.value,
            employerSignature: signatureDataUrl,
        });

        contractStore.addContract(response);
        createdContract.value = response;
        state.value = 'success';
    } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || '계약서 생성에 실패했습니다.';
        submitError.value = msg;
        state.value = 'preview'; // go back to preview on error
    } finally {
        isSubmitting.value = false;
    }
};

const handleReset = () => {
    selectedFreelancerId.value = '';
    projectName.value = '';
    jobDescription.value = '';
    startDate.value = '';
    endDate.value = '';
    budget.value = '';
    paymentDay.value = 25;
    workScheduleType.value = 'FLEXIBLE';
    workStartTime.value = '09:00';
    workEndTime.value = '18:00';
    breakStartTime.value = '12:00';
    breakEndTime.value = '13:00';
    workDaysPerWeek.value = 5;
    weeklyHoliday.value = '토, 일';
    freelancerAddress.value = '';
    freelancerPhone.value = '';
    submitError.value = '';
    createdContract.value = null;
    currentStep.value = 1;
    state.value = 'form';
};

const navigateToContracts = () => {
    router.push('/employer/contracts');
};
</script>

<template>
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 text-white">
        <!-- Form State -->
        <template v-if="state === 'form'">
            <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }" class="mb-8">
                <div class="flex items-center gap-3 mb-3">
                    <FilePlus class="w-10 h-10 text-white" />
                    <h1 class="text-4xl font-bold text-white">계약서 작성</h1>
                </div>
                <p class="text-white/60">프리랜서와의 표준근로계약서를 작성하세요</p>
            </div>

            <!-- Progress Steps -->
            <div class="mb-8 flex items-center gap-4">
                <div
                    v-for="step in totalSteps"
                    :key="step"
                    class="flex items-center gap-2"
                >
                    <div
                        class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                        :class="
                            currentStep >= step
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/10 text-white/40'
                        "
                    >
                        {{ step }}
                    </div>
                    <span
                        class="text-sm"
                        :class="currentStep >= step ? 'text-white' : 'text-white/40'"
                    >
                        {{ step === 1 ? '기본 정보' : '근무 조건' }}
                    </span>
                    <div v-if="step < totalSteps" class="w-12 h-px bg-white/20 mx-2" />
                </div>
            </div>

            <div
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
                class="max-w-2xl"
            >
                <div class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 space-y-6">
                    <!-- Step 1: Basic Info -->
                    <template v-if="currentStep === 1">
                        <!-- Company Name -->
                        <div>
                            <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <Building2 class="w-4 h-4" />
                                기업명
                            </label>
                            <input
                                v-model="employerBusinessName"
                                type="text"
                                placeholder="기업명을 입력하세요"
                                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                            />
                        </div>

                        <!-- Freelancer Select -->
                        <div>
                            <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <User class="w-4 h-4" />
                                프리랜서
                            </label>
                            <div class="relative">
                                <select
                                    v-model="selectedFreelancerId"
                                    :disabled="isLoadingFreelancers"
                                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
                                >
                                    <option value="" class="bg-gray-900">
                                        {{ isLoadingFreelancers ? '불러오는 중...' : '프리랜서를 선택하세요' }}
                                    </option>
                                    <option
                                        v-for="f in freelancerOptions"
                                        :key="f.id"
                                        :value="f.id"
                                        class="bg-gray-900"
                                    >
                                        {{ f.name }}
                                    </option>
                                </select>
                                <Loader2 v-if="isLoadingFreelancers" class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white/40" />
                            </div>
                        </div>

                        <!-- Freelancer Contact Info -->
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                    <MapPin class="w-4 h-4" />
                                    프리랜서 주소
                                </label>
                                <input
                                    v-model="freelancerAddress"
                                    type="text"
                                    placeholder="예: 경기도 성남시 분당구"
                                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                    <Phone class="w-4 h-4" />
                                    프리랜서 연락처
                                </label>
                                <input
                                    v-model="freelancerPhone"
                                    type="tel"
                                    placeholder="예: 010-1234-5678"
                                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <!-- Project Name -->
                        <div>
                            <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <FolderOpen class="w-4 h-4" />
                                프로젝트명
                            </label>
                            <input
                                v-model="projectName"
                                type="text"
                                placeholder="프로젝트명을 입력하세요"
                                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                            />
                        </div>

                        <!-- Job Description -->
                        <div>
                            <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <Briefcase class="w-4 h-4" />
                                업무 내용
                            </label>
                            <textarea
                                v-model="jobDescription"
                                rows="3"
                                placeholder="수행할 업무 내용을 상세히 입력하세요"
                                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors resize-none"
                            />
                        </div>

                        <!-- Dates -->
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                    <Calendar class="w-4 h-4" />
                                    계약 시작일
                                </label>
                                <input
                                    v-model="startDate"
                                    type="date"
                                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                    <Calendar class="w-4 h-4" />
                                    계약 종료일
                                </label>
                                <input
                                    v-model="endDate"
                                    type="date"
                                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <!-- Budget & Payment Day -->
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                    <DollarSign class="w-4 h-4" />
                                    월 급여 (원)
                                </label>
                                <input
                                    v-model="budget"
                                    type="number"
                                    placeholder="월 급여액"
                                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                    <CreditCard class="w-4 h-4" />
                                    매월 정산일
                                </label>
                                <select
                                    v-model="paymentDay"
                                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors appearance-none cursor-pointer"
                                >
                                    <option :value="10" class="bg-gray-900">매월 10일</option>
                                    <option :value="15" class="bg-gray-900">매월 15일</option>
                                    <option :value="25" class="bg-gray-900">매월 25일</option>
                                    <option :value="28" class="bg-gray-900">매월 28일</option>
                                </select>
                            </div>
                        </div>

                        <!-- Next Button -->
                        <button
                            @click="nextStep"
                            :disabled="!isStep1Valid"
                            class="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all"
                            :class="
                                isStep1Valid
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                            "
                        >
                            다음 단계
                            <ArrowRight class="w-5 h-5" />
                        </button>
                    </template>

                    <!-- Step 2: Work Schedule & Employer Details -->
                    <template v-else-if="currentStep === 2">
                        <!-- Work Schedule Type -->
                        <div>
                            <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <Clock class="w-4 h-4" />
                                근무 형태
                            </label>
                            <div class="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    @click="workScheduleType = 'FLEXIBLE'"
                                    class="p-4 rounded-xl border transition-all text-left"
                                    :class="workScheduleType === 'FLEXIBLE'
                                        ? 'bg-blue-500/20 border-blue-500/50 text-white'
                                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'"
                                >
                                    <div class="font-medium mb-1">자율 근무</div>
                                    <div class="text-xs text-white/50">업무 마감일 기준 자유롭게 작업</div>
                                </button>
                                <button
                                    type="button"
                                    @click="workScheduleType = 'FIXED'"
                                    class="p-4 rounded-xl border transition-all text-left"
                                    :class="workScheduleType === 'FIXED'
                                        ? 'bg-blue-500/20 border-blue-500/50 text-white'
                                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'"
                                >
                                    <div class="font-medium mb-1">지정 시간 근무</div>
                                    <div class="text-xs text-white/50">정해진 시간에 근무</div>
                                </button>
                            </div>
                        </div>

                        <!-- Fixed Schedule Details -->
                        <template v-if="workScheduleType === 'FIXED'">
                            <!-- Work Hours -->
                            <div class="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-sm font-medium text-white/60 mb-2 block">근무 시작시간</label>
                                    <input
                                        v-model="workStartTime"
                                        type="time"
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                                    />
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-white/60 mb-2 block">근무 종료시간</label>
                                    <input
                                        v-model="workEndTime"
                                        type="time"
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <!-- Work Days -->
                            <div class="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-sm font-medium text-white/60 mb-2 block">주 근무일수</label>
                                    <select
                                        v-model="workDaysPerWeek"
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors appearance-none cursor-pointer"
                                    >
                                        <option v-for="n in 7" :key="n" :value="n" class="bg-gray-900">{{ n }}일</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-white/60 mb-2 block">주휴일</label>
                                    <input
                                        v-model="weeklyHoliday"
                                        type="text"
                                        placeholder="예: 토, 일"
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </template>

                        <!-- Break Time (always shown) -->
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="text-sm font-medium text-white/60 mb-2 block">휴게 시작시간</label>
                                <input
                                    v-model="breakStartTime"
                                    type="time"
                                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label class="text-sm font-medium text-white/60 mb-2 block">휴게 종료시간</label>
                                <input
                                    v-model="breakEndTime"
                                    type="time"
                                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <!-- Employer Info (editable) -->
                        <div class="pt-4 border-t border-white/10">
                            <h3 class="text-lg font-semibold mb-4">사업주 정보</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                        <MapPin class="w-4 h-4" />
                                        사업장 주소
                                    </label>
                                    <input
                                        v-model="employerAddress"
                                        type="text"
                                        placeholder="예: 서울특별시 강남구 테헤란로 123"
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                        <User class="w-4 h-4" />
                                        대표자명
                                    </label>
                                    <input
                                        v-model="employerCEO"
                                        type="text"
                                        placeholder="대표자명을 입력하세요"
                                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Buttons -->
                        <div class="flex gap-3">
                            <button
                                @click="prevStep"
                                class="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
                            >
                                <ArrowLeft class="w-5 h-5" />
                                이전 단계
                            </button>
                            <button
                                @click="handlePreview"
                                :disabled="!isStep2Valid"
                                class="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all"
                                :class="
                                    isStep2Valid
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                                "
                            >
                                <FileText class="w-5 h-5" />
                                계약서 미리보기
                            </button>
                        </div>
                    </template>
                </div>
            </div>
        </template>

        <!-- Preview State -->
        <template v-else-if="state === 'preview'">
            <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }" class="mb-8">
                <div class="flex items-center gap-3 mb-3">
                    <FileText class="w-10 h-10 text-white" />
                    <h1 class="text-4xl font-bold text-white">계약서 미리보기</h1>
                </div>
                <p class="text-white/60">내용을 확인하고 서명을 진행하세요</p>
            </div>

            <!-- Error Banner -->
            <div
                v-if="submitError"
                class="max-w-4xl mx-auto mb-6 flex items-center gap-3 px-5 py-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400"
            >
                <AlertCircle class="w-5 h-5 flex-shrink-0" />
                <span class="text-sm">{{ submitError }}</span>
            </div>

            <div class="mb-6">
                <ContractPreview :contract="previewContract" />
            </div>

            <div class="max-w-4xl mx-auto flex gap-3">
                <button
                    @click="state = 'form'"
                    class="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft class="w-5 h-5" />
                    수정하기
                </button>
                <button
                    @click="handleStartSigning"
                    class="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                    <FilePlus class="w-5 h-5" />
                    서명하기
                </button>
            </div>
        </template>

        <!-- Signing State -->
        <template v-else-if="state === 'signing'">
            <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }" class="mb-12">
                <div class="flex items-center gap-3 mb-3">
                    <FilePlus class="w-10 h-10 text-white" />
                    <h1 class="text-4xl font-bold text-white">전자 서명</h1>
                </div>
                <p class="text-white/60">계약서에 서명을 진행하세요</p>
            </div>

            <SignaturePadModal
                :signerName="employerCEO || authStore.user?.name || ''"
                :disabled="isSubmitting"
                @sign="handleSign"
                @close="state = 'preview'"
            />

            <!-- Submitting overlay -->
            <div
                v-if="isSubmitting"
                class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            >
                <div class="flex flex-col items-center gap-4 text-white">
                    <Loader2 class="w-10 h-10 animate-spin" />
                    <span class="text-lg font-medium">계약서를 생성하는 중...</span>
                </div>
            </div>
        </template>

        <!-- Success State -->
        <template v-else>
            <div
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0 }"
                class="max-w-2xl mx-auto"
            >
                <div class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center">
                    <div
                        class="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
                        v-motion
                        :initial="{ scale: 0 }"
                        :enter="{ scale: 1, transition: { type: 'spring', delay: 0.2 } }"
                    >
                        <CheckCircle class="w-10 h-10 text-white" />
                    </div>

                    <h2 class="text-3xl font-bold mb-3">계약서가 생성되었습니다</h2>

                    <div class="space-y-2 mb-8">
                        <div class="flex items-center justify-center gap-2 text-white/60">
                            <Send class="w-4 h-4" />
                            <span>프리랜서에게 서명 요청이 전송되었습니다</span>
                        </div>
                        <div
                            v-if="createdContract"
                            class="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-left space-y-2"
                        >
                            <div class="flex items-center gap-2 text-white/80">
                                <FileText class="w-4 h-4" />
                                <span class="font-medium">{{ createdContract.projectName }}</span>
                            </div>
                            <div class="text-sm text-white/50">
                                계약번호: #{{ createdContract.contractId }}
                            </div>
                            <div class="text-sm text-white/50">
                                프리랜서: {{ createdContract.freelancerName }}
                            </div>
                            <div class="text-sm text-white/50">
                                계약 기간: {{ new Date(createdContract.startDate).toLocaleDateString('ko-KR') }} ~ {{ new Date(createdContract.endDate).toLocaleDateString('ko-KR') }}
                            </div>
                            <div class="text-sm text-white/50">
                                월 급여: {{ createdContract.budget.toLocaleString() }}원
                            </div>
                            <div class="mt-3 pt-3 border-t border-white/10">
                                <span class="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                                    <Clock class="w-3 h-3" />
                                    프리랜서 서명 대기중
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-3">
                        <button
                            @click="handleReset"
                            class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
                        >
                            <FilePlus class="w-4 h-4" />
                            새 계약서 작성
                        </button>
                        <button
                            @click="navigateToContracts"
                            class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 rounded-xl text-white font-semibold hover:bg-blue-600 transition-colors"
                        >
                            <ArrowLeft class="w-4 h-4" />
                            계약서 목록
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
}
</style>
