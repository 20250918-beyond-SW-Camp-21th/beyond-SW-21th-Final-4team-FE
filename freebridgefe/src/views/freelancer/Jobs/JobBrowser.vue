<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMotion } from '@vueuse/motion';
import { Search, DollarSign, Clock, Briefcase, Sparkles, TrendingUp } from 'lucide-vue-next';
import { useJobStore } from '@/stores/jobStore';
import type { JobPosting } from '@/types';
import JobDetailModal from './components/JobDetailModal.vue';

const jobStore = useJobStore();
const selectedJob = ref<JobPosting | null>(null);
const searchTerm = ref('');

// OPEN 상태인 공고만 표시
const openJobs = computed(() => jobStore.jobPostings.filter((job) => job.status === 'OPEN'));

// 검색 필터
const filteredJobs = computed(() => {
  return openJobs.value.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      job.techStack.some((tech) =>
        tech.toLowerCase().includes(searchTerm.value.toLowerCase())
      )
  );
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
      data-tour-freelancer="header"
      v-motion="{
        initial: { opacity: 0, y: 20 },
        enter: { opacity: 1, y: 0 }
      }"
    >
      <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
        프로젝트 찾기
      </h1>
      <p class="text-white/60">관심있는 프로젝트에 지원하세요</p>
    </div>

    <!-- Search Bar -->
    <div
      class="mb-8"
      data-tour-freelancer="search"
      v-motion="{
        initial: { opacity: 0, y: 20 },
        enter: { opacity: 1, y: 0, transition: { delay: 100 } }
      }"
    >
      <div class="relative">
        <Search class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          v-model="searchTerm"
          placeholder="프로젝트 제목, 설명, 기술 스택으로 검색..."
          class="w-full pl-14 pr-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 transition-colors text-white placeholder:text-white/30"
        />
      </div>
    </div>

    <!-- Stats -->
    <div
      class="mb-8 flex items-center gap-6"
      data-tour-freelancer="stats"
      v-motion="{
        initial: { opacity: 0, y: 20 },
        enter: { opacity: 1, y: 0, transition: { delay: 200 } }
      }"
    >
      <div class="flex items-center gap-2 text-white/60">
        <TrendingUp class="w-5 h-5 text-green-400" />
        <span class="font-medium">
          총 <span class="text-white">{{ filteredJobs.length }}</span>개 공고
        </span>
      </div>
    </div>

    <!-- Job List -->
    <div v-if="filteredJobs.length === 0" 
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 text-center"
        v-motion="{
          initial: { opacity: 0, scale: 0.95 },
          enter: { opacity: 1, scale: 1 }
        }"
    >
      <div 
        class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6"
        v-motion="{
          initial: { scale: 0 },
          enter: { scale: 1, transition: { type: 'spring', delay: 200 } }
        }"
      >
        <Briefcase class="w-10 h-10 text-white/60" />
      </div>
      <h3 class="text-2xl font-semibold mb-3 text-white">검색 결과가 없습니다</h3>
      <p class="text-white/60">다른 검색어로 시도해보세요</p>
    </div>

    <div v-else class="grid gap-6" data-tour-freelancer="job-list">
      <div
        v-for="(job, index) in filteredJobs"
        :key="job.id"
        @click="selectedJob = job"
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:border-white/20 transition-all cursor-pointer group hover:translate-y-[-4px]"
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { delay: index * 50 } }
        }"
      >
        <div class="flex items-start justify-between mb-6">
          <div class="flex-1">
            <!-- Title with Sparkle -->
            <div class="flex items-start gap-3 mb-3">
              <h3 class="text-2xl font-semibold text-white group-hover:text-blue-400 transition-colors flex-1">
                {{ job.title }}
              </h3>
              <div
                class="mt-1 transition-transform group-hover:rotate-180 group-hover:scale-125 duration-300"
              >
                <Sparkles class="w-6 h-6 text-yellow-400" />
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

        <!-- Footer -->
        <div class="pt-6 border-t border-white/10 flex items-center justify-between">
          <div class="text-sm text-white/50">
            {{ formatDate(job.createdAt) }} 등록
          </div>
          <div
            class="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium border border-white/20 transition-all group-hover:scale-105 group-hover:bg-white/20"
          >
            자세히 보기 →
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
