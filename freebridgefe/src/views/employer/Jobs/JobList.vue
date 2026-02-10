<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, Edit, Trash2, Users, DollarSign, Clock, AlertCircle, Sparkles } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import type { JobPosting, JobStatus } from '@/types';
import JobCreateModal from './components/JobCreateModal.vue';
import JobEditModal from './components/JobEditModal.vue';

const authStore = useAuthStore();
const jobStore = useJobStore();

const showCreateModal = ref(false);
const editingJob = ref<JobPosting | null>(null);

const myJobs = computed(() => jobStore.myJobs);

const statusConfig: Record<JobStatus, { label: string; gradient: string }> = {
  OPEN: { label: '모집중', gradient: 'from-green-500 to-emerald-500' },
  IN_PROGRESS: { label: '진행중', gradient: 'from-blue-500 to-cyan-500' },
  CONTRACTED: { label: '계약완료', gradient: 'from-purple-500 to-pink-500' },
  CLOSED: { label: '마감', gradient: 'from-gray-500 to-gray-600' },
};

const handleDelete = (job: JobPosting) => {
    if (job.status === 'CONTRACTED') {
      if (!confirm('계약 완료된 공고는 삭제 시 문제가 발생할 수 있습니다. 정말 삭제하시겠습니까?')) {
        return;
      }
    } else {
      if (!confirm('이 공고를 삭제하시겠습니까?')) {
        return;
      }
    }
    jobStore.deleteJobPosting(job.id);
};

const getApplications = (jobId: string) => {
    return jobStore.getApplicationsByJob(jobId);
};
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 font-sans">
    <!-- Header -->
    <div 
        class="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
    >
      <div>
        <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          내 프로젝트 공고
        </h1>
        <p class="text-white/60">등록한 프로젝트를 관리하세요</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-6 py-3 bg-white text-black rounded-full font-semibold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Plus class="w-5 h-5" />
        새 공고 등록
      </button>
    </div>

    <div v-if="myJobs.length === 0" 
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
        <h3 class="text-2xl font-semibold mb-3 text-white">등록된 공고가 없습니다</h3>
        <p class="text-white/60 mb-8">첫 프로젝트 공고를 등록해보세요</p>
        <button
            @click="showCreateModal = true"
            class="px-8 py-4 bg-white text-black rounded-full font-semibold inline-flex items-center gap-2 hover:scale-105 nav-button"
        >
            <Plus class="w-5 h-5" />
            공고 등록하기
        </button>
    </div>
    
    <div v-else class="grid gap-6">
        <transition-group 
            enter-active-class="transition ease-out duration-300" 
            enter-from-class="opacity-0 translate-y-4" 
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-300"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 scale-95"
            tag="div"
            class="space-y-6"
        >
          <div
            v-for="(job, index) in myJobs"
            :key="job.id"
            class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:border-white/20 transition-all hover:translate-y-[-4px]"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <div class="flex flex-col lg:flex-row items-start justify-between gap-6">
                <div class="flex-1 w-full">
                    <!-- Title & Status -->
                    <div class="flex items-start gap-3 mb-4 flex-wrap">
                        <h3 class="text-2xl font-semibold text-white flex-1">{{ job.title }}</h3>
                        <div
                            class="px-4 py-2 rounded-full bg-gradient-to-r text-white text-sm font-medium shadow-lg"
                            :class="statusConfig[job.status].gradient"
                        >
                            {{ statusConfig[job.status].label }}
                        </div>
                    </div>

                    <!-- Description -->
                    <p class="text-white/70 mb-6 leading-relaxed">{{ job.description }}</p>

                    <!-- Tech Stack -->
                    <div class="flex flex-wrap gap-2 mb-6">
                        <span
                            v-for="tech in job.techStack"
                            :key="tech"
                            class="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium border border-white/10"
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
                            <span class="font-medium">월급 {{ job.budget.toLocaleString() }}원</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Clock class="w-4 h-4 text-blue-400" />
                            </div>
                            <span class="font-medium">{{ job.duration }}개월</span>
                        </div>
                         <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Users class="w-4 h-4 text-purple-400" />
                            </div>
                            <span class="font-medium">지원자 {{ getApplications(job.id).length }}명</span>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex lg:flex-col gap-2">
                    <button
                        @click="editingJob = job"
                        class="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 hover:scale-110 active:scale-90"
                        title="수정"
                    >
                        <Edit class="w-5 h-5 text-blue-400" />
                    </button>
                    <button
                        @click="handleDelete(job)"
                        class="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl transition-all border border-red-500/20 hover:scale-110 active:scale-90"
                        title="삭제"
                    >
                        <Trash2 class="w-5 h-5 text-red-400" />
                    </button>
                </div>
            </div>

            <!-- Applicants -->
            <div v-if="getApplications(job.id).length > 0" class="mt-6 pt-6 border-t border-white/10">
                <div class="text-sm text-white/60 mb-3 flex items-center gap-2">
                    <Sparkles class="w-4 h-4" />
                    최근 지원자
                </div>
                <div class="flex -space-x-3">
                    <div
                        v-for="(app, index) in getApplications(job.id).slice(0, 5)"
                        :key="app.id"
                        class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-black flex items-center justify-center text-white font-semibold shadow-lg hover:scale-125 hover:z-10 transition-transform cursor-default"
                        :title="app.freelancerName"
                    >
                        {{ app.freelancerName[0] }}
                    </div>
                    <div v-if="getApplications(job.id).length > 5" class="w-10 h-10 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-sm text-white font-semibold">
                        +{{ getApplications(job.id).length - 5 }}
                    </div>
                </div>
            </div>
          </div>
        </transition-group>
    </div>

    <!-- Modals -->
    <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <JobCreateModal
            v-if="showCreateModal"
            @close="showCreateModal = false"
            @success="showCreateModal = false"
        />
    </transition>

    <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <JobEditModal
            v-if="editingJob"
            :job="editingJob"
            @close="editingJob = null"
            @success="editingJob = null"
        />
    </transition>

  </div>
</template>
