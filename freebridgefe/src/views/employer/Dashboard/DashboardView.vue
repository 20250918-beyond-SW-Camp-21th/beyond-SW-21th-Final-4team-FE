<script setup lang="ts">
import { TrendingUp, Users, FileText, RefreshCw } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const isPro = false; // Mock data for now

const stats = [
  { icon: TrendingUp, label: '진행 중 프로젝트', value: '12' },
  { icon: Users, label: '계약 중 프리랜서', value: '8' },
  { icon: FileText, label: '이번 달 계약 건수', value: '24' },
  { icon: RefreshCw, label: '재계약률', value: '87%' },
];

const recentFreelancers = [
  {
    name: '김서연',
    role: '풀스택 개발자',
    description: '5년 경력의 풀스택 개발자로, React와 Node.js에 특화되어 있습니다.',
  },
  {
    name: '박민지',
    role: 'UX/UI 디자이너',
    description: 'Figma와 Sketch를 활용한 프로토타입 전문가입니다.',
  },
];
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 text-white">
    <!-- Header -->
    <!-- Header -->
    <div 
      class="mb-8"
      data-tour-dashboard="header"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
    >
      <h1 class="text-4xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent mb-2">
        안녕하세요, {{ authStore.user?.name }}님
      </h1>
      <p class="text-white/60">오늘도 좋은 하루 되세요</p>
    </div>

    <!-- Upgrade Banner -->
    <div 
      v-if="!isPro"
      class="mb-8 p-8 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white flex flex-col md:flex-row items-center justify-between gap-4"
      data-tour-dashboard="upgrade-banner"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 100 } }"
    >
      <div>
        <h3 className="text-xl mb-2 font-bold">프로 플랜으로 업그레이드하세요</h3>
        <p className="text-white/90">
          AI 매칭, 무제한 채팅, 우선 지원을 받아보세요
        </p>
      </div>
      <button class="px-6 py-3 bg-white text-blue-600 rounded-lg hover:shadow-lg transition-all hover:scale-105 font-semibold">
        업그레이드
      </button>
    </div>

    <!-- Stats Grid -->
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      data-tour-dashboard="stats-grid"
    >
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all cursor-pointer"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 200 + index * 100 } }"
        :hover="{ y: -5 }"
      >
        <div class="flex items-center justify-between mb-4">
          <component :is="stat.icon" class="w-8 h-8 text-blue-400" />
        </div>
        <div class="text-3xl font-bold mb-1">{{ stat.value }}</div>
        <div class="text-sm text-white/50">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Recent Freelancers -->
    <div 
      class="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
      data-tour-dashboard="recent-freelancers"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 600 } }"
    >
      <h2 class="text-xl font-bold mb-6">최근 재계약한 프리랜서</h2>
      <div class="space-y-6">
        <div 
          v-for="(freelancer, index) in recentFreelancers" 
          :key="index"
        >
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
            <div class="flex-1">
              <h3 class="mb-1 font-semibold">{{ freelancer.name }}</h3>
              <p class="text-sm text-white/60 mb-2">{{ freelancer.role }}</p>
              <p class="text-sm text-white/40">{{ freelancer.description }}</p>
            </div>
          </div>
          <div v-if="index < recentFreelancers.length - 1" class="mt-6 border-b border-white/10" />
        </div>
      </div>
    </div>
  </div>
</template>
