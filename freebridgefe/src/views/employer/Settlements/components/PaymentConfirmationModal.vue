<script setup lang="ts">
import { ref } from 'vue';
import { X, CreditCard, CheckCircle, AlertTriangle } from 'lucide-vue-next';
import type { EmployerSettlementWithDetails } from '@/stores/contractStore';

const props = defineProps<{
    settlement: EmployerSettlementWithDetails;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'confirm'): void;
}>();

const isProcessing = ref(false);

const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + '원';
};

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR');
};

const handleConfirm = async () => {
    isProcessing.value = true;
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    emit('confirm');
};

const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
        emit('close');
    }
};
</script>

<template>
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        @click="handleBackdropClick"
    >
        <div
            class="w-full max-w-md bg-gray-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            v-motion
            :initial="{ opacity: 0, scale: 0.95, y: 20 }"
            :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', duration: 500 } }"
        >
            <!-- Header -->
            <div class="p-6 border-b border-white/10">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center"
                        >
                            <CreditCard class="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-white">결제 확인</h3>
                            <p class="text-sm text-white/60">정산 결제를 진행합니다</p>
                        </div>
                    </div>
                    <button
                        @click="$emit('close')"
                        class="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X class="w-5 h-5 text-white/60" />
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-4">
                <!-- Settlement Info -->
                <div class="bg-white/5 rounded-2xl p-4 space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-white/60">프로젝트</span>
                        <span class="font-medium text-white">{{ settlement.projectName }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-white/60">프리랜서</span>
                        <span class="font-medium text-white">{{ settlement.freelancerName }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-white/60">회차</span>
                        <span class="font-medium text-white">{{ settlement.installmentNumber }}차</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-white/60">결제 기한</span>
                        <span class="font-medium text-white">{{ formatDate(settlement.dueDate) }}</span>
                    </div>
                </div>

                <!-- Amount Breakdown -->
                <div class="bg-white/5 rounded-2xl p-4 space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-white/60">청구 금액</span>
                        <span class="font-medium text-white">{{ formatCurrency(settlement.billingAmount) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-white/60">플랫폼 수수료 ({{ (settlement.platformFee / settlement.billingAmount * 100).toFixed(0) }}%)</span>
                        <span class="font-medium text-white">{{ formatCurrency(settlement.platformFee) }}</span>
                    </div>
                    <div class="border-t border-white/10 pt-3 flex justify-between items-center">
                        <span class="font-semibold text-white">총 결제 금액</span>
                        <span class="text-2xl font-bold text-blue-400">{{ formatCurrency(settlement.totalAmount) }}</span>
                    </div>
                </div>

                <!-- Notice -->
                <div class="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <AlertTriangle class="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div class="text-sm text-yellow-200/80">
                        결제 완료 후 프리랜서에게 정산이 진행됩니다.
                        정산은 영업일 기준 3~5일 내에 처리됩니다.
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="p-6 pt-0 flex gap-3">
                <button
                    @click="$emit('close')"
                    :disabled="isProcessing"
                    class="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                    취소
                </button>
                <button
                    @click="handleConfirm"
                    :disabled="isProcessing"
                    class="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <span v-if="isProcessing" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <CheckCircle v-else class="w-5 h-5" />
                    {{ isProcessing ? '처리 중...' : '결제하기' }}
                </button>
            </div>
        </div>
    </div>
</template>