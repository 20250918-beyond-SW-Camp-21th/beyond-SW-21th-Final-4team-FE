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
  Check,
  Edit3,
  Upload,
  Download,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { getFreelancerProfile, type FreelancerProfileDashboard } from '@/api/MyPage/freelancerApi';
import ResumeManagementPage from './components/ResumeManagementPage.vue';
import EvaluationListPage from './components/EvaluationListPage.vue';
import AccountManagementPage from './components/AccountManagementPage.vue';
import GradeCheckPage from './components/GradeCheckPage.vue';
import ProfileEditPage from './components/ProfileEditPage.vue';
import ProjectManagementPage from './components/ProjectManagementPage.vue';
import ProjectDetailModal from './components/ProjectDetailModal.vue';

const router = useRouter();
const authStore = useAuthStore();
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

// 초기값은 비어있거나 로딩 상태를 나타내는 값으로 설정
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

            // 만약 authStore의 이름/스킬을 우선하고 싶다면 여기서 덮어씌우기:
            if (currentUser.value.name) profile.value.name = currentUser.value.name;
            if (currentUser.value.skills && currentUser.value.skills.length > 0) profile.value.skills = currentUser.value.skills;

        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    } else {
        // 로그인 정보가 없을 때의 디폴트 처리 (또는 로그인 페이지 리다이렉트)
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
    switch (grade) {
        case 'Junior': return 'text-green-400 border-green-400/30 bg-green-400/10';
        case 'Middle': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
        case 'Senior': return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
        case 'Master': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
        default: return 'text-slate-400 border-white/10 bg-white/5';
    }
};

const fileInput = ref<HTMLInputElement | null>(null);

const handlePortfolioUpload = () => {
    fileInput.value?.click();
};

const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
        // Create object URL for the file
        const fileUrl = URL.createObjectURL(file);
        
        // Update profile (Mock update)
        profile.value.portfolio = {
            fileUrl: fileUrl,
            fileName: file.name,
            lastUpdated: new Date().toLocaleDateString()
        };
        
        alert('포트폴리오가 업로드되었습니다.');
    }
};

const downloadPortfolio = () => {
    if (profile.value.portfolio.fileUrl) {
        const link = document.createElement('a');
        link.href = profile.value.portfolio.fileUrl;
        link.download = profile.value.portfolio.fileName || 'portfolio.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('다운로드할 포트폴리오가 없습니다.');
    }
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
             <div class="mb-2 flex items-center justify-between">
                <div>
                    <p class="text-sm text-slate-400 mb-1">안녕하세요</p>
                    <h2 class="text-2xl font-bold text-white">
                        {{ profile.name }}님. 오늘도 프리브릿지가 응원합니다!
                    </h2>
                </div>
                <button 
                    @click="activeTab = 'edit'"
                    class="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white transition-all"
                >
                    <Edit3 class="w-4 h-4" />
                    프로필 수정하기
                </button>
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
                                <img v-if="profile.avatar" :src="profile.avatar" alt="Profile" class="w-full h-full object-cover" />
                                <div v-else class="w-full h-full flex items-center justify-center bg-slate-800">
                                     <User class="w-10 h-10 text-slate-400" />
                                </div>
                            </div>
                            <div class="space-y-3">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {{ profile.name }}
                                    <span
                                        class="text-sm font-normal px-2 py-0.5 rounded border"
                                        :class="getGradeColor(profile.grade)"
                                    >
                                        {{ profile.grade }} 등급
                                    </span>
                                </h2>
                                <div class="flex items-center gap-2 text-sm text-slate-400">
                                    <span>{{ profile.job }}</span>
                                    <span class="text-slate-600">/</span>
                                    <span>{{ profile.workConditions.type }}</span>
                                    <span class="text-slate-600">/</span>
                                    <span>총 경력 {{ profile.careerYears }}년</span>
                                </div>

                                <p class="text-sm text-slate-300 bg-white/5 p-2 rounded border border-white/5 mt-1">
                                    "{{ profile.introduction }}"
                                </p>

                                <div class="flex flex-wrap gap-2">
                                    <span v-for="skill in profile.skills.slice(0, 10)" :key="skill" class="text-xs px-2 py-1 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">
                                        {{ skill }}
                                    </span>
                                    <span v-if="profile.skills.length > 10" class="text-xs px-2 py-1 bg-white/5 text-slate-400 rounded border border-white/10">
                                        +{{ profile.skills.length - 10 }}
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
                             <div class="flex justify-between items-center text-sm">
                                <span class="text-slate-500 font-medium w-24">희망 몸값</span>
                                <div class="flex-1 flex justify-end">
                                    <span class="text-white font-bold">{{ profile.salary.toLocaleString() }}원/시간</span>
                                </div>
                            </div>
                        </div>
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
                                <div class="text-3xl font-bold text-white mb-1">{{ profile.statContact }}</div>
                                <div class="text-xs text-slate-500">접촉 수</div>
                            </div>
                            <div class="w-px h-12 bg-white/10"></div>
                            <div class="flex-1 text-center">
                                <div class="text-3xl font-bold text-blue-400 mb-1">{{ profile.statChat }}</div>
                                <div class="text-xs text-slate-500">채팅 수</div>
                            </div>
                            <div class="w-px h-12 bg-white/10"></div>
                            <div class="flex-1 text-center">
                                <div class="text-3xl font-bold text-green-400 mb-1">{{ profile.statContract }}</div>
                                <div class="text-xs text-slate-500">계약 완료</div>
                            </div>
                        </div>
                    </div>

                    <!-- Active Projects -->
                    <div
                        @click="router.push({ name: 'freelancer.contracts' })"
                        class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/20 transition-all cursor-pointer"
                    >
                        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div class="relative z-10">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-blue-100 font-semibold text-sm">진행중 프로젝트</span>
                                <ChevronRight class="text-white/60 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <div class="text-5xl font-bold text-white">{{ profile.statInteresting }}</div>
                            <div class="text-xs text-blue-100/80 mt-1">개</div>
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
                                <div class="text-5xl font-bold text-white">{{ profile.statCompleted }}</div>
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
                                <div class="text-[10px] text-slate-500 font-bold mt-1">협업 능력</div>
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
                        <button @click="handlePortfolioUpload" class="text-slate-500 hover:text-white transition-colors"><Upload class="w-4 h-4" /></button>
                    </div>
                    <div class="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4">
                        <div class="w-full bg-white/5 border border-dashed border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer">
                            <div class="flex items-center gap-3" @click="downloadPortfolio">
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
                            최근 업데이트된 포트폴리오를 다운로드하여 확인하세요.
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
</template>
