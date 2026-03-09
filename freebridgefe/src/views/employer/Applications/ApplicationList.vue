<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Check,
  X,
  FileText,
  Link as LinkIcon,
  AlertCircle,
  Users,
  Sparkles,
  Send,
  Inbox,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { useJobStore } from '@/stores/jobStore';
import { useFreelancerStore } from '@/stores/freelancerStore';
import type { Application, ApplicationStatus } from '@/types';
import RejectionModal from './components/RejectionModal.vue';

const authStore = useAuthStore();
const router = useRouter();
const jobStore = useJobStore();
const freelancerStore = useFreelancerStore();
const rejectingApp = ref<Application | null>(null);

onMounted(async () => {
  try {
    await jobStore.fetchJobPostings();
  } catch (error) {
    console.error('Failed to load employer jobs for applications view:', error);
    window.alert('공고 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
  }
});

const currentUser = computed(() => authStore.user);

const myJobs = computed(() => jobStore.myJobs);

const myReceivedApplications = computed(() => {
  return jobStore.applications.filter((app) => myJobs.value.some((job) => job.id === app.jobId));
});

const currentEmployerName = computed(() => currentUser.value?.companyName || currentUser.value?.name || '');

const mySentProposals = computed(() => {
  if (!currentUser.value) return [];
  return freelancerStore.proposals.filter((proposal) => {
    const idMatched = String(proposal.employerId) === String(currentUser.value?.id);
    const nameMatched = proposal.employerName === currentEmployerName.value;
    return idMatched || nameMatched;
  });
});

const groupedApplications = computed(() => {
  return myJobs.value
    .map((job) => ({
      job,
      applications: myReceivedApplications.value.filter((app) => app.jobId === job.id),
    }))
    .filter((group) => group.applications.length > 0);
});

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
  const proposals = mySentProposals.value;
  const applications = myReceivedApplications.value;
  const combined = [...proposals, ...applications];

  return {
    sentProposalCount: proposals.length,
    receivedApplicationCount: applications.length,
    pending: combined.filter((item) => item.status === 'PENDING').length,
    accepted: combined.filter((item) => item.status === 'ACCEPTED').length,
    rejected: combined.filter((item) => item.status === 'REJECTED').length,
  };
});

const getJobTitle = (jobId?: string) => {
  if (!jobId) return '프로젝트 정보 없음';
  return jobStore.getJobById(jobId)?.title || '프로젝트 정보 없음';
};

const handleAccept = async (app: Application) => {
  if (confirm(`${app.freelancerName}님의 지원을 수락하시겠습니까?`)) {
    const roomId = await jobStore.updateApplicationStatus(app.id, 'ACCEPTED');
    if (roomId) {
      const shouldMove = confirm('채팅방이 생성되었습니다. 이동하겠습니까?');
      if (shouldMove) {
        router.push('/chat');
      }
    }
    alert('지원이 수락되었습니다!');
  }
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('ko-KR');
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
        지원/제안 관리
      </h1>
      <p class="text-white/60">내가 보낸 제안과 내 공고에 들어온 지원서를 함께 관리하세요</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Send class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="text-sm text-white/60">보낸 제안</div>
            <div class="text-3xl font-bold text-white">{{ stats.sentProposalCount }}</div>
          </div>
        </div>
      </div>

      <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Inbox class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="text-sm text-white/60">받은 지원</div>
            <div class="text-3xl font-bold text-white">{{ stats.receivedApplicationCount }}</div>
          </div>
        </div>
      </div>

      <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
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

      <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
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

      <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
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
      v-if="mySentProposals.length === 0 && myReceivedApplications.length === 0"
      class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 text-center"
    >
      <div class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
        <AlertCircle class="w-10 h-10 text-white/60" />
      </div>
      <h3 class="text-2xl font-semibold mb-3 text-white">아직 보낸 제안과 받은 지원서가 없습니다</h3>
      <p class="text-white/60">프리랜서에게 제안을 보내거나 공고를 등록해보세요</p>
    </div>

    <div v-else class="grid gap-8">
      <div class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
        <div class="flex items-center gap-2 mb-6">
          <Send class="w-5 h-5 text-purple-300" />
          <h2 class="text-2xl font-bold">내가 보낸 제안</h2>
        </div>

        <div class="space-y-4">
          <div v-if="mySentProposals.length === 0" class="text-center py-10 text-white/40">
            아직 보낸 제안이 없습니다.
          </div>

          <div
            v-for="(proposal, index) in mySentProposals"
            :key="proposal.id"
            class="bg-white/5 border border-white/10 rounded-2xl p-6"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 50 } }"
          >
            <div class="flex flex-col lg:flex-row items-start justify-between gap-6 mb-5">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 class="text-2xl font-bold text-white">{{ proposal.freelancerName }}</h3>
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
                  <span>{{ formatDate(proposal.createdAt) }} 제안 발송</span>
                </div>
                <div v-if="proposal.jobId" class="text-sm text-white/70">
                  제안 프로젝트: {{ getJobTitle(proposal.jobId) }}
                </div>
              </div>
            </div>

            <div class="mb-4">
              <div class="text-sm text-white/60 mb-2">제안 메시지</div>
              <div class="text-sm bg-white/5 border border-white/10 p-4 rounded-2xl text-white/80">
                {{ proposal.message }}
              </div>
            </div>

            <div
              v-if="proposal.status === 'ACCEPTED'"
              class="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3"
            >
              <CheckCircle class="w-5 h-5 text-green-400" />
              <span class="text-green-300 font-medium">
                프리랜서가 제안을 수락했습니다. 계약 진행을 시작해 주세요.
              </span>
            </div>

            <div
              v-if="proposal.status === 'REJECTED'"
              class="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
            >
              <div class="flex items-center gap-2 text-red-300 font-medium mb-2">
                <AlertCircle class="w-4 h-4" />
                프리랜서가 제안을 거절했습니다.
              </div>
              <div v-if="proposal.rejectionReason" class="text-sm text-red-200">
                사유: {{ proposal.rejectionReason }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
        <div class="flex items-center gap-2 mb-6">
          <Inbox class="w-5 h-5 text-blue-300" />
          <h2 class="text-2xl font-bold">내가 받은 지원서</h2>
        </div>

        <div v-if="myReceivedApplications.length === 0" class="text-center py-10 text-white/40">
          아직 받은 지원서가 없습니다.
        </div>

        <div v-else class="space-y-8">
          <div
            v-for="(group, index) in groupedApplications"
            :key="group.job.id"
            class="bg-white/5 border border-white/10 rounded-2xl p-6"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 70 } }"
          >
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-2xl font-bold text-white mb-2">{{ group.job.title }}</h3>
                <div class="flex items-center gap-2 text-white/60">
                  <Users class="w-4 h-4" />
                  <span>총 {{ group.applications.length }}명의 지원자</span>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div
                v-for="(app, appIndex) in group.applications"
                :key="app.id"
                class="bg-white/5 border border-white/10 rounded-2xl p-6"
                v-motion
                :initial="{ opacity: 0, x: -15 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: appIndex * 50 } }"
              >
                <div class="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {{ app.freelancerName[0] }}
                    </div>
                    <div>
                      <div class="text-lg font-semibold text-white flex items-center gap-2">
                        {{ app.freelancerName }}
                        <Sparkles class="w-4 h-4 text-yellow-400" />
                      </div>
                      <div class="text-sm text-white/60">
                        {{ formatDate(app.createdAt) }} 지원
                      </div>
                      <router-link
                        :to="{ name: 'employer.freelancer.profile', params: { id: app.freelancerId } }"
                        class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1 hover:underline"
                      >
                        프로필 및 포트폴리오 보기
                      </router-link>
                    </div>
                  </div>

                  <div v-if="app.status === 'PENDING'" class="flex gap-2">
                    <button
                      @click="handleAccept(app)"
                      class="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                    >
                      <Check class="w-4 h-4" />
                      수락
                    </button>
                    <button
                      @click="rejectingApp = app"
                      class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                    >
                      <X class="w-4 h-4" />
                      거절
                    </button>
                  </div>
                  <div
                    v-else
                    class="px-5 py-2.5 rounded-full font-medium border"
                    :class="app.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'"
                  >
                    {{ app.status === 'ACCEPTED' ? '수락됨' : '거절됨' }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-sm text-white/60 mb-2">지원 메시지</div>
                  <div class="text-sm bg-white/5 border border-white/10 p-4 rounded-2xl text-white/80">
                    {{ app.message }}
                  </div>
                </div>

                <div v-if="app.portfolioUrl || app.resumeUrl" class="flex gap-3 mb-4">
                  <a
                    v-if="app.portfolioUrl"
                    :href="app.portfolioUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                  >
                    <LinkIcon class="w-4 h-4" />
                    포트폴리오 보기
                  </a>
                  <a
                    v-if="app.resumeUrl"
                    :href="app.resumeUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                  >
                    <FileText class="w-4 h-4" />
                    이력서 보기
                  </a>
                </div>

                <div v-if="app.status === 'REJECTED' && app.rejectionReason" class="pt-4 border-t border-white/10">
                  <div class="text-sm text-white/60 mb-2">거절 사유</div>
                  <div class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-2xl">
                    {{ app.rejectionReason }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <RejectionModal
        v-if="rejectingApp"
        :application="rejectingApp"
        @close="rejectingApp = null"
      />
    </transition>
  </div>
</template>
