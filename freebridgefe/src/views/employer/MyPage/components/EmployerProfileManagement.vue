<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
  ArrowLeft,
  Building2,
  Crown,
  Mail,
  Phone,
  MapPin,
  Users,
  Save,
  Globe,
  Briefcase,
  Edit2,
  Loader2
} from 'lucide-vue-next';

import { getEmployerProfile, updateEmployerProfile, type EmployerProfileData } from '@/api/MyPage/employer';

defineEmits<{
  (e: 'back'): void;
}>();

const isLoading = ref(false);
const isSaving = ref(false);

const PLAN_LABELS: Record<string, string> = {
  FREE: '무료 플랜',
  PRO: '프로 플랜',
  PRIME: '프라임 플랜',
  PARTNER: '프로 플랜',
  ENTERPRISE: '프라임 플랜',
};

const profileData = ref<EmployerProfileData>({
  companyName: '',
  industry: '',
  size: '',
  location: '',
  website: '',
  email: '',
  phone: '',
  description: '',
  plan: 'FREE',
});

const companySizeOptions = [
  '1-10명',
  '10-50명',
  '50-100명',
  '100-500명',
  '500명 이상',
];

const fetchProfile = async () => {
  isLoading.value = true;
  try {
    const data = await getEmployerProfile();
    profileData.value = data;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});

const subscriptionPlanText = computed(() => {
  const normalizedPlan = (profileData.value.plan ?? 'FREE').toUpperCase();
  return PLAN_LABELS[normalizedPlan] ?? normalizedPlan;
});

const handleSave = async () => {
  isSaving.value = true;
  try {
    await updateEmployerProfile(profileData.value);
    alert('프로필이 성공적으로 저장되었습니다.');
  } catch (error) {
    console.error('Failed to save profile:', error);
    alert('저장에 실패했습니다.');
  } finally {
    isSaving.value = false;
  }
};
</script>


<template>
  <div class="max-w-4xl mx-auto px-4 md:px-8 py-8 text-white">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <button
          @click="$emit('back')"
          class="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft class="w-5 h-5 text-white/60" />
        </button>
        <div>
          <h1 class="text-2xl font-bold">고용주 프로필 관리</h1>
          <p class="text-sm text-white/40 mt-1">고용주 정보를 관리하세요</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button
          @click="handleSave"
          :disabled="isSaving"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          {{ isSaving ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>

    <!-- Profile Content -->
    <div
      class="bg-[#1e293b]/50 rounded-2xl border border-white/10 p-8"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
    >
      <div class="space-y-6">
        <!-- Company Name -->
        <div>
          <label class="text-xs text-white/50 mb-2 block flex items-center gap-2">
            <Building2 class="w-4 h-4" />
            고용주명
          </label>
          <input
            type="text"
            v-model="profileData.companyName"
            class="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Subscription Plan -->
          <div>
            <label class="text-xs text-white/50 mb-2 block flex items-center gap-2">
              <Crown class="w-4 h-4" />
              구독 등급
            </label>
            <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {{ subscriptionPlanText }}
            </div>
            <p class="text-[11px] text-white/40 mt-2">등급 변경은 계정 관리 메뉴에서 가능합니다.</p>
          </div>

          <!-- Industry -->
          <div>
            <label class="text-xs text-white/50 mb-2 block flex items-center gap-2">
              <Briefcase class="w-4 h-4" />
              업종
            </label>
            <input
              v-if="isEditing"
              type="text"
              v-model="profileData.industry"
              class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            />
            <div v-else class="text-white/80">{{ profileData.industry }}</div>
          </div>

          <!-- Company Size -->
          <div>
            <label class="text-xs text-white/50 mb-2 block flex items-center gap-2">
              <Users class="w-4 h-4" />
              고용주 규모
            </label>
          <select
            v-model="profileData.size"
            class="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors appearance-none"
          >
            <option v-for="option in companySizeOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        </div>

        <!-- Location -->
        <div>
          <label class="text-xs text-white/50 mb-2 block flex items-center gap-2">
            <MapPin class="w-4 h-4" />
            위치
          </label>
          <input
            type="text"
            v-model="profileData.location"
            class="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Website -->
          <div>
            <label class="text-xs text-white/50 mb-2 block flex items-center gap-2">
              <Globe class="w-4 h-4" />
              웹사이트
            </label>
            <input
              type="url"
              v-model="profileData.website"
              class="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="text-xs text-white/50 mb-2 block flex items-center gap-2">
              <Mail class="w-4 h-4" />
              이메일
            </label>
            <input
              type="email"
              v-model="profileData.email"
              class="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <!-- Phone -->
        <div>
          <label class="text-xs text-white/50 mb-2 block flex items-center gap-2">
            <Phone class="w-4 h-4" />
            연락처
          </label>
          <input
            type="tel"
            v-model="profileData.phone"
            class="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="text-xs text-white/50 mb-2 block">고용주 소개</label>
          <textarea
            v-model="profileData.description"
            rows="4"
            class="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors resize-none"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
