<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  isLoading?: boolean;
  profile: {
    companyName: string;
    logoUrl?: string | null;
    industry?: string | null;
    scale?: string | null;
    location?: string | null;
    phone?: string | null;
    website?: string | null;
    description?: string | null;
  };
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const fallbackText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : '정보 없음';
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-lg overflow-hidden rounded-[30px] border border-white/10 bg-slate-950 text-white shadow-[0_35px_120px_-60px_rgba(15,23,42,0.95)]">
        <div class="relative px-7 py-8 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_45%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.98))]">
          <button
            type="button"
            class="absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
            @click="emit('close')"
          >
            닫기
          </button>

          <div class="flex items-center gap-4">
            <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-white/5 text-3xl font-bold text-blue-200 shadow-inner">
              <img
                v-if="profile.logoUrl"
                :src="profile.logoUrl"
                :alt="`${profile.companyName} logo`"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ profile.companyName?.charAt(0) || '기' }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/70">Employer Profile</p>
              <h2 class="mt-2 truncate text-2xl font-bold">{{ fallbackText(profile.companyName) }}</h2>
              <p class="mt-2 text-sm text-white/65">{{ fallbackText(profile.description) }}</p>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="px-7 py-10 text-sm text-white/60">
          프로필 정보를 불러오는 중입니다.
        </div>

        <div v-else class="grid gap-4 px-7 py-7">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div class="text-[11px] uppercase tracking-[0.24em] text-white/40">업종</div>
              <div class="mt-2 text-sm font-medium text-white/90">{{ fallbackText(profile.industry) }}</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div class="text-[11px] uppercase tracking-[0.24em] text-white/40">위치</div>
              <div class="mt-2 text-sm font-medium text-white/90">{{ fallbackText(profile.location) }}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div class="text-[11px] uppercase tracking-[0.24em] text-white/40">연락처</div>
              <div class="mt-2 text-sm font-medium text-white/90">{{ fallbackText(profile.phone) }}</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div class="text-[11px] uppercase tracking-[0.24em] text-white/40">웹사이트</div>
              <div class="mt-2 break-all text-sm font-medium text-white/90">{{ fallbackText(profile.website) }}</div>
            </div>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div class="text-[11px] uppercase tracking-[0.24em] text-white/40">기업 규모</div>
            <div class="mt-2 text-sm font-medium text-white/90">{{ fallbackText(profile.scale) }}</div>
          </div>

          <div class="rounded-[26px] border border-blue-400/15 bg-blue-400/5 p-5">
            <div class="text-[11px] uppercase tracking-[0.24em] text-blue-100/60">기업 소개</div>
            <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/80">
              {{ fallbackText(profile.description) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
