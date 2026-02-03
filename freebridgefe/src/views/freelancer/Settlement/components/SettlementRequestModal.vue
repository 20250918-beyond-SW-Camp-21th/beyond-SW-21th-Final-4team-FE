<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMotion } from '@vueuse/motion';
import { X, DollarSign, Info } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const amount = ref('');
const bankAccount = ref('');

const numAmount = computed(() => parseInt(amount.value) || 0);
const feeRate = 5; // 5% 고정 수수료
const platformFee = computed(() => Math.floor(numAmount.value * (feeRate / 100)));
const tax = computed(() => Math.floor(numAmount.value * 0.1)); // 10% 세금
const netAmount = computed(() => numAmount.value - platformFee.value - tax.value);

const handleSubmit = () => {
  alert('정산 요청이 완료되었습니다!');
  emit('close');
};
</script>

<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-white">
    <div
      class="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-2xl w-full shadow-2xl"
      v-motion
      :initial="{ opacity: 0, scale: 0.95, y: 20 }"
      :enter="{ opacity: 1, scale: 1, y: 0 }"
      :leave="{ opacity: 0, scale: 0.95, y: 20 }"
    >
      <div class="border-b border-white/10 p-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-white">정산 요청</h2>
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

      <form @submit.prevent="handleSubmit" class="p-6">
        <!-- 요청 금액 -->
        <div class="mb-6">
          <label class="block text-sm text-white/80 mb-2">
            정산 요청 금액 <span class="text-red-400">*</span>
          </label>
          <div class="relative">
            <input
              type="number"
              v-model="amount"
              placeholder="1000000"
              min="0"
              step="10000"
              class="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-2xl focus:outline-none focus:border-blue-500 text-2xl font-medium text-white placeholder:text-white/30"
              required
            />
            <DollarSign class="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/60" />
          </div>
        </div>

        <!-- 수수료 및 세금 breakdown -->
        <div
          v-if="numAmount > 0"
          class="mb-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
          v-motion
          :initial="{ opacity: 0, y: -10 }"
          :enter="{ opacity: 1, y: 0 }"
        >
          <div class="flex items-start gap-2 mb-4">
            <Info class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-white/60">
              정산 금액에서 플랫폼 수수료와 세금이 차감됩니다
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-white/60">요청 금액</span>
              <span class="text-xl font-medium text-white">
                {{ numAmount.toLocaleString() }}원
              </span>
            </div>
            <div class="flex items-center justify-between text-red-400">
              <span>플랫폼 수수료 ({{ feeRate }}%)</span>
              <span>- {{ platformFee.toLocaleString() }}원</span>
            </div>
            <div class="flex items-center justify-between text-red-400">
              <span>세금 (10%)</span>
              <span>- {{ tax.toLocaleString() }}원</span>
            </div>
            <div class="pt-3 border-t border-white/10 flex items-center justify-between">
              <span class="font-medium text-white">실수령액</span>
              <span class="text-2xl font-bold text-green-400">
                {{ netAmount.toLocaleString() }}원
              </span>
            </div>
          </div>
        </div>

        <!-- 계좌 정보 -->
        <div class="mb-6">
          <label class="block text-sm text-white/80 mb-2">
            입금 계좌 <span class="text-red-400">*</span>
          </label>
          <input
            type="text"
            v-model="bankAccount"
            placeholder="예: 국민은행 123-456-789012"
            class="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-2xl focus:outline-none focus:border-blue-500 text-white placeholder:text-white/30"
            required
          />
        </div>

        <!-- 처리 기간 안내 -->
        <div class="mb-6 bg-blue-500/20 border border-blue-400/30 rounded-2xl p-4">
          <div class="text-sm text-blue-200">
            <div class="font-medium mb-1">⏱️ 예상 처리 기간</div>
            <div>영업일 기준 3-5일 이내</div>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="flex gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-colors"
            v-motion
            :hover="{ scale: 1.02 }"
            :tap="{ scale: 0.98 }"
          >
            취소
          </button>
          <button
            type="submit"
            :disabled="!amount || !bankAccount"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            v-motion
            :hover="{ scale: 1.02 }"
            :tap="{ scale: 0.98 }"
          >
            정산 요청
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
