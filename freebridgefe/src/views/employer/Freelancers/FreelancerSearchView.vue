<script setup lang="ts">
import { computed, ref } from 'vue';
import { Search, Filter, Users, Star, DollarSign, SlidersHorizontal, Send } from 'lucide-vue-next';
import { useFreelancerStore } from '@/stores/freelancerStore';
import type { User } from '@/types';
import ProposalModal from '@/views/employer/Recommended/components/ProposalModal.vue';

const freelancerStore = useFreelancerStore();

const searchQuery = ref('');
const selectedSkill = ref('ALL');
const minExperience = ref(0);
const maxHourlyRate = ref(100000);
const selectedFreelancer = ref<User | null>(null);
const favoriteIds = ref<string[]>([]);

const allSkills = computed(() => {
  const skills = new Set<string>();
  freelancerStore.freelancers.forEach((freelancer) => {
    freelancer.skills?.forEach((skill) => skills.add(skill));
  });
  return ['ALL', ...Array.from(skills).sort()];
});

const filteredFreelancers = computed<User[]>(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return freelancerStore.freelancers.filter((freelancer) => {
    const matchesQuery =
      !query ||
      freelancer.name.toLowerCase().includes(query) ||
      freelancer.bio?.toLowerCase().includes(query) ||
      freelancer.skills?.some((skill) => skill.toLowerCase().includes(query));

    const matchesSkill =
      selectedSkill.value === 'ALL' ||
      freelancer.skills?.some((skill) => skill === selectedSkill.value);

    const matchesExperience =
      (freelancer.experience ?? 0) >= minExperience.value;

    const matchesRate =
      (freelancer.hourlyRate ?? 0) <= maxHourlyRate.value;

    return matchesQuery && matchesSkill && matchesExperience && matchesRate;
  });
});

const formatSkills = (skills?: string[]) => skills?.slice(0, 6) || [];

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
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 text-white">
    <div class="flex flex-col gap-6 mb-10">
      <div class="flex items-center gap-2">
        <Users class="w-7 h-7 text-emerald-300" />
        <h1 class="text-3xl md:text-4xl font-bold">프리랜서 찾기</h1>
      </div>
      <p class="text-white/60">전체 프리랜서를 조건별로 검색해보세요</p>

      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr] items-stretch">
        <div class="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Search class="w-5 h-5 text-white/50" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="이름, 스킬, 소개로 검색"
            class="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>

        <div class="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Filter class="w-5 h-5 text-white/50" />
          <select
            v-model="selectedSkill"
            class="w-full bg-transparent text-white focus:outline-none"
          >
            <option v-for="skill in allSkills" :key="skill" :value="skill">
              {{ skill === 'ALL' ? '전체 스킬' : skill }}
            </option>
          </select>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
          <SlidersHorizontal class="w-5 h-5 text-white/50" />
          <input
            v-model.number="minExperience"
            type="number"
            min="0"
            step="1"
            class="w-full bg-transparent text-white focus:outline-none"
            placeholder="최소 경력"
          />
          <span class="text-white/40 text-sm">년+</span>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
          <DollarSign class="w-5 h-5 text-white/50" />
          <input
            v-model.number="maxHourlyRate"
            type="number"
            min="0"
            step="1000"
            class="w-full bg-transparent text-white focus:outline-none"
            placeholder="최대 시급"
          />
          <span class="text-white/40 text-sm">원</span>
        </div>
      </div>
    </div>

    <div v-if="filteredFreelancers.length === 0" class="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-white/50">
      조건에 맞는 프리랜서가 없습니다.
    </div>

    <div v-else class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="freelancer in filteredFreelancers"
        :key="freelancer.id"
        class="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all"
      >
        <div class="flex items-start gap-4 mb-4">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
            {{ freelancer.name[0] }}
          </div>
          <div class="flex-1">
            <div class="text-xl font-semibold">{{ freelancer.name }}</div>
            <div class="text-sm text-white/60">{{ freelancer.experience }}년 경력</div>
          </div>
        </div>

        <p class="text-white/70 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {{ freelancer.bio || '소개가 아직 등록되지 않았습니다.' }}
        </p>

        <div class="flex flex-wrap gap-2 mb-5">
          <span
            v-for="skill in formatSkills(freelancer.skills)"
            :key="skill"
            class="px-3 py-1 bg-emerald-400/10 text-emerald-300 text-xs rounded-full border border-emerald-400/20"
          >
            {{ skill }}
          </span>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-white/10">
          <div class="text-sm text-white/60">
            시간당 <span class="text-white font-semibold">{{ freelancer.hourlyRate?.toLocaleString() }}원</span>
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
              class="px-4 py-2 bg-emerald-400 text-black rounded-lg font-semibold hover:bg-emerald-300 transition-colors flex items-center gap-2"
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
