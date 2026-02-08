<script setup lang="ts">
import { computed } from 'vue';
import {
    X,
    DollarSign,
    CheckCircle,
    Clock,
    Send,
    Calendar,
    User,
    FileText,
    Download,
    Briefcase,
} from 'lucide-vue-next';

interface EmployerSettlement {
    id: string;
    contractId: string;
    billingAmount: number;
    platformFee: number;
    tax: number;
    totalAmount: number;
    installmentNumber: number;
    status: 'ISSUED' | 'PAID' | 'DISBURSED';
    invoicePdfUrl: string;
    projectName: string;
    freelancerName: string;
    freelancerId: string;
    employerId: string;
    dueDate: Date | string;
    paidDate?: Date | string;
}

const props = defineProps<{
    settlement: EmployerSettlement;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'download', settlement: EmployerSettlement): void;
}>();

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; color: string; bg: string }> = {
    ISSUED: { label: '청구됨', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
    PAID: { label: '결제 완료', icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
    DISBURSED: { label: '지급 완료', icon: Send, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
};

const paymentStages = [
    { id: 1, label: '청구서 발행', status: 'ISSUED' },
    { id: 2, label: '결제 완료', status: 'PAID' },
    { id: 3, label: '지급 완료', status: 'DISBURSED' },
];

const currentStageIndex = computed(() => {
    const statusOrder = ['ISSUED', 'PAID', 'DISBURSED'];
    return statusOrder.indexOf(props.settlement.status);
});

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + '원';
};

const handleDownload = () => {
    emit('download', props.settlement);
};
</script>

<template>
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-white">
        <div
            class="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            v-motion
            :initial="{ opacity: 0, scale: 0.95, y: 20 }"
            :enter="{ opacity: 1, scale: 1, y: 0 }"
            :leave="{ opacity: 0, scale: 0.95, y: 20 }"
        >
            <!-- Header -->
            <div class="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between z-10">
                <h2 class="text-2xl font-bold text-white">정산 상세 내역</h2>
                <button
                    @click="$emit('close')"
                    class="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    v-motion
                    :hover="{ scale: 1.1, rotate: 90 }"
                    :tap="{ scale: 0.9 }"
                >
                    <X class="w-6 h-6 text-white" />
                </button>
            </div>

            <div class="p-6 space-y-6">
                <!-- Project Info Card -->
                <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                    <div class="flex items-start justify-between">
                        <div>
                            <div class="text-sm text-white/60 mb-1">프로젝트</div>
                            <div class="text-2xl font-bold text-white mb-2">{{ settlement.projectName }}</div>
                            <div class="flex items-center gap-2 text-white/70">
                                <User class="w-4 h-4" />
                                {{ settlement.freelancerName }}
                            </div>
                        </div>
                        <div
                            class="px-4 py-2 rounded-full border font-medium"
                            :class="statusConfig[settlement.status].bg"
                        >
                            <span :class="statusConfig[settlement.status].color">
                                {{ statusConfig[settlement.status].label }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Progress Timeline -->
                <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                    <h3 class="text-lg font-bold text-white mb-6">정산 진행 상태</h3>
                    <div class="relative">
                        <!-- Progress Line -->
                        <div class="absolute top-6 left-6 right-6 h-1 bg-white/10">
                            <div
                                class="h-full bg-blue-500 transition-all duration-1000 ease-out"
                                :style="{ width: `${(currentStageIndex / (paymentStages.length - 1)) * 100}%` }"
                            ></div>
                        </div>

                        <!-- Stages -->
                        <div class="relative flex justify-between">
                            <div
                                v-for="(stage, index) in paymentStages"
                                :key="stage.id"
                                class="flex flex-col items-center"
                            >
                                <div
                                    class="w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all bg-gray-800"
                                    :class="{
                                        'bg-blue-500 border-white/20 shadow-lg': index <= currentStageIndex,
                                        'border-white/10': index > currentStageIndex,
                                    }"
                                    v-motion
                                    :initial="{ scale: 0 }"
                                    :enter="{ scale: 1, transition: { delay: 0.2 + index * 0.1 } }"
                                >
                                    <CheckCircle v-if="index <= currentStageIndex" class="w-6 h-6 text-white" />
                                    <div v-else class="w-3 h-3 rounded-full bg-white/30" />
                                </div>
                                <div
                                    class="mt-3 text-sm text-center"
                                    :class="index === currentStageIndex ? 'font-medium text-blue-400' : 'text-white/60'"
                                >
                                    {{ stage.label }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Settlement Details -->
                <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FileText class="w-5 h-5 text-blue-400" />
                        청구 정보
                    </h3>

                    <div class="space-y-4">
                        <div class="flex items-center justify-between py-3 border-b border-white/10">
                            <span class="text-white/60">청구 회차</span>
                            <span class="font-medium text-white">{{ settlement.installmentNumber }}차</span>
                        </div>
                        <div class="flex items-center justify-between py-3 border-b border-white/10">
                            <span class="text-white/60">청구 금액 (공급가액)</span>
                            <span class="text-xl font-bold text-white">{{ formatCurrency(settlement.billingAmount) }}</span>
                        </div>
                        <div class="flex items-center justify-between py-3 border-b border-white/10">
                            <span class="text-white/60">플랫폼 수수료 (5%)</span>
                            <span class="text-white">{{ formatCurrency(settlement.platformFee) }}</span>
                        </div>
                        <div class="flex items-center justify-between py-3 border-b border-white/10">
                            <span class="text-white/60">부가세 (10%)</span>
                            <span class="text-white">{{ formatCurrency(settlement.tax) }}</span>
                        </div>
                        <div class="flex items-center justify-between py-3 border-b border-white/10 bg-white/5 px-4 rounded-xl mt-2">
                            <span class="text-white font-medium">총 결제 금액</span>
                            <span class="text-2xl font-bold text-blue-400">{{ formatCurrency(settlement.totalAmount) }}</span>
                        </div>
                        <div class="flex items-center justify-between py-3 border-b border-white/10">
                            <span class="text-white/60">계약 ID</span>
                            <RouterLink 
                                :to="`/employer/contracts/${settlement.contractId}`"
                                class="font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                                {{ settlement.contractId }}
                                <Briefcase class="w-3 h-3" />
                            </RouterLink>
                        </div>
                    </div>
                </div>

                <!-- Dates -->
                <div class="grid md:grid-cols-2 gap-4">
                    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                        <div class="flex items-center gap-2 text-white/60 mb-2">
                            <Calendar class="w-4 h-4" />
                            <span class="text-sm">납부 기한</span>
                        </div>
                        <div class="font-medium text-white">
                            {{ formatDate(settlement.dueDate) }}
                        </div>
                    </div>

                    <div
                        v-if="settlement.paidDate"
                        class="bg-green-500/20 border border-green-400/30 rounded-2xl p-4"
                    >
                        <div class="flex items-center gap-2 text-green-300 mb-2">
                            <CheckCircle class="w-4 h-4" />
                            <span class="text-sm">결제일</span>
                        </div>
                        <div class="font-medium text-green-200">
                            {{ formatDate(settlement.paidDate) }}
                        </div>
                    </div>
                </div>

                <!-- Status Messages -->
                <div v-if="settlement.status === 'ISSUED'" class="bg-yellow-500/20 border border-yellow-400/30 rounded-2xl p-4">
                    <div class="text-sm text-yellow-200">
                        청구서가 발행되었습니다. 납부 기한 내에 결제를 완료해주세요.
                    </div>
                </div>

                <div v-if="settlement.status === 'PAID'" class="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-4">
                    <div class="text-sm text-blue-200">
                        결제가 완료되었습니다. 프리랜서에게 지급 처리 중입니다.
                    </div>
                </div>

                <div v-if="settlement.status === 'DISBURSED'" class="bg-green-500/20 border border-green-400/30 rounded-2xl p-4">
                    <div class="text-sm text-green-200">
                        프리랜서에게 정산이 완료되었습니다.
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                    <button
                        @click="handleDownload"
                        class="flex-1 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        v-motion
                        :hover="{ scale: 1.02 }"
                        :tap="{ scale: 0.98 }"
                    >
                        <Download class="w-5 h-5" />
                        청구서 다운로드
                    </button>
                    <button
                        @click="$emit('close')"
                        class="flex-1 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-2xl hover:shadow-xl transition-all"
                        v-motion
                        :hover="{ scale: 1.02 }"
                        :tap="{ scale: 0.98 }"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>