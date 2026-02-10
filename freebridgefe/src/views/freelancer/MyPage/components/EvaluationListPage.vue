<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMotion } from '@vueuse/motion';
import { 
    Star, 
    Filter, 
    ArrowLeft, 
    Search,
    MessageSquare,
    Calendar,
    Briefcase
} from 'lucide-vue-next';
import { getEvaluations, type Evaluation } from '@/api/MyPage/evaluationApi';
import { useAuthStore } from '@/stores/authStore';

const emit = defineEmits<{
    (e: 'back'): void;
}>();

const authStore = useAuthStore();
const evaluations = ref<Evaluation[]>([]);
const isLoading = ref(true);

// 필터 상태 (Filter & Sort)
const searchQuery = ref('');
const sortBy = ref<'latest' | 'rating_high' | 'rating_low'>('latest');

onMounted(async () => {
    try {
        isLoading.value = true;
        // Mock API Call
        evaluations.value = await getEvaluations(authStore.user?.id || 1);
    } catch (e) {
        console.error("Failed to fetch evaluations", e);
    } finally {
        isLoading.value = false;
    }
});

// Computed: 검색 및 정렬 로직
const filteredEvaluations = computed(() => {
    let result = [...evaluations.value];

    // 1. 검색 (회사명, 프로젝트명)
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(e => 
            e.companyName.toLowerCase().includes(query) || 
            e.projectName.toLowerCase().includes(query)
        );
    }

    // 2. 정렬
    result.sort((a, b) => {
        if (sortBy.value === 'rating_high') {
            return b.score - a.score;
        } else if (sortBy.value === 'rating_low') {
            return a.score - b.score; 
        }
        // latest (createdAt string 비교, assumming YYYY-MM-DD format works with Date parse or string compare)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
});

// Computed: 평균 평점
const averageScore = computed(() => {
    if (evaluations.value.length === 0) return 0;
    const total = evaluations.value.reduce((sum, e) => sum + e.score, 0);
    return (total / evaluations.value.length).toFixed(1);
});
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 md:px-8 py-8 font-sans text-white">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
            <button
                @click="$emit('back')"
                class="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
                <ArrowLeft class="w-5 h-5 text-white/60" />
            </button>
            <div>
                <h1 class="text-2xl font-bold text-white">받은 평가 관리</h1>
                <p class="text-sm text-slate-400 mt-1">프로젝트 완료 후 받은 고용주의 평가를 확인하세요.</p>
            </div>
        </div>

        <!-- Summary Card (Optional) -->
        <div class="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
             <div class="flex items-center gap-1">
                <Star class="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span class="text-lg font-bold text-white">{{ averageScore }}</span>
                <span class="text-sm text-slate-500">/ 5.0</span>
             </div>
             <div class="w-px h-8 bg-white/10 mx-2"></div>
             <span class="text-sm text-slate-400">총 {{ evaluations.length }}건의 평가</span>
        </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="relative flex-1">
            <Search class="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="프로젝트명 또는 회사명 검색" 
                class="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors"
            />
        </div>
        <div class="relative w-full md:w-48">
            <Filter class="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <select 
                v-model="sortBy"
                class="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none appearance-none focus:border-blue-500/50 transition-colors"
            >
                <option value="latest">최신순</option>
                <option value="rating_high">평점 높은순</option>
                <option value="rating_low">평점 낮은순</option>
            </select>
        </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredEvaluations.length === 0" class="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed text-slate-500">
        <MessageSquare class="w-12 h-12 mb-4 opacity-50" />
        <p>평가 내역이 없습니다.</p>
    </div>

    <!-- Evaluation List -->
    <div v-else class="grid grid-cols-1 gap-4">
        <div 
            v-for="evaluation in filteredEvaluations" 
            :key="evaluation.id"
            class="bg-white/5 rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all group"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
        >
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shrink-0">
                         <Briefcase class="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 class="font-bold text-white text-lg leading-tight">{{ evaluation.projectName }}</h3>
                        <p class="text-sm text-slate-400 mt-1 flex items-center gap-2">
                             {{ evaluation.companyName }}
                        </p>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <div class="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg border border-yellow-400/20">
                        <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span class="font-bold text-yellow-400 text-sm">{{ evaluation.score.toFixed(1) }}</span>
                    </div>
                    <div class="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Calendar class="w-3 h-3" />
                        {{ evaluation.createdAt }}
                    </div>
                </div>
            </div>

            <!-- Comment -->
            <div class="bg-black/20 rounded-lg p-4 mb-4 text-slate-300 text-sm leading-relaxed border border-white/5">
                "{{ evaluation.comment }}"
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2">
                <span 
                    v-for="tag in evaluation.tags" 
                    :key="tag" 
                    class="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20"
                >
                    #{{ tag }}
                </span>
            </div>
        </div>
    </div>
  </div>
</template>
