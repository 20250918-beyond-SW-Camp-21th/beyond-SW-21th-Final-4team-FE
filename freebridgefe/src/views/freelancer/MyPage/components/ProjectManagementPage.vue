<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Search, Filter, Calendar, DollarSign, User as UserIcon, ArrowLeft } from 'lucide-vue-next';
import { getFreelancerProjects, type FreelancerProject } from '@/api/MyPage/projectApi.ts';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

const emit = defineEmits<{
  (e: 'openDetail', projectId: number): void;
  (e: 'back'): void;
}>();

// 탭 정의
const tabs = [
    { id: 'all', label: '전체' },
    { id: 'scheduled', label: '진행 예정' },
    { id: 'ongoing', label: '진행 중' },
    { id: 'completed', label: '진행 완료' }
];

const activeTab = ref('all');
const searchQuery = ref('');

const projects = ref<FreelancerProject[]>([]);

onMounted(async () => {
  if (authStore.user?.id) {
    try {
      const data = await getFreelancerProjects(authStore.user.id);
      projects.value = data;
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  } else {
    // Fallback for demo/guest
    try {
      const data = await getFreelancerProjects('guest');
      projects.value = data;
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }
});

const filteredProjects = computed(() => {
  return projects.value.filter(project => {
    const matchesTab = activeTab.value === 'all' || project.status === activeTab.value;
    const query = searchQuery.value.toLowerCase();
    const matchesSearch = !query || project.title.toLowerCase().includes(query) || project.clientName.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });
});

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'scheduled': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        case 'ongoing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'completed': return 'bg-slate-500/10 text-slate-400 border-white/10';
        default: return 'bg-white/5 text-slate-400 border-white/10';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'scheduled': return '진행 예정';
        case 'ongoing': return '진행 중';
        case 'completed': return '진행 완료';
        default: return '미정';
    }
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
                    <h2 class="text-2xl font-bold text-white mb-2">프로젝트 관리</h2>
                    <p class="text-slate-400 text-sm">진행 중인 프로젝트와 완료된 프로젝트를 한눈에 관리하세요.</p>
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
                <button class="p-2 bg-[#1e293b] border border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/30 transition-colors">
                    <Filter class="w-4 h-4" />
                </button>
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
                <!-- Active Indicator -->
                <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
            </button>
        </div>

        <!-- Project Grid -->
        <div v-if="filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
                v-for="project in filteredProjects" 
                :key="project.id"
                class="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 hover:bg-[#1e293b] transition-all cursor-pointer group flex flex-col h-64"
                @click="$emit('openDetail', project.id)"
            >
                <!-- Card Header -->
                <div class="flex justify-between items-start mb-4">
                    <div class="px-3 py-1 rounded-full text-xs font-bold border" :class="getStatusBadgeClass(project.status)">
                        {{ getStatusLabel(project.status) }}
                    </div>
                    <div class="text-xs text-slate-500 font-mono">{{ project.dDay }}</div>
                </div>

                <!-- Card Content -->
                <div class="flex-1">
                    <h3 class="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {{ project.title }}
                    </h3>
                    <div class="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <UserIcon class="w-4 h-4" />
                        <span>{{ project.clientName }}</span>
                    </div>
                </div>

                <!-- Card Footer -->
                <div class="pt-4 border-t border-white/5 space-y-2">
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-2 text-slate-500">
                            <Calendar class="w-4 h-4" />
                            <span>기간</span>
                        </div>
                        <span class="text-slate-300">{{ project.period }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-2 text-slate-500">
                            <DollarSign class="w-4 h-4" />
                            <span>금액</span>
                        </div>
                        <span class="text-white font-bold">{{ project.amount }}</span>
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
