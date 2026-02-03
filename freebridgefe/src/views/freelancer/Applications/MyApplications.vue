<script setup lang="ts">
import { computed } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import type { ApplicationStatus } from '@/types';

const authStore = useAuthStore();
const jobStore = useJobStore();

const currentUser = computed(() => authStore.user);

const myApplications = computed(() => {
  if (!currentUser.value) return [];
  // jobStore doesn't strictly have getApplicationsByFreelancer, so we filter manually
  return jobStore.applications.filter(app => app.freelancerId === currentUser.value?.id);
});

const getJobTitle = (jobId: string) => {
  return jobStore.getJobById(jobId)?.title || '알 수 없음';
};

const statusConfig: Record<ApplicationStatus, { icon: any; label: string; gradient: string }> = {
  PENDING: {
    icon: Clock,
    label: '검토중',
    gradient: 'from-blue-500 to-cyan-500',
  },
  ACCEPTED: {
    icon: CheckCircle,
    label: '수락됨',
    gradient: 'from-green-500 to-emerald-500',
  },
  REJECTED: {
    icon: XCircle,
    label: '거절됨',
    gradient: 'from-red-500 to-red-600',
  },
};

const stats = computed(() => {
  const apps = myApplications.value;
  return {
    total: apps.length,
    pending: apps.filter((a) => a.status === 'PENDING').length,
    accepted: apps.filter((a) => a.status === 'ACCEPTED').length,
    rejected: apps.filter((a) => a.status === 'REJECTED').length,
  };
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
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
    >
      <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
        내 지원 내역
      </h1>
      <p class="text-white/60">지원한 프로젝트의 진행 상황을 확인하세요</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div
        class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all hover:translate-y-[-4px]"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :enter="{ opacity: 1, scale: 1 }"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <FileText class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="text-sm text-white/60">전체</div>
            <div class="text-3xl font-bold text-white">{{ stats.total }}</div>
          </div>
        </div>
      </div>

      <div
        class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all hover:translate-y-[-4px]"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :enter="{ opacity: 1, scale: 1, transition: { delay: 100 } }"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Clock class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="text-sm text-white/60">검토중</div>
            <div class="text-3xl font-bold text-white">{{ stats.pending }}</div>
          </div>
        </div>
      </div>

      <div
        class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all hover:translate-y-[-4px]"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :enter="{ opacity: 1, scale: 1, transition: { delay: 200 } }"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
            <CheckCircle class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="text-sm text-white/60">수락</div>
            <div class="text-3xl font-bold text-white">{{ stats.accepted }}</div>
          </div>
        </div>
      </div>

      <div
        class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all hover:translate-y-[-4px]"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :enter="{ opacity: 1, scale: 1, transition: { delay: 300 } }"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
            <XCircle class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="text-sm text-white/60">거절</div>
            <div class="text-3xl font-bold text-white">{{ stats.rejected }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="myApplications.length === 0" 
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 text-center"
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{ opacity: 1, scale: 1 }"
    >
      <div 
        class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6"
        v-motion
        :initial="{ scale: 0 }"
        :enter="{ scale: 1, transition: { type: 'spring', delay: 200 } }"
      >
        <FileText class="w-10 h-10 text-white/60" />
      </div>
      <h3 class="text-2xl font-semibold mb-3 text-white">아직 지원한 프로젝트가 없습니다</h3>
      <p class="text-white/60">관심있는 프로젝트를 찾아 지원해보세요</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(app, index) in myApplications"
        :key="app.id"
        class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all hover:translate-y-[-4px]"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: index * 50 } }"
      >
        <div class="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3 flex-wrap">
              <h3 class="text-2xl font-bold text-white">{{ getJobTitle(app.jobId) }}</h3>
              <div
                class="px-4 py-2 rounded-full bg-gradient-to-r text-white text-sm font-medium flex items-center gap-2 shadow-lg"
                :class="statusConfig[app.status].gradient"
              >
                <component :is="statusConfig[app.status].icon" class="w-4 h-4" />
                {{ statusConfig[app.status].label }}
              </div>
            </div>
            <div class="flex items-center gap-2 text-white/60">
              <Sparkles class="w-4 h-4" />
              <span>{{ formatDate(app.createdAt) }} 지원</span>
            </div>
          </div>
        </div>

        <!-- Message -->
        <div class="mb-6">
          <div class="text-sm text-white/60 mb-3">지원 메시지</div>
          <div class="text-sm bg-white/5 border border-white/10 p-5 rounded-2xl text-white/80 leading-relaxed">
            {{ app.message }}
          </div>
        </div>

        <!-- Rejection Reason -->
        <div
          v-if="app.status === 'REJECTED' && app.rejectionReason"
          class="pt-6 border-t border-white/10"
          v-motion
          :initial="{ opacity: 0, height: 0 }"
          :enter="{ opacity: 1, height: 'auto' }"
        >
          <div class="text-sm text-white/60 mb-3 flex items-center gap-2">
            <AlertCircle class="w-4 h-4" />
            거절 사유
          </div>
          <div class="text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-300">
            {{ app.rejectionReason }}
          </div>
        </div>

        <!-- Success Message -->
        <div
          v-if="app.status === 'ACCEPTED'"
          class="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3"
          v-motion
          :initial="{ opacity: 0, scale: 0.95 }"
          :enter="{ opacity: 1, scale: 1 }"
        >
          <CheckCircle class="w-5 h-5 text-green-400" />
          <span class="text-green-300 font-medium">
            축하합니다! 지원이 수락되었습니다. 곧 계약이 진행될 예정입니다.
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
