<script setup lang="ts">
import { ref } from 'vue';
import { TrendingUp, Send, Star } from 'lucide-vue-next';
import { useFreelancerStore } from '@/stores/freelancerStore';
import ProposalModal from './components/ProposalModal.vue';
import type { User } from '@/types';

const freelancerStore = useFreelancerStore();
const selectedFreelancer = ref<User | null>(null);
const favoriteIds = ref<string[]>([]);

const formatSkills = (skills?: string[]) => {
  return skills?.slice(0, 4) || [];
};

const isFavorite = (id: string) => favoriteIds.value.includes(id);

const toggleFavorite = (id: string) => {
  if (isFavorite(id)) {
    favoriteIds.value = favoriteIds.value.filter((item) => item !== id);
    return;
  }
  favoriteIds.value = [...favoriteIds.value, id];
};
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-8 text-white">
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-2">
        <TrendingUp class="w-6 h-6 text-[#2D5BFF]" />
        <h1 class="text-3xl font-bold">추천 프리랜서</h1>
      </div>
      <p class="text-white/60">AI가 선별한 최적의 프리랜서를 만나보세요</p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="freelancer in freelancerStore.freelancers"
        :key="freelancer.id"
        class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-white/20 hover:bg-white/10 transition-all"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
      >
        <div class="flex items-start gap-4 mb-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {{ freelancer.name[0] }}
          </div>
          <div class="flex-1">
            <router-link 
              :to="{ name: 'employer.freelancer.profile', params: { id: freelancer.id } }"
              class="text-xl font-bold mb-1 hover:text-blue-400 transition-colors cursor-pointer block"
            >
              {{ freelancer.name }}
            </router-link>
            <p class="text-sm text-white/60">{{ freelancer.experience }}년 경력</p>
          </div>
        </div>

        <p class="text-white/60 text-sm mb-4 line-clamp-2 h-10">{{ freelancer.bio }}</p>

        <div class="flex flex-wrap gap-2 mb-4 h-16 content-start">
          <span
            v-for="skill in formatSkills(freelancer.skills)"
            :key="skill"
            class="px-3 py-1 bg-[#2D5BFF]/10 text-[#2D5BFF] text-xs rounded-full border border-[#2D5BFF]/20"
          >
            {{ skill }}
          </span>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-white/10">
          <div class="text-sm">
            <span class="text-white/60">시간당</span>{' '}
            <span class="font-medium text-white">
              {{ freelancer.hourlyRate?.toLocaleString() }}원
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="toggleFavorite(freelancer.id)"
              class="px-3 py-2 rounded-lg border transition-all"
              :class="isFavorite(freelancer.id)
                ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-300'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'"
            >
              <Star
                class="w-4 h-4"
                :class="isFavorite(freelancer.id) ? 'fill-yellow-400 text-yellow-400' : ''"
              />
            </button>
            <button
              type="button"
              @click="selectedFreelancer = freelancer"
              class="px-4 py-2 bg-[#2D5BFF] text-white rounded-lg hover:bg-[#2D5BFF]/90 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Send class="w-4 h-4" />
              제안하기
            </button>
          </div>
        </div>
      </div>
    </div>

    <ProposalModal
      v-if="selectedFreelancer"
      :freelancer="selectedFreelancer"
      @close="selectedFreelancer = null"
    />
  </div>
</template>
