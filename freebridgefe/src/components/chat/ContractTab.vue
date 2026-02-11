<template>
    <div class="h-full flex flex-col bg-gray-50 overflow-y-auto">
        <!-- Header -->
        <div class="p-6 bg-white border-b border-gray-200 sticky top-0 z-10">
            <h2 class="text-xl font-bold text-gray-900">계약 관리</h2>
            <p class="text-sm text-gray-500 mt-1">프로젝트 계약 진행 상황을 확인하세요.</p>
        </div>

        <div class="p-6 flex-1">
            <!-- Case 1: No Contract -->
            <div v-if="!currentContract" class="flex flex-col items-center justify-center h-full text-center space-y-4">
                <FileTextIcon class="w-16 h-16 text-gray-300" />
                <h3 class="text-lg font-medium text-gray-900">진행 중인 계약이 없습니다</h3>
                <p class="text-sm text-gray-500 max-w-xs">
                    프로젝트 진행을 위해 계약서를 작성해주세요.<br>
                    계약서가 작성되면 이곳에서 서명을 진행할 수 있습니다.
                </p>
                <button 
                    v-if="isEmployer"
                    @click="initiateContract"
                    class="mt-4 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    계약서 작성하기
                </button>
                <button 
                    v-else
                    @click="requestContract"
                    class="mt-4 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                    계약서 요청하기
                </button>
            </div>

            <!-- Case 2: Contract Draft / Waiting Signature -->
            <div v-else-if="currentContract.status === 'WAITING_SIGNATURE'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-yellow-50 px-6 py-4 border-b border-yellow-100 flex items-center gap-3">
                    <ClockIcon class="w-5 h-5 text-yellow-600" />
                    <span class="font-semibold text-yellow-800">계약 서명 대기중</span>
                </div>
                
                <div class="p-6 space-y-6">
                    <div>
                        <h4 class="text-sm font-medium text-gray-500 mb-1">프로젝트명</h4>
                        <p class="text-lg font-bold text-gray-900">{{ currentContract.projectName }}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <h4 class="text-sm font-medium text-gray-500 mb-1">총 계약금액</h4>
                            <p class="text-base font-semibold text-gray-900">{{ formatCurrency(currentContract.budget) }}</p>
                        </div>
                        <div>
                            <h4 class="text-sm font-medium text-gray-500 mb-1">계약 기간</h4>
                            <p class="text-base font-semibold text-gray-900">
                                {{ formatDate(currentContract.startDate) }} ~ {{ formatDate(currentContract.endDate) }}
                            </p>
                        </div>
                    </div>

                    <div class="border-t border-gray-100 pt-4">
                        <h4 class="text-sm font-medium text-gray-500 mb-3">서명 현황</h4>
                        <div class="flex items-center gap-4">
                            <!-- Employer Status -->
                            <div class="flex-1 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <div :class="['w-2 h-2 rounded-full', currentContract.employerSignedDate ? 'bg-green-500' : 'bg-gray-300']"></div>
                                <span class="text-sm font-medium text-gray-700">고용주</span>
                                <span v-if="currentContract.employerSignedDate" class="ml-auto text-xs text-green-600 font-medium">완료</span>
                            </div>
                            <!-- Freelancer Status -->
                            <div class="flex-1 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <div :class="['w-2 h-2 rounded-full', currentContract.freelancerSignedDate ? 'bg-green-500' : 'bg-gray-300']"></div>
                                <span class="text-sm font-medium text-gray-700">프리랜서</span>
                                <span v-if="currentContract.freelancerSignedDate" class="ml-auto text-xs text-green-600 font-medium">완료</span>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="pt-2 flex flex-col gap-3">
                        <button class="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                             <FileIcon class="w-4 h-4" /> 계약서 미리보기 (PDF)
                        </button>
                        
                        <button 
                            v-if="!hasSigned"
                            @click="openSignatureModal"
                            class="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <PenToolIcon class="w-4 h-4" /> 내 서명하기
                        </button>
                        <div v-else class="text-center py-2 text-sm text-green-600 font-medium bg-green-50 rounded-lg">
                            이미 서명을 완료했습니다. 상대방을 기다리는 중입니다.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Case 3: Active / Completed Contract -->
            <div v-else class="space-y-6">
                <!-- Status Card -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-lg font-bold text-gray-900">{{ currentContract.projectName }}</h3>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                                {{ currentContract.status === 'IN_PROGRESS' ? '진행중' : '완료됨' }}
                            </span>
                        </div>
                        <button class="text-sm text-blue-600 hover:text-blue-800 font-medium">상세보기</button>
                    </div>
                    
                     <div class="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p class="text-xs text-gray-500">계약 시작일</p>
                            <p class="text-sm font-semibold text-gray-900">{{ formatDate(currentContract.startDate) }}</p>
                        </div>
                         <div>
                            <p class="text-xs text-gray-500">계약 종료일</p>
                            <p class="text-sm font-semibold text-gray-900">{{ formatDate(currentContract.endDate) }}</p>
                        </div>
                     </div>
                </div>

                <!-- Settlement Summary -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSignIcon class="w-4 h-4 text-gray-500" /> 정산 현황
                    </h4>
                    
                    <div class="space-y-4">
                        <!-- Upcoming Payment -->
                         <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm font-medium text-blue-900">다음 정산일</span>
                                <span class="text-sm font-bold text-blue-700">D-12</span>
                            </div>
                            <p class="text-xs text-blue-600">매월 {{ currentContract.paymentDay }}일 지급 예정</p>
                        </div>

                         <!-- Payment History Preview -->
                         <div class="space-y-2">
                            <div class="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                                <span class="text-gray-600">1차 정산금</span>
                                <span class="font-medium text-gray-900">지급 완료</span>
                            </div>
                             <div class="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                                <span class="text-gray-600">2차 정산금</span>
                                <span class="font-medium text-orange-600">처리중</span>
                            </div>
                         </div>
                    </div>
                </div>
                
                 <button class="w-full py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
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
    chatStore.sendMessage('상대방에게 계약서 작성을 요청했습니다.', 'SYSTEM');
    alert('고용주에게 계약서 작성을 요청했습니다.');
}
</script>
