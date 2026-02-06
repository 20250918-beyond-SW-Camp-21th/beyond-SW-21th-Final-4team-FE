<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMotion } from '@vueuse/motion';
import {
  User,
  Settings,
  FileText,
  Briefcase,
  MessageSquare,
  ChevronRight,
  CheckCircle,
  Award,
  CreditCard,
  Plus,
  Upload,
  Calendar,
  Users,
  Check,
  Edit3,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import ResumeManagementPage from './components/ResumeManagementPage.vue';
import CompanyEvaluationSummary from './components/CompanyEvaluationSummary.vue';
import AccountManagementPage from './components/AccountManagementPage.vue';
import GradeCheckPage from './components/GradeCheckPage.vue';
import OneOnOneInquiryModal from './components/OneOnOneInquiryModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const currentUser = computed(() => authStore.user);

const activeTab = ref('dashboard');
const isConditionOpen = ref(false); // Simplified: toggle editing mode or modal
const isPortfolioOpen = ref(false);
const isInquiryOpen = ref(false);

const profile = ref({
    name: currentUser.value?.name || 'Freelancer',
    grade: 'Master',
    avatar: null,
    workConditions: {
        type: '개인',
        startDate: '2024-02-01',
        workStyle: '원격',
        location: '서울'
    },
    skills: currentUser.value?.skills || ['React', 'Vue.js', 'TypeScript'],
    expertise: 4.8,
    communication: 4.7,
    scheduleAdherence: 4.9,
    averageRating: 4.8,
    statApply: 12,
    statInterview: 3,
    statPass: 1,
    statInteresting: 5
});

const menuItems = [
    { id: 'dashboard', label: '프로필 관리', icon: User, action: () => activeTab.value = 'dashboard' },
    { id: 'projects', label: '프로젝트 지원현황', icon: Briefcase, action: () => router.push({ name: 'freelancer.applications' }) },
    { id: 'contracts', label: '정산 프로젝트', icon: CreditCard, action: () => router.push({ name: 'freelancer.contracts' }) },
    { id: 'resume', label: '이력서 관리', icon: FileText, action: () => activeTab.value = 'resume' },
    { id: 'evaluation', label: '고용주 평가', icon: Award, action: () => activeTab.value = 'evaluation' },
    { id: 'gradecheck', label: '회원 등급 조회', icon: CheckCircle, action: () => activeTab.value = 'gradecheck' },
    { id: 'inquiry', label: '1:1 문의', icon: MessageSquare, action: () => isInquiryOpen.value = true },
    { id: 'account', label: '내 계정 관리', icon: Settings, action: () => activeTab.value = 'account' },
];

const handlePortfolioUpload = () => {
    alert('포트폴리오 업로드 완료!');
    isPortfolioOpen.value = false;
};
</script>

<template>
  <div class="flex min-h-screen bg-slate-900 text-white font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-[#0B1120] border-r border-white/10 flex-shrink-0 flex flex-col pt-8 hidden lg:flex">
        <div class="px-6 mb-8">
            <h1 class="text-xl font-bold text-white cursor-pointer" @click="activeTab = 'dashboard'">마이페이지</h1>
        </div>

        <nav class="flex-1 px-4 space-y-1">
            <button
                v-for="item in menuItems"
                :key="item.id"
                @click="item.action ? item.action() : null"
                class="w-full flex items-center justify-between px-4 py-2 text-sm transition-all duration-200 rounded-lg"
                :class="activeTab === item.id ? 'text-blue-400 font-bold bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'"
            >
                <div class="flex items-center gap-3">
                    <component :is="item.icon" class="w-4 h-4" />
                    <span>{{ item.label }}</span>
                </div>
                <div v-if="activeTab === item.id" class="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </button>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto bg-slate-900">
        <div v-if="activeTab === 'dashboard'" class="p-8 max-w-7xl mx-auto space-y-8" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }">
             <!-- Greeting Header -->
             <div class="mb-2" data-tour="freelancer-mypage-header">
                <p class="text-sm text-slate-400 mb-1">안녕하세요</p>
                <h2 class="text-2xl font-bold text-white">
                    {{ profile.name }}님. 오늘도 프리브릿지가 응원합니다!
                </h2>
            </div>

            <!-- Profile Summary Card -->
            <div class="relative mt-8">
                <div class="absolute -top-4 right-8 bg-[#FF6B6B] text-white text-[11px] px-3 py-1.5 rounded-full font-bold shadow-lg z-20 flex items-center justify-center after:content-[''] after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:border-t-[6px] after:border-t-[#FF6B6B] after:border-x-[6px] after:border-x-transparent">
                    최종 업데이트 {{ new Date().toLocaleDateString() }}
                </div>

                <div class="bg-[#1e293b]/50 rounded-2xl border border-white/10 backdrop-blur-sm shadow-sm overflow-visible relative group">
                    <div class="flex flex-col md:flex-row p-8 pb-6 gap-8 relative">
                        <!-- Left: Avatar & Basic Info -->
                        <div class="flex items-center gap-6 flex-1">
                            <div class="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-[#E2E8F0] border-2 border-white/10 relative group-avatar cursor-pointer">
                                <div class="w-full h-full flex items-center justify-center bg-slate-800">
                                     <User class="w-10 h-10 text-slate-400" />
                                </div>
                            </div>
                            <div class="space-y-3">
                                <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                                    {{ profile.name }}
                                    <span class="text-sm font-normal text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                        {{ profile.grade }}
                                    </span>
                                </h2>
                                <div class="flex items-center gap-2 text-sm text-slate-400">
                                    <span>개발자</span>
                                    <span class="text-slate-600">/</span>
                                    <span>{{ profile.workConditions.type }}</span>
                                    <span class="text-slate-600">/</span>
                                    <span>총 경력 5년</span>
                                </div>

                                <div class="flex flex-wrap gap-2">
                                    <span v-for="skill in profile.skills.slice(0, 3)" :key="skill" class="text-xs px-2 py-1 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">
                                        {{ skill }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Detailed Conditions -->
                        <div class="flex-1 md:border-l border-white/10 md:pl-12 flex flex-col justify-center space-y-4 pt-8 md:pt-2">
                            <div class="flex justify-between items-center text-sm">
                                <span class="text-slate-500 font-medium w-24">프리랜서 유형</span>
                                <div class="flex-1 flex justify-end">
                                    <span class="font-bold text-white">{{ profile.workConditions.type }}</span>
                                </div>
                            </div>
                            <div class="flex justify-between items-center text-sm">
                                <span class="text-slate-500 font-medium w-24">업무 시작 가능일</span>
                                <div class="flex-1 flex justify-end items-center gap-2">
                                    <span class="font-bold text-white">{{ profile.workConditions.startDate }}</span>
                                </div>
                            </div>
                             <div class="flex justify-between items-center text-sm">
                                <span class="text-slate-500 font-medium w-24">희망 근무형태</span>
                                <div class="flex-1 flex justify-end">
                                    <span class="text-white font-bold">{{ profile.workConditions.workStyle }}</span>
                                </div>
                            </div>
                             <div class="flex justify-between items-center text-sm">
                                <span class="text-slate-500 font-medium w-24">희망 근무지</span>
                                <div class="flex-1 flex justify-end">
                                    <span class="text-white font-bold">{{ profile.workConditions.location }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                     <div class="bg-[#0F172A]/50 border-t border-white/5 py-3 px-6 rounded-b-2xl flex justify-center items-center">
                        <button class="text-xs text-slate-400 flex items-center gap-1 group">
                            최신 업데이트 프로필로 정확한 추천 정보를 받으세요!
                            <span class="font-bold text-white underline underline-offset-2 ml-1 decoration-slate-500 group-hover:decoration-white transition-all">
                                프로필 업데이트하기
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- My Status Section -->
            <div class="mb-8">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                        <div class="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                        나의 현황
                    </h3>
                    <button
                        @click="router.push({ name: 'freelancer.applications' })"
                        class="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        전체보기 <ChevronRight class="w-4 h-4" />
                    </button>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <!-- Application Stats -->
                    <div class="bg-gradient-to-br from-[#1e293b]/80 to-[#0F172A]/80 rounded-2xl p-6 border border-white/10 backdrop-blur-sm shadow-lg">
                        <h4 class="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                            <Briefcase class="w-4 h-4" />
                            지원 현황
                        </h4>
                        <div class="flex items-center justify-between">
                            <div class="flex-1 text-center">
                                <div class="text-3xl font-bold text-white mb-1">{{ profile.statApply }}</div>
                                <div class="text-xs text-slate-500">지원완료</div>
                            </div>
                            <div class="w-px h-12 bg-white/10"></div>
                            <div class="flex-1 text-center">
                                <div class="text-3xl font-bold text-blue-400 mb-1">{{ profile.statInterview }}</div>
                                <div class="text-xs text-slate-500">인터뷰요청</div>
                            </div>
                            <div class="w-px h-12 bg-white/10"></div>
                            <div class="flex-1 text-center">
                                <div class="text-3xl font-bold text-green-400 mb-1">{{ profile.statPass }}</div>
                                <div class="text-xs text-slate-500">최종합격</div>
                            </div>
                        </div>
                    </div>

                    <!-- Active Projects -->
                    <div
                        @click="router.push({ name: 'freelancer.contracts' })"
                        class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 relative overflow-hidden group hover:shadow-xl hover:shadow-orange-500/20 transition-all cursor-pointer"
                    >
                        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div class="relative z-10">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-orange-100 font-semibold text-sm">진행중 프로젝트</span>
                                <ChevronRight class="text-white/60 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <div class="text-5xl font-bold text-white">{{ profile.statInteresting }}</div>
                            <div class="text-xs text-orange-100/80 mt-1">개</div>
                        </div>
                    </div>

                    <!-- Completed Projects -->
                    <div
                         @click="router.push({ name: 'freelancer.contracts' })"
                        class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all cursor-pointer"
                    >
                        <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div class="relative z-10">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-slate-400 font-semibold text-sm flex items-center gap-2">
                                    <CheckCircle class="w-4 h-4" />
                                    프로젝트 종료
                                </span>
                                <ChevronRight class="text-slate-600 w-5 h-5 group-hover:translate-x-1 group-hover:text-slate-400 transition-all" />
                            </div>
                            <div class="flex items-baseline gap-2">
                                <div class="text-5xl font-bold text-white">0</div>
                                <div class="text-xs text-slate-500">개</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Grids -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Evaluation -->
                <div class="bg-[#1e293b]/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm h-full flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                        <h4 class="font-bold text-base text-white">고용주 평가</h4>
                        <button class="text-slate-500 hover:text-white transition-colors"><Plus class="w-4 h-4" /></button>
                    </div>
                    <div class="flex gap-4 mb-4 flex-1">
                        <div class="w-24 h-24 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 flex-col gap-1">
                            <div class="text-xs text-slate-500">평균 평점</div>
                            <div class="text-2xl font-bold text-white">{{ profile.averageRating.toFixed(1) }}</div>
                            <div class="flex text-yellow-500 gap-1">
                                <Award class="w-3 h-3 fill-current" />
                                <Award class="w-3 h-3 fill-current" />
                                <Award class="w-3 h-3 fill-current" />
                            </div>
                        </div>
                        <div class="flex-1 space-y-2.5 text-xs justify-center flex flex-col">
                            <div class="flex items-center gap-2">
                                <span class="text-slate-400 w-14">전문성</span>
                                <div class="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                                    <div class="bg-purple-500 h-full" :style="{ width: `${(profile.expertise / 5) * 100}%` }"></div>
                                </div>
                                <span class="text-white font-bold text-sm w-7 text-right">{{ profile.expertise.toFixed(1) }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-slate-400 w-14">의사소통</span>
                                <div class="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                                    <div class="bg-blue-500 h-full" :style="{ width: `${(profile.communication / 5) * 100}%` }"></div>
                                </div>
                                <span class="text-white font-bold text-sm w-7 text-right">{{ profile.communication.toFixed(1) }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-slate-400 w-14">일정준수</span>
                                <div class="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                                    <div class="bg-green-500 h-full" :style="{ width: `${(profile.scheduleAdherence / 5) * 100}%` }"></div>
                                </div>
                                <span class="text-white font-bold text-sm w-7 text-right">{{ profile.scheduleAdherence.toFixed(1) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resume/Portfolio -->
                <div class="bg-[#1e293b]/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm h-full flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                        <h4 class="font-bold text-base text-white">이력서(포트폴리오)</h4>
                        <button @click="activeTab = 'resume'" class="text-slate-500 hover:text-white transition-colors"><Plus class="w-4 h-4" /></button>
                    </div>
                    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4">
                        <div class="text-sm text-slate-300 bg-white/5 px-4 py-2 rounded-lg flex items-center gap-2">
                            <FileText class="w-4 h-4 text-blue-400" />
                            등록된 이력서가 있습니다
                        </div>
                        <div class="flex gap-2">
                            <button
                                @click="activeTab = 'resume'"
                                class="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white rounded-lg font-medium text-xs transition-colors"
                            >
                                이력서 관리
                            </button>
                            <button
                                @click="isPortfolioOpen = true"
                                class="px-4 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 rounded-lg font-medium text-xs transition-colors"
                            >
                                포트폴리오 추가
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <ResumeManagementPage
            v-else-if="activeTab === 'resume'"
            @back="activeTab = 'dashboard'"
        />

        <CompanyEvaluationSummary
            v-else-if="activeTab === 'evaluation'"
            @back="activeTab = 'dashboard'"
        />

        <GradeCheckPage
            v-else-if="activeTab === 'gradecheck'"
            @back="activeTab = 'dashboard'"
        />

        <AccountManagementPage
            v-else-if="activeTab === 'account'"
            @back="activeTab = 'dashboard'"
        />
    </main>
    
    <OneOnOneInquiryModal
        v-if="isInquiryOpen"
        @close="isInquiryOpen = false"
    />

  </div>
</template>
