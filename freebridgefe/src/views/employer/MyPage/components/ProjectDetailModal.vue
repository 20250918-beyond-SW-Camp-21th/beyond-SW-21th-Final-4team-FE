<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  X,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Briefcase,
  Clock,
  CheckCircle,
  Zap,
  Tag,
} from 'lucide-vue-next';
import { getEmployerApplicantStatus, type EmployerApplicantStatus } from '@/api/MyPage/projectApi';

// --- Types ---
type ProjectStatus = 'BEFORE_START' | 'IN_PROGRESS' | 'COMPLETED';

interface FreelancerProfile {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  contractPeriod: string;
  paymentAmount: string;
}

interface ProjectDetail {
  id: string;
  title: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  progress: number;
  description: string;
  budget: string;
  freelancers: FreelancerProfile[];
  contractType: string;
  contractDate: string;
}

const props = defineProps<{
  project: ProjectDetail | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const applicantStatuses = ref<EmployerApplicantStatus[]>([]);
const isApplicantLoading = ref(false);
const isApplicantError = ref(false);
const applicantRequestId = ref(0);

const statusLabel = (status?: string) => {
  const key = (status ?? '').toUpperCase();
  if (!key) return '미확인';
  if (key.includes('RECEIVED') || key.includes('APPLIED')) return '접수중';
  if (key.includes('REVIEW') || key.includes('SCREEN')) return '심사중';
  if (key.includes('PROGRESS') || key.includes('IN_PROGRESS')) return '진행중';
  if (key.includes('COMPLETE') || key.includes('COMPLETED') || key.includes('DONE')) return '완료/종결';
  return status ?? '기타';
};

const applicantSummary = computed(() => {
  const counts: Record<string, number> = {};
  applicantStatuses.value.forEach((item) => {
    const label = statusLabel(item.applyStatus);
    counts[label] = (counts[label] ?? 0) + 1;
  });
  return counts;
});

const totalApplicants = computed(() => applicantStatuses.value.length);

const loadApplicantStatus = async (requestId: number) => {
  if (!props.project?.id) return;
  const projectId = Number(props.project.id);
  if (!projectId) return;
  try {
    isApplicantLoading.value = true;
    isApplicantError.value = false;
    const result = await getEmployerApplicantStatus(projectId);
    if (requestId !== applicantRequestId.value) return;
    applicantStatuses.value = result;
  } catch (error) {
    if (requestId !== applicantRequestId.value) return;
    console.error('Failed to fetch applicant status:', error);
    isApplicantError.value = true;
  } finally {
    if (requestId === applicantRequestId.value) {
      isApplicantLoading.value = false;
    }
  }
};

watch(
  () => [props.isOpen, props.project?.id],
  ([isOpen], _, onCleanup) => {
    const requestId = ++applicantRequestId.value;
    onCleanup(() => {
      if (applicantRequestId.value === requestId) {
        applicantRequestId.value = requestId + 1;
      }
    });
    if (isOpen) {
      loadApplicantStatus(requestId);
    }
  }
);

// --- Helpers for Status Colors ---
const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
        case 'BEFORE_START': return { label: '착수 예정', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
        case 'IN_PROGRESS': return { label: '진행 중', class: 'bg-green-500/10 text-green-400 border-green-500/20' };
        case 'COMPLETED': return { label: '종료', class: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
        default: return { label: status, class: 'bg-slate-500/10 text-slate-400' };
    }
};

const getFreelancerStatusColor = (status: string) => {
    if (status === 'ACTIVE') return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (status === 'COMPLETED') return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
};
</script>

<template>
  <div v-if="isOpen && project" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="$emit('close')">

    <div
        class="w-full max-w-4xl bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
    >
      <!-- Header -->
      <div class="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#1e293b]/95 backdrop-blur-md border-b border-white/10">
        <div>
           <div class="flex items-center gap-3 mb-2">
               <span class="px-3 py-1 text-xs font-bold border rounded-full" :class="getStatusBadge(project.status).class">
                   {{ getStatusBadge(project.status).label }}
               </span>
               <span class="text-sm text-slate-400 font-mono tracking-wide">ID: {{ project.id }}</span>
           </div>
           <h2 class="text-2xl font-bold text-white">{{ project.title }}</h2>
        </div>
        <button @click="$emit('close')" class="p-2 transition-colors rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white">
          <X class="w-6 h-6" />
        </button>
      </div>

      <div class="p-8 space-y-8">

        <!-- 1. Project Overview Grid -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <!-- Period -->
            <div class="p-5 border bg-white/5 rounded-xl border-white/5">
                <div class="flex items-center gap-2 mb-2 text-sm text-slate-400">
                    <Calendar class="w-4 h-4 text-blue-400" />
                    프로젝트 기간
                </div>
                <div class="text-lg font-bold text-white">{{ project.startDate }} ~ {{ project.endDate }}</div>
            </div>
            <!-- Budget -->
            <div class="p-5 border bg-white/5 rounded-xl border-white/5">
                <div class="flex items-center gap-2 mb-2 text-sm text-slate-400">
                    <DollarSign class="w-4 h-4 text-green-400" />
                    총 예산
                </div>
                <div class="text-lg font-bold text-white">{{ project.budget }}</div>
            </div>
            <!-- Progress -->
            <div class="p-5 border bg-white/5 rounded-xl border-white/5">
                <div class="flex items-center gap-2 mb-2 text-sm text-slate-400">
                    <Zap class="w-4 h-4 text-yellow-400" />
                    현재 진행률
                </div>
                <div class="flex items-end gap-2">
                    <span class="text-2xl font-bold text-white">{{ project.progress }}%</span>
                    <div class="flex-1 h-3 mb-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" :style="{ width: `${project.progress}%` }"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. Detailed Description -->
        <div>
            <h3 class="flex items-center gap-2 mb-4 text-lg font-bold text-white">
                <FileText class="w-5 h-5 text-indigo-400" />
                프로젝트 상세 내용
            </h3>
            <div class="p-6 leading-relaxed border bg-slate-900/50 rounded-xl border-white/5 text-slate-300">
                {{ project.description }}
            </div>
        </div>

        <!-- 3. Applicant Status Summary -->
        <div>
            <h3 class="flex items-center gap-2 mb-4 text-lg font-bold text-white">
                <Users class="w-5 h-5 text-purple-400" />
                지원자 상태 요약
            </h3>
            <div class="bg-white/5 border border-white/10 rounded-xl p-5">
                <div v-if="isApplicantLoading" class="text-sm text-slate-400">불러오는 중...</div>
                <div v-else-if="isApplicantError" class="text-sm text-red-400">지원자 상태를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>
                <div v-else-if="totalApplicants === 0" class="text-sm text-slate-400">지원자 상태 데이터가 없습니다.</div>
                <div v-else class="flex flex-wrap gap-3">
                    <div
                      v-for="(count, label) in applicantSummary"
                      :key="label"
                      class="px-3 py-2 rounded-lg text-xs font-bold text-white bg-purple-500/20 border border-purple-500/30 flex items-center gap-2"
                    >
                      <Tag class="w-3.5 h-3.5 text-purple-300" />
                      {{ label }}: {{ count }}명
                    </div>
                    <div class="px-3 py-2 rounded-lg text-xs font-bold text-slate-200 bg-white/10 border border-white/10">
                      총 {{ totalApplicants }}명
                    </div>
                </div>
            </div>
        </div>

        <div class="w-full h-px bg-white/10"></div>

        <!-- 4. Freelancers & Contract Info -->
        <div>
            <div class="flex items-center justify-between mb-6">
                <h3 class="flex items-center gap-2 text-lg font-bold text-white">
                    <Users class="w-5 h-5 text-purple-400" />
                    참여 프리랜서 및 계약 정보
                </h3>
                <span class="px-3 py-1 text-xs font-bold text-purple-300 border bg-purple-500/10 border-purple-500/20 rounded-lg">
                    총 {{ project.freelancers.length }}명 참여중
                </span>
            </div>

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div
                    v-for="freelancer in project.freelancers"
                    :key="freelancer.id"
                    class="flex items-center justify-between p-4 transition-all border group bg-white/5 hover:bg-white/10 rounded-xl border-white/5 hover:border-blue-500/30"
                >
                    <div class="flex items-center gap-4">
                        <div class="flex items-center justify-center w-10 h-10 text-base font-bold text-white rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ring-2 ring-white/10">
                            {{ freelancer.name.charAt(0) }}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{{ freelancer.name }}</span>
                                <span class="px-2 py-0.5 text-[10px] font-bold border rounded-md" :class="getFreelancerStatusColor(freelancer.status)">
                                    {{ freelancer.status === 'ACTIVE' ? '계약중' : '종료' }}
                                </span>
                            </div>
                            <div class="text-xs text-slate-400 mt-0.5">{{ freelancer.role }} | <span class="font-mono text-slate-500">{{ freelancer.contractPeriod }}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="sticky bottom-0 z-10 p-6 border-t bg-[#1e293b] border-white/10 flex justify-end gap-3">
          <button @click="$emit('close')" class="px-6 py-2.5 text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              닫기
          </button>
          <button class="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              프로젝트 수정
          </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
