<script setup lang="ts">
import { ref } from 'vue';
import { useMotion } from '@vueuse/motion';
import { X, Building } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', account: { bankName: string; accountNumber: string }): void;
}>();

const bankName = ref('');
const accountNumber = ref('');

const handleSubmit = () => {
    if (bankName.value && accountNumber.value) {
        emit('save', {
            bankName: bankName.value,
            accountNumber: accountNumber.value
        });
        emit('close');
    }
};
</script>

<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-white">
    <div
      class="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl"
      v-motion
      :initial="{ opacity: 0, scale: 0.95, y: 20 }"
      :enter="{ opacity: 1, scale: 1, y: 0 }"
      :leave="{ opacity: 0, scale: 0.95, y: 20 }"
    >
      <div class="border-b border-white/10 p-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            <Building class="w-6 h-6 text-blue-400" />
            계좌 관리
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          <X class="w-6 h-6 text-white" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6">
        <div class="mb-6">
          <label class="block text-sm text-white/80 mb-2">
            은행명 <span class="text-red-400">*</span>
          </label>
          <input
            type="text"
            v-model="bankName"
            placeholder="예: 국민은행"
            class="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-2xl focus:outline-none focus:border-blue-500 text-white placeholder:text-white/30"
            required
          />
        </div>

        <div class="mb-8">
          <label class="block text-sm text-white/80 mb-2">
            계좌번호 <span class="text-red-400">*</span>
          </label>
          <input
            type="text"
            v-model="accountNumber"
            placeholder="예: 123-456-789012"
            class="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-2xl focus:outline-none focus:border-blue-500 text-white placeholder:text-white/30"
            required
          />
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            :disabled="!bankName || !accountNumber"
            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-500/20"
          >
            저장하기
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
