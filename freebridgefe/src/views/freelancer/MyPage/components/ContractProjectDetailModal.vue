<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  X,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  CreditCard,
  Loader2,
  TrendingUp,
  MapPin,
  Clock3,
} from 'lucide-vue-next';
import { getContract, type ContractResponseDto } from '@/api/contractApi';

const props = defineProps<{
  contractId: number | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isLoading = ref(false);
const contract = ref<ContractResponseDto | null>(null);

const toDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value?: string | null) => {
  const parsed = toDate(value);
  if (!parsed) return '-';
  return parsed.toLocaleDateString('ko-KR');
};

const formatCurrency = (amount?: number | null) => {
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) return '-';
  return `${amount.toLocaleString()}원`;
};

const contractStatusLabel = computed(() => {
  switch (contract.value?.status) {
    case 'WAITING_SIGNATURE':
      return '시작전';
    case 'IN_PROGRESS':
      return '진행중';
    case 'COMPLETED':
      return '완료';
    case 'REJECTED':
      return '종료';
    default:
      return '-';
  }
});

const progress = computed(() => {
  const start = toDate(contract.value?.startDate);
  const end = toDate(contract.value?.endDate);

  if (!start || !end) return 0;
  if (end <= start) return 0;

  const now = new Date();
  if (now <= start) return 0;
  if (now >= end) return 100;

  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
});

const progressLabel = computed(() => {
  const start = toDate(contract.value?.startDate);
  const end = toDate(contract.value?.endDate);

  if (!start || !end) return '일정 확인 필요';

  const now = new Date();
  const startDiff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const endDiff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (now < start) {
    return startDiff > 0 ? `시작까지 D-${startDiff}` : '곧 시작';
  }

  if (now > end) {
    return '프로젝트 완료';
  }

  return endDiff >= 0 ? `종료까지 D-${endDiff}` : '진행중';
});

const loadContract = async () => {
  if (!props.contractId || !props.isOpen) return;

  isLoading.value = true;
  try {
    contract.value = await getContract(props.contractId);
  } catch (error) {
    console.error('Failed to load contract detail:', error);
    contract.value = null;
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => [props.contractId, props.isOpen] as const,
  ([contractId, isOpen]) => {
    if (contractId && isOpen) {
      void loadContract();
      return;
    }

    if (!isOpen) {
      contract.value = null;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl flex flex-col">
      <div class="flex items-start justify-between gap-4 border-b border-white/10 bg-slate-900/90 px-6 py-5">
        <div>
          <div class="text-xs tracking-[0.2em] text-slate-400 mb-2">PROJECT DETAIL</div>
          <h2 class="text-2xl font-bold text-white">{{ contract?.projectName || '프로젝트 상세' }}</h2>
          <p class="mt-2 text-sm text-slate-400">프로젝트 정보와 계약 상태, 진행률을 함께 확인하세요.</p>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6">
        <div v-if="isLoading" class="flex min-h-[360px] items-center justify-center text-slate-400">
          <Loader2 class="mr-3 h-6 w-6 animate-spin" />
          계약 정보를 불러오는 중입니다.
        </div>

        <div v-else-if="contract" class="space-y-6">
          <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
              <div class="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <FileText class="w-4 h-4 text-sky-300" />
                프로젝트 정보
              </div>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div class="text-xs text-slate-400 mb-1">프로젝트명</div>
                  <div class="text-sm text-white">{{ contract.projectName }}</div>
                </div>
                <div>
                  <div class="text-xs text-slate-400 mb-1">고용주</div>
                  <div class="text-sm text-white">{{ contract.employerName || '-' }}</div>
                </div>
                <div>
                  <div class="text-xs text-slate-400 mb-1">프로젝트 설명</div>
                  <div class="text-sm text-white whitespace-pre-wrap">{{ contract.jobDescription || '-' }}</div>
                </div>
                <div>
                  <div class="text-xs text-slate-400 mb-1">근무 위치</div>
                  <div class="text-sm text-white flex items-center gap-2">
                    <MapPin class="w-4 h-4 text-slate-400" />
                    {{ contract.workLocation || '-' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div class="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <TrendingUp class="w-4 h-4 text-emerald-300" />
                진행률
              </div>
              <div class="text-4xl font-bold text-white mb-2">{{ progress }}%</div>
              <div class="text-sm text-slate-400 mb-4">{{ progressLabel }}</div>
              <div class="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-400 to-emerald-400 transition-all"
                  :style="{ width: `${progress}%` }"
                ></div>
              </div>
            </div>
          </section>

          <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div class="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <CreditCard class="w-4 h-4 text-violet-300" />
                계약 정보
              </div>
              <div class="space-y-3 text-sm">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-400">계약 번호</span>
                  <span class="text-white">#{{ contract.contractId }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-400">계약 상태</span>
                  <span class="text-white">{{ contractStatusLabel }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-400">계약 금액</span>
                  <span class="text-white">{{ formatCurrency(contract.budget) }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-400">계약 시작일</span>
                  <span class="text-white">{{ formatDate(contract.startDate) }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-400">계약 종료일</span>
                  <span class="text-white">{{ formatDate(contract.endDate) }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-400">서명 상태</span>
                  <span class="text-white">
                    {{ contract.employerSigned ? '고용주 서명 완료' : '고용주 서명 대기' }} /
                    {{ contract.freelancerSigned ? '프리랜서 서명 완료' : '프리랜서 서명 대기' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div class="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Calendar class="w-4 h-4 text-amber-300" />
                일정 및 근무 조건
              </div>
              <div class="space-y-3 text-sm">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-400">근무 시간</span>
                  <span class="text-white">
                    {{ contract.workStartTime || '-' }} ~ {{ contract.workEndTime || '-' }}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-400">휴게 시간</span>
                  <span class="text-white">
                    {{ contract.breakStartTime || '-' }} ~ {{ contract.breakEndTime || '-' }}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-400">주 근무일</span>
                  <span class="text-white">{{ contract.workDaysPerWeek ?? '-' }}일</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-400">주 휴일</span>
                  <span class="text-white">{{ contract.weeklyHoliday || '-' }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-400">프리랜서 연락처</span>
                  <span class="text-white">{{ contract.freelancerPhone || '-' }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-400">프리랜서 주소</span>
                  <span class="text-white">{{ contract.freelancerAddress || '-' }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div v-else class="flex min-h-[360px] items-center justify-center text-slate-400">
          <Clock3 class="mr-3 h-5 w-5" />
          계약 상세 정보를 불러오지 못했습니다.
        </div>
      </div>
    </div>
  </div>
</template>
