<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  Save,
  Globe,
  Briefcase,
  Edit2,
  Loader2,
} from 'lucide-vue-next';

import { getEmployerProfile, updateEmployerProfile, type EmployerProfileData } from '@/api/MyPage/employer';

defineEmits<{
  (e: 'back'): void;
}>();

const isEditing = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);

const profileData = ref<EmployerProfileData>({
  companyName: '',
  industry: '',
  size: '',
  location: '',
  website: '',
  email: '',
  phone: '',
  description: '',
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

const handleSave = async () => {
  isSaving.value = true;
  try {
    await updateEmployerProfile(profileData.value);
    isEditing.value = false;
    // alert('프로필이 저장되었습니다.'); // Optional: Use toast notification instead if available
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
      <div v-if="!isEditing">
        <button
          @click="isEditing = true"
          class="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10 flex items-center gap-2"
        >
          <Edit2 class="w-4 h-4" />
          수정하기
        </button>
      </div>
      <div v-else class="flex gap-2">
        <button
          @click="isEditing = false"
          class="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
        >
          취소
        </button>
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
            v-if="isEditing"
            type="text"
            v-model="profileData.companyName"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
          />
          <div v-else class="font-semibold text-lg">{{ profileData.companyName }}</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              v-if="isEditing"
              v-model="profileData.size"
              class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors appearance-none"
            >
              <option v-for="option in companySizeOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            <div v-else class="text-white/80">{{ profileData.size }}</div>
          </div>
        </div>

        <!-- Location -->
        <div>
          <label class="text-xs text-white/50 mb-2 block flex items-center gap-2">
            <MapPin class="w-4 h-4" />
            위치
          </label>
          <input
            v-if="isEditing"
            type="text"
            v-model="profileData.location"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
          />
          <div v-else class="text-white/80">{{ profileData.location }}</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Website -->
          <div>
            <label class="text-xs text-white/50 mb-2 block flex items-center gap-2">
              <Globe class="w-4 h-4" />
              웹사이트
            </label>
            <input
              v-if="isEditing"
              type="url"
              v-model="profileData.website"
              class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            />
            <a
              v-else
              :href="profileData.website"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-400 hover:underline"
            >
              {{ profileData.website }}
            </a>
          </div>

          <!-- Email -->
          <div>
            <label class="text-xs text-white/50 mb-2 block flex items-center gap-2">
              <Mail class="w-4 h-4" />
              이메일
            </label>
            <input
              v-if="isEditing"
              type="email"
              v-model="profileData.email"
              class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            />
            <div v-else class="text-white/80">{{ profileData.email }}</div>
          </div>
        </div>

        <!-- Phone -->
        <div>
          <label class="text-xs text-white/50 mb-2 block flex items-center gap-2">
            <Phone class="w-4 h-4" />
            연락처
          </label>
          <input
            v-if="isEditing"
            type="tel"
            v-model="profileData.phone"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
          />
          <div v-else class="text-white/80">{{ profileData.phone }}</div>
        </div>

        <!-- Description -->
        <div>
          <label class="text-xs text-white/50 mb-2 block">고용주 소개</label>
          <textarea
            v-if="isEditing"
            v-model="profileData.description"
            rows="4"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors resize-none"
          ></textarea>
          <div v-else class="text-white/80 leading-relaxed">{{ profileData.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
