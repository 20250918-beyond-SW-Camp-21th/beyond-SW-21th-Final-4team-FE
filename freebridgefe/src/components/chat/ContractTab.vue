<template>
    <div class="h-full flex flex-col bg-slate-950 overflow-y-auto custom-scrollbar">
        <!-- Header -->
        <div class="p-6 bg-slate-900 border-b border-white/5 sticky top-0 z-10">
            <h2 class="text-xl font-bold text-white">계약 관리</h2>
            <p class="text-sm text-slate-400 mt-1">프로젝트 계약 진행 상황을 확인하세요.</p>
        </div>

        <div class="p-6 flex-1">
            <!-- Case 1: No Contract -->

            <div v-if="!currentContract" class="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div class="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-2">
                    <FileTextIcon class="w-10 h-10 text-slate-600" />
                </div>
                <h3 class="text-lg font-bold text-white">진행 중인 계약이 없습니다</h3>
                <p class="text-sm text-slate-400 max-w-xs leading-relaxed">
                    프로젝트 진행을 위해 계약서를 작성해주세요.<br>
                    계약서가 작성되면 이곳에서 서명을 진행할 수 있습니다.
                </p>
                <button 
                    v-if="isEmployer"
                    @click="initiateContract"
                    class="mt-4 px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
                >
                    계약서 작성하기
                </button>
                <button 
                    v-else
                    @click="requestContract"
                    class="mt-4 px-6 py-2.5 bg-slate-800 border border-white/10 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
                >
                    계약서 요청하기
                </button>
            </div>

            <!-- Case 2: Contract Draft / Waiting Signature -->
            <div v-else-if="currentContract.status === 'WAITING_SIGNATURE'" class="bg-slate-900 rounded-xl shadow-lg border border-white/5 overflow-hidden">
                <div class="bg-yellow-500/10 px-6 py-4 border-b border-yellow-500/20 flex items-center gap-3">
                    <ClockIcon class="w-5 h-5 text-yellow-500" />
                    <span class="font-bold text-yellow-500">계약 서명 대기중</span>
                </div>
                
                <div class="p-6 space-y-6">
                    <div>
                        <h4 class="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">프로젝트명</h4>
                        <p class="text-lg font-bold text-white">{{ currentContract.projectName }}</p>
                        <p v-if="currentContract.projectId" class="text-xs text-slate-500 mt-1">프로젝트 ID · {{ currentContract.projectId }}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <h4 class="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">총 계약금액</h4>
                            <p class="text-base font-bold text-white">{{ formatCurrency(currentContract.budget) }}</p>
                        </div>
                        <div>
                            <h4 class="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">계약 기간</h4>
                            <p class="text-base font-bold text-white">
                                {{ formatDate(currentContract.startDate) }} ~ {{ formatDate(currentContract.endDate) }}
                            </p>
                        </div>
                    </div>

                    <div class="border-t border-white/5 pt-4">
                        <h4 class="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">서명 현황</h4>
                        <div class="flex items-center gap-4">
                            <!-- Employer Status -->
                            <div class="flex-1 flex items-center gap-2 p-3 bg-slate-800 rounded-lg border border-white/5">
                                <div :class="['w-2 h-2 rounded-full', currentContract.employerSignedDate ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600']"></div>
                                <span class="text-sm font-medium text-slate-300">고용주</span>
                                <span v-if="currentContract.employerSignedDate" class="ml-auto text-xs text-emerald-500 font-bold">완료</span>
                            </div>
                            <!-- Freelancer Status -->
                            <div class="flex-1 flex items-center gap-2 p-3 bg-slate-800 rounded-lg border border-white/5">
                                <div :class="['w-2 h-2 rounded-full', currentContract.freelancerSignedDate ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600']"></div>
                                <span class="text-sm font-medium text-slate-300">프리랜서</span>
                                <span v-if="currentContract.freelancerSignedDate" class="ml-auto text-xs text-emerald-500 font-bold">완료</span>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="pt-2 flex flex-col gap-3">
                        <button class="w-full py-2.5 border border-white/10 bg-slate-800 text-slate-300 font-medium rounded-lg hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2">
                             <FileIcon class="w-4 h-4" /> 계약서 미리보기 (PDF)
                        </button>
                        
                        <template v-if="!hasSigned">
                            <button 
                                @click="openSignatureModal"
                                class="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                            >
                                <PenToolIcon class="w-4 h-4" /> 서명하고 수락하기
                            </button>
                            <button
                                v-if="!isEmployer"
                                @click="rejectContract"
                                class="w-full py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold rounded-lg hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                                거절하기
                            </button>
                        </template>
                        <div v-else class="text-center py-2 text-sm text-emerald-500 font-medium bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            이미 서명을 완료했습니다. 상대방을 기다리는 중입니다.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Case 2.5: Rejected Contract -->
            <div v-else-if="currentContract.status === 'REJECTED'" class="bg-slate-900 rounded-xl shadow-lg border border-white/5 overflow-hidden">
                <div class="bg-rose-500/10 px-6 py-4 border-b border-rose-500/20 flex items-center gap-3">
                    <ClockIcon class="w-5 h-5 text-rose-400" />
                    <span class="font-bold text-rose-400">계약이 거절되었습니다</span>
                </div>
                <div class="p-6 space-y-4">
                    <div class="text-sm text-slate-300">
                        상대방이 계약을 거절했습니다. 새로운 조건으로 다시 제안할 수 있습니다.
                    </div>
                    <div class="flex flex-col gap-3">
                        <button
                            v-if="isEmployer"
                            @click="initiateContract"
                            class="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                        >
                            계약서 다시 작성하기
                        </button>
                        <button
                            v-else
                            @click="requestContract()"
                            class="w-full py-2.5 bg-slate-800 border border-white/10 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
                        >
                            계약서 다시 요청하기
                        </button>
                    </div>
                </div>
            </div>

            <!-- Case 3: Active / Completed Contract -->
            <div v-else class="space-y-6">
                <!-- Status Card -->
                <div class="bg-slate-900 rounded-xl shadow-lg border border-white/5 p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-lg font-bold text-white">{{ currentContract.projectName }}</h3>
                            <p v-if="currentContract.projectId" class="text-xs text-slate-500 mt-1">프로젝트 ID · {{ currentContract.projectId }}</p>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mt-2">
                                {{ currentContract.status === 'IN_PROGRESS' ? '진행중' : '완료됨' }}
                            </span>
                        </div>
                        <button class="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">상세보기</button>
                    </div>
                    
                     <div class="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p class="text-xs text-slate-500">계약 시작일</p>
                            <p class="text-sm font-semibold text-slate-200">{{ formatDate(currentContract.startDate) }}</p>
                        </div>
                         <div>
                            <p class="text-xs text-slate-500">계약 종료일</p>
                            <p class="text-sm font-semibold text-slate-200">{{ formatDate(currentContract.endDate) }}</p>
                        </div>
                     </div>
                </div>

                <!-- Settlement Summary -->
                <div class="bg-slate-900 rounded-xl shadow-lg border border-white/5 p-6">
                    <h4 class="font-bold text-white mb-4 flex items-center gap-2">
                        <DollarSignIcon class="w-4 h-4 text-slate-500" /> 정산 현황
                    </h4>
                    
                    <div class="space-y-4">
                        <!-- Upcoming Payment -->
                         <div class="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm font-medium text-blue-400">다음 정산일</span>
                                <span class="text-sm font-bold text-blue-400">D-12</span>
                            </div>
                            <p class="text-xs text-blue-300">매월 {{ currentContract.paymentDay }}일 지급 예정</p>
                        </div>

                         <!-- Payment History Preview -->
                         <div class="space-y-2">
                            <div class="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded transition-colors">
                                <span class="text-slate-400">1차 정산금</span>
                                <span class="font-medium text-emerald-500">지급 완료</span>
                            </div>
                             <div class="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded transition-colors">
                                <span class="text-slate-400">2차 정산금</span>
                                <span class="font-medium text-orange-400">처리중</span>
                            </div>
                         </div>
                    </div>
                </div>
                
                 <button class="w-full py-3 border border-white/10 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2 shadow-lg">
                    <FileTextIcon class="w-4 h-4" /> 최종 계약서 다운로드
                </button>
            </div>
        </div>
    </div>

    <!-- Create Contract Modal -->
    <div
        v-if="isCreateModalOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
        <div class="w-full max-w-xl rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white shadow-2xl">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold">계약서 작성</h3>
                <button class="text-slate-400 hover:text-white text-sm" @click="closeCreateModal">닫기</button>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="text-xs text-slate-400">프로젝트명</label>
                    <input
                        v-model="createForm.projectName"
                        type="text"
                        class="mt-2 w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400/60"
                        placeholder="프로젝트명을 입력하세요"
                    />
                </div>
                <div>
                    <label class="text-xs text-slate-400">프로젝트 고유번호</label>
                    <input
                        v-model="createForm.projectId"
                        type="text"
                        readonly
                        class="mt-2 w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-2.5 text-sm text-slate-300 focus:outline-none"
                    />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs text-slate-400">시작일</label>
                        <input
                            v-model="createForm.startDate"
                            type="date"
                            class="mt-2 w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400/60"
                        />
                    </div>
                    <div>
                        <label class="text-xs text-slate-400">종료일</label>
                        <input
                            v-model="createForm.endDate"
                            type="date"
                            class="mt-2 w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400/60"
                        />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs text-slate-400">총 계약금액</label>
                        <input
                            v-model.number="createForm.budget"
                            type="number"
                            min="0"
                            class="mt-2 w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400/60"
                            placeholder="예: 10000000"
                        />
                    </div>
                    <div>
                        <label class="text-xs text-slate-400">지급일</label>
                        <input
                            v-model.number="createForm.paymentDay"
                            type="number"
                            min="1"
                            max="31"
                            class="mt-2 w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400/60"
                            placeholder="예: 25"
                        />
                    </div>
                </div>
                <div v-if="createError" class="text-xs text-rose-400">{{ createError }}</div>
            </div>

            <div class="mt-6 flex gap-3">
                <button
                    class="flex-1 py-3 rounded-xl bg-white/10 border border-white/10 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                    @click="closeCreateModal"
                >
                    취소
                </button>
                <button
                    class="flex-1 py-3 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
                    @click="createContract"
                >
                    작성 완료
                </button>
            </div>
        </div>
    </div>

    <SignaturePadModal
        v-if="isSignatureModalOpen && authStore.user"
        :signerName="authStore.user.name"
        @sign="handleSignature"
        @close="isSignatureModalOpen = false"
    />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useContractStore } from '@/stores/contractStore';
import { useJobStore } from '@/stores/jobStore';
import { useFreelancerStore } from '@/stores/freelancerStore';
import SignaturePadModal from '@/views/employer/Contracts/components/SignaturePadModal.vue';
import { 
    FileText as FileTextIcon, 
    Clock as ClockIcon, 
    PenTool as PenToolIcon, 
    File as FileIcon,
    DollarSign as DollarSignIcon
} from 'lucide-vue-next';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const props = defineProps<{
    roomId: string;
}>();

const authStore = useAuthStore();
const chatStore = useChatStore();
const contractStore = useContractStore();
const jobStore = useJobStore();
const freelancerStore = useFreelancerStore();

const currentRoom = computed(() => chatStore.rooms.find(r => r.id === props.roomId));
const currentContract = computed(() => {
    if (!currentRoom.value?.contractId) return null;
    return contractStore.contracts.find(c => c.id === currentRoom.value?.contractId);
});

const isEmployer = computed(() => authStore.user?.role === 'EMPLOYER');
const isCreateModalOpen = ref(false);
const isSignatureModalOpen = ref(false);
const createError = ref('');
const createForm = ref({
    projectName: '',
    projectId: '',
    startDate: '',
    endDate: '',
    budget: 0,
    paymentDay: 25
});

const hasSigned = computed(() => {
    if (!currentContract.value || !authStore.user) return false;
    return isEmployer.value 
        ? !!currentContract.value.employerSignedDate 
        : !!currentContract.value.freelancerSignedDate;
});

const otherParticipantId = computed(() => {
    if (!currentRoom.value) return null;
    return chatStore.getOtherParticipantId(currentRoom.value) || null;
});

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

function formatDate(date: Date | string) {
    return format(new Date(date), 'yyyy.MM.dd', { locale: ko });
}

function initiateContract() {
    if (!isEmployer.value) return;
    const proposalId = currentRoom.value?.relatedProposalId ?? null;
    const proposal = proposalId
        ? freelancerStore.proposals.find((item) => item.id === proposalId)
        : null;
    const jobId = currentRoom.value?.relatedJobId ?? proposal?.jobId ?? '';
    const job = jobId ? jobStore.getJobById(jobId) : null;

    createForm.value = {
        projectName: job?.title || proposal?.message?.slice(0, 24) || '프로젝트 계약',
        projectId: jobId || '',
        startDate: '',
        endDate: '',
        budget: 0,
        paymentDay: 25
    };
    createError.value = '';
    isCreateModalOpen.value = true;
}

function openSignatureModal() {
    if (!currentContract.value) return;
    isSignatureModalOpen.value = true;
}

function requestContract() {
    // Fixed system message for contract request
    chatStore.sendSystemMessage(props.roomId, '계약서를 요청했습니다.', 'SYSTEM');
    alert('고용주에게 계약서 작성을 요청했습니다.');
}

function closeCreateModal() {
    isCreateModalOpen.value = false;
}

function parseParticipantId(participantId: string | null) {
    if (!participantId) return null;
    const match = String(participantId).match(/^([ef])(\d+)$/i);
    if (match) {
        return { role: match[1].toUpperCase(), id: Number(match[2]) };
    }
    const numericId = Number(participantId);
    return Number.isNaN(numericId) ? null : { role: null, id: numericId };
}

function createContract() {
    if (!authStore.user || !currentRoom.value || !otherParticipantId.value) return;
    if (!createForm.value.projectName.trim()) {
        createError.value = '프로젝트명을 입력해주세요.';
        return;
    }
    if (!createForm.value.startDate || !createForm.value.endDate) {
        createError.value = '계약 기간을 선택해주세요.';
        return;
    }
    if (createForm.value.budget <= 0) {
        createError.value = '계약 금액을 입력해주세요.';
        return;
    }

    const other = parseParticipantId(otherParticipantId.value);
    if (!other?.id) {
        createError.value = '상대방 정보를 찾을 수 없습니다.';
        return;
    }

    const nextId = Math.max(0, ...contractStore.contracts.map((c) => c.id)) + 1;
    const contract = {
        id: nextId,
        contractId: 1000 + nextId,
        projectName: createForm.value.projectName.trim(),
        projectId: createForm.value.projectId || undefined,
        freelancerId: authStore.user.role === 'EMPLOYER' ? other.id : Number(authStore.user.id),
        employerId: authStore.user.role === 'EMPLOYER' ? Number(authStore.user.id) : other.id,
        startDate: new Date(createForm.value.startDate),
        endDate: new Date(createForm.value.endDate),
        status: 'WAITING_SIGNATURE' as const,
        budget: createForm.value.budget,
        commissionRate: 0.05,
        paymentDay: createForm.value.paymentDay || 25,
        contractPdfUrl: `/contracts/${1000 + nextId}_contract.pdf`,
        employerSignature: authStore.user.role === 'EMPLOYER' ? 'signed-by-employer' : undefined,
        employerSignedDate: authStore.user.role === 'EMPLOYER' ? new Date() : undefined
    };

    contractStore.addContract(contract);
    chatStore.updateRoomContract(props.roomId, contract.id);
    chatStore.sendMessage(
        '프로젝트 계약 요청',
        'CONTRACT_ALERT',
        { contractId: contract.id, status: 'WAITING_SIGNATURE' },
        props.roomId
    );
    chatStore.sendSystemMessage(props.roomId, '계약서가 작성되어 전송되었습니다.');

    isCreateModalOpen.value = false;
}

function handleSignature(signatureDataUrl: string) {
    if (!currentContract.value || !authStore.user) return;

    const updates: Record<string, any> = {};
    if (isEmployer.value) {
        updates.employerSignature = signatureDataUrl;
        updates.employerSignedDate = new Date();
    } else {
        updates.freelancerSignature = signatureDataUrl;
        updates.freelancerSignedDate = new Date();
    }

    const nextEmployerSigned = updates.employerSignedDate || currentContract.value.employerSignedDate;
    const nextFreelancerSigned = updates.freelancerSignedDate || currentContract.value.freelancerSignedDate;

    if (nextEmployerSigned && nextFreelancerSigned) {
        updates.status = 'IN_PROGRESS';
        updates.signedDate = new Date();
        chatStore.sendSystemMessage(props.roomId, '계약서 서명이 완료되었습니다.');
    }

    contractStore.updateContract(currentContract.value.id, updates);
    isSignatureModalOpen.value = false;
}

function rejectContract() {
    if (!currentContract.value) return;
    if (!confirm('계약을 거절하시겠습니까?')) return;
    contractStore.updateContract(currentContract.value.id, {
        status: 'REJECTED'
    });
    chatStore.sendSystemMessage(props.roomId, '계약이 거절되었습니다.');
}
</script>
