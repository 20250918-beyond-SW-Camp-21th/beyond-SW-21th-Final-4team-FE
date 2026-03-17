<template>
  <div class="custom-scrollbar flex h-full flex-col overflow-y-auto border-l border-white/5 bg-slate-900">
    <div class="border-b border-white/5 p-6 text-center">
      <div class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-800 text-3xl font-bold text-slate-300 ring-2 ring-emerald-500/50">
        {{ otherParticipantName.charAt(0) }}
      </div>

      <h2 class="mb-1 text-xl font-bold text-white">{{ otherParticipantName }}</h2>
      <p class="mb-4 text-sm text-slate-400">{{ otherParticipantSummary }}</p>

      <button
        type="button"
        @click="handleProfileClick"
        class="w-full rounded-lg border border-white/5 bg-slate-800 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
      >
        프로필 보기
      </button>
    </div>

    <div class="border-b border-white/5 p-6">
      <h3 class="mb-4 text-sm font-bold uppercase tracking-wider text-white">현재 연결 프로젝트</h3>
      <div class="rounded-xl border border-white/5 bg-slate-800/50 p-4 transition-colors hover:border-white/10">
        <div class="mb-2 flex items-start justify-between">
          <div class="rounded-lg bg-blue-500/10 p-2 text-blue-400">
            <CodeIcon class="h-5 w-5" />
          </div>
          <span class="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-400">
            제안중
          </span>
        </div>

        <h4 class="mb-1 font-bold text-slate-200">{{ proposedProject.title }}</h4>
        <p class="mb-4 text-xs text-slate-500">{{ proposedProject.summary }}</p>

        <button
          type="button"
          @click="handleProposalDetail"
          class="w-full rounded-lg bg-slate-700/80 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          상세 보기
        </button>
      </div>
    </div>

    <div class="p-6">
      <h3 class="mb-4 text-sm font-bold uppercase tracking-wider text-white">공유 파일</h3>
      <div class="space-y-3">
        <div
          v-for="file in sharedFiles"
          :key="file.id"
          class="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-800/50"
        >
          <div class="rounded bg-slate-800 p-2 text-slate-400 transition-colors group-hover:text-emerald-400">
            <FileTextIcon class="h-5 w-5" />
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="truncate text-sm font-medium text-slate-300 group-hover:text-white">{{ file.name }}</p>
            <p class="text-xs text-slate-500">{{ formatFileMeta(file) }}</p>
          </div>
        </div>

        <div v-if="sharedFiles.length === 0" class="text-xs text-slate-500">
          아직 공유된 파일이 없습니다.
        </div>
      </div>
    </div>
  </div>

  <EmployerProfilePreviewModal
    :is-open="isEmployerProfileOpen"
    :is-loading="isEmployerProfileLoading"
    :profile="employerProfile"
    @close="isEmployerProfileOpen = false"
  />

  <FreelancerProfilePreviewModal
    :is-open="isFreelancerProfileOpen"
    :is-loading="isFreelancerProfileLoading"
    :profile="freelancerProfile"
    @close="isFreelancerProfileOpen = false"
  />

  <div
    v-if="isJobDetailOpen"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
  >
    <div class="w-full max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white shadow-2xl">
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 font-bold text-emerald-300">
            공
          </div>
          <div>
            <h3 class="text-lg font-bold">공고 상세</h3>
            <p class="text-xs text-slate-400">현재 연결된 제안 프로젝트 정보</p>
          </div>
        </div>
        <button class="text-sm text-slate-400 hover:text-white" @click="isJobDetailOpen = false">닫기</button>
      </div>

      <div class="space-y-5">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div class="mb-2 text-xs text-slate-400">프로젝트 제목</div>
          <div class="text-xl font-semibold text-white">{{ jobDetail.title }}</div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div class="mb-2 text-xs text-slate-400">프로젝트 설명</div>
          <p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{{ jobDetail.description }}</p>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div class="mb-1 text-xs text-slate-400">기술 스택</div>
            <div class="text-sm text-slate-200">
              {{ jobDetail.techStack.length ? jobDetail.techStack.join(', ') : '정보 없음' }}
            </div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div class="mb-1 text-xs text-slate-400">예산</div>
            <div class="text-sm text-slate-200">{{ jobDetail.budget }}</div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div class="mb-1 text-xs text-slate-400">기간</div>
            <div class="text-sm text-slate-200">{{ jobDetail.duration }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Code as CodeIcon, FileText as FileTextIcon } from 'lucide-vue-next';
import EmployerProfilePreviewModal from '@/components/profile/EmployerProfilePreviewModal.vue';
import FreelancerProfilePreviewModal from '@/components/profile/FreelancerProfilePreviewModal.vue';
import { getEmployerProfilePreview, getFreelancerProfilePreview } from '@/api/profilePreviewApi';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useFreelancerStore } from '@/stores/freelancerStore';
import { useJobStore } from '@/stores/jobStore';

const props = defineProps<{
  roomId: string;
}>();

const authStore = useAuthStore();
const chatStore = useChatStore();
const freelancerStore = useFreelancerStore();
const jobStore = useJobStore();

const isEmployerProfileOpen = ref(false);
const isEmployerProfileLoading = ref(false);
const isFreelancerProfileOpen = ref(false);
const isFreelancerProfileLoading = ref(false);
const isJobDetailOpen = ref(false);

const employerProfile = ref({
  companyName: '정보 없음',
  logoUrl: null as string | null,
  industry: null as string | null,
  scale: null as string | null,
  location: null as string | null,
  phone: null as string | null,
  website: null as string | null,
  description: null as string | null,
});

const freelancerProfile = ref({
  name: '정보 없음',
  avatarUrl: null as string | null,
  job: null as string | null,
  careerYears: null as number | null,
  wage: null as number | null,
  grade: null as string | null,
  introduction: null as string | null,
  skills: [] as string[],
  phone: null as string | null,
  email: null as string | null,
  address: null as string | null,
  portfolioUrl: null as string | null,
  portfolioFileName: null as string | null,
  portfolioLastUpdated: null as string | null,
});

const jobDetail = ref({
  title: '프로젝트 정보 없음',
  description: '연결된 공고 정보를 찾을 수 없습니다.',
  techStack: [] as string[],
  budget: '정보 없음',
  duration: '정보 없음',
});

const currentRoom = computed(() => chatStore.rooms.find((room) => room.id === props.roomId));

const sharedFiles = computed(() => {
  if (!currentRoom.value) return [];

  const roomMessages = chatStore.messages[currentRoom.value.id] || [];
  return roomMessages
    .filter((msg) => msg.type === 'FILE')
    .map((msg) => ({
      id: msg.id,
      name: msg.metadata?.fileName || msg.content || '파일',
      size: msg.metadata?.fileSize,
      createdAt: msg.createdAt,
    }))
    .reverse();
});

const otherParticipantName = computed(() => {
  if (!currentRoom.value) return '정보 없음';
  return chatStore.getOtherParticipantName(currentRoom.value);
});

const otherParticipantSummary = computed(() => {
  const room = currentRoom.value;
  if (!room || !authStore.user) {
    return '상대 프로필 정보를 불러오는 중입니다.';
  }

  const otherId = chatStore.getOtherParticipantId(room);
  const otherUserId = otherId?.replace(/^[a-z]/i, '') ?? '';
  const proposal = room.relatedProposalId
    ? freelancerStore.proposals.find((item) => item.id === room.relatedProposalId)
    : null;
  const job = room.relatedJobId ? jobStore.getJobById(room.relatedJobId) : null;

  if (authStore.user.role === 'EMPLOYER') {
    const freelancer = freelancerStore.freelancers.find((item) => String(item.id) === otherUserId);
    if (freelancer?.bio?.trim()) return freelancer.bio.trim();
    if (freelancer?.skills?.length) return `주요 기술: ${freelancer.skills.slice(0, 3).join(', ')}`;
    return '프리랜서 소개 정보가 아직 없습니다.';
  }

  if (job?.description?.trim()) return job.description.trim();
  if (proposal?.message?.trim()) return proposal.message.trim();
  return '기업 소개 정보가 아직 없습니다.';
});

const proposedProject = computed(() => {
  if (!currentRoom.value) {
    return {
      title: '제안된 프로젝트가 없습니다',
      summary: '현재 채팅과 연결된 제안 프로젝트를 찾을 수 없습니다.',
      proposalId: null as string | null,
      jobId: null as string | null,
    };
  }

  const proposalId = currentRoom.value.relatedProposalId ?? null;
  const proposal = proposalId
    ? freelancerStore.proposals.find((item) => item.id === proposalId)
    : null;
  const jobId = currentRoom.value.relatedJobId ?? proposal?.jobId ?? null;
  const job = jobId ? jobStore.getJobById(jobId) : null;

  return {
    title: job?.title || proposal?.message?.slice(0, 24) || '프로젝트 제안',
    summary: job?.description || proposal?.message || '현재 제안된 프로젝트의 상세 정보를 확인해 주세요.',
    proposalId,
    jobId,
  };
});

const openFreelancerProfile = async (freelancerId: string) => {
  isFreelancerProfileOpen.value = true;
  isFreelancerProfileLoading.value = true;

  try {
    const preview = await getFreelancerProfilePreview(freelancerId);
    freelancerProfile.value = {
      name: preview.name || '정보 없음',
      avatarUrl: preview.avatarUrl,
      job: preview.job,
      careerYears: preview.careerYears,
      wage: preview.wage,
      grade: preview.grade,
      introduction: preview.introduction,
      skills: preview.skills ?? [],
      phone: preview.phone,
      email: preview.email,
      address: preview.address,
      portfolioUrl: preview.portfolioFileUrl,
      portfolioFileName: preview.portfolioFileName,
      portfolioLastUpdated: preview.portfolioLastUpdated,
    };
  } catch (error) {
    console.error('Failed to load freelancer preview:', error);
  } finally {
    isFreelancerProfileLoading.value = false;
  }
};

const openEmployerProfile = async (employerId: string) => {
  isEmployerProfileOpen.value = true;
  isEmployerProfileLoading.value = true;

  try {
    const preview = await getEmployerProfilePreview(employerId);
    employerProfile.value = {
      companyName: preview.companyName || '정보 없음',
      logoUrl: preview.logoUrl,
      industry: preview.industry,
      scale: preview.scale,
      location: preview.location,
      phone: preview.phone,
      website: preview.websiteUrl,
      description: preview.description,
    };
  } catch (error) {
    console.error('Failed to load employer preview:', error);
    const room = currentRoom.value;
    const proposal = room?.relatedProposalId
      ? freelancerStore.proposals.find((item) => item.id === room.relatedProposalId)
      : null;
    const job = room?.relatedJobId ? jobStore.getJobById(room.relatedJobId) : null;

    employerProfile.value = {
      companyName: job?.employerName || proposal?.employerName || otherParticipantName.value,
      logoUrl: null,
      industry: null,
      scale: null,
      location: null,
      phone: null,
      website: null,
      description: job?.description || proposal?.message || otherParticipantSummary.value,
    };
  } finally {
    isEmployerProfileLoading.value = false;
  }
};

const handleProfileClick = async () => {
  const room = currentRoom.value;
  if (!room || !authStore.user) return;

  const otherId = chatStore.getOtherParticipantId(room);
  if (!otherId) return;

  if (authStore.user.role === 'EMPLOYER') {
    await openFreelancerProfile(otherId.replace(/^[a-z]/i, ''));
    return;
  }

  const job = room.relatedJobId ? jobStore.getJobById(room.relatedJobId) : null;
  const employerId = job?.employerId || otherId.replace(/^[a-z]/i, '');
  await openEmployerProfile(String(employerId));
};

const handleProposalDetail = () => {
  if (!proposedProject.value.proposalId && !proposedProject.value.jobId) return;

  const jobId = proposedProject.value.jobId;
  const job = jobId ? jobStore.getJobById(jobId) : null;
  const proposalMessage = proposedProject.value.summary || '연결된 제안 메시지를 찾을 수 없습니다.';

  jobDetail.value = job
    ? {
        title: job.title,
        description: job.description,
        techStack: job.techStack,
        budget: `${job.budget.toLocaleString()}원`,
        duration: `${job.duration}개월`,
      }
    : {
        title: '프로젝트 제안',
        description: proposalMessage,
        techStack: [],
        budget: '정보 없음',
        duration: '정보 없음',
      };

  isJobDetailOpen.value = true;
};

function formatFileMeta(file: { size?: number; createdAt: Date }) {
  const sizeLabel =
    typeof file.size === 'number' ? `${Math.max(1, Math.round(file.size / 1024))} KB` : '파일';
  const dateLabel = new Date(file.createdAt).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
  return `${sizeLabel} · ${dateLabel}`;
}
</script>
