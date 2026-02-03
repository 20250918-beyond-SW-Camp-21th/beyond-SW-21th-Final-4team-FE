<script setup lang="ts">
import { ref } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Key,
  Crown,
  Check,
} from 'lucide-vue-next';

defineEmits<{
  (e: 'back'): void;
}>();

type PlanType = 'FREE' | 'PRO' | 'PRIME';

const accountInfo = ref({
  name: '김대표',
  email: 'ceo@techstartup.com',
  phone: '010-1234-5678',
});

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const showPasswords = ref({
  current: false,
  new: false,
  confirm: false,
});

const currentPlan = ref<PlanType>('PRO');

const plans = {
  FREE: {
    name: '무료 플랜',
    price: '₩0',
    period: '영구 무료',
    icon: '🌱',
    color: 'from-gray-400 to-gray-600',
    features: ['기본 공고 등록', '제한적 채팅', '월 3개 프로젝트', '기본 지원'],
  },
  PRO: {
    name: '프로 플랜',
    price: '₩99,000',
    period: '월',
    icon: '⚡',
    color: 'from-blue-500 to-cyan-500',
    features: [
      '무제한 공고 등록',
      '무제한 채팅',
      '무제한 프로젝트',
      '우선 지원',
      '프리랜서 추천',
      '분석 리포트',
    ],
  },
  PRIME: {
    name: '프라임 플랜',
    price: '₩199,000',
    period: '월',
    icon: '👑',
    color: 'from-purple-500 to-pink-500',
    features: [
      '프로 플랜 모든 기능',
      '전담 매니저',
      '계약서 검토',
      'VIP 지원',
      '맞춤형 컨설팅',
      '우선 매칭',
    ],
  },
};

const handleSaveAccountInfo = () => {
  alert('계정 정보가 저장되었습니다.');
};

const handleChangePassword = () => {
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    alert('새 비밀번호가 일치하지 않습니다.');
    return;
  }
  if (passwordData.value.newPassword.length < 8) {
    alert('비밀번호는 최소 8자 이상이어야 합니다.');
    return;
  }
  alert('비밀번호가 변경되었습니다.');
  passwordData.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
};

const handlePlanChange = (plan: PlanType) => {
  if (plan === currentPlan.value) return;
  if (confirm(`${plans[plan].name}으로 변경하시겠습니까?`)) {
    currentPlan.value = plan;
    alert(`${plans[plan].name}으로 변경되었습니다.`);
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 md:px-8 py-8 text-white">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <button
        @click="$emit('back')"
        class="p-2 hover:bg-white/5 rounded-lg transition-colors"
      >
        <ArrowLeft class="w-5 h-5 text-white/60" />
      </button>
      <div>
        <h1 class="text-2xl font-bold">고용주 계정 관리</h1>
        <p class="text-sm text-white/40 mt-1">계정 정보 및 구독 플랜을 관리하세요</p>
      </div>
    </div>

    <div class="space-y-6">
      <!-- Subscription Plans -->
      <div
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
            class="relative rounded-2xl p-6 border-2 transition-all"
            :class="
              currentPlan === planKey
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            "
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{ opacity: 1, scale: 1 }"
          >
            <div v-if="currentPlan === planKey" class="absolute top-4 right-4">
              <div class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                현재 플랜
              </div>
            </div>

            <div class="text-4xl mb-4">{{ plan.icon }}</div>
            <h3 class="text-xl font-bold mb-2">{{ plan.name }}</h3>
            <div class="mb-4">
              <span class="text-3xl font-bold">{{ plan.price }}</span>
              <span v-if="planKey !== 'FREE'" class="text-white/40 text-sm">/{{ plan.period }}</span>
            </div>

            <ul class="space-y-2 mb-6">
              <li
                v-for="(feature, idx) in plan.features"
                :key="idx"
                class="flex items-center gap-2 text-sm text-white/60"
              >
                <Check class="w-4 h-4 text-green-400 flex-shrink-0" />
                {{ feature }}
              </li>
            </ul>

            <button
              @click="handlePlanChange(planKey as PlanType)"
              :disabled="currentPlan === planKey"
              class="w-full py-3 rounded-lg font-bold transition-all"
              :class="
                currentPlan === planKey
                  ? 'bg-blue-500 text-white cursor-default'
                  : 'bg-white/10 text-white hover:bg-white/20'
              "
            >
              {{ currentPlan === planKey ? '사용 중' : '선택하기' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Account Information -->
      <div
        class="bg-[#1e293b]/50 rounded-2xl border border-white/10 p-8"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold flex items-center gap-2">
            <User class="w-5 h-5 text-blue-400" />
            기본 정보
          </h2>
          <button
            @click="handleSaveAccountInfo"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
          >
            <Save class="w-4 h-4" />
            저장
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-white/50 mb-2 block">이름</label>
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <User class="w-4 h-4 text-slate-400" />
              <input
                type="text"
                v-model="accountInfo.name"
                class="bg-transparent border-none outline-none w-full text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label class="text-xs text-white/50 mb-2 block">이메일</label>
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <Mail class="w-4 h-4 text-slate-400" />
              <input
                type="email"
                v-model="accountInfo.email"
                class="bg-transparent border-none outline-none w-full text-white text-sm"
              />
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="text-xs text-white/50 mb-2 block">휴대폰 번호</label>
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <Phone class="w-4 h-4 text-slate-400" />
              <input
                type="tel"
                v-model="accountInfo.phone"
                class="bg-transparent border-none outline-none w-full text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Password Change -->
      <div
        class="bg-[#1e293b]/50 rounded-2xl border border-white/10 p-8"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
      >
        <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
          <Lock class="w-5 h-5 text-purple-400" />
          비밀번호 변경
        </h2>

        <div class="space-y-4">
          <div>
            <label class="text-xs text-white/50 mb-2 block">현재 비밀번호</label>
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <Key class="w-4 h-4 text-slate-400" />
              <input
                :type="showPasswords.current ? 'text' : 'password'"
                v-model="passwordData.currentPassword"
                class="bg-transparent border-none outline-none w-full text-white text-sm"
                placeholder="현재 비밀번호를 입력하세요"
              />
              <button
                @click="showPasswords.current = !showPasswords.current"
                class="text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                <component :is="showPasswords.current ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label class="text-xs text-white/50 mb-2 block">새 비밀번호</label>
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <Lock class="w-4 h-4 text-slate-400" />
              <input
                :type="showPasswords.new ? 'text' : 'password'"
                v-model="passwordData.newPassword"
                class="bg-transparent border-none outline-none w-full text-white text-sm"
                placeholder="새 비밀번호 (최소 8자)"
              />
              <button
                @click="showPasswords.new = !showPasswords.new"
                class="text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                <component :is="showPasswords.new ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label class="text-xs text-white/50 mb-2 block">새 비밀번호 확인</label>
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <Lock class="w-4 h-4 text-slate-400" />
              <input
                :type="showPasswords.confirm ? 'text' : 'password'"
                v-model="passwordData.confirmPassword"
                class="bg-transparent border-none outline-none w-full text-white text-sm"
                placeholder="새 비밀번호를 다시 입력하세요"
              />
              <button
                @click="showPasswords.confirm = !showPasswords.confirm"
                class="text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                <component :is="showPasswords.confirm ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            @click="handleChangePassword"
            class="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors"
          >
            비밀번호 변경
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
