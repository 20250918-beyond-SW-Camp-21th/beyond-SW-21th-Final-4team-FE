<script setup lang="ts">
import { ref, computed } from 'vue';
import { Check, X, FileText, Link as LinkIcon, AlertCircle, Users, Sparkles } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import type { Application } from '@/types';
import RejectionModal from './components/RejectionModal.vue';

const authStore = useAuthStore();
const jobStore = useJobStore();
const rejectingApp = ref<Application | null>(null);

const myJobs = computed(() => jobStore.myJobs);
const myApplications = computed(() => {
    return jobStore.applications.filter(app => myJobs.value.some(job => job.id === app.jobId));
});

const groupedApplications = computed(() => {
    return myJobs.value.map(job => ({
        job,
        applications: myApplications.value.filter(app => app.jobId === job.id)
    })).filter(group => group.applications.length > 0);
});

const handleAccept = (app: Application) => {
  if (confirm(`${app.freelancerName}님의 지원을 수락하시겠습니까?`)) {
    jobStore.updateApplicationStatus(app.id, 'ACCEPTED');
    alert('지원이 수락되었습니다!');
  }
};

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR');
}
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 font-sans">
    <!-- Header -->
    <div 
        class="mb-12"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
    >
      <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
        지원자 관리
      </h1>
      <p class="text-white/60">프로젝트별 지원자를 확인하고 관리하세요</p>
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
        <AlertCircle class="w-10 h-10 text-white/60" />
      </div>
      <h3 class="text-2xl font-semibold mb-3 text-white">아직 지원자가 없습니다</h3>
      <p class="text-white/60">공고를 등록하고 지원자를 기다려보세요</p>
    </div>

    <div v-else class="space-y-8">
        <transition-group name="list">
             <div 
                v-for="(group, index) in groupedApplications"
                :key="group.job.id"
                class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
             >
                <!-- Job Header -->
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h2 class="text-2xl font-bold text-white mb-2">{{ group.job.title }}</h2>
                        <div class="flex items-center gap-2 text-white/60">
                            <Users class="w-4 h-4" />
                            <span>총 {{ group.applications.length }}명의 지원자</span>
                        </div>
                    </div>
                </div>

                <!-- Applications -->
                <div class="space-y-4">
                    <div 
                        v-for="(app, appIndex) in group.applications"
                        :key="app.id"
                        class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all hover:translate-x-1"
                        v-motion
                        :initial="{ opacity: 0, x: -20 }"
                        :enter="{ opacity: 1, x: 0, transition: { delay: 200 + appIndex * 50 } }"
                    >
                        <div class="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                            <div class="flex items-center gap-4">
                                <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                    {{ app.freelancerName[0] }}
                                </div>
                                <div>
                                    <div class="text-lg font-semibold text-white flex items-center gap-2">
                                        {{ app.freelancerName }}
                                        <Sparkles class="w-4 h-4 text-yellow-400" />
                                    </div>
                                    <div class="text-sm text-white/60">
                                        {{ formatDate(app.createdAt) }} 지원
                                    </div>
                                    <router-link 
                                        :to="{ name: 'employer.freelancer.profile', params: { id: app.freelancerId } }"
                                        class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1 hover:underline"
                                    >
                                        프로필 및 포트폴리오 보기
                                    </router-link>
                                </div>
                            </div>

                            <div v-if="app.status === 'PENDING'" class="flex gap-2">
                                <button
                                    @click="handleAccept(app)"
                                    class="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:shadow-lg transition-all flex items-center gap-2 font-medium hover:scale-105 active:scale-95"
                                >
                                    <Check class="w-4 h-4" />
                                    수락
                                </button>
                                <button
                                    @click="rejectingApp = app"
                                    class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:shadow-lg transition-all flex items-center gap-2 font-medium hover:scale-105 active:scale-95"
                                >
                                    <X class="w-4 h-4" />
                                    거절
                                </button>
                            </div>
                            <div v-else
                                class="px-5 py-2.5 rounded-full font-medium border"
                                :class="app.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'"
                            >
                                {{ app.status === 'ACCEPTED' ? '수락됨' : '거절됨' }}
                            </div>
                        </div>

                        <!-- Message -->
                        <div class="mb-4">
                            <div class="text-sm text-white/60 mb-2">지원 메시지</div>
                            <div class="text-sm bg-white/5 border border-white/10 p-4 rounded-2xl text-white/80">
                                {{ app.message }}
                            </div>
                        </div>

                        <!-- Links -->
                        <div v-if="app.portfolioUrl || app.resumeUrl" class="flex gap-3 mb-4">
                            <a 
                                v-if="app.portfolioUrl"
                                :href="app.portfolioUrl"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium hover:translate-x-1 transition-transform"
                            >
                                <LinkIcon class="w-4 h-4" />
                                포트폴리오 보기
                            </a>
                            <a 
                                v-if="app.resumeUrl"
                                :href="app.resumeUrl"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium hover:translate-x-1 transition-transform"
                            >
                                <FileText class="w-4 h-4" />
                                이력서 보기
                            </a>
                        </div>

                        <!-- Rejection Reason -->
                        <div v-if="app.status === 'REJECTED' && app.rejectionReason" class="pt-4 border-t border-white/10">
                            <div class="text-sm text-white/60 mb-2">거절 사유</div>
                            <div class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-2xl">
                                {{ app.rejectionReason }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition-group>
    </div>

    <!-- Rejection Modal -->
    <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <RejectionModal
            v-if="rejectingApp"
            :application="rejectingApp"
            @close="rejectingApp = null"
        />
    </transition>
  </div>
</template>
