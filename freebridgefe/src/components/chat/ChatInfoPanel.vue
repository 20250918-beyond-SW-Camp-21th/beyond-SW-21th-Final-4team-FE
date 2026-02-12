<template>
    <div class="h-full bg-slate-900 border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar">
        <!-- Profile Section -->
        <div class="p-6 flex flex-col items-center text-center border-b border-white/5">
            <div class="relative mb-4">
                <div class="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-3xl font-bold border-4 border-slate-800 ring-2 ring-emerald-500/50">
                    {{ otherParticipantName.charAt(0) }}
                </div>
            </div>
            
            <h2 class="text-xl font-bold text-white mb-1">{{ otherParticipantName }}</h2>
            <p class="text-sm text-slate-400 mb-4">시니어 프론트엔드 개발자</p>
            
            <div class="flex gap-2 w-full">
                <button
                    type="button"
                    @click="handleProfileClick"
                    class="flex-1 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-white/5"
                >
                    프로필
                </button>
            </div>
        </div>

        <!-- Proposed Project Summary -->
        <div class="p-6 border-b border-white/5">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-white uppercase tracking-wider">현재 제안된 프로젝트</h3>
            </div>

            <div class="bg-slate-800/50 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                <div class="flex justify-between items-start mb-2">
                    <div class="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <CodeIcon class="w-5 h-5" />
                    </div>
                    <span class="px-2 py-1 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        제안됨
                    </span>
                </div>

                <h4 class="font-bold text-slate-200 mb-1">{{ proposedProject.title }}</h4>
                <p class="text-xs text-slate-500 mb-4">{{ proposedProject.summary }}</p>

                <button
                    type="button"
                    @click="handleProposalDetail"
                    class="w-full py-2 text-sm font-medium text-white bg-slate-700/80 hover:bg-slate-700 rounded-lg transition-colors"
                >
                    상세보기
                </button>
            </div>
        </div>

        <!-- Shared Files -->
        <div class="p-6">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-4">공유된 파일</h3>
            <div class="space-y-3">
                <div
                    v-for="file in sharedFiles"
                    :key="file.id"
                    class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                    <div class="p-2 rounded bg-slate-800 text-slate-400 group-hover:text-emerald-400 transition-colors">
                        <FileTextIcon class="w-5 h-5" />
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <p class="text-sm text-slate-300 font-medium truncate group-hover:text-white">{{ file.name }}</p>
                        <p class="text-xs text-slate-500">{{ formatFileMeta(file) }}</p>
                    </div>
                </div>

                <div v-if="sharedFiles.length === 0" class="text-xs text-slate-500">
                    아직 공유된 파일이 없습니다.
                </div>
            </div>
        </div>
    </div>

    <!-- Employer Profile Modal (Freelancer View) -->
    <div
        v-if="isEmployerProfileOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
        <div class="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white shadow-2xl">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-300 font-bold">
                        {{ employerProfile.companyName.charAt(0) }}
                    </div>
                    <div>
                        <h3 class="text-lg font-bold">기업 프로필</h3>
                        <p class="text-xs text-slate-400">현재 대화 기준</p>
                    </div>
                </div>
                <button class="text-slate-400 hover:text-white text-sm" @click="isEmployerProfileOpen = false">닫기</button>
            </div>
            <div class="grid gap-4 text-sm text-slate-200">
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div class="text-xs text-slate-400 mb-1">회사명</div>
                    <div class="text-base font-semibold text-white">{{ employerProfile.companyName }}</div>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div class="text-xs text-slate-400 mb-1">전화번호</div>
                    <div class="text-sm font-medium">{{ employerProfile.phone }}</div>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div class="text-xs text-slate-400 mb-1">위치</div>
                    <div class="text-sm font-medium">{{ employerProfile.location }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Job Detail Modal -->
    <div
        v-if="isJobDetailOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
        <div class="w-full max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white shadow-2xl">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-300 font-bold">
                        공
                    </div>
                    <div>
                        <h3 class="text-lg font-bold">공고 상세</h3>
                        <p class="text-xs text-slate-400">현재 제안된 프로젝트 기준</p>
                    </div>
                </div>
                <button class="text-slate-400 hover:text-white text-sm" @click="isJobDetailOpen = false">닫기</button>
            </div>

            <div class="space-y-5">
                <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div class="text-xs text-slate-400 mb-2">프로젝트 제목</div>
                    <div class="text-xl font-semibold text-white">{{ jobDetail.title }}</div>
                </div>

                <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div class="text-xs text-slate-400 mb-2">프로젝트 설명</div>
                    <p class="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">{{ jobDetail.description }}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div class="text-xs text-slate-400 mb-1">기술 스택</div>
                        <div class="text-sm text-slate-200">
                            {{ jobDetail.techStack.length ? jobDetail.techStack.join(', ') : '정보 없음' }}
                        </div>
                    </div>
                    <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div class="text-xs text-slate-400 mb-1">예산</div>
                        <div class="text-sm text-slate-200">{{ jobDetail.budget }}</div>
                    </div>
                    <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div class="text-xs text-slate-400 mb-1">기간</div>
                        <div class="text-sm text-slate-200">{{ jobDetail.duration }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import { useFreelancerStore } from '@/stores/freelancerStore';
import { getEmployerProfile } from '@/api/MyPage/employer';
import { 
    Code as CodeIcon,
    FileText as FileTextIcon,
    Image as ImageIcon
} from 'lucide-vue-next';

const props = defineProps<{
    roomId: string;
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();
const jobStore = useJobStore();
const freelancerStore = useFreelancerStore();
const router = useRouter();
const isEmployerProfileOpen = ref(false);
const isJobDetailOpen = ref(false);
const employerProfile = ref({
    companyName: '알 수 없음',
    phone: '알 수 없음',
    location: '알 수 없음'
});
const jobDetail = ref({
    title: '프로젝트 정보 없음',
    description: '연결된 공고 정보를 찾을 수 없습니다.',
    techStack: [] as string[],
    budget: '정보 없음',
    duration: '정보 없음'
});
const sharedFiles = computed(() => {
    if (!currentRoom.value) return [];
    const roomMessages = chatStore.messages[currentRoom.value.id] || [];
    return roomMessages
        .filter((msg) => msg.type === 'FILE')
        .map((msg) => ({
            id: msg.id,
            name: msg.metadata?.fileName || msg.content || '파일',
            size: msg.metadata?.fileSize,
            createdAt: msg.createdAt
        }))
        .reverse();
});

const currentRoom = computed(() => chatStore.rooms.find(r => r.id === props.roomId));

const otherParticipantName = computed(() => {
    if (!currentRoom.value || !authStore.user) return 'Unknown';
    const otherId = chatStore.getOtherParticipantId(currentRoom.value);
    return otherId ? (currentRoom.value.participantNames[otherId] || '알 수 없음') : '알 수 없음';
});

const proposedProject = computed(() => {
    if (!currentRoom.value) {
        return {
            title: '제안된 프로젝트가 없습니다',
            summary: '현재 채팅에 연결된 제안 프로젝트를 찾을 수 없습니다.',
            proposalId: null as string | null,
            jobId: null as string | null
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
        summary: job?.description || proposal?.message || '현재 제안된 프로젝트의 상세 정보를 확인하세요.',
        proposalId,
        jobId
    };
});

const handleProfileClick = () => {
    const room = currentRoom.value;
    if (!room || !authStore.user) return;

    const otherId = chatStore.getOtherParticipantId(room);
    if (!otherId) return;

    if (authStore.user.role === 'EMPLOYER') {
        router.push({ name: 'employer.freelancer.profile', params: { id: otherId } });
        return;
    }

    const job = room.relatedJobId ? jobStore.getJobById(room.relatedJobId) : null;
    const proposal = room.relatedProposalId
        ? freelancerStore.proposals.find((item) => item.id === room.relatedProposalId)
        : null;

    employerProfile.value = {
        companyName: job?.employerName || proposal?.employerName || room.participantNames[otherId] || '알 수 없음',
        phone: job ? '02-0000-0000' : '02-0000-0000',
        location: job ? '서울' : '서울'
    };

    if (proposal || job) {
        isEmployerProfileOpen.value = true;
        return;
    }

    getEmployerProfile(otherId)
        .then((profile) => {
            employerProfile.value = {
                companyName: profile.companyName || employerProfile.value.companyName,
                phone: profile.phone || employerProfile.value.phone,
                location: profile.location || employerProfile.value.location
            };
            isEmployerProfileOpen.value = true;
        })
        .catch(() => {
            isEmployerProfileOpen.value = true;
        });
};

const handleProposalDetail = () => {
    if (!authStore.user) return;
    if (!proposedProject.value.proposalId && !proposedProject.value.jobId) {
        alert('연결된 제안 프로젝트가 없습니다.');
        return;
    }

    const jobId = proposedProject.value.jobId;
    const job = jobId ? jobStore.getJobById(jobId) : null;
    const proposalMessage = proposedProject.value.summary || '연결된 제안 메시지를 찾을 수 없습니다.';

    jobDetail.value = job
        ? {
            title: job.title,
            description: job.description,
            techStack: job.techStack,
            budget: `${job.budget.toLocaleString()}원`,
            duration: `${job.duration}개월`
        }
        : {
            title: '프로젝트 제안',
            description: proposalMessage,
            techStack: [],
            budget: '정보 없음',
            duration: '정보 없음'
        };

    isJobDetailOpen.value = true;
};

function formatFileMeta(file: { size?: number; createdAt: Date }) {
    const sizeLabel = typeof file.size === 'number'
        ? `${Math.max(1, Math.round(file.size / 1024))} KB`
        : '파일';
    const dateLabel = new Date(file.createdAt).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
    });
    return `${sizeLabel} • ${dateLabel}`;
}
</script>
