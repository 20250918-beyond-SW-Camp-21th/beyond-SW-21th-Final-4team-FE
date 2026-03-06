<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Crown,
  Check,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import {
  getAccountInfo,
  updateAccountInfo,
  getEmployerSubscription,
  updateEmployerSubscription,
  changeEmployerPassword
} from '@/api/MyPage/accountApi';

defineEmits<{
  (e: 'back'): void;
}>();

type PlanType = 'FREE' | 'PRO' | 'PRIME';
type AccountSection = 'subscription' | 'profile';

const activeSection = ref<AccountSection>('subscription');
const isLoading = ref(false);
const isSaving = ref(false);
const authStore = useAuthStore();

const accountInfo = ref({
  name: '',
  email: '',
  phone: '',
});

const currentPlan = ref<PlanType>('PRO');

const normalizePlan = (plan?: string): PlanType => {
  const normalizedPlan = (plan ?? 'FREE').trim().toUpperCase();
  if (normalizedPlan === 'PARTNER') return 'PRO';
  if (normalizedPlan === 'ENTERPRISE') return 'PRIME';
  if (normalizedPlan === 'PRO' || normalizedPlan === 'PRIME') return normalizedPlan;
  return 'FREE';
};

interface SubscriptionPlan {
  name: string;
  description: string;
  price: string;
  period: string;
  fee: string;
  icon: string;
  features: string[];
}

const plans = ref<Record<string, SubscriptionPlan>>({});

const verificationPassword = ref('');
const verificationError = ref('');
const isVerifying = ref(false);
const isProfileVerified = ref(false);
const isPasswordSaving = ref(false);

const fetchAccountInfo = async () => {
  isLoading.value = true;
  try {
    accountInfo.value = await getAccountInfo();
  } catch (error) {
    console.error('Failed to fetch account info:', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchSubscriptionPlans = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));
    plans.value = {
      FREE: {
        name: '무료 플랜',
        description: '부담 없이 시작하는 기본 구독',
        price: '무료',
        period: '',
        fee: '12%',
        icon: '🧊',
        features: ['최신순 조회만 가능', '기본 지원'],
      },
      PRO: {
        name: '프로 플랜',
        description: '채용 효율을 높이는 구독',
        price: '월 9,000',
        period: '월',
        fee: '10%',
        icon: '💎',
        features: ['다양한 조회 가능', '추천 기능 제공', '수수료 할인 (10%)'],
      },
      PRIME: {
        name: '프라임 플랜',
        description: '빠른 매칭을 위한 최상위 구독',
        price: '월 19,000',
        period: '월',
        fee: '7%',
        icon: '👑',
        features: ['다양한 조회 가능', '추천 기능 제공', '대폭 수수료 할인 (7%)', '전담 AI 컨설팅 배정'],
      },
    };
  } catch (error) {
    console.error('Failed to fetch subscription plans:', error);
  }
};

const fetchCurrentPlan = async () => {
  try {
    const subscription = await getEmployerSubscription();
    currentPlan.value = normalizePlan(subscription.currentPlan);
  } catch (error) {
    console.error('Failed to fetch current subscription plan:', error);
    currentPlan.value = 'FREE';
  }
};

const handleVerifyIdentity = async () => {
  verificationError.value = '';
  const email = authStore.user?.email || accountInfo.value.email;

  if (!verificationPassword.value.trim()) {
    verificationError.value = '비밀번호를 입력해 주세요.';
    return;
  }

  if (!email) {
    verificationError.value = '로그인한 계정의 이메일 정보를 찾을 수 없습니다. 다시 로그인해 주세요.';
    isProfileVerified.value = false;
    return;
  }

  try {
    isVerifying.value = true;
    await authStore.login({ email, password: verificationPassword.value });
    isProfileVerified.value = true;
    verificationPassword.value = '';
  } catch (error) {
    console.error('Failed to verify password:', error);
    verificationError.value = '비밀번호가 올바르지 않습니다.';
    isProfileVerified.value = false;
  } finally {
    isVerifying.value = false;
  }
};

const resetProfileVerification = () => {
  isProfileVerified.value = false;
  verificationPassword.value = '';
  verificationError.value = '';
};

const handleSaveAccountInfo = async () => {
  if (!isProfileVerified.value) {
    alert('비밀번호 확인 후에만 정보를 수정할 수 있습니다.');
    return;
  }

  try {
    isSaving.value = true;
    await updateAccountInfo(accountInfo.value);
    alert('계정 정보가 수정되었습니다.');
  } catch (error) {
    console.error('Failed to update account info:', error);
    alert('수정에 실패했습니다.');
  } finally {
    isSaving.value = false;
  }
};

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
});

const passwordError = ref('');

const validatePasswordForm = () => {
  passwordError.value = '';
  if (!passwordForm.value.current.trim()) {
    passwordError.value = '현재 비밀번호를 입력해 주세요.';
    return false;
  }
  if (!passwordForm.value.new.trim()) {
    passwordError.value = '새 비밀번호를 입력해 주세요.';
    return false;
  }
  if (passwordForm.value.new.length < 8) {
    passwordError.value = '새 비밀번호는 8자 이상이어야 합니다.';
    return false;
  }
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    passwordError.value = '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.';
    return false;
  }
  return true;
};

const handleChangePassword = async () => {
  if (!isProfileVerified.value) {
    alert('비밀번호 확인 후에만 변경할 수 있습니다.');
    return;
  }
  if (!validatePasswordForm()) return;

  try {
    isPasswordSaving.value = true;
    await changeEmployerPassword(passwordForm.value);
    resetProfileVerification();
    alert('비밀번호가 변경되었습니다.');
    passwordForm.value = { current: '', new: '', confirm: '' };
    passwordError.value = '';
  } catch (error) {
    console.error('Failed to change password:', error);
    passwordError.value = '비밀번호 변경에 실패했습니다.';
  } finally {
    isPasswordSaving.value = false;
  }
};

const handlePlanChange = async (plan: PlanType) => {
  if (plan === currentPlan.value) return;
  const selectedPlan = plans.value[plan];
  if (!selectedPlan) return;

  if (confirm(`${selectedPlan.name}로 변경하시겠습니까?`)) {
    try {
      isLoading.value = true;
      await updateEmployerSubscription(plan);
      currentPlan.value = plan;
      alert(`${selectedPlan.name}로 변경되었습니다.`);
    } catch (error) {
      console.error('Failed to change plan:', error);
      alert('플랜 변경에 실패했습니다.');
    } finally {
      isLoading.value = false;
    }
  }
};

onMounted(() => {
  fetchAccountInfo();
  fetchSubscriptionPlans();
  fetchCurrentPlan();
});
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 md:px-8 py-8 text-white">
    <div class="flex items-center gap-4 mb-8">
      <button @click="$emit('back')" class="p-2 hover:bg-white/5 rounded-lg transition-colors">
        <ArrowLeft class="w-5 h-5 text-white/60" />
      </button>
      <div>
        <h1 class="text-2xl font-bold">고용주 계정 관리</h1>
        <p class="text-sm text-white/40 mt-1">구독과 계정 정보를 관리하세요</p>
      </div>
    </div>

    <div class="mb-6 inline-flex bg-white/5 border border-white/10 rounded-xl p-1">
      <button
        @click="activeSection = 'subscription'"
        class="px-4 py-2 text-sm font-bold rounded-lg transition-colors"
        :class="activeSection === 'subscription' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'"
      >
        구독
      </button>
      <button
        @click="activeSection = 'profile'; resetProfileVerification()"
        class="px-4 py-2 text-sm font-bold rounded-lg transition-colors"
        :class="activeSection === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'"
      >
        회원정보
      </button>
    </div>

    <div
      v-if="activeSection === 'subscription'"
      class="bg-[#1e293b]/50 rounded-2xl border border-white/10 p-8"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
    >
      <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
        <Crown class="w-5 h-5 text-yellow-400" />
        구독 플랜
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="(plan, planKey) in plans"
          :key="planKey"
          class="relative rounded-2xl p-6 border-2 transition-all flex flex-col h-full"
          :class="currentPlan === planKey ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1 }"
        >
          <div v-if="currentPlan === planKey" class="absolute top-4 right-4">
            <div class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">현재 플랜</div>
          </div>

          <div class="text-4xl mb-4">{{ plan.icon }}</div>
          <h3 class="text-xl font-bold mb-1">{{ plan.name }}</h3>
          <p class="text-sm text-slate-400 mb-4">{{ plan.description }}</p>

          <div class="mb-4">
            <div>
              <span class="text-3xl font-bold text-white">{{ plan.price }}</span>
              <span v-if="plan.period" class="text-sm text-slate-400">/{{ plan.period }}</span>
            </div>
            <div class="mt-1">
              <span class="text-sm font-bold text-blue-400">{{ plan.fee }}</span>
              <span class="text-xs text-slate-500 ml-1">수수료</span>
            </div>
          </div>

          <ul class="space-y-3 mb-8 flex-1">
            <li v-for="(feature, idx) in plan.features" :key="idx" class="flex items-start gap-2 text-sm text-white/80">
              <Check class="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span>{{ feature }}</span>
            </li>
          </ul>

          <button
            @click="handlePlanChange(planKey as PlanType)"
            :disabled="currentPlan === planKey || isLoading"
            class="w-full py-3 rounded-lg font-bold transition-all mt-auto disabled:opacity-60 disabled:cursor-not-allowed"
            :class="currentPlan === planKey ? 'bg-blue-500 text-white cursor-default' : 'bg-white/10 text-white hover:bg-white/20'"
          >
            {{ currentPlan === planKey ? '사용 중' : '변경하기' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="bg-[#1e293b]/50 rounded-2xl border border-white/10 p-8"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
    >
      <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
        <User class="w-5 h-5 text-blue-400" />
        회원정보
      </h2>

      <div v-if="!isProfileVerified" class="max-w-lg">
        <p class="text-sm text-slate-300 mb-4">
          보안을 위해 비밀번호를 먼저 확인합니다.
        </p>
        <label class="text-xs text-white/50 mb-2 block">비밀번호 확인</label>
        <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
          <Lock class="w-4 h-4 text-slate-400" />
          <input
            type="password"
            v-model="verificationPassword"
            class="bg-transparent border-none outline-none w-full text-white text-sm"
            placeholder="비밀번호를 입력하세요"
            @keyup.enter="handleVerifyIdentity"
          />
        </div>
        <p v-if="verificationError" class="text-sm text-red-400 mt-2">{{ verificationError }}</p>
        <button
          @click="handleVerifyIdentity"
          :disabled="isVerifying"
          class="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {{ isVerifying ? '확인 중...' : '확인' }}
        </button>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <p class="text-sm text-green-300">비밀번호 확인이 완료되었습니다. 회원정보를 수정할 수 있습니다.</p>
          <button @click="resetProfileVerification" class="text-xs text-slate-400 hover:text-white transition-colors">
            다시 인증하기
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-white/50 mb-2 block">이름</label>
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <User class="w-4 h-4 text-slate-400" />
              <input type="text" v-model="accountInfo.name" class="bg-transparent border-none outline-none w-full text-white text-sm" />
            </div>
          </div>

          <div>
            <label class="text-xs text-white/50 mb-2 block">이메일</label>
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <Mail class="w-4 h-4 text-slate-400" />
              <input type="email" v-model="accountInfo.email" class="bg-transparent border-none outline-none w-full text-white text-sm" />
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="text-xs text-white/50 mb-2 block">휴대폰 번호</label>
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <Phone class="w-4 h-4 text-slate-400" />
              <input type="tel" v-model="accountInfo.phone" class="bg-transparent border-none outline-none w-full text-white text-sm" />
            </div>
          </div>
        </div>

        <button
          @click="handleSaveAccountInfo"
          :disabled="isSaving || isLoading"
          class="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save class="w-4 h-4" />
          {{ isSaving ? '저장 중...' : '정보 저장' }}
        </button>

        <div class="mt-10 pt-8 border-t border-white/10">
          <h3 class="text-base font-bold mb-4">비밀번호 변경</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-white/50 mb-2 block">현재 비밀번호</label>
              <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                <Lock class="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  v-model="passwordForm.current"
                  class="bg-transparent border-none outline-none w-full text-white text-sm"
                  placeholder="현재 비밀번호"
                />
              </div>
            </div>
            <div>
              <label class="text-xs text-white/50 mb-2 block">새 비밀번호</label>
              <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                <Lock class="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  v-model="passwordForm.new"
                  class="bg-transparent border-none outline-none w-full text-white text-sm"
                  placeholder="8자 이상"
                />
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="text-xs text-white/50 mb-2 block">새 비밀번호 확인</label>
              <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                <Lock class="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  v-model="passwordForm.confirm"
                  class="bg-transparent border-none outline-none w-full text-white text-sm"
                  placeholder="새 비밀번호 확인"
                />
              </div>
            </div>
          </div>

          <p v-if="passwordError" class="text-sm text-red-400 mt-3">{{ passwordError }}</p>

          <button
            @click="handleChangePassword"
            :disabled="isPasswordSaving"
            class="mt-4 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ isPasswordSaving ? '변경 중...' : '비밀번호 변경' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
