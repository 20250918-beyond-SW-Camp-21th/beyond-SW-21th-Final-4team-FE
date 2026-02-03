<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Lock, User as UserIcon, Building2, ArrowLeft, Eye, EyeOff, Check } from 'lucide-vue-next';
import AnimatedBackground from './components/AnimatedBackground.vue';
import type { User, UserRole } from '@/types';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// State
const role = ref<UserRole>('FREELANCER');
const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  company: '',
  skills: '',
  agreeTerms: false,
  agreePrivacy: false,
});
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const errors = ref<Record<string, string>>({});

// Computed used for simplifying template logic
const isEmployer = computed(() => role.value === 'EMPLOYER');

// Initialize role from query param
onMounted(() => {
  if (route.query.role && (route.query.role === 'EMPLOYER' || route.query.role === 'FREELANCER')) {
    role.value = route.query.role as UserRole;
  }
});

const switchRole = (newRole: UserRole) => {
  role.value = newRole;
  // Optional: clear errors or form data when switching
  errors.value = {};
};

const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.value.name.trim()) {
    newErrors.name = isEmployer.value ? '고용주명을 입력해주세요' : '이름을 입력해주세요';
  }

  if (!formData.value.email.trim()) {
    newErrors.email = '이메일을 입력해주세요';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    newErrors.email = '올바른 이메일 형식이 아닙니다';
  }

  if (!formData.value.password) {
    newErrors.password = '비밀번호를 입력해주세요';
  } else if (formData.value.password.length < 8) {
    newErrors.password = '비밀번호는 8자 이상이어야 합니다';
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
  }

  if (!isEmployer.value && !formData.value.skills.trim()) {
    newErrors.skills = '주요 기술을 입력해주세요';
  }

  if (!formData.value.agreeTerms) {
    newErrors.terms = '이용약관에 동의해주세요';
  }

  if (!formData.value.agreePrivacy) {
    newErrors.privacy = '개인정보처리방침에 동의해주세요';
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = (e: Event) => {
  e.preventDefault();

  if (!validateForm()) return;

  const newUser: User = {
    id: isEmployer.value ? 'e-new' : 'f-new',
    name: formData.value.name,
    email: formData.value.email,
    role: role.value,
  };

  // Mock Signup
  authStore.signup(newUser);
  alert(`회원가입이 완료되었습니다!\n환영합니다, ${formData.value.name}님 🎉`);
  
  // Redirect to dashboard based on role (Mock)
  if (isEmployer.value) {
      router.push('/employer/dashboard');
  } else {
      router.push('/freelancer/jobs');
  }
};

const goBack = () => {
  router.push('/login');
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};
</script>

<template>
  <div class="min-h-screen bg-black text-white flex items-center justify-center p-4 py-12 relative overflow-hidden font-sans">
    <AnimatedBackground />

    <div class="relative z-10 w-full max-w-2xl">
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

      <!-- Signup Card -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-10"
      >
        <!-- Header -->
        <div class="text-center mb-8">
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{ opacity: 1, scale: 1, transition: { delay: 200 } }"
            class="inline-block mb-6"
          >
            <div
              class="w-20 h-20 rounded-3xl flex items-center justify-center transition-colors duration-500"
              :class="isEmployer ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'"
            >
              <Building2 v-if="isEmployer" class="w-10 h-10 text-white" />
              <UserIcon v-else class="w-10 h-10 text-white" />
            </div>
          </div>
          <h1
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
            class="text-4xl font-bold mb-3"
          >
            {{ isEmployer ? '고용주' : '프리랜서' }} 회원가입
          </h1>
          <p
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
            class="text-white/60"
          >
            {{ isEmployer ? '프로젝트를 등록하고 최고의 프리랜서를 만나보세요' : '프로젝트에 지원하고 커리어를 성장시키세요' }}
          </p>
        </div>

        <!-- Role Switch -->
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 500 } }"
          class="flex gap-3 mb-8"
        >
          <button
            @click="switchRole('FREELANCER')"
            class="flex-1 py-3 rounded-2xl border transition-all"
            :class="!isEmployer ? 'border-blue-500 bg-blue-500/20 text-white' : 'border-white/10 text-white/60 hover:border-white/20'"
          >
            프리랜서
          </button>
          <button
            @click="switchRole('EMPLOYER')"
            class="flex-1 py-3 rounded-2xl border transition-all"
            :class="isEmployer ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-white/10 text-white/60 hover:border-white/20'"
          >
            고용주
          </button>
        </div>

        <form @submit="handleSubmit" class="space-y-5">
          <!-- Name / Company -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }"
          >
            <label class="block text-sm font-medium mb-2 text-white/80">
              {{ isEmployer ? '고용주명' : '이름' }} <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <Building2 v-if="isEmployer" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <UserIcon v-else class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                v-model="formData.name"
                :placeholder="isEmployer ? '예: 테크스타트업' : '예: 홍길동'"
                class="w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl focus:outline-none transition-colors text-white placeholder:text-white/30"
                :class="errors.name ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'"
              />
            </div>
            <p v-if="errors.name" class="text-red-400 text-sm mt-2">{{ errors.name }}</p>
          </div>

          <!-- Email -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 700 } }"
          >
            <label class="block text-sm font-medium mb-2 text-white/80">
              이메일 <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="email"
                v-model="formData.email"
                placeholder="your@email.com"
                class="w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl focus:outline-none transition-colors text-white placeholder:text-white/30"
                :class="errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'"
              />
            </div>
            <p v-if="errors.email" class="text-red-400 text-sm mt-2">{{ errors.email }}</p>
          </div>

          <!-- Skills (Freelancer Only) -->
          <div
            v-if="!isEmployer"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 800 } }"
          >
            <label class="block text-sm font-medium mb-2 text-white/80">
              주요 기술 <span class="text-red-400">*</span>
            </label>
            <input
              type="text"
              v-model="formData.skills"
              placeholder="예: React, TypeScript, Node.js"
              class="w-full px-4 py-4 bg-white/5 border rounded-2xl focus:outline-none transition-colors text-white placeholder:text-white/30"
              :class="errors.skills ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'"
            />
            <p v-if="errors.skills" class="text-red-400 text-sm mt-2">{{ errors.skills }}</p>
          </div>

          <!-- Password -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 900 } }"
          >
            <label class="block text-sm font-medium mb-2 text-white/80">
              비밀번호 <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="formData.password"
                placeholder="8자 이상"
                class="w-full pl-12 pr-12 py-4 bg-white/5 border rounded-2xl focus:outline-none transition-colors text-white placeholder:text-white/30"
                :class="errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'"
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
            <p v-if="errors.password" class="text-red-400 text-sm mt-2">{{ errors.password }}</p>
          </div>

          <!-- Confirm Password -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 1000 } }"
          >
            <label class="block text-sm font-medium mb-2 text-white/80">
              비밀번호 확인 <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="formData.confirmPassword"
                placeholder="비밀번호 재입력"
                class="w-full pl-12 pr-12 py-4 bg-white/5 border rounded-2xl focus:outline-none transition-colors text-white placeholder:text-white/30"
                :class="errors.confirmPassword ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'"
              />
              <button
                type="button"
                @click="toggleConfirmPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                <EyeOff v-if="showConfirmPassword" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="text-red-400 text-sm mt-2">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Agreements -->
          <div
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { delay: 1100 } }"
            class="space-y-3 pt-4"
          >
            <label
              class="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border transition-colors"
              :class="errors.terms ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'"
            >
              <div
                class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                :class="formData.agreeTerms ? 'bg-white border-white' : 'border-white/30'"
              >
                <Check v-if="formData.agreeTerms" class="w-4 h-4 text-black" />
              </div>
              <input type="checkbox" v-model="formData.agreeTerms" class="sr-only" />
              <span class="text-sm text-white/80">
                <span class="font-medium text-white">이용약관</span>에 동의합니다{' '}
                <span class="text-red-400">*</span>
              </span>
            </label>

            <label
              class="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border transition-colors"
              :class="errors.privacy ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'"
            >
              <div
                class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                :class="formData.agreePrivacy ? 'bg-white border-white' : 'border-white/30'"
              >
                <Check v-if="formData.agreePrivacy" class="w-4 h-4 text-black" />
              </div>
              <input type="checkbox" v-model="formData.agreePrivacy" class="sr-only" />
              <span class="text-sm text-white/80">
                <span class="font-medium text-white">개인정보처리방침</span>에 동의합니다{' '}
                <span class="text-red-400">*</span>
              </span>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 1200 } }"
            class="w-full py-4 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl transition-transform hover:scale-102 active:scale-98"
            :class="isEmployer ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'"
          >
            가입 완료
          </button>
        </form>

        <!-- Login Link -->
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 1300 } }"
          class="mt-6 text-center"
        >
          <p class="text-sm text-white/50">
            이미 계정이 있으신가요?{' '}
            <button @click="goBack" class="text-white hover:underline font-medium">
              로그인하기
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
