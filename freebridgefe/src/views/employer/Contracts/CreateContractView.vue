<script setup lang="ts">
import { ref, computed } from 'vue';
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
    FileText,
    Send,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useContractStore } from '@/stores/contractStore';
import { useFreelancerStore } from '@/stores/freelancerStore';
import type { ContractDocument } from '@/types/contract';
import SignaturePadModal from './components/SignaturePadModal.vue';

type CreateContractState = 'form' | 'signing' | 'success';

const router = useRouter();
const authStore = useAuthStore();
const contractStore = useContractStore();
const freelancerStore = useFreelancerStore();

const state = ref<CreateContractState>('form');

// Form fields
const selectedFreelancerId = ref('');
const projectName = ref('');
const contractDate = ref('');
const paymentDate = ref('');
const budget = ref('');

// Created contract reference
const createdContract = ref<ContractDocument | null>(null);

const freelancerOptions = computed(() =>
    freelancerStore.freelancers.filter((u) => u.role === 'FREELANCER')
);

const isFormValid = computed(
    () =>
        selectedFreelancerId.value &&
        projectName.value &&
        contractDate.value &&
        paymentDate.value &&
        budget.value
);

const handleSubmit = () => {
    if (!isFormValid.value) return;
    state.value = 'signing';
};

const handleSign = (signatureDataUrl: string) => {
    const selectedFreelancer = freelancerOptions.value.find(
        (f) => f.id === selectedFreelancerId.value
    );
    if (!selectedFreelancer || !authStore.user) return;

    const newContract: ContractDocument = {
        id: `contract-${Date.now()}`,
        contractId: `c${Date.now()}`,
        projectName: projectName.value,
        freelancerId: selectedFreelancer.id,
        freelancerName: selectedFreelancer.name,
        employerId: authStore.user.id,
        employerName: authStore.user.companyName || authStore.user.name,
        startDate: new Date(contractDate.value),
        endDate: new Date(paymentDate.value),
        status: 'DRAFT',
        budget: Number(budget.value),
        milestones: [],
        terms: `프로젝트: ${projectName.value}\n계약일: ${contractDate.value}\n결제일: ${paymentDate.value}\n계약금액: ${Number(budget.value).toLocaleString()}원`,
        signedByEmployer: true,
        signedByFreelancer: false,
        employerSignature: signatureDataUrl,
        paymentDate: new Date(paymentDate.value),
    };

    contractStore.addContract(newContract);
    createdContract.value = newContract;
    state.value = 'success';
};

const handleReset = () => {
    selectedFreelancerId.value = '';
    projectName.value = '';
    contractDate.value = '';
    paymentDate.value = '';
    budget.value = '';
    createdContract.value = null;
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
            <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }" class="mb-12">
                <div class="flex items-center gap-3 mb-3">
                    <FilePlus class="w-10 h-10 text-white" />
                    <h1
                        class="text-4xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent"
                    >
                        계약서 작성
                    </h1>
                </div>
                <p class="text-white/60">
                    프리랜서와의 계약서를 작성하고 전자 서명을 진행하세요
                </p>
            </div>

            <div
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
                class="max-w-2xl"
            >
                <div
                    class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 space-y-6"
                >
                    <!-- Company Name (auto-filled) -->
                    <div>
                        <label
                            class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2"
                        >
                            <Building2 class="w-4 h-4" />
                            기업명
                        </label>
                        <div
                            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40"
                        >
                            {{ authStore.user?.companyName || authStore.user?.name }}
                        </div>
                    </div>

                    <!-- Freelancer Select -->
                    <div>
                        <label
                            class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2"
                        >
                            <User class="w-4 h-4" />
                            프리랜서 이름
                        </label>
                        <select
                            v-model="selectedFreelancerId"
                            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors appearance-none cursor-pointer"
                        >
                            <option value="" class="bg-gray-900">
                                프리랜서를 선택하세요
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
                    </div>

                    <!-- Project Name -->
                    <div>
                        <label
                            class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2"
                        >
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

                    <!-- Contract Date / Payment Date -->
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label
                                class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2"
                            >
                                <Calendar class="w-4 h-4" />
                                계약일
                            </label>
                            <input
                                v-model="contractDate"
                                type="date"
                                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label
                                class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2"
                            >
                                <Calendar class="w-4 h-4" />
                                결제일
                            </label>
                            <input
                                v-model="paymentDate"
                                type="date"
                                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-colors [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <!-- Budget -->
                    <div>
                        <label
                            class="flex items-center gap-2 text-sm font-medium text-white/60 mb-2"
                        >
                            <DollarSign class="w-4 h-4" />
                            계약금액 (원)
                        </label>
                        <input
                            v-model="budget"
                            type="number"
                            placeholder="계약금액을 입력하세요"
                            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                        />
                    </div>

                    <!-- Submit Button -->
                    <button
                        @click="handleSubmit"
                        :disabled="!isFormValid"
                        class="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all"
                        :class="
                            isFormValid
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/25'
                                : 'bg-white/5 text-white/30 cursor-not-allowed'
                        "
                        v-motion
                        :hover="isFormValid ? { scale: 1.02 } : {}"
                        :tap="isFormValid ? { scale: 0.98 } : {}"
                    >
                        <FilePlus class="w-5 h-5" />
                        계약서 작성
                    </button>
                </div>
            </div>
        </template>

        <!-- Signing State -->
        <template v-else-if="state === 'signing'">
            <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }" class="mb-12">
                <div class="flex items-center gap-3 mb-3">
                    <FilePlus class="w-10 h-10 text-white" />
                    <h1
                        class="text-4xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent"
                    >
                        계약서 작성
                    </h1>
                </div>
                <p class="text-white/60">전자 서명을 진행하세요</p>
            </div>

            <SignaturePadModal
                :signerName="authStore.user?.companyName || authStore.user?.name || ''"
                @sign="handleSign"
                @close="state = 'form'"
            />
        </template>

        <!-- Success State -->
        <template v-else>
            <div
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0 }"
                class="max-w-2xl mx-auto"
            >
                <div
                    class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center"
                >
                    <div
                        class="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
                        v-motion
                        :initial="{ scale: 0 }"
                        :enter="{ scale: 1, transition: { type: 'spring', delay: 0.2 } }"
                    >
                        <CheckCircle class="w-10 h-10 text-white" />
                    </div>

                    <h2
                        class="text-3xl font-bold mb-3"
                        v-motion
                        :initial="{ opacity: 0, y: 10 }"
                        :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
                    >
                        계약서가 생성되었습니다
                    </h2>

                    <div
                        class="space-y-2 mb-8"
                        v-motion
                        :initial="{ opacity: 0, y: 10 }"
                        :enter="{ opacity: 1, y: 0, transition: { delay: 0.4 } }"
                    >
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
                                <span class="font-medium">{{
                                    createdContract.projectName
                                }}</span>
                            </div>
                            <div class="text-sm text-white/50">
                                프리랜서: {{ createdContract.freelancerName }}
                            </div>
                            <div class="text-sm text-white/50">
                                계약금액: {{ createdContract.budget.toLocaleString() }}원
                            </div>
                        </div>
                    </div>

                    <div
                        class="flex flex-col sm:flex-row gap-3"
                        v-motion
                        :initial="{ opacity: 0, y: 10 }"
                        :enter="{ opacity: 1, y: 0, transition: { delay: 0.5 } }"
                    >
                        <button
                            @click="handleReset"
                            class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
                            v-motion
                            :hover="{ scale: 1.02 }"
                            :tap="{ scale: 0.98 }"
                        >
                            <FilePlus class="w-4 h-4" />
                            새 계약서 작성
                        </button>
                        <button
                            @click="navigateToContracts"
                            class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold shadow-lg"
                            v-motion
                            :hover="{ scale: 1.02 }"
                            :tap="{ scale: 0.98 }"
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