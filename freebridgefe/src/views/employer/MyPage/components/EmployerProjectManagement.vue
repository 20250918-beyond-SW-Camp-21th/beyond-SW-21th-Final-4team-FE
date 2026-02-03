<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
  ArrowLeft,
  Plus,
  Search,
  Briefcase,
  Users,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-vue-next';

defineEmits<{
  (e: 'back'): void;
}>();

type ProjectStatus = 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  applicants: number;
  budget: string;
  startDate: string;
  endDate: string;
  description: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'React 웹 애플리케이션 개발',
    status: 'RECRUITING',
    applicants: 12,
    budget: '₩5,000,000',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    description: 'React 기반 웹 애플리케이션 개발 프로젝트',
  },
  {
    id: '2',
    title: 'Node.js 백엔드 API 개발',
    status: 'IN_PROGRESS',
    applicants: 8,
    budget: '₩7,000,000',
    startDate: '2024-01-15',
    endDate: '2024-03-31',
    description: 'RESTful API 개발 및 데이터베이스 설계',
  },
  {
    id: '3',
    title: 'UI/UX 디자인 리뉴얼',
    status: 'COMPLETED',
    applicants: 15,
    budget: '₩3,000,000',
    startDate: '2023-11-01',
    endDate: '2023-12-31',
    description: '기존 서비스 UI/UX 전면 리뉴얼',
  },
];

const projects = ref<Project[]>(mockProjects);
const searchTerm = ref('');
const statusFilter = ref<ProjectStatus | 'ALL'>('ALL');

const getStatusConfig = (status: ProjectStatus) => {
  switch (status) {
    case 'RECRUITING':
      return { label: '모집중', color: 'bg-blue-500', icon: Users };
    case 'IN_PROGRESS':
      return { label: '진행중', color: 'bg-green-500', icon: Clock };
    case 'COMPLETED':
      return { label: '완료', color: 'bg-slate-500', icon: CheckCircle };
    case 'CANCELLED':
      return { label: '취소', color: 'bg-red-500', icon: XCircle };
  }
};

const filteredProjects = computed(() => {
  return projects.value.filter((project) => {
    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchTerm.value.toLowerCase());
    const matchesStatus =
      statusFilter.value === 'ALL' || project.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});
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
          <p class="text-sm text-white/40 mt-1">등록한 프로젝트를 관리하세요</p>
        </div>
      </div>
      <button
        class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        새 프로젝트 등록
      </button>
    </div>

    <!-- Filters -->
    <div
      class="bg-[#1e293b]/50 rounded-2xl border border-white/10 p-6 mb-6"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
    >
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            />
            <input
              type="text"
              placeholder="프로젝트 검색..."
              v-model="searchTerm"
              class="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div class="flex gap-2">
          <button
            v-for="status in ['ALL', 'RECRUITING', 'IN_PROGRESS', 'COMPLETED']"
            :key="status"
            @click="statusFilter = status as any"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="
              statusFilter === status
                ? status === 'IN_PROGRESS'
                  ? 'bg-green-500 text-white'
                  : status === 'COMPLETED'
                  ? 'bg-slate-500 text-white'
                  : 'bg-blue-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            "
          >
            {{
              status === 'ALL'
                ? '전체'
                : status === 'RECRUITING'
                ? '모집중'
                : status === 'IN_PROGRESS'
                ? '진행중'
                : '완료'
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Projects List -->
    <div class="space-y-4">
      <div
        v-for="(project, index) in filteredProjects"
        :key="project.id"
        class="bg-[#1e293b]/50 rounded-2xl border border-white/10 p-6 hover:bg-[#1e293b]/70 transition-colors"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-bold">{{ project.title }}</h3>
              <span
                :class="`${
                  getStatusConfig(project.status).color
                } text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1`"
              >
                <component :is="getStatusConfig(project.status).icon" class="w-3 h-3" />
                {{ getStatusConfig(project.status).label }}
              </span>
            </div>
            <p class="text-sm text-white/40">{{ project.description }}</p>
          </div>
          <div class="flex gap-2">
            <button class="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Eye class="w-4 h-4 text-slate-400" />
            </button>
            <button class="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Edit class="w-4 h-4 text-slate-400" />
            </button>
            <button class="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Trash2 class="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="flex items-center gap-2 text-sm">
            <Users class="w-4 h-4 text-blue-400" />
            <span class="text-white/40">지원자:</span>
            <span class="text-white font-semibold">{{ project.applicants }}명</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <DollarSign class="w-4 h-4 text-green-400" />
            <span class="text-white/40">예산:</span>
            <span class="text-white font-semibold">{{ project.budget }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <Calendar class="w-4 h-4 text-purple-400" />
            <span class="text-white/40">시작:</span>
            <span class="text-white font-semibold">{{ project.startDate }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <Calendar class="w-4 h-4 text-orange-400" />
            <span class="text-white/40">종료:</span>
            <span class="text-white font-semibold">{{ project.endDate }}</span>
          </div>
        </div>
      </div>

      <div v-if="filteredProjects.length === 0" class="text-center py-12">
        <Briefcase class="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p class="text-slate-400">검색 결과가 없습니다.</p>
      </div>
    </div>
  </div>
</template>
