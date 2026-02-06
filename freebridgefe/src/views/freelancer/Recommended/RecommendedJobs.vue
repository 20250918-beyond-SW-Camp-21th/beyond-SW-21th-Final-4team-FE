<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMotion } from '@vueuse/motion';
import { Sparkles, DollarSign, Clock, Briefcase, TrendingUp } from 'lucide-vue-next';
import { useJobStore } from '@/stores/jobStore';
import { useAuthStore } from '@/stores/authStore';
import type { JobPosting } from '@/types';
import JobDetailModal from '../Jobs/components/JobDetailModal.vue';

const jobStore = useJobStore();
const authStore = useAuthStore();
const selectedJob = ref<JobPosting | null>(null);

const recommendedJobs = computed(() => {
  if (!authStore.user || !authStore.user.skills) return jobStore.jobPostings.slice(0, 3);
  
  const userSkills = authStore.user.skills.map(s => s.toLowerCase());
  
  return jobStore.jobPostings
    .filter(job => job.status === 'OPEN')
    .map(job => {
      const matchCount = job.techStack.filter(tech => 
        userSkills.some(skill => skill.includes(tech.toLowerCase()) || tech.toLowerCase().includes(skill))
      ).length;
      return { ...job, matchCount };
    })
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 5); // Top 5
});

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('ko-KR');
};
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 font-sans text-white">
    <!-- Header -->
    <div
      class="mb-12"
      data-tour="freelancer-recommended-header"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
    >
      <div class="flex items-center gap-2 mb-3">
        <Sparkles class="w-8 h-8 text-yellow-400" />
        <h1 class="text-4xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          AI 추천 프로젝트
        </h1>
      </div>
      <p class="text-white/60">회원님의 스킬과 경험을 분석하여 딱 맞는 프로젝트를 추천해드려요</p>
    </div>

    <div v-if="recommendedJobs.length === 0" 
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 text-center"
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{ opacity: 1, scale: 1 }"
    >
        <div class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
            <TrendingUp class="w-10 h-10 text-white/60" />
        </div>
        <h3 class="text-2xl font-semibold mb-3 text-white">추천 프로젝트가 없습니다</h3>
        <p class="text-white/60">프로필에 스킬을 추가하면 더 정확한 추천을 받을 수 있어요</p>
    </div>

    <div v-else class="grid gap-6">
      <div
        v-for="(job, index) in recommendedJobs"
        :key="job.id"
        @click="selectedJob = job"
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:border-white/20 transition-all cursor-pointer group hover:translate-y-[-4px]"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
      >
        <div class="flex items-start justify-between mb-6">
          <div class="flex-1">
            <!-- Title -->
            <div class="flex items-start gap-3 mb-3">
              <h3 class="text-2xl font-semibold text-white group-hover:text-blue-400 transition-colors flex-1">
                {{ job.title }}
              </h3>
              <div class="px-3 py-1 bg-yellow-400/10 text-yellow-400 text-xs font-bold rounded-full border border-yellow-400/20 flex items-center gap-1">
                <Sparkles class="w-3 h-3" />
                강력 추천
              </div>
            </div>

            <!-- Description -->
            <p class="text-white/70 mb-6 leading-relaxed line-clamp-2">
              {{ job.description }}
            </p>

            <!-- Tech Stack -->
            <div class="flex flex-wrap gap-2 mb-6">
              <span
                v-for="tech in job.techStack"
                :key="tech"
                class="px-4 py-2 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30 font-medium"
              >
                {{ tech }}
              </span>
            </div>

            <!-- Stats -->
            <div class="flex flex-wrap gap-6 text-white/60">
              <div class="flex items-center gap-2">
                 <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign class="w-4 h-4 text-green-400" />
                </div>
                <span class="font-medium">{{ job.budget.toLocaleString() }}원</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Clock class="w-4 h-4 text-blue-400" />
                </div>
                <span class="font-medium">{{ job.duration }}주</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Briefcase class="w-4 h-4 text-purple-400" />
                </div>
                <span class="font-medium">{{ job.employerName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 상세보기 모달 -->
    <JobDetailModal
        v-if="selectedJob"
        :job="selectedJob"
        @close="selectedJob = null"
    />
  </div>
</template>
