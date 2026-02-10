<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMotion } from '@vueuse/motion';
import {
  User,
  Briefcase,
  Users,
  Settings,
  Building2,
  FileText,
  Crown,
  CheckCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Star,
  Award,
  MessageSquare,
  X,
  ClipboardList,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';

import EmployerProfileManagement from './components/EmployerProfileManagement.vue';
import EmployerAccountManagement from './components/EmployerAccountManagement.vue';
import EmployerProjectManagement from './components/EmployerProjectManagement.vue';
import FreelancerChecklistPage from './components/FreelancerChecklistPage.vue';
import EmployerApplicantStatus from './components/EmployerApplicantStatus.vue';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('dashboard');
const isInquiryOpen = ref(false);

const employerProfile = ref({
  companyName: '테크스타트업',
  plan: 'PRO',
  industry: 'IT/소프트웨어',
  location: '서울 강남구',
  activeProjects: 3,
  totalApplicants: 45,
  contractedFreelancers: 8,
  avgRating: 4.7,
});

const menuItems = [
  { id: 'dashboard', label: '프로필 관리', icon: Building2, action: () => (activeTab.value = 'dashboard') },
  {
    id: 'applicants',
    label: '지원자 현황',
    icon: Users,
    action: () => (activeTab.value = 'applicants'),
  },
  {
    id: 'checklist',
    label: '프리랜서 체크리스트',
    icon: ClipboardList,
    action: () => (activeTab.value = 'checklist'),
  },
  {
    id: 'projects',
    label: '프로젝트 관리',
    icon: Briefcase,
    action: () => (activeTab.value = 'projects'),
  },
  {
    id: 'inquiry',
    label: '1:1 문의',
    icon: MessageSquare,
    action: () => (isInquiryOpen.value = true),
  },
  {
    id: 'account',
    label: '고용주 계정 관리',
    icon: Settings,
    action: () => (activeTab.value = 'account'),
  },
];

const handleNavigate = (path: string) => {
    if (path === 'dashboard') {
        activeTab.value = 'dashboard';
    } else if (path === 'applications') {
        activeTab.value = 'applicants';
    }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
    <div class="flex h-[calc(100vh-80px)] overflow-hidden">
      <!-- Sidebar -->
      <div
        class="w-64 bg-[#0f172a]/80 backdrop-blur-xl border-r border-white/10 flex flex-col"
        v-motion
        :initial="{ x: -300 }"
        :enter="{ x: 0 }"
      >
        <div class="p-6 border-b border-white/10">
          <h1 class="text-xl font-bold">마이페이지</h1>
        </div>

        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            v-for="item in menuItems"
            :key="item.id"
            @click="
              () => {
                if (['dashboard', 'profile', 'applicants', 'checklist', 'projects', 'account'].includes(item.id)) {
                  activeTab = item.id;
                } else {
                  item.action();
                }
              }
            "
            class="w-full flex items-center justify-between px-4 py-2 text-sm transition-all duration-200"
            :class="
              activeTab === item.id
                ? 'text-blue-400 font-bold bg-white/5 rounded-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5 rounded-lg'
            "
          >
            <div class="flex items-center gap-3">
              <component :is="item.icon" class="w-4 h-4" />
              <span>{{ item.label }}</span>
            </div>
          </button>
        </nav>

        <div class="p-4 border-t border-white/10">
          <button
            @click="router.push({ name: 'employer.dashboard' })"
            class="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-8">
            <!-- Dynamic Content Rendering -->
            <EmployerProfileManagement v-if="activeTab === 'profile'" @back="activeTab = 'dashboard'" />
            <EmployerApplicantStatus v-else-if="activeTab === 'applicants'" @back="activeTab = 'dashboard'" />
            <FreelancerChecklistPage v-else-if="activeTab === 'checklist'" @back="activeTab = 'dashboard'" />
            <EmployerProjectManagement v-else-if="activeTab === 'projects'" @back="activeTab = 'dashboard'" />
            <EmployerAccountManagement v-else-if="activeTab === 'account'" @back="activeTab = 'dashboard'" />
            
            <!-- Dashboard View -->
            <div v-else-if="activeTab === 'dashboard'" class="space-y-6">
                <!-- Profile Header -->
                <div
                class="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-white/10 p-8"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0 }"
                >
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-6">
                    <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <Building2 class="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold mb-2">{{ employerProfile.companyName }}</h2>
                        <div class="flex items-center gap-4 text-sm text-slate-300">
                        <span class="flex items-center gap-1">
                            <Briefcase class="w-4 h-4" />
                            {{ employerProfile.industry }}
                        </span>
                        <span class="flex items-center gap-1">
                            <Building2 class="w-4 h-4" />
                            {{ employerProfile.location }}
                        </span>
                        </div>
                    </div>
                    </div>
                    <div class="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-full">
                    <Crown class="w-4 h-4 text-white" />
                    <span class="text-white font-bold text-sm">{{ employerProfile.plan }} 플랜</span>
                    </div>
                </div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                    class="bg-[#1e293b]/50 rounded-xl border border-white/10 p-6"
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
                >
                    <div class="flex items-center justify-between mb-2">
                    <span class="text-slate-400 text-sm">진행중 프로젝트</span>
                    <Briefcase class="w-5 h-5 text-blue-400" />
                    </div>
                    <div class="flex items-baseline gap-2">
                    <div class="text-3xl font-bold">{{ employerProfile.activeProjects }}</div>
                    <div class="text-xs text-slate-500">개</div>
                    </div>
                </div>

                <div
                    class="bg-[#1e293b]/50 rounded-xl border border-white/10 p-6"
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
                >
                    <div class="flex items-center justify-between mb-2">
                    <span class="text-slate-400 text-sm">총 지원자</span>
                    <Users class="w-5 h-5 text-green-400" />
                    </div>
                    <div class="flex items-baseline gap-2">
                    <div class="text-3xl font-bold">{{ employerProfile.totalApplicants }}</div>
                    <div class="text-xs text-slate-500">명</div>
                    </div>
                </div>

                <div
                    class="bg-[#1e293b]/50 rounded-xl border border-white/10 p-6"
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
                >
                    <div class="flex items-center justify-between mb-2">
                    <span class="text-slate-400 text-sm">계약 프리랜서</span>
                    <CheckCircle class="w-5 h-5 text-purple-400" />
                    </div>
                    <div class="flex items-baseline gap-2">
                    <div class="text-3xl font-bold">{{ employerProfile.contractedFreelancers }}</div>
                    <div class="text-xs text-slate-500">명</div>
                    </div>
                </div>

                <div
                    class="bg-[#1e293b]/50 rounded-xl border border-white/10 p-6"
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 0.4 } }"
                >
                    <div class="flex items-center justify-between mb-2">
                    <span class="text-slate-400 text-sm">평균 평점</span>
                    <Star class="w-5 h-5 text-yellow-400" />
                    </div>
                    <div class="flex items-baseline gap-2">
                    <div class="text-3xl font-bold">{{ employerProfile.avgRating }}</div>
                    <div class="text-xs text-slate-500">/ 5.0</div>
                    </div>
                </div>
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Left Column -->
                <div class="space-y-6">
                    <!-- Profile Update -->
                    <div class="bg-[#1e293b]/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-bold text-base">고용주 프로필</h4>
                        <button
                        @click="activeTab = 'profile'"
                        class="text-slate-500 hover:text-white transition-colors text-sm"
                        >
                        수정
                        </button>
                    </div>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                        <span class="text-slate-400">업종</span>
                        <span class="font-semibold">{{ employerProfile.industry }}</span>
                        </div>
                        <div class="flex justify-between">
                        <span class="text-slate-400">위치</span>
                        <span class="font-semibold">{{ employerProfile.location }}</span>
                        </div>
                        <div class="flex justify-between">
                        <span class="text-slate-400">플랜</span>
                        <span class="text-blue-400 font-semibold">{{ employerProfile.plan }}</span>
                        </div>
                    </div>
                    </div>

                    <!-- Freelancer Checklist Summary -->
                    <div class="bg-[#1e293b]/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-bold text-base">프리랜서 체크리스트</h4>
                        <button
                        @click="activeTab = 'checklist'"
                        class="text-slate-500 hover:text-white transition-colors text-sm"
                        >
                        전체보기
                        </button>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div class="flex items-center gap-3">
                            <CheckCircle class="w-5 h-5 text-green-400" />
                            <span class="text-sm">검토 완료</span>
                        </div>
                        <span class="font-bold">12명</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div class="flex items-center gap-3">
                            <Award class="w-5 h-5 text-blue-400" />
                            <span class="text-sm">추천 프리랜서</span>
                        </div>
                        <span class="font-bold">5명</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div class="flex items-center gap-3">
                            <Star class="w-5 h-5 text-yellow-400" />
                            <span class="text-sm">즐겨찾기</span>
                        </div>
                        <span class="font-bold">8명</span>
                        </div>
                    </div>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-6">
                    <!-- Project Status -->
                    <div class="bg-[#1e293b]/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-bold text-base">프로젝트 현황</h4>
                        <button
                        @click="activeTab = 'projects'"
                        class="text-slate-500 hover:text-white transition-colors text-sm"
                        >
                        관리
                        </button>
                    </div>
                    <div class="space-y-3">
                        <div class="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-blue-300 text-sm font-semibold">모집중</span>
                            <span class="font-bold text-lg">2</span>
                        </div>
                        <div class="text-xs text-slate-400">React 개발자, Node.js 개발자</div>
                        </div>
                        <div class="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-green-300 text-sm font-semibold">진행중</span>
                            <span class="font-bold text-lg">3</span>
                        </div>
                        <div class="text-xs text-slate-400">UI/UX 디자인, 백엔드 개발 외 1건</div>
                        </div>
                        <div class="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-purple-300 text-sm font-semibold">완료</span>
                            <span class="font-bold text-lg">15</span>
                        </div>
                        <div class="text-xs text-slate-400">지난 6개월 완료 프로젝트</div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <!-- Inquiry Dialog -->
    <div v-if="isInquiryOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="isInquiryOpen = false">
      <div
        class="bg-[#1e293b] rounded-2xl border border-white/10 p-8 max-w-md w-full"
        v-motion
        :initial="{ scale: 0.9, opacity: 0 }"
        :enter="{ scale: 1, opacity: 1 }"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold">1:1 문의</h3>
          <button
            @click="isInquiryOpen = false"
            class="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X class="w-5 h-5 text-white/60" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="text-sm text-slate-400 mb-2 block">제목</label>
            <input
              type="text"
              class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
              placeholder="문의 제목을 입력하세요"
            />
          </div>
          <div>
            <label class="text-sm text-slate-400 mb-2 block">내용</label>
            <textarea
              rows="5"
              class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="문의 내용을 입력하세요"
            ></textarea>
          </div>
          <button class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors">
            문의하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
