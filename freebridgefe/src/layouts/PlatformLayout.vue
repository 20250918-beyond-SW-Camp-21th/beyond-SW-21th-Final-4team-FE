<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import {
  Briefcase,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  TrendingUp,
  User,
  FileCheck,
  Wallet,
  UserCircle,
  MessageSquareQuote,
  HelpCircle,
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);

const currentUser = computed(() => authStore.user);
const isEmployer = computed(() => currentUser.value?.role === 'EMPLOYER');

// Navigation Items
const employerNavItems = [
  { id: 'employer.jobs', path: '/employer/jobs', label: '내 공고', icon: Briefcase },
  { id: 'employer.review', path: '/employer/review', label: '내 리뷰', icon:MessageSquareQuote},
  { id: 'employer.applications', path: '/employer/applications', label: '지원 관리', icon: FileText },
  { id: 'employer.freelancers', path: '/employer/freelancers', label: '프리랜서 찾기', icon: Users },
  { id: 'employer.recommended', path: '/employer/recommended', label: '추천 프리랜서', icon: TrendingUp },
  { id: 'employer.contracts', path: '/employer/contracts', label: '계약서', icon: FileCheck },
  { id: 'employer.settlement', path: '/employer/settlement', label: '정산', icon: Wallet },
  { id: 'employer.mypage', path: '/employer/mypage', label: '마이페이지', icon: UserCircle },
];

const freelancerNavItems = [
  { id: 'freelancer.browse', path: '/freelancer/jobs', label: '공고', icon: Briefcase },
  { id: 'freelancer.applications', path: '/freelancer/applications', label: '내 지원', icon: FileText },
  { id: 'freelancer.contracts', path: '/freelancer/contracts', label: '계약서', icon: FileCheck },
  { id: 'freelancer.settlement', path: '/freelancer/settlement', label: '정산', icon: Wallet },
  { id: 'freelancer.review', path: '/freelancer/review', label: '내 리뷰', icon: MessageSquareQuote },
  { id: 'freelancer.mypage', path: '/freelancer/mypage', label: '마이페이지', icon: UserCircle },
];

const navItems = computed(() => isEmployer.value ? employerNavItems : freelancerNavItems);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const handleOpenGuide = () => {
  router.push('/guide');
  isMobileMenuOpen.value = false;
};

const navigate = (path: string) => {
  router.push(path);
  isMobileMenuOpen.value = false;
};

const isActive = (path: string) => route.path.startsWith(path);

onMounted(() => {
  // Tour auto-start logic removed
});
</script>

<template>
  <div v-if="currentUser" class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 font-sans">
    <!-- Desktop Navigation -->
    <nav class="hidden lg:block sticky top-0 z-50 h-20 bg-white/5 backdrop-blur-2xl border-b border-white/10">
      <div class="w-full px-4 xl:px-8 h-full flex items-center justify-between gap-4">
        <div 
          @click="router.push(isEmployer ? '/employer/dashboard' : '/freelancer/jobs')"
          class="shrink-0 text-2xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent cursor-pointer"
          :data-tour="isEmployer ? 'employer.dashboard' : undefined"
          v-motion="{
            initial: { opacity: 0, x: -20 },
            enter: { opacity: 1, x: 0 }
          }"
        >
          FreeBridge
        </div>

        <div class="flex-1 flex items-center justify-center min-w-0 mx-4 md:mx-6">
          <div class="flex items-center gap-2 py-2 px-1 w-auto justify-center">
            <button
              v-for="(item, index) in navItems"
              :key="item.id"
              @click="navigate(item.path)"
              class="shrink-0 relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all whitespace-nowrap"
              :class="isActive(item.path) ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'"
              :data-tour="item.id"
              v-motion="{
                initial: { opacity: 0, y: -10 },
                enter: { opacity: 1, y: 0, transition: { delay: index * 100 } },
                hover: { scale: 1.05 },
                tap: { scale: 0.95 }
              }"
            >
              <div
                v-if="isActive(item.path)"
                class="absolute inset-0 bg-white/10 rounded-full border border-white/20"
                v-motion
                layoutId="activeTab"
              />
              <component :is="item.icon" class="w-5 h-5 relative z-10" />
              <span class="relative z-10 font-medium">{{ item.label }}</span>
            </button>
          </div>
        </div>

        <div class="shrink-0 flex items-center gap-3">
          <div class="px-4 py-2.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 hidden xl:block">
            <div class="text-xs text-white/50">
              {{ isEmployer ? '고용주' : '프리랜서' }}
            </div>
            <div class="font-medium text-white">{{ currentUser.name }}</div>
          </div>
          <button
            @click="handleOpenGuide"
            class="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 whitespace-nowrap"
            v-motion="{
              hover: { scale: 1.05 },
              tap: { scale: 0.95 }
            }"
          >
            <HelpCircle class="w-5 h-5 text-white/80" />
            <span class="font-medium text-white/90 hidden xl:inline">이용 가이드</span>
            <span class="font-medium text-white/90 xl:hidden">가이드</span>
          </button>
          <button
            @click="handleLogout"
            class="p-2.5 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-white/10"
            title="로그아웃"
            v-motion="{
              hover: { scale: 1.1 },
              tap: { scale: 0.9 }
            }"
          >
            <LogOut class="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Navigation -->
    <nav class="lg:hidden sticky top-0 z-50 h-16 bg-white/5 backdrop-blur-2xl border-b border-white/10">
      <div class="px-4 h-full flex items-center justify-between">
        <div class="text-xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          FreeBridge
        </div>
        <div class="flex items-center gap-2">
          <div class="text-sm px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-white">
            {{ currentUser.name }}
          </div>
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X v-if="isMobileMenuOpen" class="w-6 h-6 text-white" />
            <Menu v-else class="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMobileMenuOpen" 
        class="absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden"
        v-motion="{
          initial: { opacity: 0, height: 0 },
          enter: { opacity: 1, height: 'auto' }
        }"
      >
        <div class="p-4 space-y-2">
          <button
            v-for="(item, index) in navItems"
            :key="item.id"
            @click="navigate(item.path)"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
            :class="isActive(item.path) ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/5'"
            v-motion="{
              initial: { opacity: 0, x: -20 },
              enter: { opacity: 1, x: 0, transition: { delay: index * 50 } }
            }"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span class="font-medium">{{ item.label }}</span>
          </button>
          <button
            @click="handleOpenGuide"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-blue-500/10 text-blue-400 transition-all border border-blue-500/20"
          >
            <HelpCircle class="w-5 h-5" />
            <span class="font-medium">이용 가이드</span>
          </button>
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-500/10 text-red-400 transition-all border border-red-500/20"
          >
            <LogOut class="w-5 h-5" />
            <span class="font-medium">로그아웃</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="text-white">
      <router-view v-slot="{ Component }">
        <transition 
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-4"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
