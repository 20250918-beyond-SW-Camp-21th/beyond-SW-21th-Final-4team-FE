<script setup lang="ts">
import { ref } from 'vue';
import { useMotion } from '@vueuse/motion';
import { X, Send } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useFreelancerStore } from '@/stores/freelancerStore';
import type { User } from '@/types';

const props = defineProps<{
  freelancer: User;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const authStore = useAuthStore();
const freelancerStore = useFreelancerStore();

const message = ref('');

const handleSubmit = () => {
  if (!authStore.user) return;

  // Use store action to add proposal
  freelancerStore.addProposal({
    employerId: authStore.user.id,
    employerName: authStore.user.companyName || authStore.user.name,
    freelancerId: props.freelancer.id,
    freelancerName: props.freelancer.name,
    message: message.value,
    status: 'PENDING',
  });

  alert(`${props.freelancer.name}님께 제안을 보냈습니다!`);
  emit('close');
};
</script>

<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div
      class="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden"
      v-motion
      :initial="{ opacity: 0, scale: 0.95, y: 20 }"
      :enter="{ opacity: 1, scale: 1, y: 0 }"
      :leave="{ opacity: 0, scale: 0.95, y: 20 }"
    >
      <div class="border-b border-white/10 p-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-white">프로젝트 제안</h2>
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
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {{ freelancer.name[0] }}
            </div>
            <div>
              <div class="font-medium text-white">{{ freelancer.name }}</div>
              <div class="text-sm text-white/60">
                {{ freelancer.skills?.slice(0, 3).join(', ') }}
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm text-white/80 mb-2">
            제안 메시지 <span class="text-red-400">*</span>
          </label>
          <textarea
            v-model="message"
            :placeholder="`${freelancer.name}님께 프로젝트에 대해 설명하고 제안하세요...`"
            rows="8"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500 resize-none text-white placeholder:text-white/30"
            required
          ></textarea>
        </div>

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
            class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-xl transition-all font-semibold flex items-center justify-center gap-2"
            v-motion
            :hover="{ scale: 1.02 }"
            :tap="{ scale: 0.98 }"
          >
            <Send class="w-5 h-5" />
            제안 보내기
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
