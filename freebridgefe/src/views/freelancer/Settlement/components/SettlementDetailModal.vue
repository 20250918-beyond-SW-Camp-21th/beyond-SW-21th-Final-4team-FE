<script setup lang="ts">
import { computed } from 'vue';
import { X, DollarSign, CheckCircle, Clock } from 'lucide-vue-next';
import type { Settlement } from '@/types/contract';

const props = defineProps<{
  settlement: Settlement;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// 결제 단계 타임라인
const paymentStages = [
  { id: 1, label: '정산 요청', status: 'PENDING' },
  { id: 2, label: '검토중', status: 'PROCESSING' },
  { id: 3, label: '승인 완료', status: 'APPROVED' },
  { id: 4, label: '지급 완료', status: 'PAID' },
];

const currentStageIndex = computed(() => 
  paymentStages.findIndex((s) => s.status === props.settlement.status)
);

const feeRate = computed(() => 
  ((props.settlement.platformFee / props.settlement.totalAmount) * 100).toFixed(1)
);
</script>

<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-white">
    <div
      class="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      v-motion
      :initial="{ opacity: 0, scale: 0.95, y: 20 }"
      :enter="{ opacity: 1, scale: 1, y: 0 }"
      :leave="{ opacity: 0, scale: 0.95, y: 20 }"
    >
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
        <!-- 프로젝트 정보 -->
        <div class="bg-white/5 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 shadow-lg">
          <div class="text-sm text-white/60 mb-1">프로젝트</div>
          <div class="text-2xl font-medium text-white mb-2">{{ settlement.projectName }}</div>
          <div class="text-white/70">{{ settlement.employerName }}</div>
        </div>

        <!-- 타임라인 스테퍼 -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
          <h3 class="text-lg font-bold text-white mb-6">정산 진행 상태</h3>
          <div class="relative">
            <!-- 프로그레스 라인 -->
            <div class="absolute top-6 left-6 right-6 h-1 bg-white/10">
              <div
                class="h-full bg-blue-500 transition-all duration-1000 ease-out"
                :style="{ width: `${(currentStageIndex / (paymentStages.length - 1)) * 100}%` }"
              ></div>
            </div>

            <!-- 단계 -->
            <div class="relative flex justify-between">
              <div
                v-for="(stage, index) in paymentStages"
                :key="stage.id"
                class="flex flex-col items-center"
              >
                <div
                  class="w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all bg-gray-800 border-white/10"
                   :class="{
                    'bg-blue-600 border-white/20 shadow-lg': index <= currentStageIndex
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
                <div
                  v-if="index === currentStageIndex"
                  class="mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                >
                  진행중
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 금액 breakdown -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
          <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign class="w-5 h-5 text-green-400" />
            금액 상세
          </h3>

          <div class="space-y-4">
            <div class="flex items-center justify-between pb-4 border-b border-white/10">
              <span class="text-white/60">총 정산 금액</span>
              <span class="text-2xl font-medium text-white">
                {{ settlement.totalAmount.toLocaleString() }}원
              </span>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between text-red-400">
                <span>플랫폼 수수료 ({{ feeRate }}%)</span>
                <span>- {{ settlement.platformFee.toLocaleString() }}원</span>
              </div>
              <div class="flex items-center justify-between text-red-400">
                <span>원천세 (10%)</span>
                <span>- {{ settlement.tax.toLocaleString() }}원</span>
              </div>
            </div>

            <div class="pt-4 border-t border-white/10 flex items-center justify-between">
              <span class="text-lg font-medium text-white">실수령액</span>
              <span class="text-3xl font-bold text-green-400">
                {{ settlement.netAmount.toLocaleString() }}원
              </span>
            </div>
          </div>
        </div>

        <!-- 계좌 정보 -->
        <div v-if="settlement.bankAccount" class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
          <h3 class="text-lg font-bold text-white mb-3">입금 계좌</h3>
          <div class="text-xl font-medium text-white">{{ settlement.bankAccount }}</div>
        </div>

        <!-- 날짜 정보 -->
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div class="flex items-center gap-2 text-white/60 mb-2">
              <Clock class="w-4 h-4" />
              <span class="text-sm">요청일</span>
            </div>
            <div class="font-medium text-white">
              {{ new Date(settlement.requestDate).toLocaleDateString('ko-KR') }}
            </div>
          </div>

          <div v-if="settlement.paidDate" class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div class="flex items-center gap-2 text-white/60 mb-2">
              <CheckCircle class="w-4 h-4" />
              <span class="text-sm">지급일</span>
            </div>
            <div class="font-medium text-white">
              {{ new Date(settlement.paidDate).toLocaleDateString('ko-KR') }}
            </div>
          </div>
        </div>

        <!-- 상태별 안내 메시지 -->
        <div v-if="settlement.status === 'PROCESSING'" class="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div class="text-sm text-gray-300">
            💡 정산이 처리 중입니다. 영업일 기준 2-3일 내 승인 예정입니다.
          </div>
        </div>

        <div v-if="settlement.status === 'APPROVED'" class="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div class="text-sm text-gray-300">
            ✅ 정산이 승인되었습니다. 곧 입금 처리될 예정입니다.
          </div>
        </div>

        <div v-if="settlement.status === 'PAID'" class="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div class="text-sm text-gray-300">
            🎉 정산이 완료되어 입금되었습니다. 계좌를 확인해주세요.
          </div>
        </div>

        <!-- 닫기 버튼 -->
        <button
          @click="$emit('close')"
          class="w-full py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all"
          v-motion
          :hover="{ scale: 1.02 }"
          :tap="{ scale: 0.98 }"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</template>
