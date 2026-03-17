<template>
    <div class="h-full flex flex-col bg-slate-950 overflow-y-auto custom-scrollbar">
        <div class="p-6 bg-slate-900 border-b border-white/5 sticky top-0 z-10">
            <h2 class="text-xl font-bold text-white">계약 관리</h2>
            <p class="text-sm text-slate-400 mt-1">
                채팅에서는 계약 상태만 확인하고, 실제 작성과 서명은 계약 화면에서 진행합니다.
            </p>
        </div>

        <div class="p-6 flex-1">
            <div
                v-if="isContractLookupPending"
                class="h-full min-h-[320px] flex flex-col items-center justify-center text-center space-y-4"
            >
                <div class="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center">
                    <Loader2Icon class="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
                <div>
                    <h3 class="text-lg font-bold text-white">계약 정보를 불러오는 중입니다</h3>
                    <p class="text-sm text-slate-400 mt-2">잠시 후 현재 대화와 연결된 계약 상태를 확인합니다.</p>
                </div>
            </div>

            <div
                v-else-if="!currentContract"
                class="h-full min-h-[320px] flex flex-col items-center justify-center text-center space-y-4"
            >
                <div class="w-20 h-20 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center">
                    <FileTextIcon class="w-10 h-10 text-slate-600" />
                </div>
                <div class="space-y-2">
                    <h3 class="text-lg font-bold text-white">
                        {{ hasMultipleContractCandidates ? '계약이 여러 건 있어 자동 연결하지 않았습니다' : '연결된 계약이 없습니다' }}
                    </h3>
                    <p class="text-sm text-slate-400 max-w-md leading-relaxed">
                        {{ emptyStateDescription }}
                    </p>
                </div>
                <div class="mt-2 flex flex-col gap-3">
                    <button
                        @click="openContractPage"
                        class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-950/30"
                    >
                        {{ primaryActionLabel }}
                        <ArrowRightIcon class="w-4 h-4" />
                    </button>
                    <button
                        @click="openLegalAdvicePage"
                        class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-sky-400/20 bg-sky-500/10 text-sky-100 font-semibold hover:bg-sky-500/20 transition-colors"
                    >
                        <ScaleIcon class="w-4 h-4" />
                        법률 자문 AI 보기
                    </button>
                </div>
            </div>

            <div v-else class="space-y-6">
                <div class="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden shadow-lg">
                    <div class="px-6 py-4 border-b border-white/5 flex items-start justify-between gap-4">
                        <div>
                            <p class="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">현재 계약</p>
                            <h3 class="text-xl font-bold text-white">{{ currentContract.projectName }}</h3>
                            <p class="text-sm text-slate-400 mt-1">
                                계약번호 · {{ currentContract.contractId }}
                            </p>
                        </div>
                        <div
                            :class="currentStatusConfig.badgeClass"
                            class="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold border"
                        >
                            <component :is="currentStatusConfig.icon" class="w-4 h-4" />
                            {{ currentStatusConfig.label }}
                        </div>
                    </div>

                    <div class="p-6 space-y-6">
                        <div class="rounded-2xl border border-white/5 bg-slate-950/70 p-4">
                            <p class="text-sm text-slate-300 leading-relaxed">
                                {{ currentStatusConfig.description }}
                            </p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="rounded-xl bg-slate-950/70 border border-white/5 p-4">
                                <p class="text-xs text-slate-500 uppercase tracking-wider">상대방</p>
                                <p class="text-base font-semibold text-white mt-2">{{ otherParticipantName }}</p>
                            </div>
                            <div class="rounded-xl bg-slate-950/70 border border-white/5 p-4">
                                <p class="text-xs text-slate-500 uppercase tracking-wider">총 계약금액</p>
                                <p class="text-base font-semibold text-white mt-2">{{ formatCurrency(currentContract.budget) }}</p>
                            </div>
                            <div class="rounded-xl bg-slate-950/70 border border-white/5 p-4">
                                <p class="text-xs text-slate-500 uppercase tracking-wider">계약 기간</p>
                                <p class="text-base font-semibold text-white mt-2">
                                    {{ formatDate(currentContract.startDate) }} ~ {{ formatDate(currentContract.endDate) }}
                                </p>
                            </div>
                            <div class="rounded-xl bg-slate-950/70 border border-white/5 p-4">
                                <p class="text-xs text-slate-500 uppercase tracking-wider">정산일</p>
                                <p class="text-base font-semibold text-white mt-2">
                                    매월 {{ currentContract.paymentDay || 25 }}일
                                </p>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <div class="flex items-center justify-between gap-3 rounded-xl bg-slate-950/70 border border-white/5 p-4">
                                <div>
                                    <p class="text-sm font-semibold text-white">고용주 서명</p>
                                    <p class="text-xs text-slate-500 mt-1">계약 화면에서만 서명할 수 있습니다.</p>
                                </div>
                                <span
                                    :class="currentContract.employerSignedDate ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-slate-400 border-white/10 bg-white/5'"
                                    class="px-3 py-1.5 rounded-full text-xs font-semibold border"
                                >
                                    {{ currentContract.employerSignedDate ? '완료' : '대기중' }}
                                </span>
                            </div>
                            <div class="flex items-center justify-between gap-3 rounded-xl bg-slate-950/70 border border-white/5 p-4">
                                <div>
                                    <p class="text-sm font-semibold text-white">프리랜서 서명</p>
                                    <p class="text-xs text-slate-500 mt-1">계약 화면에서만 서명할 수 있습니다.</p>
                                </div>
                                <span
                                    :class="currentContract.freelancerSignedDate ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-slate-400 border-white/10 bg-white/5'"
                                    class="px-3 py-1.5 rounded-full text-xs font-semibold border"
                                >
                                    {{ currentContract.freelancerSignedDate ? '완료' : '대기중' }}
                                </span>
                            </div>
                        </div>

                        <button
                            @click="openContractPage"
                            class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-950/30"
                        >
                            {{ primaryActionLabel }}
                            <ArrowRightIcon class="w-4 h-4" />
                        </button>
                        <button
                            @click="openLegalAdvicePage"
                            class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-sky-400/20 bg-sky-500/10 text-sky-100 font-semibold hover:bg-sky-500/20 transition-colors"
                        >
                            <ScaleIcon class="w-4 h-4" />
                            법률 자문 AI 보기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <ContractDetailModal
        v-if="selectedLegalAdviceContract"
        :contract="selectedLegalAdviceContract"
        :is-freelancer="!isEmployer"
        initial-tab="ai-advice"
        @close="selectedLegalAdviceContract = null"
    />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useContractStore } from '@/stores/contractStore';
import ContractDetailModal from '@/views/employer/Contracts/components/ContractDetailModal.vue';
import {
    AlertCircle as AlertCircleIcon,
    ArrowRight as ArrowRightIcon,
    CheckCircle as CheckCircleIcon,
    Clock as ClockIcon,
    FileText as FileTextIcon,
    Loader2 as Loader2Icon,
    Scale as ScaleIcon,
} from 'lucide-vue-next';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const props = defineProps<{
    roomId: string;
}>();

const authStore = useAuthStore();
const chatStore = useChatStore();
const contractStore = useContractStore();
const router = useRouter();
const selectedLegalAdviceContract = ref<ReturnType<typeof contractStore.findContractByAnyId>>(null);

const currentRoom = computed(() => chatStore.rooms.find((room) => room.id === props.roomId));
const isEmployer = computed(() => authStore.user?.role === 'EMPLOYER');
const otherParticipantId = computed(() => {
    if (!currentRoom.value) return null;
    return chatStore.getOtherParticipantId(currentRoom.value) || null;
});
const otherParticipantName = computed(() => {
    if (!currentRoom.value) return '알 수 없음';
    return chatStore.getOtherParticipantName(currentRoom.value);
});

function parseParticipantNumericId(participantId: string | null) {
    if (!participantId) return null;
    const matchedParticipant = String(participantId).match(/^[efa](\d+)$/i);
    if (matchedParticipant) {
        return Number(matchedParticipant[1]);
    }
    const numericId = Number(participantId);
    return Number.isFinite(numericId) ? numericId : null;
}

const roomParticipantIds = computed(() => {
    if (!authStore.user || !otherParticipantId.value) return null;

    const myUserId = Number(authStore.user.id);
    const counterpartId = parseParticipantNumericId(otherParticipantId.value);
    if (!Number.isFinite(myUserId) || !Number.isFinite(counterpartId)) return null;

    return {
        employerId: isEmployer.value ? myUserId : counterpartId,
        freelancerId: isEmployer.value ? counterpartId : myUserId,
    };
});

const relatedContracts = computed(() => {
    if (!roomParticipantIds.value) return [];

    return contractStore.contracts.filter(
        (contract) =>
            Number(contract.employerId) === roomParticipantIds.value!.employerId &&
            Number(contract.freelancerId) === roomParticipantIds.value!.freelancerId
    );
});

const currentContract = computed(() => {
    const linkedContract = contractStore.findContractByAnyId(currentRoom.value?.contractId);
    if (linkedContract) return linkedContract;
    if (!roomParticipantIds.value) return null;

    return contractStore.findContractByParticipants(
        roomParticipantIds.value.employerId,
        roomParticipantIds.value.freelancerId
    );
});

const hasMultipleContractCandidates = computed(() => {
    return !currentRoom.value?.contractId && !currentContract.value && relatedContracts.value.length > 1;
});

const isContractLookupPending = computed(() => {
    return contractStore.isContractsLoading && !contractStore.hasFetchedContracts && !currentContract.value;
});

const statusConfig = {
    WAITING_SIGNATURE: {
        label: '서명 대기중',
        badgeClass: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
        description: '실제 서명은 계약 화면에서만 진행합니다. 채팅에서는 현재 서명 진행 상태만 확인할 수 있습니다.',
        icon: ClockIcon,
    },
    IN_PROGRESS: {
        label: '진행중',
        badgeClass: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
        description: '계약이 활성화되었습니다. 세부 계약서와 정산 상태는 계약/정산 화면에서 확인하세요.',
        icon: CheckCircleIcon,
    },
    COMPLETED: {
        label: '완료됨',
        badgeClass: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
        description: '완료된 계약입니다. 최종 계약 내용과 정산 내역은 계약 화면에서 확인하세요.',
        icon: CheckCircleIcon,
    },
    REJECTED: {
        label: '거절됨',
        badgeClass: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
        description: '거절된 계약입니다. 조건을 조정해 다시 진행하려면 계약 화면에서 새 계약을 작성하세요.',
        icon: AlertCircleIcon,
    },
} as const;

const currentStatusConfig = computed(() => {
    if (!currentContract.value) {
        return statusConfig.WAITING_SIGNATURE;
    }
    return statusConfig[currentContract.value.status];
});

const primaryActionLabel = computed(() => {
    if (!currentContract.value) {
        if (hasMultipleContractCandidates.value) return '계약 목록으로 이동';
        return isEmployer.value ? '계약서 작성 화면으로 이동' : '계약 목록으로 이동';
    }
    if (currentContract.value.status === 'REJECTED' && isEmployer.value) {
        return '계약서 다시 작성 화면으로 이동';
    }
    return '계약 화면으로 이동';
});

const emptyStateDescription = computed(() => {
    if (hasMultipleContractCandidates.value) {
        return '같은 상대와 연결된 계약이 여러 건 있어 채팅에서는 하나를 임의로 선택하지 않았습니다. 계약 화면에서 정확한 계약을 확인하세요.';
    }
    if (isEmployer.value) {
        return '채팅에서는 계약서를 작성하지 않습니다. 계약서 생성은 계약 화면에서 진행하고, 생성된 상태만 이 탭에서 확인합니다.';
    }
    return '채팅에서는 계약 요청이나 서명을 진행하지 않습니다. 계약 상태 확인과 서명은 계약 화면에서 진행하세요.';
});

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

function formatDate(date: Date | string | undefined) {
    if (!date) return '-';
    return format(new Date(date), 'yyyy.MM.dd', { locale: ko });
}

function openContractPage() {
    const targetRouteName =
        hasMultipleContractCandidates.value
            ? isEmployer.value
                ? 'employer.contracts'
                : 'freelancer.contracts'
            : !currentContract.value && isEmployer.value
            ? 'employer.contracts.create'
            : currentContract.value?.status === 'REJECTED' && isEmployer.value
              ? 'employer.contracts.create'
              : isEmployer.value
                ? 'employer.contracts'
                : 'freelancer.contracts';

    const query: Record<string, string> = {
        roomId: props.roomId,
    };

    if (currentRoom.value?.relatedJobId) {
        query.jobId = String(currentRoom.value.relatedJobId);
    }
    if (currentRoom.value?.relatedProposalId) {
        query.proposalId = String(currentRoom.value.relatedProposalId);
    }
    if (currentContract.value?.contractId) {
        query.contractId = String(currentContract.value.contractId);
    } else if (currentRoom.value?.contractId) {
        query.contractId = String(currentRoom.value.contractId);
    }

    router.push({ name: targetRouteName, query });
}

function openLegalAdvicePage() {
    const contractToOpen =
        currentContract.value ||
        (relatedContracts.value.length === 1 ? relatedContracts.value[0] : null);

    if (!contractToOpen) {
        window.alert('채팅과 바로 연결된 계약이 없어 법률 자문 모달을 열 수 없습니다. 계약 목록에서 먼저 계약을 확인해 주세요.');
        return;
    }

    selectedLegalAdviceContract.value = contractToOpen;
}
</script>
