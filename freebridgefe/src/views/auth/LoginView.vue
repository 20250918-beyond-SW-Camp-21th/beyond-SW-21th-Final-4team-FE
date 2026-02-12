<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-vue-next';
import AnimatedBackground from './components/AnimatedBackground.vue';
import type { User } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const error = ref('');

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = (e: Event) => {
  e.preventDefault();
  error.value = '';

  // Mock Login Logic
  if (email.value === 'employer@test.com' && password.value === 'test1234') {
    const user: User = {
      id: 1,
      name: '스타트업 A',
      companyName: '스타트업 A',
      email: 'employer@test.com',
      password: password.value,
      role: 'EMPLOYER',
    };
    authStore.login(user);
    router.push('/employer/dashboard'); // TODO: Create this route later
  } else if (email.value === 'freelancer@test.com' && password.value === 'test1234') {
    const user: User = {
      id: 1,
      name: '김프론트',
      email: 'freelancer@test.com',
      password: password.value,
      role: 'FREELANCER',
    };
    authStore.login(user);
    router.push('/freelancer/jobs'); // TODO: Create this route later
  } else {
    error.value = '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
};

const navigateToSignup = (role: 'EMPLOYER' | 'FREELANCER') => {
  router.push({ path: '/signup', query: { role } });
};

const goBack = () => {
  router.push('/');
};

const isFindPasswordModalOpen = ref(false);
const resetEmail = ref('');
const isResetting = ref(false);
const resetSuccess = ref(false);

const openFindPasswordModal = () => {
  isFindPasswordModalOpen.value = true;
  resetEmail.value = '';
  resetSuccess.value = false;
  isResetting.value = false;
};

const closeFindPasswordModal = () => {
  isFindPasswordModalOpen.value = false;
};

const handlePasswordReset = async () => {
  isResetting.value = true;
  // Simulate API call
  // TODO: Implement SMTP email sending via backend API (Future Requirement)
  await new Promise(resolve => setTimeout(resolve, 1500));
  isResetting.value = false;
  resetSuccess.value = true;
  
  // Close modal after success (optional delay)
  setTimeout(() => {
    if(isFindPasswordModalOpen.value) {
      // closeFindPasswordModal(); // Uncomment if you want to auto-close
    }
  }, 2000);
};

// Animation variants for v-motion
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 600 } }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
    <AnimatedBackground />

    <div class="relative z-10 w-full max-w-md">
      <!-- Back Button -->
      <button
        @click="goBack"
        v-motion
        :initial="{ opacity: 0, x: -20 }"
        :enter="{ opacity: 1, x: 0 }"
        class="mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
      >
        <ArrowLeft class="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>돌아가기</span>
      </button>

      <!-- Login Card -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-10"
      >
        <div class="text-center mb-10">
          <h1
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
            class="text-4xl font-bold mb-3"
          >
            로그인
          </h1>
          <p
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
            class="text-white/60"
          >
            FreeBridge에 오신 것을 환영합니다
          </p>
        </div>

        <form @submit="handleLogin" class="space-y-5">
          <!-- Email -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
          >
            <label class="block text-sm font-medium mb-2 text-white/80">이메일</label>
            <div class="relative">
              <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="email"
                v-model="email"
                placeholder="your@email.com"
                class="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 transition-colors text-white placeholder:text-white/30"
                required
              />
            </div>
          </div>

          <!-- Password -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
          >
            <label class="block text-sm font-medium mb-2 text-white/80">비밀번호</label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="••••••••"
                class="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 transition-colors text-white placeholder:text-white/30"
                required
              />
              <button
                type="button"
                @click="togglePassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                <EyeOff v-if="showPassword" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="error"
            v-motion
            :initial="{ opacity: 0, scale: 0.95 }"
            :enter="{ opacity: 1, scale: 1 }"
            class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm"
          >
            {{ error }}
          </div>

          <!-- Remember & Forgot -->
          <div
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { delay: 600 } }"
            class="flex items-center justify-between text-sm"
          >
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="rounded bg-white/5 border-white/10" />
              <span class="text-white/60">로그인 상태 유지</span>
            </label>
            <button 
              type="button" 
              @click="openFindPasswordModal"
              class="text-white/80 hover:text-white transition-colors"
            >
              비밀번호 찾기
            </button>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 700 } }"
            class="w-full py-4 bg-white text-black rounded-2xl font-semibold text-lg hover:shadow-2xl transition-transform hover:scale-102 active:scale-98"
          >
            로그인
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-white/10" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-black/50 text-white/50 backdrop-blur-sm">또는</span>
          </div>
        </div>

        <!-- Signup Links -->
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 800 } }"
          class="space-y-3"
        >
          <p class="text-center text-white/50 text-sm mb-4">
            아직 계정이 없으신가요?
          </p>
          <button
            @click="navigateToSignup('FREELANCER')"
            class="w-full py-3 border border-white/20 text-white rounded-2xl hover:bg-white/5 transition-all font-medium hover:scale-102 active:scale-98"
          >
            프리랜서로 가입하기
          </button>
          <button
            @click="navigateToSignup('EMPLOYER')"
            class="w-full py-3 border border-white/20 text-white rounded-2xl hover:bg-white/5 transition-all font-medium hover:scale-102 active:scale-98"
          >
            고용주로 가입하기
          </button>
        </div>

        <!-- Demo Info -->
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 900 } }"
          class="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl"
        >
          <div class="text-sm text-blue-300">
            <div class="font-medium mb-2">🔑 데모 계정</div>
            <div class="space-y-1 text-xs text-white/60">
              <div>
                <strong>고용주:</strong> employer@test.com / test1234
              </div>
              <div>
                <strong>프리랜서:</strong> freelancer@test.com / test1234
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Find Password Modal -->
    <div v-if="isFindPasswordModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        class="absolute inset-0 bg-black/80 backdrop-blur-sm"
        @click="closeFindPasswordModal"
      ></div>
      
      <div 
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :enter="{ opacity: 1, scale: 1 }"
        class="relative bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        <button 
          @click="closeFindPasswordModal"
          class="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 class="text-2xl font-bold mb-2">비밀번호 찾기</h2>
        <p class="text-white/60 mb-6 text-sm">
          가입하신 이메일 주소를 입력해 주세요.<br/>
          비밀번호 재설정 링크를 보내드립니다.
        </p>

        <form @submit.prevent="handlePasswordReset" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2 text-white/80">이메일</label>
            <div class="relative">
              <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="email"
                v-model="resetEmail"
                placeholder="your@email.com"
                class="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 transition-colors text-white placeholder:text-white/30"
                required
              />
            </div>
          </div>

          <div v-if="resetSuccess" class="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>재설정 링크가 전송되었습니다!</span>
          </div>

          <button
            type="submit"
            :disabled="isResetting || resetSuccess"
            class="w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="isResetting" class="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
            <span>{{ isResetting ? '전송 중...' : (resetSuccess ? '전송 완료' : '링크 전송하기') }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
