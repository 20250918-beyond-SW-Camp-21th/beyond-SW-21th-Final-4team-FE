<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
  ArrowLeft,
  Search,
  Star,
  Cpu,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  FileText,
  Briefcase,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  CheckCircle2,
  XCircle,
  BarChart3,
  MessageSquare
} from 'lucide-vue-next';

defineEmits<{
  (e: 'back'): void;
}>();

import { getMockReviews, type Review } from '@/api/MyPage/mock/mockProfiles';

// --- Types ---
interface AIAnalysisResult {
    summary: string;
    sentimentMultiplier: number; // 0.0 to 1.0 (bad to good)
    strengths: string[];
    weaknesses: string[];

}

// --- Mock Data ---
const reviews = ref<Review[]>(getMockReviews());

// --- Analysis Logic ---
const isAnalyzing = ref(false);
const analysisResult = ref<AIAnalysisResult | null>(null);

const analyzeReputation = async () => {
    if (reviews.value.length < 3) {
      alert('AI 분석을 위해서는 최소 3개 이상의 리뷰가 필요합니다.');
      return;
    }

    isAnalyzing.value = true;
    
    // Simulate AI Analysis Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock Analysis Result derived from mock reviews
    // In a real app, this would be an API call sending reviews to an LLM
    analysisResult.value = {
        summary: "전반적으로 '결제 속도'와 '업무 명확성'에서 긍정적인 평가를 받고 있으나, '커뮤니케이션'과 '일정 관리' 측면에서 개선이 필요합니다. 특히 프로젝트 중반의 기획 변경 시 소통 방식에 대한 부정적 피드백이 감지됩니다.",
        sentimentMultiplier: 0.65, // 65% positive sentiment score
        strengths: [
            "빠르고 정확한 대금 지급 (100% 긍정)",
            "기술적 이해도가 높은 업무 지시",
            "초기 요구사항 명세의 명확성"
        ],
        weaknesses: [
            "프로젝트 진행 중 잦은 기획 변경 및 지연 공유",
            "업무 시간 외(주말) 연락 빈도 높음",
            "타이트한 일정 산정"
        ],

    };
    
    // Save to local storage
    localStorage.setItem('employerReputationAnalysis', JSON.stringify(analysisResult.value));
    
    isAnalyzing.value = false;
};

// Load analysis from local storage on mount
onMounted(() => {
    const savedAnalysis = localStorage.getItem('employerReputationAnalysis');
    if (savedAnalysis) {
      try {
        analysisResult.value = JSON.parse(savedAnalysis);
      } catch (e) {
        console.error('Failed to parse saved analysis', e);
        localStorage.removeItem('employerReputationAnalysis');
      }
    }
});

const stats = computed(() => {
    const total = reviews.value.length;
    const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0);
    const avg = total > 0 ? (sum / total).toFixed(1) : '0.0';
    
    // Calculate category averages
    const atmosphereCount = reviews.value.filter(r => r.checklist.atmosphere).length;
    const salaryCount = reviews.value.filter(r => r.checklist.salarySatisfaction).length;
    const scheduleCount = reviews.value.filter(r => r.checklist.scheduleAdherence).length;

    const atmosphereAvg = total > 0 ? ((atmosphereCount / total) * 5).toFixed(1) : '0.0';
    const salaryAvg = total > 0 ? ((salaryCount / total) * 5).toFixed(1) : '0.0';
    const scheduleAvg = total > 0 ? ((scheduleCount / total) * 5).toFixed(1) : '0.0';

    return {
        total,
        avg,
        details: [
            { label: '사내 분위기', score: atmosphereAvg, icon: ThumbsUp, color: 'text-blue-400', bg: 'bg-blue-400' },
            { label: '급여 만족도', score: salaryAvg, icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-400' },
            { label: '일정 준수', score: scheduleAvg, icon: Calendar, color: 'text-green-400', bg: 'bg-green-400' },
        ]
    };
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
          <h1 class="text-2xl font-bold flex items-center gap-2">
            AI 평판 분석 리포트
            <span class="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20">BETA</span>
          </h1>
          <p class="text-sm text-white/40 mt-1">프리랜서 리뷰 데이터를 AI가 분석하여 구체적인 개선 솔루션을 제안합니다.</p>
        </div>
      </div>
      <div>
           <button 
            @click="analyzeReputation"
            :disabled="isAnalyzing"
            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Cpu class="w-5 h-5" :class="{ 'animate-pulse': isAnalyzing }" />
            {{ isAnalyzing ? 'AI 분석 중...' : '지금 바로 분석하기' }}
          </button>
      </div>
    </div>


    <!-- Stats Overview Section -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <!-- Overall Rating Card -->
        <div class="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <h3 class="text-sm font-bold text-slate-400 mb-2">전체 평균 평점</h3>
            <div class="flex items-end gap-2 mb-2">
                <span class="text-4xl font-bold text-white">{{ stats.avg }}</span>
                <span class="text-lg text-slate-500 mb-1">/ 5.0</span>
            </div>
            
            <div class="mt-4 text-xs text-slate-500 font-medium bg-white/5 px-3 py-1 rounded-full">
                최근 6개월 기준
            </div>
        </div>

        <!-- Detailed Ratings -->
        <div class="md:col-span-3 bg-[#1e293b]/50 border border-white/10 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div v-for="stat in stats.details" :key="stat.label" class="flex flex-col justify-between">
                <div class="flex items-center gap-2 mb-3">
                    <component :is="stat.icon" class="w-4 h-4" :class="stat.color" />
                    <span class="text-sm text-slate-300 font-medium">{{ stat.label }}</span>
                </div>
                <div class="flex items-end justify-between mb-2">
                    <span class="text-2xl font-bold text-white">{{ stat.score }}</span>
                    <span class="text-xs text-slate-500 mb-1">점</span>
                </div>
                <div class="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div :class="`h-full rounded-full ${stat.bg}`" :style="`width: ${Number(stat.score) * 20}%`"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- 1. AI Analysis Result Section (Conditional) -->
    <div v-if="analysisResult" class="mb-12 space-y-6" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }">
        
        <!-- Summary & Score -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 bg-gradient-to-br from-indigo-900/50 to-slate-900/50 border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden">
                <div class="absolute top-0 right-0 p-3 bg-indigo-500/10 rounded-bl-2xl border-l border-b border-indigo-500/20">
                    <FileText class="w-6 h-6 text-indigo-400" />
                </div>
                <h3 class="text-lg font-bold text-indigo-100 mb-4 flex items-center gap-2">
                    <Lightbulb class="w-5 h-5 text-yellow-400" />
                    AI 총평 요약
                </h3>
                <p class="text-lg text-slate-200 leading-relaxed font-medium">
                    "{{ analysisResult.summary }}"
                </p>

            </div>

            <!-- Sentiment Score -->
             <div class="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center relative">
                <h4 class="text-sm font-bold text-slate-400 mb-4">평판 긍정 지수</h4>
                <div class="relative w-32 h-32 flex items-center justify-center">
                     <svg class="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12" fill="transparent" class="text-slate-700" />
                        <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12" fill="transparent" :class="analysisResult.sentimentMultiplier > 0.7 ? 'text-green-500' : analysisResult.sentimentMultiplier > 0.4 ? 'text-yellow-500' : 'text-red-500'" 
                         stroke-dasharray="351.86" :stroke-dashoffset="351.86 * (1 - analysisResult.sentimentMultiplier)" class="transition-all duration-1000 ease-out" />
                    </svg>
                    <span class="absolute text-3xl font-bold text-white">{{ Math.round(analysisResult.sentimentMultiplier * 100) }}점</span>
                </div>
                <div class="mt-4 text-xs text-center text-slate-500" v-if="analysisResult.sentimentMultiplier > 0.7">매우 긍정적인 평판을 유지 중입니다!</div>
                <div class="mt-4 text-xs text-center text-slate-500" v-else-if="analysisResult.sentimentMultiplier > 0.4">부분적인 개선이 필요합니다.</div>
                <div class="mt-4 text-xs text-center text-slate-500" v-else>평판 관리가 시급합니다.</div>
            </div>
        </div>

        <!-- Strengths & Weaknesses -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Strengths -->
            <div class="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-6">
                 <h3 class="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                    <TrendingUp class="w-5 h-5" />
                    강점 (Keep)
                </h3>
                <ul class="space-y-3">
                    <li v-for="(item, idx) in analysisResult.strengths" :key="idx" class="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span class="text-slate-200 text-sm">{{ item }}</span>
                    </li>
                </ul>
            </div>

            <!-- Weaknesses -->
             <div class="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-6">
                 <h3 class="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                    <TrendingDown class="w-5 h-5" />
                    약점 (Improve)
                </h3>
                <ul class="space-y-3">
                    <li v-for="(item, idx) in analysisResult.weaknesses" :key="idx" class="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <AlertTriangle class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <span class="text-slate-200 text-sm">{{ item }}</span>
                    </li>
                </ul>
            </div>
        </div>



    </div>

    <!-- Empty State / Introduction -->
    <div v-else class="text-center py-20 bg-[#1e293b]/30 rounded-3xl border border-white/5 border-dashed" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }">
         <div class="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Cpu class="w-10 h-10 text-blue-400" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-3">AI 평판 분석을 시작해보세요</h2>
        <p class="text-slate-400 max-w-lg mx-auto mb-8">
            최근 등록된 프리랜서 리뷰 데이터를 기반으로 우리 기업의 이미지를 진단하고,<br/>
            더 좋은 프리랜서와 매칭되기 위한 구체적인 개선 가이드를 제공합니다.
        </p>
        <p v-if="reviews.length < 3" class="text-yellow-400 mt-2 font-medium">
             현재 리뷰가 {{ reviews.length }}개입니다. 3개 이상부터 분석이 가능합니다.
        </p>
        <button
            @click="analyzeReputation"
            :disabled="reviews.length < 3 || isAnalyzing"
            class="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isAnalyzing ? 'AI 분석 중...' : '분석 리포트 생성하기' }}
        </button>
    </div>

  </div>
</template>
