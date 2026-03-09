<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import {
  FileText,
  AlertCircle,
  Check,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Send,
  Inbox,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { useJobStore } from '@/stores/jobStore';
import { useFreelancerStore } from '@/stores/freelancerStore';
import type { ApplicationStatus } from '@/types';

const authStore = useAuthStore();
const router = useRouter();
const jobStore = useJobStore();
const freelancerStore = useFreelancerStore();

onMounted(async () => {
  const [jobsResult, proposalsResult] = await Promise.allSettled([
    jobStore.fetchJobPostings(),
    freelancerStore.fetchFreelancerProposals(),
  ]);

  if (jobsResult.status === 'rejected') {
    console.error('Failed to load freelancer jobs for application history:', jobsResult.reason);
    window.alert('공고 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
  }

  if (proposalsResult.status === 'rejected') {
    console.error('Failed to load freelancer proposals:', proposalsResult.reason);
    window.alert('받은 제안 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
  }
});

const currentUser = computed(() => authStore.user);

const isSameFreelancer = (freelancerId: string | number, freelancerName: string) => {
  if (!currentUser.value) return false;
  const idMatched = String(freelancerId) === String(currentUser.value.id);
  const nameMatched = freelancerName === currentUser.value.name;
  return idMatched || nameMatched;
};

const myApplications = computed(() => {
  if (!currentUser.value) return [];
  return jobStore.applications.filter((app) => isSameFreelancer(app.freelancerId, app.freelancerName));
});

const receivedProposals = computed(() => {
  if (!currentUser.value) return [];
  return freelancerStore.proposals.filter((proposal) =>
    isSameFreelancer(proposal.freelancerId, proposal.freelancerName)
  );
});

const getJobTitle = (jobId: string) => {
  return jobStore.getJobById(jobId)?.title || '알 수 없음';
};

const statusConfig: Record<ApplicationStatus, { icon: any; label: string; gradient: string }> = {
  PENDING: {
    icon: Clock,
    label: '검토중',
    gradient: 'from-blue-500 to-cyan-500',
  },
  ACCEPTED: {
    icon: CheckCircle,
    label: '수락됨',
    gradient: 'from-green-500 to-emerald-500',
  },
  REJECTED: {
    icon: XCircle,
    label: '거절됨',
    gradient: 'from-red-500 to-red-600',
  },
};

const stats = computed(() => {
  const apps = myApplications.value;
  const proposals = receivedProposals.value;
  const combined = [...apps, ...proposals];

  return {
    proposalCount: proposals.length,
    applicationCount: apps.length,
    pending: combined.filter((item) => item.status === 'PENDING').length,
    accepted: combined.filter((item) => item.status === 'ACCEPTED').length,
    rejected: combined.filter((item) => item.status === 'REJECTED').length,
  };
});

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('ko-KR');
};

const actionFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);

const handleAcceptProposal = async (proposalId: string) => {
  if (!window.confirm('이 제안을 수락하시겠습니까?')) return;

  try {
    const roomId = await freelancerStore.updateProposalStatus(proposalId, 'ACCEPTED');
    if (!roomId) {
      actionFeedback.value = { type: 'error', message: '제안 상태 변경에 실패했습니다. 다시 시도해 주세요.' };
      alert('제안 상태 변경에 실패했습니다.');
      return;
    }

    const shouldMove = confirm('채팅방이 생성되었습니다. 이동하겠습니까?');
    if (shouldMove) {
      router.push('/chat');
    }
    actionFeedback.value = { type: 'success', message: '제안을 수락했습니다. 상태가 수락됨으로 변경되었습니다.' };
    alert('제안을 수락했습니다.');
  } catch (error) {
    console.error('Failed to accept proposal:', error);
    actionFeedback.value = { type: 'error', message: '제안 상태 변경에 실패했습니다. 다시 시도해 주세요.' };
    alert('제안 상태 변경에 실패했습니다.');
  }
};

const handleRejectProposal = async (proposalId: string) => {
  if (!window.confirm('이 제안을 거절하시겠습니까?')) return;

  try {
    const updated = await freelancerStore.updateProposalStatus(proposalId, 'REJECTED');
    if (!updated) {
      actionFeedback.value = { type: 'error', message: '제안 상태 변경에 실패했습니다. 다시 시도해 주세요.' };
      alert('제안 상태 변경에 실패했습니다.');
      return;
    }

    actionFeedback.value = { type: 'success', message: '제안을 거절했습니다. 상태가 거절됨으로 변경되었습니다.' };
    alert('제안을 거절했습니다.');
  } catch (error) {
    console.error('Failed to reject proposal:', error);
    actionFeedback.value = { type: 'error', message: '제안 상태 변경에 실패했습니다. 다시 시도해 주세요.' };
    alert('제안 상태 변경에 실패했습니다.');
  }
};
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 font-sans text-white">
    <div
      class="mb-12"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
    >
      <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
        내 지원/제안
      </h1>
      <p class="text-white/60">기업이 보낸 제안과 내가 보낸 지원서를 한눈에 확인하세요</p>
    </div>

    <div
      v-if="actionFeedback"
      class="mb-6 rounded-2xl border px-5 py-4 text-sm font-medium"
      :class="
        actionFeedback.type === 'success'
          ? 'bg-green-500/10 border-green-500/30 text-green-300'
          : 'bg-red-500/10 border-red-500/30 text-red-300'
      "
    >
      {{ actionFeedback.message }}
    </div>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div
        class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all hover:translate-y-[-4px]"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :enter="{ opacity: 1, scale: 1 }"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Inbox class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="text-sm text-white/60">받은 제안</div>
            <div class="text-3xl font-bold text-white">{{ stats.proposalCount }}</div>
          </div>
        </div>
      </div>

      <div
        class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all hover:translate-y-[-4px]"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :enter="{ opacity: 1, scale: 1, transition: { delay: 100 } }"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Send class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="text-sm text-white/60">보낸 지원</div>
            <div class="text-3xl font-bold text-white">{{ stats.applicationCount }}</div>
          </div>
        </div>
      </div>

      <div
        class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all hover:translate-y-[-4px]"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :enter="{ opacity: 1, scale: 1, transition: { delay: 200 } }"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
            <Clock class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="text-sm text-white/60">검토중</div>
            <div class="text-3xl font-bold text-white">{{ stats.pending }}</div>
          </div>
        </div>
      </div>

      <div
        class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all hover:translate-y-[-4px]"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :enter="{ opacity: 1, scale: 1, transition: { delay: 300 } }"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <CheckCircle class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="text-sm text-white/60">수락</div>
            <div class="text-3xl font-bold text-white">{{ stats.accepted }}</div>
          </div>
        </div>
      </div>

      <div
        class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all hover:translate-y-[-4px]"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :enter="{ opacity: 1, scale: 1, transition: { delay: 400 } }"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg">
            <XCircle class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="text-sm text-white/60">거절</div>
            <div class="text-3xl font-bold text-white">{{ stats.rejected }}</div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="myApplications.length === 0 && receivedProposals.length === 0"
      class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 text-center"
      v-motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :enter="{ opacity: 1, scale: 1 }"
    >
      <div
        class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6"
        v-motion
        :initial="{ scale: 0 }"
        :enter="{ scale: 1, transition: { type: 'spring', delay: 200 } }"
      >
        <FileText class="w-10 h-10 text-white/60" />
      </div>
      <h3 class="text-2xl font-semibold mb-3 text-white">아직 받은 제안과 보낸 지원서가 없습니다</h3>
      <p class="text-white/60">공고에 지원하거나 기업 제안을 기다려보세요</p>
    </div>

    <div v-else class="grid gap-8">
      <div
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
      >
        <div class="flex items-center gap-2 mb-6">
          <Inbox class="w-5 h-5 text-blue-300" />
          <h2 class="text-2xl font-bold">기업이 보낸 제안</h2>
        </div>

        <div v-if="freelancerStore.isFetchingProposals" class="text-center py-10 text-white/40">
          제안 목록을 불러오는 중입니다.
        </div>

        <div
          v-else-if="freelancerStore.proposalFetchError"
          class="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200"
        >
          {{ freelancerStore.proposalFetchError }}
        </div>

        <div class="space-y-4">
          <div v-if="!freelancerStore.isFetchingProposals && receivedProposals.length === 0" class="text-center py-10 text-white/40">
            아직 받은 제안이 없습니다.
          </div>

          <div
            v-for="(proposal, index) in receivedProposals"
            :key="proposal.id"
            class="bg-white/5 border rounded-2xl p-6"
            :class="
              proposal.status === 'ACCEPTED'
                ? 'border-green-500/30'
                : proposal.status === 'REJECTED'
                  ? 'border-red-500/30'
                  : 'border-white/10'
            "
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 50 } }"
          >
            <div class="flex flex-col lg:flex-row items-start justify-between gap-6 mb-5">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 class="text-2xl font-bold text-white">{{ proposal.employerName }}</h3>
                  <div
                    class="px-4 py-2 rounded-full bg-gradient-to-r text-white text-sm font-medium flex items-center gap-2 shadow-lg"
                    :class="statusConfig[proposal.status].gradient"
                  >
                    <component :is="statusConfig[proposal.status].icon" class="w-4 h-4" />
                    {{ statusConfig[proposal.status].label }}
                  </div>
                </div>
                <div class="flex items-center gap-2 text-white/60 mb-2">
                  <Sparkles class="w-4 h-4" />
                  <span>{{ formatDate(proposal.createdAt) }} 제안</span>
                </div>
                <div v-if="proposal.jobId" class="text-sm text-white/70">
                  제안 프로젝트: {{ getJobTitle(proposal.jobId) }}
                </div>
              </div>
            </div>

            <div class="mb-5">
              <div class="text-sm text-white/60 mb-3">제안 메시지</div>
              <div class="text-sm bg-white/5 border border-white/10 p-5 rounded-2xl text-white/80 leading-relaxed">
                {{ proposal.message }}
              </div>
            </div>

            <div v-if="proposal.status === 'PENDING'" class="flex flex-wrap gap-3 mb-4">
              <button
                type="button"
                @click="handleAcceptProposal(proposal.id)"
                class="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:shadow-lg transition-all flex items-center gap-2 font-medium"
              >
                <Check class="w-4 h-4" />
                제안 수락
              </button>
              <button
                type="button"
                @click="handleRejectProposal(proposal.id)"
                class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:shadow-lg transition-all flex items-center gap-2 font-medium"
              >
                <X class="w-4 h-4" />
                제안 거절
              </button>
            </div>

            <div
              v-if="proposal.status === 'ACCEPTED'"
              class="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3"
            >
              <CheckCircle class="w-5 h-5 text-green-400" />
              <span class="text-green-300 font-medium">
                제안이 수락되었습니다. 계약 진행 정보를 확인해주세요.
              </span>
            </div>

            <div
              v-if="proposal.status === 'REJECTED'"
              class="pt-4 border-t border-white/10"
            >
              <div class="text-sm text-white/60 mb-2 flex items-center gap-2">
                <AlertCircle class="w-4 h-4" />
                거절 사유
              </div>
              <div class="text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-300">
                {{ proposal.rejectionReason || '사유가 입력되지 않았습니다.' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
      >
        <div class="flex items-center gap-2 mb-6">
          <Send class="w-5 h-5 text-purple-300" />
          <h2 class="text-2xl font-bold">내가 보낸 지원서</h2>
        </div>

        <div class="space-y-4">
          <div v-if="myApplications.length === 0" class="text-center py-10 text-white/40">
            아직 보낸 지원서가 없습니다.
          </div>

          <div
            v-for="(app, index) in myApplications"
            :key="app.id"
            class="bg-white/5 border border-white/10 rounded-2xl p-6"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 50 } }"
          >
            <div class="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3 flex-wrap">
                  <h3 class="text-2xl font-bold text-white">{{ getJobTitle(app.jobId) }}</h3>
                  <div
                    class="px-4 py-2 rounded-full bg-gradient-to-r text-white text-sm font-medium flex items-center gap-2 shadow-lg"
                    :class="statusConfig[app.status].gradient"
                  >
                    <component :is="statusConfig[app.status].icon" class="w-4 h-4" />
                    {{ statusConfig[app.status].label }}
                  </div>
                </div>
                <div class="flex items-center gap-2 text-white/60">
                  <Sparkles class="w-4 h-4" />
                  <span>{{ formatDate(app.createdAt) }} 지원</span>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <div class="text-sm text-white/60 mb-3">지원 메시지</div>
              <div class="text-sm bg-white/5 border border-white/10 p-5 rounded-2xl text-white/80 leading-relaxed">
                {{ app.message }}
              </div>
            </div>

            <div
              v-if="app.status === 'REJECTED' && app.rejectionReason"
              class="pt-6 border-t border-white/10"
              v-motion
              :initial="{ opacity: 0, height: 0 }"
              :enter="{ opacity: 1, height: 'auto' }"
            >
              <div class="text-sm text-white/60 mb-3 flex items-center gap-2">
                <AlertCircle class="w-4 h-4" />
                거절 사유
              </div>
              <div class="text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-300">
                {{ app.rejectionReason }}
              </div>
            </div>

            <div
              v-if="app.status === 'ACCEPTED'"
              class="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3"
              v-motion
              :initial="{ opacity: 0, scale: 0.95 }"
              :enter="{ opacity: 1, scale: 1 }"
            >
              <CheckCircle class="w-5 h-5 text-green-400" />
              <span class="text-green-300 font-medium">
                축하합니다! 지원이 수락되었습니다. 곧 계약이 진행될 예정입니다.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
