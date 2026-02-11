<template>
    <div class="h-full flex flex-col bg-slate-950 overflow-y-auto custom-scrollbar">
        <!-- Header -->
        <div class="p-6 bg-slate-900 border-b border-white/5 sticky top-0 z-10">
            <h2 class="text-xl font-bold text-white">계약 관리</h2>
            <p class="text-sm text-slate-400 mt-1">프로젝트 계약 진행 상황을 확인하세요.</p>
        </div>

        <div class="p-6 flex-1">
            <!-- Case 1: No Contract -->
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
                        
                        <button 
                            v-if="!hasSigned"
                            @click="openSignatureModal"
                            class="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                        >
                            <PenToolIcon class="w-4 h-4" /> 내 서명하기
                        </button>
                        <div v-else class="text-center py-2 text-sm text-emerald-500 font-medium bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            이미 서명을 완료했습니다. 상대방을 기다리는 중입니다.
                        </div>
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useContractStore } from '@/stores/contractStore';
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

const currentRoom = computed(() => chatStore.rooms.find(r => r.id === props.roomId));
const currentContract = computed(() => {
    if (!currentRoom.value?.contractId) return null;
    return contractStore.contracts.find(c => c.id === currentRoom.value?.contractId);
});

const isEmployer = computed(() => authStore.user?.role === 'EMPLOYER');

const hasSigned = computed(() => {
    if (!currentContract.value || !authStore.user) return false;
    return isEmployer.value 
        ? !!currentContract.value.employerSignedDate 
        : !!currentContract.value.freelancerSignedDate;
});

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

function formatDate(date: Date | string) {
    return format(new Date(date), 'yyyy.MM.dd', { locale: ko });
}

function initiateContract() {
    // Logic to open modal to create contract
    alert('계약서 작성 모달이 열립니다. (구현 예정)');
    // After creation, it would mimic:
    // contractStore.addContract(...)
    // chatStore.updateRoomContract(...)
}

function openSignatureModal() {
     alert('서명 패드가 열립니다. (구현 예정)');
    // After signature:
    // contractStore.updateContract(id, { ...signedDate: new Date() })
}

function requestContract() {
    // Logic to send a system message or notification to employer
    chatStore.sendSystemMessage(props.roomId, '상대방에게 계약서 작성을 요청했습니다.', 'SYSTEM');
    alert('고용주에게 계약서 작성을 요청했습니다.');
}
</script>
