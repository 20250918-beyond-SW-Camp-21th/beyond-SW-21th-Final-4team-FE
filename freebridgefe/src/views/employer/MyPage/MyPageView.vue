<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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
  MapPin,
  Globe,
  ArrowRight,
  ClipboardList,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { getEmployerProfile, type EmployerProfileData } from '@/api/MyPage/employer';

import EmployerProfileManagement from './components/EmployerProfileManagement.vue';
import EmployerAccountManagement from './components/EmployerAccountManagement.vue';
import EmployerProjectManagement from './components/EmployerProjectManagement.vue';
import FreelancerChecklistPage from './components/FreelancerChecklistPage.vue';
import EmployerApplicantStatus from './components/EmployerApplicantStatus.vue';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('dashboard');
const isInquiryOpen = ref(false);

const employerProfile = ref<EmployerProfileData>({
  companyName: '',
  industry: '',
  size: '',
  location: '',
  website: '',
  email: '',
  phone: '',
  description: '',
  plan: '',
  activeProjects: 0,
  totalApplicants: 0,
  contractedFreelancers: 0,
  avgRating: 0.0,
  ratingDetails: {
    atmosphere: 0,
    requirementsDetail: 0,
    scheduleAdherence: 0,
  }
});

const fetchProfile = async () => {
  try {
    const data = await getEmployerProfile();
    employerProfile.value = data;
  } catch (error) {
    console.error('Failed to fetch employer profile:', error);
  }
};

onMounted(() => {
  fetchProfile();
});

watch(activeTab, (newTab) => {
  if (newTab === 'dashboard') {
    fetchProfile();
  }
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
              <!-- Profile Header (Apple Style) -->
              <div
                class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 relative overflow-hidden group"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0 }"
              >
                <!-- Decorative Background Glow -->
                <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-700"></div>

                <div class="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                  <!-- Profile Image -->
                  <div class="relative">
                    <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
                         <!-- Use first letter of company name as fallback avatar -->
                         {{ employerProfile.companyName.charAt(0) }}
                    </div>
                    <div class="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20">
                      {{ employerProfile.plan }}
                    </div>
                  </div>

                  <!-- Profile Info -->
                  <div class="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <h2 class="text-3xl font-bold text-white mb-2">{{ employerProfile.companyName }}</h2>
                      <p class="text-slate-400 text-lg">{{ employerProfile.description }}</p>
                    </div>
                    
                    <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-300">
                      <span class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                        <Briefcase class="w-4 h-4 text-blue-400" />
                        {{ employerProfile.industry }}
                      </span>
                      <span class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                        <MapPin class="w-4 h-4 text-purple-400" />
                        {{ employerProfile.location }}
                      </span>
                      <a 
                        v-if="employerProfile.website" 
                        :href="employerProfile.website" 
                        target="_blank" 
                        class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-colors"
                      >
                        <Globe class="w-4 h-4 text-green-400" />
                        웹사이트
                      </a>
                    </div>
                  </div>

                  <!-- Edit Button -->
                  <button
                    @click="activeTab = 'profile'"
                    class="px-6 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-colors shadow-lg shadow-white/5 flex items-center gap-2"
                  >
                    <Settings class="w-5 h-5" />
                    프로필 관리
                  </button>
                </div>
              </div>

              <!-- Main Content Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left Details Column (2/3 width) -->
                <div class="lg:col-span-2 space-y-6">
                  
                  <!-- Ratings & Atmosphere Section (Highlighted) -->
                  <div 
                    class="bg-[#1e293b]/50 rounded-3xl border border-white/10 p-8 backdrop-blur-sm"
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
                  >
                    <div class="flex items-center gap-3 mb-8">
                      <div class="p-2 bg-yellow-500/10 rounded-xl">
                        <Star class="w-6 h-6 text-yellow-500" />
                      </div>
                      <h3 class="text-xl font-bold">기업 상세 평가</h3>
                    </div>

                    <div class="flex flex-col md:flex-row gap-8 items-center">
                      <!-- Total Rating -->
                      <div class="text-center p-6 bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/5 min-w-[200px]">
                        <div class="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                          {{ employerProfile.avgRating }}
                        </div>
                        <div class="flex items-center justify-center gap-1 mb-2">
                           <Star v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= Math.round(employerProfile.avgRating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'" />
                        </div>
                        <p class="text-sm text-slate-400">종합 평점</p>
                      </div>

                      <!-- Detailed Ratings -->
                      <div class="flex-1 w-full space-y-5">
                         <!-- Atmosphere -->
                         <div>
                           <div class="flex justify-between text-sm mb-2">
                             <span class="text-slate-300 flex items-center gap-2">
                               <Users class="w-4 h-4 text-blue-400" /> 사내 분위기
                             </span>
                             <span class="font-bold text-white">{{ employerProfile.ratingDetails?.atmosphere || 0 }}</span>
                           </div>
                           <div class="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                             <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" :style="{ width: `${(employerProfile.ratingDetails?.atmosphere || 0) * 20}%` }"></div>
                           </div>
                         </div>

                         <!-- Requirements Detail -->
                         <div>
                           <div class="flex justify-between text-sm mb-2">
                             <span class="text-slate-300 flex items-center gap-2">
                               <FileText class="w-4 h-4 text-purple-400" /> 요구사항 디테일
                             </span>
                             <span class="font-bold text-white">{{ employerProfile.ratingDetails?.requirementsDetail || 0 }}</span>
                           </div>
                           <div class="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                             <div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" :style="{ width: `${(employerProfile.ratingDetails?.requirementsDetail || 0) * 20}%` }"></div>
                           </div>
                         </div>

                         <!-- Schedule Adherence -->
                         <div>
                           <div class="flex justify-between text-sm mb-2">
                             <span class="text-slate-300 flex items-center gap-2">
                               <Calendar class="w-4 h-4 text-green-400" /> 일정 준수
                             </span>
                             <span class="font-bold text-white">{{ employerProfile.ratingDetails?.scheduleAdherence || 0 }}</span>
                           </div>
                           <div class="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                             <div class="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" :style="{ width: `${(employerProfile.ratingDetails?.scheduleAdherence || 0) * 20}%` }"></div>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  <!-- Freelancer Checklist (Integrated) -->
                  <div 
                     class="bg-[#1e293b]/50 rounded-3xl border border-white/10 p-8 backdrop-blur-sm"
                     v-motion
                     :initial="{ opacity: 0, y: 20 }"
                     :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
                   >
                     <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-indigo-500/10 rounded-xl">
                              <ClipboardList class="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 class="text-xl font-bold">프리랜서 체크리스트</h3>
                        </div>
                        <button 
                            @click="activeTab = 'checklist'"
                            class="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                            전체보기 <ArrowRight class="w-4 h-4" />
                        </button>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors cursor-pointer group">
                             <CheckCircle class="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                             <span class="text-2xl font-bold text-white mb-1">12</span>
                             <span class="text-xs text-slate-400">검토 완료</span>
                        </div>
                        <div class="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors cursor-pointer group">
                             <Award class="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                             <span class="text-2xl font-bold text-white mb-1">5</span>
                             <span class="text-xs text-slate-400">추천 프리랜서</span>
                        </div>
                        <div class="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors cursor-pointer group">
                             <Star class="w-8 h-8 text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
                             <span class="text-2xl font-bold text-white mb-1">8</span>
                             <span class="text-xs text-slate-400">즐겨찾기</span>
                        </div>
                      </div>
                   </div>

                </div>

                <!-- Right Sidebar Column (1/3 width) - Stats & Compact Projects -->
                <div class="space-y-6">
                   <!-- Stats Compact Cards -->
                   <div class="grid grid-cols-2 gap-4">
                      <div class="bg-[#1e293b]/50 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
                          <div class="text-slate-400 text-xs mb-1">진행중 프로젝트</div>
                          <div class="text-2xl font-bold text-white">{{ employerProfile.activeProjects }}<span class="text-sm font-normal text-slate-500 ml-1">개</span></div>
                      </div>
                      <div class="bg-[#1e293b]/50 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
                          <div class="text-slate-400 text-xs mb-1">총 지원자</div>
                          <div class="text-2xl font-bold text-white">{{ employerProfile.totalApplicants }}<span class="text-sm font-normal text-slate-500 ml-1">명</span></div>
                      </div>
                      <div class="col-span-2 bg-[#1e293b]/50 rounded-2xl p-5 border border-white/10 backdrop-blur-sm flex items-center justify-between">
                          <div>
                              <div class="text-slate-400 text-xs mb-1">계약 프리랜서</div>
                              <div class="text-2xl font-bold text-white">{{ employerProfile.contractedFreelancers }}<span class="text-sm font-normal text-slate-500 ml-1">명</span></div>
                          </div>
                          <div class="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <Users class="w-6 h-6 text-purple-400" />
                          </div>
                      </div>
                   </div>

                   <!-- Project Status (Minimized) -->
                   <div class="bg-[#1e293b]/50 rounded-3xl border border-white/10 p-6 backdrop-blur-sm h-full">
                      <div class="flex items-center justify-between mb-4">
                        <h4 class="font-bold text-base">프로젝트 현황</h4>
                        <button @click="activeTab = 'projects'" class="text-xs text-slate-500 hover:text-white">관리</button>
                      </div>
                      
                      <div class="space-y-3">
                         <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div class="flex items-center gap-3">
                               <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                               <span class="text-sm text-slate-300">모집중</span>
                            </div>
                            <span class="font-bold">2건</span>
                         </div>
                         <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div class="flex items-center gap-3">
                               <div class="w-2 h-2 rounded-full bg-green-500"></div>
                               <span class="text-sm text-slate-300">진행중</span>
                            </div>
                            <span class="font-bold">3건</span>
                         </div>
                         <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div class="flex items-center gap-3">
                               <div class="w-2 h-2 rounded-full bg-slate-500"></div>
                               <span class="text-sm text-slate-300">완료</span>
                            </div>
                            <span class="font-bold">15건</span>
                         </div>
                      </div>
                      
                      <div class="mt-6 pt-6 border-t border-white/10">
                        <p class="text-xs text-slate-500 text-center">
                           최근 30일간 5개의 프로젝트가<br>성공적으로 완료되었습니다.
                        </p>
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
