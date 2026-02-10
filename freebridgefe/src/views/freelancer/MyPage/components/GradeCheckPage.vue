<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMotion } from '@vueuse/motion';
import { ArrowLeft, Star, Award, Info } from 'lucide-vue-next';
import { getGradeInfo, type GradeInfo } from '@/api/MyPage/accountApi';
import { useAuthStore } from '@/stores/authStore';

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const authStore = useAuthStore();
const myGradeInfo = ref<GradeInfo | null>(null);
const isLoading = ref(true);

onMounted(async () => {
    try {
        const userId = authStore.user?.id || 1;
        myGradeInfo.value = await getGradeInfo(userId);
    } catch (e) {
        console.error("Failed to fetch grade info", e);
    } finally {
        isLoading.value = false;
    }
});

// Apple-style grade colors (subtle, refined)
const getGradeColor = (grade: string) => {
    switch (grade) {
        case 'Master': return 'text-purple-400';
        case 'Senior': return 'text-blue-400';
        case 'Middle': return 'text-emerald-400';
        case 'Junior': return 'text-slate-400';
        default: return 'text-slate-500';
    }
};

const getProgressBarColor = (grade: string) => {
    switch (grade) {
        case 'Master': return 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]';
        case 'Senior': return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
        case 'Middle': return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
        case 'Junior': return 'bg-slate-500';
        default: return 'bg-slate-500';
    }
};
</script>

<template>
  <div class="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12 font-sans text-slate-200">
    <!-- Header -->
    <div class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-6">
            <button
                @click="$emit('back')"
                class="group flex items-center justify-center w-12 h-12 rounded-full bg-[#0f172a] hover:bg-[#1e293b] transition-all duration-300 border border-white/5 hover:border-white/10 shadow-lg"
            >
                <ArrowLeft class="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
            </button>
            <div>
                 <h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-white">Membership</h1>
                 <p class="text-slate-400 mt-1 font-light">나의 멤버십 등급과 혜택을 확인하세요.</p>
            </div>
        </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-40">
        <div class="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-500/20 border-t-blue-500"></div>
    </div>

    <div v-else class="space-y-8">
        <!-- Main Card (Navy Style) -->
        <div 
            v-if="myGradeInfo"
            class="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/5 shadow-2xl p-10 md:p-14"
            v-motion
            :initial="{ opacity: 0, scale: 0.98 }"
            :enter="{ opacity: 1, scale: 1, transition: { duration: 500, ease: 'easeOut' } }"
        >
            <!-- Background Glows -->
            <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1e3a8a]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#312e81]/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

            <div class="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
                <div class="flex-1">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider backdrop-blur-sm">
                        Current Level
                    </div>
                    <div class="text-6xl md:text-7xl font-semibold tracking-tight text-white mb-6 leading-none">
                        {{ myGradeInfo.currentGrade }}
                    </div>
                    <p class="text-xl text-slate-300 font-light max-w-xl leading-relaxed">
                        {{ authStore.user?.name }}님은 현재 <span :class="getGradeColor(myGradeInfo.currentGrade)" class="font-medium">{{ myGradeInfo.currentGrade }}</span> 등급입니다.
                        <br class="hidden md:block" />
                        꾸준한 활동으로 더 높은 등급에 도전해보세요.
                    </p>
                </div>
                
                <div class="flex flex-col items-center gap-4">
                    <div class="w-24 h-24 rounded-[32px] bg-gradient-to-br from-[#1e293b] to-[#0f172a] flex items-center justify-center border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] relative group overflow-hidden">
                        <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Award class="w-12 h-12" :class="getGradeColor(myGradeInfo.currentGrade)" />
                    </div>
                </div>
            </div>

            <!-- Progress Section -->
            <div class="mt-16 max-w-3xl">
                <div class="flex justify-between items-end mb-4">
                    <div>
                        <div class="text-4xl font-bold text-white">{{ myGradeInfo.score }}<span class="text-xl text-slate-500 font-normal ml-2">pts</span></div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-slate-400 mb-1">Target: Master</div>
                        <div class="text-base font-medium text-white">{{ myGradeInfo.nextGradeScore }} pts</div>
                    </div>
                </div>
                
                <!-- Refined Progress Bar -->
                <div class="h-3 bg-[#020617] rounded-full overflow-hidden border border-white/5">
                    <div 
                        class="h-full rounded-full transition-all duration-1000 ease-out"
                        :class="getProgressBarColor(myGradeInfo.currentGrade)"
                        :style="{ width: `${(myGradeInfo.score / myGradeInfo.nextGradeScore) * 100}%` }"
                    ></div>
                </div>
                <div class="mt-4 flex justify-between items-center text-sm">
                    <span class="text-slate-500">다음 등급까지</span>
                    <span class="text-blue-400 font-medium">{{ myGradeInfo.nextGradeScore - myGradeInfo.score }} points to next level</span>
                </div>
            </div>
        </div>

        <!-- Info Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Benefits Card -->
            <div 
                class="group rounded-[32px] bg-[#0f172a] p-10 border border-white/5 hover:bg-[#1e293b] transition-all duration-300 relative overflow-hidden"
                v-motion
                :initial="{ opacity: 0, y: 30 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            >
                <div class="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Star class="w-32 h-32 text-blue-500" />
                </div>
                
                <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
                    <Star class="w-6 h-6" />
                </div>
                <h3 class="text-2xl font-semibold text-white mb-3">Benefits</h3>
                <p class="text-slate-400 font-light text-base leading-relaxed mb-8">
                    현재 등급에서 누릴 수 있는<br/>특별한 혜택들을 확인하세요.
                </p>
                <ul class="space-y-4 relative z-10">
                    <li v-for="benefit in ['수수료 10% 할인', '프로젝트 우선 노출', '전용 배지 제공']" :key="benefit" class="flex items-center gap-4 text-slate-300">
                         <div class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                         {{ benefit }}
                    </li>
                </ul>
            </div>

            <!-- Criteria Card -->
             <div 
                class="group rounded-[32px] bg-[#0f172a] p-10 border border-white/5 hover:bg-[#1e293b] transition-all duration-300 relative overflow-hidden"
                v-motion
                :initial="{ opacity: 0, y: 30 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
            >
                <div class="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Info class="w-32 h-32 text-purple-500" />
                </div>

                 <div class="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
                    <Info class="w-6 h-6" />
                </div>
                <h3 class="text-2xl font-semibold text-white mb-3">Requirements</h3>
                <p class="text-slate-400 font-light text-base leading-relaxed mb-8">
                    다음 등급으로 승급하기 위한<br/>점수 기준을 확인하세요.
                </p>
                <div class="space-y-4 relative z-10">
                    <div class="flex justify-between items-center py-4 border-b border-white/5 last:border-0 hover:bg-white/5 px-4 -mx-4 rounded-xl transition-colors group/item">
                        <span class="text-slate-300 font-medium group-hover/item:text-white transition-colors">Master</span>
                        <div class="flex items-center gap-2">
                             <div class="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                            <span class="text-sm text-slate-400">500 pts</span>
                        </div>
                    </div>
                    <div class="flex justify-between items-center py-4 border-b border-white/5 last:border-0 hover:bg-white/5 px-4 -mx-4 rounded-xl transition-colors group/item">
                        <span class="text-slate-300 font-medium group-hover/item:text-white transition-colors">Senior</span>
                        <div class="flex items-center gap-2">
                             <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span class="text-sm text-slate-400">300 pts</span>
                        </div>
                    </div>
                    <div class="flex justify-between items-center py-4 border-b border-white/5 last:border-0 hover:bg-white/5 px-4 -mx-4 rounded-xl transition-colors group/item">
                        <span class="text-slate-300 font-medium group-hover/item:text-white transition-colors">Middle</span>
                        <div class="flex items-center gap-2">
                             <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span class="text-sm text-slate-400">100 pts</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
