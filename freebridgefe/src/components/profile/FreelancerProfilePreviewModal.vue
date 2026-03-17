<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  isLoading?: boolean;
  profile: {
    name: string;
    avatarUrl?: string | null;
    job?: string | null;
    careerYears?: number | null;
    wage?: number | null;
    grade?: string | null;
    introduction?: string | null;
    skills?: string[];
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    portfolioUrl?: string | null;
    portfolioFileName?: string | null;
    portfolioLastUpdated?: string | null;
  };
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const fallbackText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : '정보 없음';
};

const formatWage = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return '협의 필요';
  }

  return `${value.toLocaleString()}원`;
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/10 bg-slate-950 text-white shadow-[0_35px_120px_-60px_rgba(88,28,135,0.75)]">
        <div class="relative px-7 py-8 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.22),_transparent_42%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(17,24,39,0.98))]">
          <button
            type="button"
            class="absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
            @click="emit('close')"
          >
            닫기
          </button>

          <div class="flex flex-col gap-5 md:flex-row md:items-center">
            <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-3xl font-bold text-white shadow-inner">
              <img
                v-if="profile.avatarUrl"
                :src="profile.avatarUrl"
                :alt="`${profile.name} avatar`"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ profile.name?.charAt(0) || '프' }}</span>
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-200/70">Freelancer Profile</p>
              <h2 class="mt-2 text-2xl font-bold">{{ fallbackText(profile.name) }}</h2>
              <div class="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/70">
                <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1">{{ fallbackText(profile.job) }}</span>
                <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1">{{ profile.careerYears ?? 0 }}년 경력</span>
                <span v-if="profile.grade" class="rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-1 text-fuchsia-100">{{ profile.grade }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="px-7 py-10 text-sm text-white/60">
          프로필 정보를 불러오는 중입니다.
        </div>

        <div v-else class="grid gap-4 px-7 py-7">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div class="text-[11px] uppercase tracking-[0.24em] text-white/40">희망 급여</div>
              <div class="mt-2 text-sm font-medium text-white/90">{{ formatWage(profile.wage) }}</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div class="text-[11px] uppercase tracking-[0.24em] text-white/40">연락처</div>
              <div class="mt-2 text-sm font-medium text-white/90">{{ fallbackText(profile.phone) }}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div class="text-[11px] uppercase tracking-[0.24em] text-white/40">이메일</div>
              <div class="mt-2 break-all text-sm font-medium text-white/90">{{ fallbackText(profile.email) }}</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div class="text-[11px] uppercase tracking-[0.24em] text-white/40">주소</div>
              <div class="mt-2 text-sm font-medium text-white/90">{{ fallbackText(profile.address) }}</div>
            </div>
          </div>

          <div class="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
            <div class="text-[11px] uppercase tracking-[0.24em] text-white/40">소개</div>
            <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/80">
              {{ fallbackText(profile.introduction) }}
            </p>
          </div>

          <div class="rounded-[26px] border border-fuchsia-300/15 bg-fuchsia-400/5 p-5">
            <div class="text-[11px] uppercase tracking-[0.24em] text-fuchsia-100/60">기술 스택</div>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="skill in profile.skills ?? []"
                :key="skill"
                class="rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium text-fuchsia-100"
              >
                {{ skill }}
              </span>
              <span v-if="!(profile.skills ?? []).length" class="text-sm text-white/60">정보 없음</span>
            </div>
          </div>

          <div class="flex flex-wrap justify-end gap-3">
            <span v-if="profile.portfolioLastUpdated" class="self-center text-xs text-white/40">
              {{ profile.portfolioLastUpdated }}
            </span>
            <a
              v-if="profile.portfolioUrl"
              :href="profile.portfolioUrl"
              :download="profile.portfolioFileName || 'portfolio.pdf'"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {{ profile.portfolioFileName || '포트폴리오 PDF 다운로드' }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
