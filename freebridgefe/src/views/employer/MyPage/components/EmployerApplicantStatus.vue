<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  MessageSquare,
  Sparkles,
  Link as LinkIcon,
  Check,
  X 
} from 'lucide-vue-next';
import { useMotion } from '@vueuse/motion';
import type { Application, ApplicationGroup } from '@/api/MyPage/employer';
import { getApplications, acceptApplication, rejectApplication } from '@/api/MyPage/employer';
import MyPageRejectionModal from './MyPageRejectionModal.vue';

defineEmits<{
  (e: 'back'): void;
}>();

// State
const isLoading = ref(true);
const groups = ref<ApplicationGroup[]>([]);
const searchQuery = ref('');
const statusFilter = ref<string>('ALL');
const selectedJobId = ref<string>('ALL');

// Modal State
const rejectingApp = ref<Application | null>(null);

// Mock Data Loading
const fetchApplications = async () => {
    try {
        groups.value = await getApplications();
    } catch (error) {
        console.error('Failed to fetch applications:', error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchApplications();
});

// Actions
const handleAccept = async (app: Application) => {
    if (confirm(`${app.freelancerName}님의 지원을 수락하시겠습니까?`)) {
        try {
            await acceptApplication(app.id);
            // Optimistic Update
            app.status = 'ACCEPTED';
        } catch (error) {
            console.error('Failed to accept application:', error);
            alert('오류가 발생했습니다.');
        }
    }
};

const openRejectionModal = (app: Application) => {
    rejectingApp.value = app;
};

const handleRejectConfirm = async (reason: string) => {
    if (!rejectingApp.value) return;

    try {
        await rejectApplication(rejectingApp.value.id, reason);

        // Optimistic Update
        const targetApp = findApplication(rejectingApp.value.id);
        if (targetApp) {
            targetApp.status = 'REJECTED';
            targetApp.rejectionReason = reason;
        }
    } catch (error) {
        console.error('Failed to reject application:', error);
        alert('오류가 발생했습니다.');
    } finally {
        rejectingApp.value = null;
    }
};

// Helper
const findApplication = (appId: string): Application | undefined => {
    for (const group of groups.value) {
        const app = group.applications.find(a => a.id === appId);
        if (app) return app;
    }
    return undefined;
};

const formatDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString('ko-KR');
};

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'ACCEPTED': return 'bg-green-500/10 text-green-400 border-green-500/20';
        case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20';
        default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'ACCEPTED': return '수락됨';
        case 'REJECTED': return '거절됨';
        default: return '대기중';
    }
};
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 md:px-8 py-8 text-white font-sans">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-2">
            <Users class="w-6 h-6 text-blue-400" />
            지원자 현황
        </h1>
        <p class="text-sm text-white/50 mt-1">프로젝트별 지원자를 확인하고 채용을 진행하세요</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
                v-model="searchQuery"
                type="text" 
                placeholder="지원자 이름 또는 내용 검색"
                class="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
        </div>
        <div class="flex gap-2">
            <select 
                v-model="selectedJobId"
                class="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
                <option value="ALL">모든 프로젝트</option>
                <option v-for="group in groups" :key="group.jobId" :value="group.jobId">
                    {{ group.jobTitle }}
                </option>
            </select>
            <select 
                v-model="statusFilter"
                class="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
                <option value="ALL">모든 상태</option>
                <option value="PENDING">대기중</option>
                <option value="ACCEPTED">수락됨</option>
                <option value="REJECTED">거절됨</option>
            </select>
        </div>
    </div>

    <!-- Content -->
    <div v-if="isLoading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else class="space-y-8">
        <div v-for="group in groups" :key="group.jobId" class="space-y-4">
            <!-- Job Header -->
            <div 
                v-if="selectedJobId === 'ALL' || selectedJobId === group.jobId"
                class="flex items-center gap-3 pb-2 border-b border-white/10"
            >
                <h2 class="text-lg font-bold text-white/90">{{ group.jobTitle }}</h2>
                <div class="px-2 py-0.5 bg-white/10 rounded text-xs font-medium text-white/60">
                    {{ group.applications.length }}명
                </div>
            </div>

            <!-- Application Cards -->
            <div v-if="selectedJobId === 'ALL' || selectedJobId === group.jobId" class="grid grid-cols-1 gap-4">
                <div 
                    v-for="app in group.applications" 
                    :key="app.id"
                    class="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:bg-[#1e293b]/60 transition-all group"
                >
                    <div class="flex flex-col md:flex-row gap-6">
                        <!-- Freelancer Info -->
                        <div class="flex items-start gap-4 min-w-[200px]">
                            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-bold shadow-lg">
                                {{ app.freelancerName[0] }}
                            </div>
                            <div>
                                <div class="font-bold flex items-center gap-2">
                                    {{ app.freelancerName }}
                                    <Sparkles class="w-3.5 h-3.5 text-yellow-400" />
                                </div>
                                <div class="text-xs text-white/40 mt-1">{{ formatDate(app.createdAt) }} 지원</div>
                                <div class="flex gap-2 mt-3">
                                    <a v-if="app.portoflioUrl" :href="app.portfolioUrl" target="_blank" class="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300">
                                        <LinkIcon class="w-3 h-3" /> 포트폴리오
                                    </a>
                                    <a v-if="app.resumeUrl" :href="app.resumeUrl" target="_blank" class="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300">
                                        <FileText class="w-3 h-3" /> 이력서
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Message -->
                        <div class="flex-1 bg-black/20 rounded-xl p-4 text-sm text-white/70 leading-relaxed">
                            {{ app.message }}
                        </div>

                        <!-- Actions & Status -->
                        <div class="flex flex-col items-end gap-3 min-w-[140px]">
                            <div 
                                class="px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5"
                                :class="getStatusBadgeClass(app.status)"
                            >
                                <span v-if="app.status === 'PENDING'" class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                <CheckCircle v-if="app.status === 'ACCEPTED'" class="w-3.5 h-3.5" />
                                <XCircle v-if="app.status === 'REJECTED'" class="w-3.5 h-3.5" />
                                {{ getStatusLabel(app.status) }}
                            </div>

                            <div v-if="app.status === 'PENDING'" class="flex gap-2 mt-auto">
                                <button 
                                    @click="handleAccept(app)"
                                    class="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                                    title="수락"
                                >
                                    <Check class="w-5 h-5" />
                                </button>
                                <button 
                                    @click="openRejectionModal(app)"
                                    class="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                    title="거절"
                                >
                                    <X class="w-5 h-5" />
                                </button>
                            </div>

                             <div v-if="app.status === 'REJECTED' && app.rejectionReason" class="text-xs text-red-400/80 text-right mt-1">
                                사유: {{ app.rejectionReason }}
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="group.applications.length === 0" class="text-center py-8 text-white/30 text-sm bg-white/5 rounded-xl border border-white/5 border-dashed">
                    지원자가 없습니다.
                </div>
            </div>
        </div>
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
        <MyPageRejectionModal 
            v-if="rejectingApp" 
            :application="rejectingApp" 
            @close="rejectingApp = null"
            @confirm="handleRejectConfirm"
        />
    </transition>
  </div>
</template>
