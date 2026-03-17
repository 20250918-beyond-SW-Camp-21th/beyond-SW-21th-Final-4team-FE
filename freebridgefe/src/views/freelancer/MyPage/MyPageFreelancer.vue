<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
  Users,
  Upload,
  Download,
  Eye,
  AlertTriangle,
  X,
  Edit3,
  TrendingUp,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useAlertStore } from '@/stores/alertStore';
import { useContractStore } from '@/stores/contractStore';
import { getFreelancerProfile, uploadFreelancerPortfolio, type FreelancerProfileDashboard } from '@/api/MyPage/freelancerApi';
import {
    getFreelancerReviewSummary,
    getFreelancerAiPositivityIndex,
    getFreelancerStrengthWeakness,
} from '@/api/MyPage/evaluationApi';
import ProfileIdentityAvatar from '@/components/profile/ProfileIdentityAvatar.vue';
import { getFreelancerProjectStats } from '@/api/MyPage/projectApi';
import ResumeManagementPage from './components/ResumeManagementPage.vue';
import EvaluationListPage from './components/EvaluationListPage.vue';
import AccountManagementPage from './components/AccountManagementPage.vue';
import GradeCheckPage from './components/GradeCheckPage.vue';
import ProfileEditPage from './components/ProfileEditPage.vue';
import ProjectManagementPage from './components/ProjectManagementPage.vue';
import ProjectDetailModal from './components/ProjectDetailModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const alertStore = useAlertStore();
const contractStore = useContractStore();
const currentUser = computed(() => authStore.user);

const activeTab = ref('dashboard');
const isConditionOpen = ref(false);
const isPortfolioOpen = ref(false);

const isProjectDetailOpen = ref(false);
const selectedProjectId = ref<number | null>(null);

const openProjectDetail = (projectId: number) => {
    selectedProjectId.value = projectId;
    isProjectDetailOpen.value = true;
};

const toggleRestMode = () => {
    alert('휴식 모드로 전환했습니다.');
    hideBurnoutAlert.value = true;
};

const viewRecommendedProjects = () => {
    alert('추천 프로젝트 페이지로 이동합니다.');
    hideChurnAlert.value = true;
};

const handleLegalNoticeClick = async () => {
    try {
        await contractStore.fetchContracts();
        const latestContract = [...contractStore.contractsWithDetails]
            .sort((left, right) => Number(right.contractId ?? right.id) - Number(left.contractId ?? left.id))[0];

        await router.push({
            name: 'freelancer.contracts',
            query: latestContract
                ? {
                    contractId: String(latestContract.contractId ?? latestContract.id),
                    contractTab: 'ai-advice',
                }
                : {
                    contractTab: 'ai-advice',
                },
        });
    } catch (error) {
        console.error('Failed to open freelancer legal ai guide:', error);
        alertStore.open({
            title: 'NOTICE',
            message: '법률 자문 AI 화면으로 이동하지 못했습니다.',
            type: 'error',
        });
    }
};

// 초기값 로딩 상태를 고려한 기본값 설정
const profile = ref<FreelancerProfileDashboard>({
    name: '',
    grade: '',
    avatar: null,
    job: '',
    introduction: '',
    careerYears: 0,
    salary: 0,
    workConditions: {
        type: '',
        startDate: '',
        workStyle: '',
        location: ''
    },
    skills: [],
    expertise: {
        programming: 0,
        framework: 0,
        problemSolving: 0
    },
    collaboration: {
        communication: 0,
        scheduleAdherence: 0,
        dispute: 0
    },
    averageRating: 0,
    statPending: 0,
    statContact: 0,
    statChat: 0,
    statContract: 0,
    statInteresting: 0,
    statCompleted: 0,
    portfolio: {
        fileUrl: null,
        fileName: '',
        lastUpdated: ''
    }
});

const handleProfileUpdate = (updatedData: FreelancerProfileDashboard) => {
    profile.value = updatedData;
    activeTab.value = 'dashboard';
};

onMounted(async () => {
    if (currentUser.value?.id) {
        try {
            const data = await getFreelancerProfile(currentUser.value.id);
            profile.value = data;

            // authStore 이름/스킬 우선 반영
            if (currentUser.value.name) profile.value.name = currentUser.value.name;
            if (currentUser.value.skills && currentUser.value.skills.length > 0) {
                profile.value.skills = currentUser.value.skills;
            }

            try {
                const stats = await getFreelancerProjectStats();
                profile.value.statPending = stats.appliedProjects ?? 0;
                profile.value.statInteresting = stats.inProgressProjects ?? 0;
                profile.value.statCompleted = stats.completedProjects ?? 0;
            } catch (statsError) {
                console.error('Failed to load project stats:', statsError);
            }

            try {
                const [summaryResult, positivityResult, strengthWeaknessResult] = await Promise.allSettled([
                    getFreelancerReviewSummary(),
                    getFreelancerAiPositivityIndex(),
                    getFreelancerStrengthWeakness(),
                ]);

                if (summaryResult.status === 'fulfilled') {
                    const summary = summaryResult.value;
                    profile.value.topPercentile = summary.topPercentile ?? 0;
                }

                if (
                    positivityResult.status === 'fulfilled' ||
                    strengthWeaknessResult.status === 'fulfilled'
                ) {
                    profile.value.aiSummary = {
                        positivityScore:
                            positivityResult.status === 'fulfilled'
                                ? positivityResult.value.positivityScore ?? 0
                                : 0,
                        grade:
                            positivityResult.status === 'fulfilled'
                                ? positivityResult.value.grade ?? ''
                                : '',
                        strengths:
                            strengthWeaknessResult.status === 'fulfilled'
                                ? strengthWeaknessResult.value.strengths ?? []
                                : [],
                        weaknesses:
                            strengthWeaknessResult.status === 'fulfilled'
                                ? strengthWeaknessResult.value.weaknesses ?? []
                                : [],
                    };
                }
            } catch (reviewError) {
                console.error('Failed to load review summary/ai data:', reviewError);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    } else {
        // 로그인 정보가 없을 때의 폴백 처리
        const data = await getFreelancerProfile('guest');
        profile.value = data;
    }
});

const menuItems = [
    { id: 'dashboard', label: '프로필 관리', icon: User, action: () => activeTab.value = 'dashboard' },
    { id: 'projects', label: '프로젝트', icon: Briefcase, action: () => activeTab.value = 'projects' },
    // { id: 'contracts', label: '정산 프로젝트', icon: CreditCard, action: () => router.push({ name: 'freelancer.contracts' }) }, // Removed as per request to consolidate
    { id: 'resume', label: '이력서 관리', icon: FileText, action: () => activeTab.value = 'resume' },
    { id: 'evaluation', label: '고용주 평가', icon: Award, action: () => activeTab.value = 'evaluation' },
    { id: 'gradecheck', label: '회원 등급 조회', icon: CheckCircle, action: () => activeTab.value = 'gradecheck' },
    { id: 'account', label: '내 계정 관리', icon: Settings, action: () => activeTab.value = 'account' },
];

const getGradeColor = (grade: string) => {
    const normalized = (grade ?? '').trim().toUpperCase();
    switch (normalized) {
        case 'BEGINNER':
        case 'JUNIOR':
        case '주니어':
            return 'text-emerald-300 border-emerald-300/30 bg-emerald-400/12';
        case 'INTERMEDIATE':
        case 'MIDDLE':
        case '미들':
            return 'text-sky-300 border-sky-300/30 bg-sky-400/12';
        case 'ADVANCED':
        case 'SENIOR':
        case '시니어':
            return 'text-violet-300 border-violet-300/30 bg-violet-400/12';
        case 'EXPERT':
        case 'MASTER':
        case '마스터':
            return 'text-amber-300 border-amber-300/30 bg-amber-400/12';
        default:
            return 'text-slate-300 border-white/10 bg-white/5';
    }
};

const fileInput = ref<HTMLInputElement | null>(null);
const isPortfolioUploading = ref(false);

const handlePortfolioUpload = () => {
    fileInput.value?.click();
};

const onFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
        try {
            isPortfolioUploading.value = true;
            const uploaded = await uploadFreelancerPortfolio(file);
            profile.value.portfolio = {
                fileUrl: uploaded.fileUrl,
                fileName: uploaded.fileName || file.name,
                lastUpdated: uploaded.lastUpdated || new Date().toLocaleDateString(),
            };
            alert('포트폴리오가 업로드되었습니다.');
        } catch (error) {
            console.error('Failed to upload portfolio:', error);
            alert('포트폴리오 업로드에 실패했습니다.');
        } finally {
            isPortfolioUploading.value = false;
            target.value = '';
        }
    }
};

const viewPortfolio = () => {
    const fileUrl = profile.value.portfolio.fileUrl;
    const isValid = fileUrl && typeof fileUrl === 'string' && fileUrl.trim() !== '' && fileUrl !== '#';

    if (isValid) {
        window.open(fileUrl, '_blank');
    } else {
        alert('확인할 포트폴리오가 없습니다.');
    }
};

const downloadPortfolio = () => {
    const fileUrl = profile.value.portfolio.fileUrl;
    const isValid = fileUrl && typeof fileUrl === 'string' && fileUrl.trim() !== '' && fileUrl !== '#';

    if (isValid) {
        const link = document.createElement('a');
        link.href = fileUrl!;
        link.download = profile.value.portfolio.fileName || 'portfolio.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('다운로드할 포트폴리오가 없습니다.');
    }
};
const hideRateBumpAlert = ref(false);
const hideBurnoutAlert = ref(false);
const hideChurnAlert = ref(false);
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
    <div class="flex flex-col lg:flex-row h-full overflow-hidden lg:relative">
    <!-- Sidebar -->
    <aside class="hidden lg:flex fixed top-20 left-0 z-30 h-[calc(100vh-80px)] w-[17.5rem] flex-col bg-white/5 backdrop-blur-2xl border-r border-white/5 shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]">
        <div class="px-6 pt-8 pb-6 border-b border-white/5">
            <h1 class="text-xl font-semibold tracking-tight text-white cursor-pointer" @click="activeTab = 'dashboard'">마이페이지</h1>
            <p class="mt-2 text-xs text-white/45 leading-relaxed">프로필과 프로젝트, 계정 정보를 한 곳에서 관리합니다.</p>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <button
                v-for="item in menuItems"
                :key="item.id"
                @click="item.action ? item.action() : null"
                class="w-full flex items-center justify-between px-4 py-3 text-sm transition-all duration-200 rounded-2xl border"
                :class="activeTab === item.id ? 'text-white font-semibold bg-white/10 border-white/10 shadow-[0_12px_30px_-22px_rgba(255,255,255,0.18)]' : 'text-slate-300 border-transparent hover:text-white hover:bg-white/[0.06] hover:border-white/6'"
            >
                <div class="flex items-center gap-3">
                    <component :is="item.icon" class="w-4 h-4" />
                    <span>{{ item.label }}</span>
                </div>
                <div v-if="activeTab === item.id" class="w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.45)]" />
            </button>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto lg:pl-[17.5rem]">
        <div v-if="activeTab === 'dashboard'" class="p-8 max-w-7xl mx-auto space-y-8" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }">
             <!-- Greeting Header -->
             <div class="pointer-events-none relative mb-2 flex select-none items-center justify-between overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(191,219,254,0.08),rgba(255,255,255,0.04))] px-7 py-6 shadow-[0_30px_80px_-52px_rgba(15,23,42,0.85)] backdrop-blur-2xl transition-none">
                <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(191,219,254,0.16),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.08),transparent_32%)]"></div>
                <div class="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <div>
                    <p class="text-xs text-white/50 mb-1 tracking-widest uppercase">Welcome</p>
                    <h2 class="text-2xl font-bold text-white">
                        {{ profile.name }}님, 오늘도 프리브릿지가 응원합니다.
                    </h2>
                    <p class="text-sm text-white/50 mt-1">프로필을 최신 상태로 유지하면 추천 정확도가 올라갑니다.</p>
                </div>
            </div>

            <!-- CRM Banners -->
            <div class="space-y-4 mb-8">
                <!-- 1. Rate Bump Alert -->
                <div v-if="profile.crmAlerts?.isRateBumpEligible && !hideRateBumpAlert" class="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
                    <div class="flex items-center gap-4">
                        <div class="p-2 bg-emerald-500/20 rounded-full shrink-0">
                            <TrendingUp class="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">월급 인상 최적기입니다!</h4>
                            <p class="text-slate-300 text-xs mt-1 leading-relaxed">최근 3개 프로젝트에서 좋은 고용주 평가를 받으셨습니다. 이번 기회에 희망 월급을 10~15% 상향 조정해보세요.</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <button @click="activeTab = 'edit'" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-emerald-900/20">월급 수정하러 가기</button>
                        <button @click="hideRateBumpAlert = true" class="text-slate-400 hover:text-white transition-colors p-1"><X class="w-4 h-4" /></button>
                    </div>
                </div>

                <!-- 2. Burnout Alert -->
                <div v-if="profile.crmAlerts?.isBurnoutWarning && !hideBurnoutAlert" class="bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
                    <div class="flex items-center gap-4">
                        <div class="p-2 bg-orange-500/20 rounded-full shrink-0">
                            <AlertTriangle class="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">휴식이 필요한 시점입니다.</h4>
                            <p class="text-slate-300 text-xs mt-1 leading-relaxed">최근 프로젝트 일정이 매우 타이트합니다. 컨디션 관리를 위해 잠시 휴식하는 것을 권장합니다.</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <button @click="toggleRestMode" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/10 transition-colors">휴식 모드 전환</button>
                         <button @click="hideBurnoutAlert = true" class="text-slate-400 hover:text-white transition-colors p-1"><X class="w-4 h-4" /></button>
                    </div>
                </div>

                 <!-- 3. Churn Alert (Encouragement) -->
                 <div v-if="profile.crmAlerts?.isChurnWarning && !hideChurnAlert" class="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
                    <div class="flex items-center gap-4">
                        <div class="p-2 bg-indigo-500/20 rounded-full shrink-0">
                            <Briefcase class="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">포기하지 마세요! 딱 맞는 프로젝트가 기다리고 있습니다.</h4>
                            <p class="text-slate-300 text-xs mt-1 leading-relaxed">최근 지원 결과가 아쉬우셨나요? 프리브릿지 AI가 {{ profile.name }}님의 전문성에 꼭 맞는 추천 프로젝트를 준비했습니다.</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <button @click="viewRecommendedProjects" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-900/20">추천 프로젝트 보기</button>
                         <button @click="hideChurnAlert = true" class="text-slate-400 hover:text-white transition-colors p-1"><X class="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            <!-- Profile Summary Card -->
            <div class="relative mt-8">
                <div class="bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl shadow-[0_30px_90px_-60px_rgba(255,255,255,0.35)] overflow-visible relative">
                    <div class="flex flex-col md:flex-row gap-8 p-8">
                        <div class="w-full md:w-[34%] flex flex-col items-center text-center">
                            <ProfileIdentityAvatar
                                :image-url="profile.avatar"
                                :label="profile.name"
                                variant="freelancer"
                                shape="circle"
                                size-class="w-28 h-28"
                                text-class="text-4xl font-bold"
                                ring-class="border-2 border-white/20 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]"
                            />

                            <h2 class="text-xl md:text-2xl font-semibold tracking-tight mt-5 mb-2 text-white">{{ profile.name }}</h2>
                            <div
                                class="mb-5 inline-flex items-center gap-2 rounded-full border backdrop-blur-xl px-3 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                                :class="getGradeColor(profile.grade)"
                            >
                                <Award class="w-3.5 h-3.5" />
                                <span class="text-[10px] tracking-[0.14em] uppercase">Grade</span>
                                <span class="text-xs font-semibold">{{ profile.grade }}</span>
                            </div>

                            <div class="w-full flex flex-wrap items-center justify-center gap-2 text-sm text-slate-300">
                                <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
                                    <span class="text-white/40">•</span>
                                    직무 <strong class="text-white">{{ profile.job }}</strong>
                                </span>
                                <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
                                    <span class="text-white/40">•</span>
                                    선호 작업 <strong class="text-white">{{ profile.workConditions.type }}</strong>
                                </span>
                                <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
                                    <span class="text-white/40">•</span>
                                    총 경력 <strong class="text-white">{{ profile.careerYears }}년</strong>
                                </span>
                            </div>
                        </div>

                        <div class="w-full md:w-[66%] space-y-6">
                            <div class="flex items-start justify-between mb-4">
                                <h3 class="text-base md:text-lg font-semibold flex items-center gap-2 text-white">
                                    <User class="w-5 h-5 text-white/70" />
                                    기본 정보
                                </h3>
                                <div class="flex items-center gap-2">
                                    <button 
                                        @click="activeTab = 'edit'"
                                        class="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/85 shadow-[0_18px_40px_-26px_rgba(255,255,255,0.25)] transition-colors hover:bg-white/18 hover:text-white"
                                    >
                                        <Edit3 class="w-3.5 h-3.5" />
                                        프로필 수정하기
                                    </button>
                                    <button
                                        @click="activeTab = 'account'"
                                        class="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
                                    >
                                        <Settings class="w-3 h-3" />
                                        내 계정 관리
                                    </button>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-4">
                                    <div class="group">
                                        <label class="text-[11px] text-slate-500 mb-1 block">프리랜서 유형</label>
                                        <div class="flex items-center gap-2 text-sm text-white">
                                            <Briefcase class="w-4 h-4 text-slate-400" />
                                            {{ profile.workConditions.type }}
                                        </div>
                                    </div>
                                    <div class="group">
                                        <label class="text-[11px] text-slate-500 mb-1 block">업무 시작 가능일</label>
                                        <div class="flex items-center gap-2 text-sm text-white">
                                            <CheckCircle class="w-4 h-4 text-slate-400" />
                                            {{ profile.workConditions.startDate }}
                                        </div>
                                    </div>
                                    <div class="group">
                                        <label class="text-[11px] text-slate-500 mb-1 block">근무 형태</label>
                                        <div class="flex items-center gap-2 text-sm text-white">
                                            <CreditCard class="w-4 h-4 text-slate-400" />
                                            {{ profile.workConditions.workStyle }}
                                        </div>
                                    </div>
                                    <div class="group">
                                        <label class="text-[11px] text-slate-500 mb-1 block">근무 지역</label>
                                        <div class="flex items-center gap-2 text-sm text-white">
                                            <Settings class="w-4 h-4 text-slate-400" />
                                            {{ profile.workConditions.location }}
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-4">
                                    <div class="group">
                                        <label class="text-[11px] text-slate-500 mb-1 block">희망 월급</label>
                                        <div class="flex items-center gap-2 text-sm text-white">
                                            <Award class="w-4 h-4 text-slate-400" />
                                            {{ profile.salary.toLocaleString() }}만원/월
                                        </div>
                                    </div>
                                    <div class="group">
                                        <label class="text-[11px] text-slate-500 mb-1 block">자기 소개</label>
                                        <p class="text-xs text-slate-300 bg-white/5 p-3 rounded-2xl border border-white/10 leading-relaxed">
                                            {{ profile.introduction }}
                                        </p>
                                    </div>
                                    <div class="group">
                                        <label class="text-[11px] text-slate-500 mb-2 block">기술 스택</label>
                                        <div class="flex flex-wrap gap-2">
                                            <span v-for="skill in profile.skills.slice(0, 10)" :key="skill" class="text-xs px-2.5 py-1 bg-white/5 text-slate-200 rounded-full border border-white/10">
                                                {{ skill }}
                                            </span>
                                            <span v-if="profile.skills.length > 10" class="text-xs px-2.5 py-1 bg-white/5 text-slate-400 rounded-full border border-white/10">
                                                +{{ profile.skills.length - 10 }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- My Project Status Section -->
            <div class="mb-8 grid grid-cols-1 xl:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] gap-6 items-stretch">
                <div>
                    <div class="flex items-center gap-3 mb-6">
                        <h3 class="text-base md:text-lg font-semibold text-white flex items-center gap-2">
                            <Briefcase class="w-5 h-5 text-white/70" />
                            나의 프로젝트 현황
                        </h3>
                        <button
                            @click="router.push({ name: 'freelancer.applications' })"
                            class="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
                        >
                            전체보기 <ChevronRight class="w-4 h-4" />
                        </button>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <!-- Applied / Proposed Projects -->
                        <div
                            @click="activeTab = 'projects'"
                            @keydown.enter="activeTab = 'projects'"
                            @keydown.space.prevent="activeTab = 'projects'"
                            role="button"
                            tabindex="0"
                            class="bg-blue-500/10 rounded-3xl p-4 h-[206px] border border-blue-400/20 backdrop-blur-xl shadow-[0_20px_60px_-40px_rgba(59,130,246,0.35)] relative overflow-hidden group cursor-pointer hover:bg-blue-500/15 hover:border-blue-300/30 transition-all flex flex-col justify-between"
                        >
                            <div class="relative z-10">
                                <div class="flex items-start justify-between mb-5">
                                    <h4 class="text-sm font-semibold text-blue-200 flex items-center gap-2">
                                        <Briefcase class="w-4 h-4" />
                                        지원/제안 프로젝트
                                    </h4>
                                    <ChevronRight class="text-blue-200/80 w-5 h-5" />
                                </div>
                                <div class="mt-auto">
                                    <div class="text-5xl leading-none font-bold text-white">{{ profile.statPending }}<span class="ml-0.5 text-xl font-semibold text-blue-200/90">건</span></div>
                                </div>
                            </div>
                        </div>

                        <!-- Active Projects -->
                        <div
                            @click="activeTab = 'projects'"
                            @keydown.enter="activeTab = 'projects'"
                            @keydown.space.prevent="activeTab = 'projects'"
                            role="button"
                            tabindex="0"
                            class="bg-rose-500/10 rounded-3xl p-4 h-[206px] border border-rose-400/20 backdrop-blur-xl shadow-[0_20px_60px_-40px_rgba(244,63,94,0.35)] relative overflow-hidden group hover:bg-rose-500/15 hover:border-rose-300/30 transition-all cursor-pointer flex flex-col justify-between"
                        >
                            <div class="relative z-10">
                                <div class="flex items-start justify-between mb-5">
                                    <span class="text-rose-200 font-semibold text-sm">진행중인 프로젝트</span>
                                    <ChevronRight class="text-rose-200/80 w-5 h-5" />
                                </div>
                                <div class="mt-auto text-5xl leading-none font-bold text-white">{{ profile.statInteresting }}<span class="ml-0.5 text-xl font-semibold text-rose-200/90">건</span></div>
                            </div>
                        </div>

                        <!-- Completed Projects -->
                        <div
                            @click="activeTab = 'projects'"
                            @keydown.enter="activeTab = 'projects'"
                            @keydown.space.prevent="activeTab = 'projects'"
                            role="button"
                            tabindex="0"
                            class="bg-emerald-500/10 rounded-3xl p-4 h-[206px] border border-emerald-400/20 backdrop-blur-xl shadow-[0_20px_60px_-40px_rgba(16,185,129,0.35)] relative overflow-hidden group hover:bg-emerald-500/15 hover:border-emerald-300/30 transition-all cursor-pointer flex flex-col justify-between"
                        >
                            <div class="relative z-10">
                                <div class="flex items-start justify-between mb-5">
                                    <span class="text-emerald-200 font-semibold text-sm flex items-center gap-2">
                                        <CheckCircle class="w-4 h-4" />
                                        프로젝트 종료
                                    </span>
                                    <ChevronRight class="text-emerald-200/80 w-5 h-5" />
                                </div>
                                <div class="mt-auto text-5xl leading-none font-bold text-white">{{ profile.statCompleted }}<span class="ml-0.5 text-xl font-semibold text-emerald-200/90">건</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-700/60 border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center h-[206px] shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur xl:mt-[3.25rem]">
                    <div class="relative z-10 w-full h-full flex flex-col justify-between">
                        <div class="inline-flex items-center gap-2 mb-2">
                            <span class="text-[10px] tracking-[0.2em] font-semibold text-slate-300 inline-block">NOTICE</span>
                            <span class="px-2 py-1 rounded-full bg-white/8 border border-white/10 text-[10px] font-semibold text-slate-200">LEGAL AI AGENT</span>
                        </div>
                        <div>
                            <h4 class="font-semibold text-white text-base leading-snug mb-2">계약 전 확인이 필요할 때<br/>법률 자문 AI Agent 제공</h4>
                        </div>
                        <p class="text-[11px] leading-relaxed text-slate-300/80">계약 조항 점검과 리스크 확인을<br/>AI Agent로 빠르게 도와드립니다.</p>
                        <button
                            type="button"
                            @click="handleLegalNoticeClick"
                            class="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-2 text-[11px] font-semibold text-slate-200 transition-colors hover:bg-white/12 hover:text-white"
                        >
                            자세히 보기 <ArrowRight class="w-3 h-3" />
                        </button>
                    </div>
                    <div class="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                    <div class="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                </div>
            </div>

            <!-- Grids -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Evaluation -->
                <div class="bg-[#1e293b]/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm h-full flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                        <h4 class="font-bold text-base text-white">고용주 평가</h4>
                        <button @click="activeTab = 'evaluation'" class="text-slate-500 hover:text-white transition-colors"><Plus class="w-4 h-4" /></button>
                    </div>
                    <div class="flex gap-4 mb-4 flex-1">
                        <div class="w-24 h-24 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 flex-col gap-1">
                            <div class="text-xs text-slate-500">평균 평점</div>
                            <div class="text-2xl font-bold text-white">{{ profile.averageRating.toFixed(1) }}</div>
                            <!-- Dynamic Star Rating -->
                            <div class="relative w-16 h-3 bg-slate-700 rounded-sm overflow-hidden">
                                <div class="absolute top-0 left-0 h-full bg-yellow-400" :style="{ width: `${(profile.averageRating / 5) * 100}%` }"></div>
                                <div class="absolute top-0 left-0 w-full h-full flex justify-between px-[1px]">
                                    <div class="w-[1px] h-full bg-slate-900/30"></div>
                                    <div class="w-[1px] h-full bg-slate-900/30"></div>
                                    <div class="w-[1px] h-full bg-slate-900/30"></div>
                                    <div class="w-[1px] h-full bg-slate-900/30"></div>
                                </div>
                            </div>
                        </div>
                        <div class="flex-1 space-y-3 text-xs justify-center flex flex-col pl-2">
                            <!-- Expertize -->
                            <div class="space-y-1.5">
                                <div class="text-[10px] text-slate-500 font-bold">전문성</div>
                                <div class="flex items-center gap-2">
                                    <span class="text-slate-400 w-20">프로그래밍</span>
                                    <div class="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                                        <div class="bg-purple-500 h-full" :style="{ width: `${(profile.expertise.programming / 5) * 100}%` }"></div>
                                    </div>
                                    <span class="text-white font-bold w-6 text-right">{{ profile.expertise.programming.toFixed(1) }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-slate-400 w-20">프레임워크</span>
                                    <div class="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                                        <div class="bg-purple-500 h-full" :style="{ width: `${(profile.expertise.framework / 5) * 100}%` }"></div>
                                    </div>
                                    <span class="text-white font-bold w-6 text-right">{{ profile.expertise.framework.toFixed(1) }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-slate-400 w-20">문제해결</span>
                                    <div class="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                                        <div class="bg-purple-500 h-full" :style="{ width: `${(profile.expertise.problemSolving / 5) * 100}%` }"></div>
                                    </div>
                                    <span class="text-white font-bold w-6 text-right">{{ profile.expertise.problemSolving.toFixed(1) }}</span>
                                </div>
                            </div>

                            <!-- Collaboration -->
                            <div class="space-y-1.5">
                                <div class="text-[10px] text-slate-500 font-bold mt-1">협업 역량</div>
                                <div class="flex items-center gap-2">
                                    <span class="text-slate-400 w-20">의사소통</span>
                                    <div class="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                                        <div class="bg-blue-500 h-full" :style="{ width: `${(profile.collaboration.communication / 5) * 100}%` }"></div>
                                    </div>
                                    <span class="text-white font-bold w-6 text-right">{{ profile.collaboration.communication.toFixed(1) }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-slate-400 w-20">일정준수</span>
                                    <div class="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                                        <div class="bg-blue-500 h-full" :style="{ width: `${(profile.collaboration.scheduleAdherence / 5) * 100}%` }"></div>
                                    </div>
                                    <span class="text-white font-bold w-6 text-right">{{ profile.collaboration.scheduleAdherence.toFixed(1) }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-slate-400 w-20">분쟁관리</span>
                                    <div class="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                                        <div class="bg-blue-500 h-full" :style="{ width: `${(profile.collaboration.dispute / 5) * 100}%` }"></div>
                                    </div>
                                    <span class="text-white font-bold w-6 text-right">{{ profile.collaboration.dispute.toFixed(1) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resume/Portfolio -->
                <div class="bg-[#1e293b]/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm h-full flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                        <h4 class="font-bold text-base text-white">포트폴리오</h4>
                        <input 
                            type="file" 
                            ref="fileInput" 
                            class="hidden" 
                            accept=".pdf"
                            @change="onFileChange"
                        />
                        <div class="flex items-center gap-2">
                            <button
                                @click="viewPortfolio"
                                class="text-slate-500 hover:text-white transition-colors"
                                title="보기"
                            >
                                <Eye class="w-4 h-4" />
                            </button>
                            <button
                                @click="downloadPortfolio"
                                class="text-slate-500 hover:text-white transition-colors"
                                title="다운로드"
                            >
                                <Download class="w-4 h-4" />
                            </button>
                            <button
                                @click="handlePortfolioUpload"
                                class="text-slate-500 hover:text-white transition-colors"
                                :disabled="isPortfolioUploading"
                                title="업로드"
                            >
                                <Upload class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4">
                        <div class="w-full bg-white/5 border border-dashed border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer">
                            <div class="flex items-center gap-3" @click="viewPortfolio">
                                <div class="w-10 h-10 bg-red-400/20 rounded-lg flex items-center justify-center text-red-400">
                                    <FileText class="w-5 h-5" />
                                </div>
                                <div class="text-left">
                                    <div class="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{{ profile.portfolio?.fileName || '포트폴리오 없음' }}</div>
                                    <div class="text-xs text-slate-500">{{ profile.portfolio?.lastUpdated }} 업데이트</div>
                                </div>
                            </div>
                            <button @click.stop="downloadPortfolio" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-500 hover:text-white transition-all">
                                <Download class="w-4 h-4" />
                            </button>
                        </div>
                        
                        <p class="text-xs text-slate-500">
                            최신 업데이트된 포트폴리오를 다운로드해 확인하세요.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <ProfileEditPage
            v-else-if="activeTab === 'edit'"
            :profile="profile"
            @back="activeTab = 'dashboard'"
            @update="handleProfileUpdate"
        />

        <ProjectManagementPage
            v-else-if="activeTab === 'projects'"
            @back="activeTab = 'dashboard'"
            @openDetail="openProjectDetail"
        />

        <ResumeManagementPage
            v-else-if="activeTab === 'resume'"
            @back="activeTab = 'dashboard'"
        />

        <EvaluationListPage
            v-else-if="activeTab === 'evaluation'"
            :profile="profile"
            @back="activeTab = 'dashboard'"
        />

        <GradeCheckPage
            v-else-if="activeTab === 'gradecheck'"
            :existingGrade="profile.grade"
            @back="activeTab = 'dashboard'"
        />

        <AccountManagementPage
            v-else-if="activeTab === 'account'"
            @back="activeTab = 'dashboard'"
        />

        <ProjectDetailModal
            :is-open="isProjectDetailOpen"
            :project-id="selectedProjectId"
            @close="isProjectDetailOpen = false"
        />

    </main>
    </div>
  </div>
</template>








