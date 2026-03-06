<script setup lang="ts">
import { ref, computed } from "vue";
import {
  X,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  User,
  PenTool,
  Clock,
  MapPin,
  Briefcase,
  Shield,
  ScrollText,
} from "lucide-vue-next";
import type { ContractWithDetails } from "@/stores/contractStore";
import ContractPreview from "@/components/contract/ContractPreview.vue";

type ViewTab = "details" | "contract";

const props = defineProps<{
  contract: ContractWithDetails;
  isFreelancer?: boolean;
}>();

defineEmits<{
  (e: "close"): void;
  (e: "sign"): void;
}>();

const statusLabels: Record<string, string> = {
  WAITING_SIGNATURE: "서명 대기",
  IN_PROGRESS: "진행 중",
  COMPLETED: "완료",
  REJECTED: "거절됨",
};

const canSign = computed(() => {
  if (props.contract.status !== "WAITING_SIGNATURE") return false;
  if (props.isFreelancer) {
    return (
      props.contract.employerSignature && !props.contract.freelancerSignature
    );
  }
  return false;
});

const formatDate = (date: Date | string | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ko-KR");
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString() + "원";
};

const isFlexibleWork = computed(() => props.contract.workStartTime === "자율");

const activeTab = ref<ViewTab>("details");
</script>

<template>
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      v-motion
      :initial="{ opacity: 0, scale: 0.95, y: 20 }"
      :enter="{ opacity: 1, scale: 1, y: 0 }"
      :leave="{ opacity: 0, scale: 0.95, y: 20 }"
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-white/10 z-10"
      >
        <div class="p-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
            >
              <FileText class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white">계약서 상세</h2>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-white/10 rounded-xl transition-colors"
            v-motion
            :hover="{ scale: 1.1, rotate: 90 }"
            :tap="{ scale: 0.9 }"
          >
            <X class="w-6 h-6 text-white" />
          </button>
        </div>

        <!-- Tab Navigation -->
        <div class="px-6 pb-4 flex gap-2">
          <button
            @click="activeTab = 'details'"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            :class="
              activeTab === 'details'
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            "
          >
            <Briefcase class="w-4 h-4" />
            상세 정보
          </button>
          <button
            @click="activeTab = 'contract'"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            :class="
              activeTab === 'contract'
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            "
          >
            <ScrollText class="w-4 h-4" />
            계약서 보기
          </button>
        </div>
      </div>

      <!-- Details Tab Content -->
      <div v-if="activeTab === 'details'" class="p-6 space-y-6 text-white">
        <!-- Project Info -->
        <div
          class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
        >
          <h3 class="text-xl font-bold mb-4">프로젝트 정보</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-white/60 mb-1">프로젝트명</div>
              <div class="text-lg font-medium">
                {{ contract.projectName }}
              </div>
            </div>
            <div v-if="contract.projectId">
              <div class="text-sm text-white/60 mb-1">프로젝트 ID</div>
              <div class="text-lg font-medium">{{ contract.projectId }}</div>
            </div>
            <div>
              <div class="text-sm text-white/60 mb-1">계약 상태</div>
              <div class="text-lg font-medium">
                {{ statusLabels[contract.status] || contract.status }}
              </div>
            </div>
            <div>
              <div class="text-sm text-white/60 mb-1">프리랜서</div>
              <div class="text-lg font-medium flex items-center gap-2">
                <User class="w-4 h-4" />
                {{ contract.freelancerName }}
              </div>
            </div>
            <div>
              <div class="text-sm text-white/60 mb-1">고용주</div>
              <div class="text-lg font-medium flex items-center gap-2">
                <User class="w-4 h-4" />
                {{ contract.employerName }}
              </div>
            </div>
          </div>
        </div>

        <!-- Period & Budget -->
        <div class="grid md:grid-cols-2 gap-6">
          <div
            class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <div class="flex items-center gap-3 mb-3">
              <Calendar class="w-6 h-6 text-blue-400" />
              <h3 class="text-lg font-bold">계약 기간</h3>
            </div>
            <div class="text-sm text-white/60 mb-1">시작일</div>
            <div class="text-lg font-medium mb-3">
              {{ formatDate(contract.startDate) }}
            </div>
            <div class="text-sm text-white/60 mb-1">종료일</div>
            <div class="text-lg font-medium">
              {{ formatDate(contract.endDate) }}
            </div>
          </div>

          <div
            class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <div class="flex items-center gap-3 mb-3">
              <DollarSign class="w-6 h-6 text-green-400" />
              <h3 class="text-lg font-bold">계약 금액</h3>
            </div>
            <div class="text-sm text-white/60 mb-1">총 계약금</div>
            <div class="text-3xl font-bold text-green-400">
              {{ formatCurrency(contract.budget) }}
            </div>
          </div>
        </div>

        <!-- Work Details -->
        <div
          class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
        >
          <div class="flex items-center gap-3 mb-4">
            <Briefcase class="w-6 h-6 text-purple-400" />
            <h3 class="text-lg font-bold">업무 정보</h3>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-white/60 mb-1">업무 내용</div>
              <div class="font-medium">
                {{ contract.jobDescription || "-" }}
              </div>
            </div>
            <div>
              <div class="text-sm text-white/60 mb-1">근무 장소</div>
              <div class="font-medium flex items-center gap-2">
                <MapPin class="w-4 h-4" />
                {{ contract.workLocation || "원격근무" }}
              </div>
            </div>
          </div>
        </div>

        <!-- Work Schedule -->
        <div
          class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
        >
          <div class="flex items-center gap-3 mb-4">
            <Clock class="w-6 h-6 text-cyan-400" />
            <h3 class="text-lg font-bold">근무 시간</h3>
          </div>
          <div v-if="isFlexibleWork" class="p-4 bg-cyan-500/10 rounded-xl">
            <div class="font-medium text-cyan-400 mb-1">자율 근무</div>
            <div class="text-sm text-white/60">
              업무 마감일 기준 자유롭게 근무
            </div>
          </div>
          <div v-else class="grid md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-white/60 mb-1">근무 시간</div>
              <div class="font-medium">
                {{ contract.workStartTime || "--:--" }} ~
                {{ contract.workEndTime || "--:--" }}
              </div>
            </div>
            <div>
              <div class="text-sm text-white/60 mb-1">휴게 시간</div>
              <div class="font-medium">
                {{ contract.breakStartTime || "--:--" }} ~
                {{ contract.breakEndTime || "--:--" }}
              </div>
            </div>
            <div>
              <div class="text-sm text-white/60 mb-1">주 근무일수</div>
              <div class="font-medium">
                {{ contract.workDaysPerWeek || "-" }}일
              </div>
            </div>
            <div>
              <div class="text-sm text-white/60 mb-1">주휴일</div>
              <div class="font-medium">{{ contract.weeklyHoliday || "-" }}</div>
            </div>
          </div>
        </div>

        <!-- Insurance Status -->
        <div
          class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
        >
          <div class="flex items-center gap-3 mb-4">
            <Shield class="w-6 h-6 text-emerald-400" />
            <h3 class="text-lg font-bold">사회보험</h3>
          </div>
          <div class="flex flex-wrap gap-3">
            <span
              class="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium"
            >
              ✓ 고용보험
            </span>
            <span
              class="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium"
            >
              ✓ 산재보험
            </span>
            <span
              class="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium"
            >
              ✓ 국민연금
            </span>
            <span
              class="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium"
            >
              ✓ 건강보험
            </span>
          </div>
        </div>

        <!-- AI Legal Advice -->
        <div
          v-if="contract.aiLegalAdvice"
          class="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 shadow-lg"
        >
          <div class="flex items-center gap-3 mb-4">
            <FileText class="w-6 h-6 text-blue-400" />
            <h3 class="text-lg font-bold text-blue-300">AI 법률 검토 결과</h3>
          </div>
          <div class="text-white/80 leading-relaxed whitespace-pre-wrap">
            {{ contract.aiLegalAdvice }}
          </div>
        </div>

        <!-- Signatures -->
        <div
          class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
        >
          <h3 class="text-lg font-bold mb-4">서명 정보</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Employer Signature -->
            <div
              class="p-4 rounded-xl"
              :class="
                contract.employerSignature
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-white/5 border border-white/10'
              "
            >
              <div class="flex items-center gap-3 mb-3">
                <CheckCircle
                  v-if="contract.employerSignature"
                  class="w-6 h-6 text-green-400"
                />
                <Clock v-else class="w-6 h-6 text-white/40" />
                <div>
                  <div class="text-sm text-white/60">고용주</div>
                  <div
                    class="font-medium"
                    :class="
                      contract.employerSignature
                        ? 'text-green-400'
                        : 'text-white/60'
                    "
                  >
                    {{ contract.employerSignature ? "서명 완료" : "서명 대기" }}
                  </div>
                </div>
              </div>
              <div
                v-if="contract.employerSignedDate"
                class="text-xs text-white/50"
              >
                서명일: {{ formatDate(contract.employerSignedDate) }}
              </div>
            </div>
            <!-- Freelancer Signature -->
            <div
              class="p-4 rounded-xl"
              :class="
                contract.freelancerSignature
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-orange-500/10 border border-orange-500/30'
              "
            >
              <div class="flex items-center gap-3 mb-3">
                <CheckCircle
                  v-if="contract.freelancerSignature"
                  class="w-6 h-6 text-green-400"
                />
                <Clock v-else class="w-6 h-6 text-orange-400" />
                <div>
                  <div class="text-sm text-white/60">프리랜서</div>
                  <div
                    class="font-medium"
                    :class="
                      contract.freelancerSignature
                        ? 'text-green-400'
                        : 'text-orange-400'
                    "
                  >
                    {{
                      contract.freelancerSignature ? "서명 완료" : "서명 대기"
                    }}
                  </div>
                </div>
              </div>
              <div
                v-if="contract.freelancerSignedDate"
                class="text-xs text-white/50"
              >
                서명일: {{ formatDate(contract.freelancerSignedDate) }}
              </div>
            </div>
          </div>
          <div
            v-if="contract.signedDate"
            class="mt-4 pt-4 border-t border-white/10"
          >
            <div class="text-sm text-white/60">
              계약 체결일: {{ formatDate(contract.signedDate) }}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            v-if="canSign"
            @click="$emit('sign')"
            class="flex-1 py-4 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
            v-motion
            :hover="{ scale: 1.02 }"
            :tap="{ scale: 0.98 }"
          >
            <PenTool class="w-5 h-5" />
            서명하기
          </button>
          <button
            @click="$emit('close')"
            class="flex-1 py-4 bg-white/10 border border-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl hover:shadow-xl transition-all"
            v-motion
            :hover="{ scale: 1.02 }"
            :tap="{ scale: 0.98 }"
          >
            닫기
          </button>
        </div>
      </div>

      <!-- Contract Tab Content -->
      <div v-else class="p-6">
        <ContractPreview :contract="contract" />

        <!-- Action Buttons -->
        <div class="flex gap-3 mt-6 max-w-4xl mx-auto">
          <button
            v-if="canSign"
            @click="$emit('sign')"
            class="flex-1 py-4 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
            v-motion
            :hover="{ scale: 1.02 }"
            :tap="{ scale: 0.98 }"
          >
            <PenTool class="w-5 h-5" />
            서명하기
          </button>
          <button
            @click="$emit('close')"
            class="flex-1 py-4 bg-white/10 border border-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl hover:shadow-xl transition-all"
            v-motion
            :hover="{ scale: 1.02 }"
            :tap="{ scale: 0.98 }"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
