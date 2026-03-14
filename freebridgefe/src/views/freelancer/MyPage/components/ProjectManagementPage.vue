<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Search, Calendar, DollarSign, User as UserIcon, ArrowLeft } from 'lucide-vue-next';
import { getFreelancerProjects, type FreelancerAppliedProject } from '@/api/MyPage/projectApi';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

const emit = defineEmits<{
  (e: 'openDetail', projectId: number): void;
  (e: 'back'): void;
}>();

const tabs = [
  { id: 'all', label: '전체' },
  { id: '심사중', label: '심사중' },
  { id: '합격', label: '합격' },
  { id: '거절', label: '거절' }
];

const activeTab = ref('all');
const searchQuery = ref('');
const projects = ref<FreelancerAppliedProject[]>([]);

const loadProjects = async () => {
  if (authStore.user?.id) {
    const data = await getFreelancerProjects(authStore.user.id);
    projects.value = data;
    return;
  }
  const data = await getFreelancerProjects('guest');
  projects.value = data;
};

onMounted(async () => {
  try {
    await loadProjects();
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
});

const filteredProjects = computed(() => {
  return projects.value.filter((project) => {
    const matchesTab = activeTab.value === 'all' || project.applyStatus === activeTab.value;
    const query = searchQuery.value.toLowerCase();
    const matchesSearch =
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.employerName.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });
});

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case '심사중':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case '합격':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case '거절':
      return 'bg-slate-500/10 text-slate-400 border-white/10';
    default:
      return 'bg-white/5 text-slate-400 border-white/10';
  }
};

const getCardClass = (status: string) => {
  switch (status) {
    case '심사중':
      return 'bg-yellow-500/10 border-yellow-400/20 hover:border-yellow-300/30 hover:bg-yellow-500/15';
    case '합격':
      return 'bg-emerald-500/10 border-emerald-400/20 hover:border-emerald-300/30 hover:bg-emerald-500/15';
    case '거절':
      return 'bg-[#1e293b]/50 border-white/5 hover:border-blue-500/30 hover:bg-[#1e293b]';
    default:
      return 'bg-[#1e293b]/50 border-white/5 hover:border-blue-500/30 hover:bg-[#1e293b]';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case '심사중':
      return '심사중';
    case '합격':
      return '합격';
    case '거절':
      return '거절';
    default:
      return '미정';
  }
};

const formatAppliedAt = (timestamp: number | null) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('ko-KR');
};
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto h-full flex flex-col animate-fade-in-up">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div class="flex items-center gap-4">
        <button
          @click="$emit('back')"
          class="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft class="w-5 h-5 text-white/60" />
        </button>
        <div>
          <h2 class="text-2xl font-bold text-white mb-2">프로젝트 지원 현황</h2>
          <p class="text-slate-400 text-sm">지원하거나 제안받은 프로젝트의 상태를 한눈에 확인하세요.</p>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="flex items-center gap-3">
        <div class="relative">
          <Search class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="프로젝트명 검색"
            class="bg-[#1e293b] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
          />
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-8 border-b border-white/10">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-6 py-3 text-sm font-medium transition-all relative"
        :class="activeTab === tab.id ? 'text-blue-400' : 'text-slate-400 hover:text-white'"
      >
        {{ tab.label }}
        <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
      </button>
    </div>

    <!-- Project Grid -->
    <div v-if="filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in filteredProjects"
        :key="project.projectId"
        class="border rounded-2xl p-6 transition-all group flex flex-col h-64"
        :class="getCardClass(project.applyStatus || '')"
      >
        <!-- Card Header -->
        <div class="flex justify-between items-start mb-4">
          <div class="px-3 py-1 rounded-full text-xs font-bold border" :class="getStatusBadgeClass(project.applyStatus || '')">
            {{ getStatusLabel(project.applyStatus || '') }}
          </div>
          <div class="text-xs text-slate-500 font-mono">{{ formatAppliedAt(project.appliedAt) }}</div>
        </div>

        <!-- Card Content -->
        <div class="flex-1">
          <h3 class="text-lg font-bold text-white mb-2 line-clamp-2 transition-colors">
            {{ project.title }}
          </h3>
          <div class="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <UserIcon class="w-4 h-4" />
            <span>{{ project.employerName }}</span>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="pt-4 border-t border-white/5 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2 text-slate-500">
              <Calendar class="w-4 h-4" />
              <span>지원일</span>
            </div>
            <span class="text-slate-300">{{ formatAppliedAt(project.appliedAt) }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2 text-slate-500">
              <DollarSign class="w-4 h-4" />
              <span>상태</span>
            </div>
            <span class="text-white font-bold">{{ getStatusLabel(project.applyStatus || '') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4 min-h-[400px]">
      <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
        <Search class="w-8 h-8 opacity-50" />
      </div>
      <p>해당하는 프로젝트가 없습니다.</p>
    </div>
  </div>
</template>
