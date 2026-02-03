<script setup lang="ts">
import { ref } from 'vue';
import { useMotion } from '@vueuse/motion';
import { X, MessageSquare, Send } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const inquiryData = ref({
  subject: '',
  content: '',
  type: 'GENERAL' // GENERAL, PAYMENT, SYSTEM, etc.
});

const handleSubmit = () => {
    if (!inquiryData.value.subject || !inquiryData.value.content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }
    
    // API call simulation
    setTimeout(() => {
        alert('문의가 접수되었습니다. 담당자가 확인 후 답변 드리겠습니다.');
        emit('close');
    }, 500);
};
</script>

<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-white">
    <div
      class="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
      v-motion
      :initial="{ opacity: 0, scale: 0.95, y: 20 }"
      :enter="{ opacity: 1, scale: 1, y: 0 }"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/5">
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare class="w-5 h-5 text-blue-400" />
            1:1 문의하기
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-5">
        <div>
            <label class="text-xs text-slate-400 mb-1.5 block ml-1">문의 유형</label>
            <div class="grid grid-cols-3 gap-2">
                <button
                    v-for="type in ['GENERAL', 'PAYMENT', 'SYSTEM']"
                    :key="type"
                    @click="inquiryData.type = type"
                    class="py-2 rounded-xl text-sm font-medium transition-colors border"
                    :class="inquiryData.type === type 
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'"
                >
                    {{ type === 'GENERAL' ? '일반 문의' : type === 'PAYMENT' ? '정산/결제' : '시스템 장애' }}
                </button>
            </div>
        </div>

        <div>
            <label class="text-xs text-slate-400 mb-1.5 block ml-1">문의 제목</label>
            <input
                type="text"
                v-model="inquiryData.subject"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-colors placeholder-white/20"
                placeholder="문의 제목을 입력해주세요"
            />
        </div>

        <div>
            <label class="text-xs text-slate-400 mb-1.5 block ml-1">문의 내용</label>
            <textarea
                v-model="inquiryData.content"
                class="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 resize-none transition-colors placeholder-white/20"
                placeholder="문의 내용을 자세히 적어주세요. 스크린샷 등이 있다면 이메일로 보내주세요."
            ></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-5 border-t border-white/10 bg-white/5 flex justify-end gap-3">
        <button
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
            취소
        </button>
        <button
            @click="handleSubmit"
            class="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-105 flex items-center gap-2"
        >
            <Send class="w-4 h-4" />
            문의 접수
        </button>
      </div>
    </div>
  </div>
</template>
