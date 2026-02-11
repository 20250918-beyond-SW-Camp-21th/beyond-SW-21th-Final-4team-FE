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
  Mail,
  Phone,
  Camera,
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
  },
  projectStatusCounts: {
    posted: 0,
    screening: 0,
    inProgress: 0,
    completed: 0
  }
});

const handleLogoUpdate = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        const file = input.files[0];
        // Mock upload: Convert to Base64 (normally upload to server and get URL)
        const reader = new FileReader();
        reader.onload = (e) => {
            employerProfile.value.logoUrl = e.target?.result as string;
            // TODO: Call API to update logo
        };
        reader.readAsDataURL(file);
    }
};

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
        <div class="p-8 w-[70%] mx-auto">
            <!-- Dynamic Content Rendering -->
            <EmployerProfileManagement v-if="activeTab === 'profile'" @back="activeTab = 'dashboard'" />
            <EmployerApplicantStatus v-else-if="activeTab === 'applicants'" @back="activeTab = 'dashboard'" />
            <FreelancerChecklistPage v-else-if="activeTab === 'checklist'" @back="activeTab = 'dashboard'" />
            <EmployerProjectManagement v-else-if="activeTab === 'projects'" @back="activeTab = 'dashboard'" />
            <EmployerAccountManagement v-else-if="activeTab === 'account'" @back="activeTab = 'dashboard'" />
            
            <!-- Dashboard View -->
            <div v-else-if="activeTab === 'dashboard'" class="space-y-8">
              
              <!-- 1. Profile Section (Detailed) -->
              <div 
                class="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
                v-motion
                :initial="{ opacity: 0, y: -20 }"
                :enter="{ opacity: 1, y: 0 }"
              >
                  <div class="flex flex-col md:flex-row gap-8">
                      <!-- Left: Logo & Core Info -->
                      <div class="w-full md:w-1/3 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-8">
                          <!-- Logo Upload -->
                          <div class="relative group cursor-pointer mb-4">
                              <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-xl bg-slate-800 flex items-center justify-center">
                                  <img 
                                      v-if="employerProfile.logoUrl" 
                                      :src="employerProfile.logoUrl" 
                                      alt="Company Logo" 
                                      class="w-full h-full object-cover"
                                  />
                                  <div v-else class="text-4xl font-bold text-white/20">
                                      {{ employerProfile.companyName.charAt(0) }}
                                  </div>
                              </div>
                              
                              <!-- Hover Overlay -->
                              <div class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div class="flex flex-col items-center text-white text-xs">
                                      <Camera class="w-6 h-6 mb-1" />
                                      <span>변경</span>
                                  </div>
                              </div>
                              <input type="file" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" @change="handleLogoUpdate" />
                          </div>

                          <h2 class="text-2xl font-bold mb-2">{{ employerProfile.companyName }}</h2>
                          <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20 mb-6">
                              {{ employerProfile.plan || 'PARTNER' }}
                          </span>

                           <!-- Core Stats -->
                          <div class="w-full grid grid-cols-2 gap-4">
                              <div class="bg-white/5 rounded-xl p-3">
                                  <div class="text-xs text-slate-400 mb-1">진행 프로젝트</div>
                                  <div class="text-xl font-bold">{{ employerProfile.activeProjects }}</div>
                              </div>
                              <div class="bg-white/5 rounded-xl p-3">
                                  <div class="text-xs text-slate-400 mb-1">평균 평점</div>
                                  <div class="text-xl font-bold text-yellow-500">{{ employerProfile.avgRating }}</div>
                              </div>
                          </div>
                      </div>

                      <!-- Right: Detailed Info -->
                      <div class="w-full md:w-2/3 space-y-6">
                          <div class="flex items-center justify-between mb-4">
                              <h3 class="text-lg font-bold flex items-center gap-2">
                                  <Building2 class="w-5 h-5 text-blue-400" />
                                  기업 정보
                              </h3>
                              <button 
                                   @click="activeTab = 'profile'"
                                   class="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"
                              >
                                  <Settings class="w-3 h-3" />
                                  정보 수정
                              </button>
                          </div>

                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div class="space-y-4">
                                  <div class="group">
                                      <label class="text-xs text-slate-500 mb-1 block group-hover:text-blue-400 transition-colors">업종</label>
                                      <div class="flex items-center gap-2 text-sm">
                                          <Briefcase class="w-4 h-4 text-slate-400" />
                                          {{ employerProfile.industry }}
                                      </div>
                                  </div>
                                  <div class="group">
                                      <label class="text-xs text-slate-500 mb-1 block group-hover:text-blue-400 transition-colors">규모</label>
                                      <div class="flex items-center gap-2 text-sm">
                                          <Users class="w-4 h-4 text-slate-400" />
                                          {{ employerProfile.size }}
                                      </div>
                                  </div>
                                  <div class="group">
                                      <label class="text-xs text-slate-500 mb-1 block group-hover:text-blue-400 transition-colors">위치</label>
                                      <div class="flex items-center gap-2 text-sm">
                                          <MapPin class="w-4 h-4 text-slate-400" />
                                          {{ employerProfile.location }}
                                      </div>
                                  </div>
                                  <div class="group">
                                      <label class="text-xs text-slate-500 mb-1 block group-hover:text-blue-400 transition-colors">웹사이트</label>
                                      <div class="flex items-center gap-2 text-sm truncate">
                                          <Globe class="w-4 h-4 text-slate-400" />
                                          <a :href="employerProfile.website" target="_blank" class="hover:underline hover:text-blue-400 truncate">{{ employerProfile.website }}</a>
                                      </div>
                                  </div>
                              </div>
                              <div class="space-y-4">
                                  <div class="group">
                                      <label class="text-xs text-slate-500 mb-1 block group-hover:text-blue-400 transition-colors">이메일</label>
                                      <div class="flex items-center gap-2 text-sm">
                                          <Mail class="w-4 h-4 text-slate-400" />
                                          {{ employerProfile.email }}
                                      </div>
                                  </div>
                                  <div class="group">
                                      <label class="text-xs text-slate-500 mb-1 block group-hover:text-blue-400 transition-colors">연락처</label>
                                      <div class="flex items-center gap-2 text-sm">
                                          <Phone class="w-4 h-4 text-slate-400" />
                                          {{ employerProfile.phone }}
                                      </div>
                                  </div>
                                  <div class="group">
                                      <label class="text-xs text-slate-500 mb-1 block group-hover:text-blue-400 transition-colors">기업 소개</label>
                                      <p class="text-sm text-slate-300 bg-white/5 p-3 rounded-lg leading-relaxed text-xs">
                                          {{ employerProfile.description }}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- 2. Project Status Board (Elancer Style Flow) -->
              <div 
                class="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden"
                v-motion
                :initial="{ opacity: 0, scale: 0.95 }"
                :enter="{ opacity: 1, scale: 1, transition: { delay: 0.1 } }"
              >
                  <div class="flex items-center justify-between mb-8">
                      <h3 class="text-lg font-bold flex items-center gap-2">
                          <Briefcase class="w-5 h-5 text-blue-400" />
                          프로젝트 진행 현황
                      </h3>
                      <button @click="activeTab = 'projects'" class="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                          전체보기 <ArrowRight class="w-3 h-3" />
                      </button>
                  </div>

                  <!-- Status Steps -->
                  <div class="grid grid-cols-4 gap-4 relative z-10">
                      <!-- Step 1: 접수중 (Posted) -->
                      <div class="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                          <div class="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all border border-blue-500/20">
                              <ClipboardList class="w-5 h-5 text-blue-400" />
                          </div>
                          <span class="text-sm text-blue-400 mb-1 font-medium">접수중</span>
                          <span class="text-2xl font-bold text-white">{{ employerProfile.projectStatusCounts?.posted || 0 }}</span>
                      </div>
                      
                      <!-- Arrow -->
                      <div class="hidden md:flex items-center justify-center absolute left-[25%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 opacity-20">
                          <ArrowRight class="w-full h-full text-white" />
                      </div>

                      <!-- Step 2: 심사중 (Screening) -->
                      <div class="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                          <div class="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all border border-purple-500/20">
                              <Users class="w-5 h-5 text-purple-400" />
                          </div>
                          <span class="text-sm text-purple-400 mb-1 font-medium">심사중</span>
                          <span class="text-2xl font-bold text-white">{{ employerProfile.projectStatusCounts?.screening || 0 }}</span>
                      </div>

                      <!-- Arrow -->
                      <div class="hidden md:flex items-center justify-center absolute left-[50%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 opacity-20">
                          <ArrowRight class="w-full h-full text-white" />
                      </div>

                      <!-- Step 3: 진행중 (In Progress) -->
                      <div class="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group relative">
                          <div class="absolute inset-0 bg-green-500/5 rounded-xl blur-xl"></div>
                          <div class="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-green-500/20 transition-all border border-green-500/20 relative z-10">
                              <Briefcase class="w-5 h-5 text-green-400" />
                          </div>
                          <span class="text-sm text-green-400 mb-1 font-medium relative z-10">진행중</span>
                          <span class="text-2xl font-bold text-white relative z-10">{{ employerProfile.projectStatusCounts?.inProgress || 0 }}</span>
                      </div>

                       <!-- Arrow -->
                       <div class="hidden md:flex items-center justify-center absolute left-[75%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 opacity-20">
                          <ArrowRight class="w-full h-full text-white" />
                      </div>

                      <!-- Step 4: 완료/평가 (Completed) -->
                      <div class="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                           <div class="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-slate-700 transition-all border border-white/5">
                              <CheckCircle class="w-5 h-5 text-slate-400 group-hover:text-white" />
                          </div>
                          <span class="text-sm text-slate-400 mb-1">완료/평가</span>
                          <span class="text-2xl font-bold text-white">{{ employerProfile.projectStatusCounts?.completed || 0 }}</span>
                      </div>
                  </div>
              </div>

              <!-- 3. Bottom Grid (Review, Checklist, Account) -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left: Evaluation & Checklist (2/3) -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Detailed Ratings (Preserved from prev version but more compact) -->
                     <div 
                        class="bg-[#1e293b]/50 rounded-2xl border border-white/10 p-6 backdrop-blur-sm"
                        v-motion
                        :initial="{ opacity: 0, y: 20 }"
                        :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
                      >
                         <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-bold flex items-center gap-2">
                                <Star class="w-5 h-5 text-yellow-500" />
                                고용주 평가
                            </h3>
                            <div class="flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20">
                                <span class="text-sm text-yellow-500 font-bold">전체 평균</span>
                                <Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span class="text-lg font-bold text-white">{{ employerProfile.avgRating }}</span>
                                <span class="text-xs text-slate-400">/ 5.0</span>
                            </div>
                         </div>
                         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <!-- Rating Items -->
                            <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-slate-400">사내 분위기</span>
                                    <span class="font-bold">{{ employerProfile.ratingDetails?.atmosphere }}</span>
                                </div>
                                <div class="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                     <div class="h-full bg-blue-500 rounded-full" :style="{ width: `${(employerProfile.ratingDetails?.atmosphere || 0) * 20}%` }"></div>
                                </div>
                            </div>
                            <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-slate-400">급여 만족도</span>
                                    <span class="font-bold">{{ employerProfile.ratingDetails?.requirementsDetail }}</span>
                                </div>
                                <div class="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                     <div class="h-full bg-purple-500 rounded-full" :style="{ width: `${(employerProfile.ratingDetails?.requirementsDetail || 0) * 20}%` }"></div>
                                </div>
                            </div>
                            <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-slate-400">일정 준수</span>
                                    <span class="font-bold">{{ employerProfile.ratingDetails?.scheduleAdherence }}</span>
                                </div>
                                <div class="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                     <div class="h-full bg-green-500 rounded-full" :style="{ width: `${(employerProfile.ratingDetails?.scheduleAdherence || 0) * 20}%` }"></div>
                                </div>
                            </div>
                         </div>
                     </div>

                     <!-- Freelancer Checklist Preview -->
                     <button 
                         @click="activeTab = 'checklist'"
                         class="w-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 hover:from-indigo-500/20 hover:to-blue-500/20 border border-indigo-500/20 rounded-2xl p-6 flex items-center justify-between group transition-all"
                     >
                        <div class="flex items-center gap-4">
                            <div class="p-3 bg-indigo-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                <ClipboardList class="w-6 h-6 text-indigo-400" />
                            </div>
                            <div class="text-left">
                                <h4 class="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">프리랜서 체크리스트 확인하기</h4>
                                <p class="text-sm text-slate-400">관심있는 프리랜서를 확인하고 프로젝트를 제안해보세요.</p>
                            </div>
                        </div>
                        <ArrowRight class="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                     </button>
                </div>

                <!-- Right: CS Center & Manager (1/3) -->
                <div class="space-y-6">
                     <!-- Account Manager -->


                     <!-- Notice / Banners -->
                     <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 relative overflow-hidden">
                         <div class="relative z-10">
                             <span class="text-xs font-bold bg-white/20 px-2 py-1 rounded text-white mb-2 inline-block">NOTICE</span>
                             <h4 class="font-bold text-white text-lg mb-2">프리랜서 계약 시<br/>법률 가이드 무상 제공</h4>
                             <p class="text-xs text-blue-100 mb-4">표준계약서 작성부터 법적 효력까지<br/>전문 변호사가 검수한 가이드를 확인하세요.</p>
                             <button class="text-xs font-bold text-white hover:underline flex items-center gap-1">
                                 자세히 보기 <ArrowRight class="w-3 h-3" />
                             </button>
                         </div>
                         <!-- Decorative circles -->
                         <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                         <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
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
