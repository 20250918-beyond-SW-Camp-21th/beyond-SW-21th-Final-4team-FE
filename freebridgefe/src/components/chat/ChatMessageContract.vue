<template>
    <div class="w-72 bg-slate-800 rounded-xl border border-emerald-500/30 overflow-hidden shadow-md my-2">
        <!-- Header -->
        <div class="px-4 py-3 bg-slate-800/50 border-b border-white/5 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <FileTextIcon class="w-4 h-4 text-emerald-500" />
            </div>
            <div>
                <p class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">계약 요청</p>
                <p class="text-sm font-bold text-white">{{ contractTitle }}</p>
            </div>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-3">
            <div class="flex justify-between items-center text-sm">
                <span class="text-slate-400">상태</span>
                <span :class="statusBadgeClass">
                    {{ statusLabel }}
                </span>
            </div>
            
            <div class="space-y-1">
                <p class="text-xs text-slate-500">프로젝트명</p>
                <p class="text-sm text-slate-300 font-medium truncate">{{ contractProjectName }}</p>
            </div>
            <div v-if="contractProjectId" class="text-xs text-slate-500">
                프로젝트 ID · {{ contractProjectId }}
            </div>

            <div class="pt-2 flex gap-2">
                <button
                    class="flex-1 py-2 text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-white/5"
                    @click="openDetailModal"
                    :disabled="!contractDetails"
                >
                    상세 보기
                </button>
                <button
                    v-if="showSignButton"
                    class="flex-1 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
                    @click="openSignatureModal"
                >
                    서명하기
                </button>
                <button
                    v-if="showRejectButton"
                    class="flex-1 py-2 text-xs font-medium text-rose-200 bg-rose-500/30 hover:bg-rose-500/40 rounded-lg transition-colors shadow-lg shadow-rose-900/20"
                    @click="rejectContract"
                >
                    거절하기
                </button>
            </div>
        </div>
    </div>

    <ContractDetailModal
        v-if="isDetailOpen && contractDetails"
        :contract="contractDetails"
        :isFreelancer="!isEmployer"
        @close="isDetailOpen = false"
        @sign="openSignatureModal"
    />

    <SignaturePadModal
        v-if="isSignatureOpen && authStore.user"
        :signerName="authStore.user.name"
        @sign="handleSignature"
        @close="isSignatureOpen = false"
    />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { FileText as FileTextIcon } from 'lucide-vue-next';
import type { ChatMessage } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useContractStore } from '@/stores/contractStore';
import { useChatStore } from '@/stores/chatStore';
import ContractDetailModal from '@/views/employer/Contracts/components/ContractDetailModal.vue';
import SignaturePadModal from '@/views/employer/Contracts/components/SignaturePadModal.vue';

const props = defineProps<{
    message?: ChatMessage;
}>();

const authStore = useAuthStore();
const contractStore = useContractStore();
const chatStore = useChatStore();
const isDetailOpen = ref(false);
const isSignatureOpen = ref(false);

const contractId = computed(() => {
    const raw = props.message?.metadata?.contractId;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
});

const contractDetails = computed(() => {
    if (!contractId.value) return null;
    return contractStore.contractsWithDetails.find((c) => c.id === contractId.value) || null;
});

const isEmployer = computed(() => authStore.user?.role === 'EMPLOYER');
const contractTitle = computed(() => contractDetails.value?.projectName || '프로젝트 표준 계약');
const contractProjectName = computed(() => contractDetails.value?.projectName || '계약 정보 없음');
const contractProjectId = computed(() => contractDetails.value?.projectId || '');

const statusLabel = computed(() => {
    const status = contractDetails.value?.status;
    if (!status) return '정보 없음';
    if (status === 'WAITING_SIGNATURE') return '서명 대기중';
    if (status === 'IN_PROGRESS') return '진행 중';
    if (status === 'COMPLETED') return '완료';
    if (status === 'REJECTED') return '거절됨';
    return status;
});

const statusBadgeClass = computed(() => {
    const status = contractDetails.value?.status;
    if (status === 'WAITING_SIGNATURE') {
        return 'px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
    }
    if (status === 'IN_PROGRESS') {
        return 'px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
    if (status === 'COMPLETED') {
        return 'px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
    if (status === 'REJECTED') {
        return 'px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
    return 'px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20';
});

const showSignButton = computed(() => {
    if (!contractDetails.value || !authStore.user) return false;
    if (contractDetails.value.status !== 'WAITING_SIGNATURE') return false;
    return isEmployer.value
        ? !contractDetails.value.employerSignedDate
        : !contractDetails.value.freelancerSignedDate;
});

const showRejectButton = computed(() => {
    if (!contractDetails.value || !authStore.user) return false;
    if (contractDetails.value.status !== 'WAITING_SIGNATURE') return false;
    return !isEmployer.value && !contractDetails.value.freelancerSignedDate;
});

function openDetailModal() {
    if (!contractDetails.value) return;
    isDetailOpen.value = true;
}

function openSignatureModal() {
    if (!contractDetails.value) return;
    isSignatureOpen.value = true;
}

function handleSignature(signatureDataUrl: string) {
    if (!contractDetails.value || !authStore.user) return;

    const updates: Record<string, any> = {};
    if (isEmployer.value) {
        updates.employerSignature = signatureDataUrl;
        updates.employerSignedDate = new Date();
    } else {
        updates.freelancerSignature = signatureDataUrl;
        updates.freelancerSignedDate = new Date();
    }

    const nextEmployerSigned = updates.employerSignedDate || contractDetails.value.employerSignedDate;
    const nextFreelancerSigned = updates.freelancerSignedDate || contractDetails.value.freelancerSignedDate;

    if (nextEmployerSigned && nextFreelancerSigned) {
        updates.status = 'IN_PROGRESS';
        updates.signedDate = new Date();
        if (props.message?.roomId) {
            chatStore.sendSystemMessage(props.message.roomId, '계약서 서명이 완료되었습니다.');
        }
    }

    contractStore.updateContract(contractDetails.value.id, updates);
    if (props.message?.roomId) {
        chatStore.updateRoomContract(props.message.roomId, contractDetails.value.id);
    }
    isSignatureOpen.value = false;
}

function rejectContract() {
    if (!contractDetails.value) return;
    if (!confirm('계약을 거절하시겠습니까?')) return;
    contractStore.updateContract(contractDetails.value.id, { status: 'REJECTED' });
    if (props.message?.roomId) {
        chatStore.updateRoomContract(props.message.roomId, contractDetails.value.id);
        chatStore.sendSystemMessage(props.message.roomId, '계약이 거절되었습니다.');
    }
}
</script>
