<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMotion } from '@vueuse/motion';
import {
  ArrowLeft,
  Search,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  Zap,
} from 'lucide-vue-next';

import ProjectDetailModal from './ProjectDetailModal.vue';

defineEmits<{
  (e: 'back'): void;
}>();

const isModalOpen = ref(false);
const selectedProject = ref<any>(null); // Type 'any' for now to fit the extended interface or create a new one

// --- Types ---
type ProjectStatus = 'BEFORE_START' | 'IN_PROGRESS' | 'COMPLETED';

interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  progress: number;
  description: string;
  budget: string; // Added back for simple info
}

// --- Mock Data ---
const mockProjects: Project[] = [
  {
    id: '1',
    title: '핀테크 대시보드 리뉴얼',
    status: 'BEFORE_START',
    startDate: '2024-02-15',
    endDate: '2024-04-15',
    progress: 0,
    description: '기존 어드민 대시보드 React 리뉴얼 프로젝트입니다. 레거시 코드를 최신 스택으로 마이그레이션합니다.',
    budget: '₩5,000,000',
    // Extended Data for Modal
    freelancers: [
        { id: 'f1', name: '김프론트', role: 'Frontend Developer', status: 'ACTIVE', contractPeriod: '2024.02.15 ~ 2024.04.15', paymentAmount: '₩3,000,000' },
        { id: 'f2', name: '박백엔드', role: 'Backend Developer', status: 'ACTIVE', contractPeriod: '2024.02.15 ~ 2024.04.15', paymentAmount: '₩2,000,000' }
    ]
  },
  {
    id: '2',
    title: '쇼핑몰 앱 UI/UX 디자인',
    status: 'IN_PROGRESS',
    startDate: '2024-01-25',
    endDate: '2024-03-25',
    progress: 65,
    description: 'MZ세대 타겟 패션 커머스 앱 디자인 작업을 진행 중입니다. 메인/상세 페이지 위주입니다.',
    budget: '₩3,500,000',
    freelancers: [
        { id: 'f3', name: '이디자인', role: 'UI/UX Designer', status: 'ACTIVE', contractPeriod: '2024.01.25 ~ 2024.03.25', paymentAmount: '₩3,500,000' }
    ]
  },
  {
    id: '3',
    title: '사내 업무 자동화 봇 개발',
    status: 'COMPLETED',
    startDate: '2023-12-05',
    endDate: '2023-12-31',
    progress: 100,
    description: '슬랙 연동 사내 알림 봇 개발 완료. 서버 모니터링 및 알림 기능 포함.',
    budget: '₩2,000,000',
    freelancers: [
        { id: 'f4', name: '최엔지니어', role: 'DevOps Engineer', status: 'COMPLETED', contractPeriod: '2023.12.05 ~ 2023.12.31', paymentAmount: '₩2,000,000' }
    ]
  },
  {
    id: '4',
    title: '배달 플랫폼 백엔드 개선',
    status: 'IN_PROGRESS',
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    progress: 40,
    description: '트래픽 이슈 해결 및 쿼리 최적화 작업. DB 인덱싱 및 캐싱 전략 수립.',
    budget: '₩8,000,000',
    freelancers: [
        { id: 'f5', name: '정서버', role: 'Backend Lead', status: 'ACTIVE', contractPeriod: '2024.01.15 ~ 2024.04.15', paymentAmount: '₩5,000,000' },
        { id: 'f6', name: '윤DB', role: 'DBA', status: 'ACTIVE', contractPeriod: '2024.01.15 ~ 2024.03.15', paymentAmount: '₩3,000,000' }
    ]
  },
];

const projects = ref<Project[]>(mockProjects);
const searchTerm = ref('');
const statusFilter = ref<ProjectStatus | 'ALL'>('ALL');
const router = useRouter();

// --- Helpers ---
const getStatusConfig = (status: ProjectStatus) => {
  switch (status) {
    case 'BEFORE_START':
      return { label: '시작 전', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: Clock };
    case 'IN_PROGRESS':
      return { label: '진행 중', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', icon: Briefcase };
    case 'COMPLETED':
      return { label: '완료됨', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: CheckCircle };
  }
};

const filteredProjects = computed(() => {
  return projects.value.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesStatus = statusFilter.value === 'ALL' || project.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const getProgressColor = (progress: number) => {
    if (progress <= 30) {
        return {
            bar: 'from-blue-500 to-indigo-500',
            text: 'text-blue-400',
            iconFill: 'fill-blue-400',
            shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]'
        };
    } else if (progress <= 69) {
        return {
             bar: 'from-yellow-400 to-orange-500',
             text: 'text-yellow-400',
             iconFill: 'fill-yellow-400',
             shadow: 'shadow-[0_0_10px_rgba(250,204,21,0.5)]'
        };
    } else {
         return {
             bar: 'from-red-500 to-pink-600',
             text: 'text-red-400',
             iconFill: 'fill-red-400',
             shadow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]'
        };
    }
};

const openModal = (project: Project) => {
    console.log('openModal called with:', project);
    selectedProject.value = project;
    isModalOpen.value = true;
    console.log('isModalOpen:', isModalOpen.value);
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-8 py-8 text-white">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <button
          @click="$emit('back')"
          class="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft class="w-5 h-5 text-white/60" />
        </button>
        <div>
          <h1 class="text-2xl font-bold">프로젝트 관리</h1>
          <p class="text-sm text-white/40 mt-1">등록된 프로젝트의 진행 현황을 확인하세요.</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
         <!-- Status Tabs -->
        <div class="bg-white/5 p-1 rounded-xl flex gap-1">
            <button
                v-for="status in ['ALL', 'BEFORE_START', 'IN_PROGRESS', 'COMPLETED']"
                :key="status"
                @click="statusFilter = status as any"
                class="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                :class="statusFilter === status ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'"
            >
                {{ status === 'ALL' ? '전체' : status === 'BEFORE_START' ? '착수 예정' : status === 'IN_PROGRESS' ? '진행 중' : '종료' }}
            </button>
        </div>

        <!-- Search -->
        <div class="relative w-full md:w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="프로젝트명 검색..."
              v-model="searchTerm"
              class="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors text-xs"
            />
        </div>
    </div>

    <!-- Projects Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
            v-for="(project, index) in filteredProjects"
            :key="project.id"
            @click="openModal(project)"
            class="group bg-[#1e293b]/50 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all hover:bg-[#1e293b] flex flex-col aspect-[4/5] relative overflow-hidden shadow-lg cursor-pointer"
            v-motion
            :initial="{ opacity: 0, scale: 0.95 }"
            :enter="{ opacity: 1, scale: 1, transition: { delay: index * 0.05 } }"
        >
             <!-- Header: Status & Title -->
             <div class="mb-4">
                 <div class="flex justify-between items-start mb-3">
                     <span class="px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5"
                        :class="`${getStatusConfig(project.status).color} ${getStatusConfig(project.status).bg} ${getStatusConfig(project.status).border}`"
                     >
                        <component :is="getStatusConfig(project.status).icon" class="w-3.5 h-3.5" />
                        {{ getStatusConfig(project.status).label }}
                     </span>
                     <span class="text-xs text-slate-500 font-medium font-mono">
                        {{ project.startDate }} ~
                     </span>
                 </div>
                 <h3 class="font-bold text-white text-xl leading-snug group-hover:text-blue-400 transition-colors">
                    {{ project.title }}
                </h3>
             </div>

            <!-- Project Simple Info -->
            <div class="flex-1 bg-white/5 rounded-xl p-5 border border-white/5 flex flex-col mb-4">
                 <div class="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                    <Briefcase class="w-4 h-4 text-blue-400" />
                    프로젝트 설명
                 </div>
                 <p class="text-sm text-slate-400 leading-relaxed mb-4">
                    {{ project.description }}
                 </p>
                 
                 <div class="mt-auto pt-4 border-t border-white/5">
                     <div class="grid grid-cols-2 gap-4">
                         <div>
                             <div class="text-[10px] text-slate-500 mb-1">예산</div>
                             <div class="text-sm font-bold text-white">{{ project.budget }}</div>
                         </div>
                         <div>
                             <div class="text-[10px] text-slate-500 mb-1">종료일</div>
                             <div class="text-sm font-bold text-white">{{ project.endDate }}</div>
                         </div>
                     </div>
                 </div>
            </div>

            <!-- Footer: Stats -->
            <div class="border-t border-white/5 pt-4 w-full">
                <div v-if="project.status === 'IN_PROGRESS'" class="w-full">
                    <div class="flex justify-between items-end mb-2">
                        <span class="text-xs font-bold flex items-center gap-1" :class="getProgressColor(project.progress).text">
                            <Zap class="w-3.5 h-3.5" :class="getProgressColor(project.progress).iconFill" />
                            진행중
                        </span>
                        <span class="text-sm font-bold text-white">{{ project.progress }}%</span>
                    </div>
                    <div class="h-2.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out" 
                             :class="`${getProgressColor(project.progress).bar} ${getProgressColor(project.progress).shadow}`"
                             :style="{ width: `${project.progress}%` }">
                        </div>
                    </div>
                </div>
                 <div v-else-if="project.status === 'COMPLETED'" class="w-full flex justify-end">
                    <span class="px-3 py-1 bg-slate-700/50 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-1.5 border border-white/5">
                        <CheckCircle class="w-4 h-4 text-slate-400" />
                        프로젝트 종료
                    </span>
                </div>
                 <div v-else class="w-full flex justify-end">
                    <span class="px-3 py-1 bg-blue-500/10 rounded-lg text-xs font-bold text-blue-400 flex items-center gap-1.5 border border-blue-500/20">
                        <Clock class="w-4 h-4" />
                        시작 대기
                    </span>
                </div>
            </div>
        </div>
    </div>
  </div>

    <!-- Project Detail Modal -->
    <Teleport to="body">
        <ProjectDetailModal 
            :is-open="isModalOpen" 
            :project="selectedProject" 
            @close="isModalOpen = false" 
        />
    </Teleport>
</template>
