import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, Proposal } from '@/types';
import { useChatStore } from '@/stores/chatStore';
import * as authApi from '@/api/authApi';

export const useFreelancerStore = defineStore('freelancer', () => {
    const freelancers = ref<User[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const proposals = ref<Proposal[]>([
        {
            id: 'proposal-1',
            employerId: 'e1',
            employerName: '스타트업 A',
            freelancerId: 'f1',
            freelancerName: '김프론트',
            jobId: 'job1',
            message: '대시보드 고도화 프로젝트에 합류해주실 수 있을까요? 기술 인터뷰 없이 바로 협의 가능합니다.',
            status: 'PENDING',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
        },
        {
            id: 'proposal-2',
            employerId: 'e1',
            employerName: '스타트업 A',
            freelancerId: 'f3',
            freelancerName: '박풀스택',
            jobId: 'job2',
            message: '백엔드 안정화 작업 제안을 드립니다. 가능 일정 회신 부탁드립니다.',
            status: 'ACCEPTED',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        }
    ]);

    function addProposal(proposal: Omit<Proposal, 'id' | 'createdAt'>) {
        const newProposal: Proposal = {
            ...proposal,
            id: `p${Date.now()}`,
            createdAt: new Date(),
        };
        proposals.value = [newProposal, ...proposals.value];
    }

    function getProposalsByFreelancer(freelancerId: string) {
        return proposals.value.filter((p) => p.freelancerId === freelancerId);
    }

    function updateProposalStatus(
        proposalId: string,
        status: Proposal['status'],
        rejectionReason?: string
    ): string | null {
        const index = proposals.value.findIndex(p => p.id === proposalId);
        if (index === -1) return null;

        const proposal = proposals.value[index];

        // Update local state
        proposals.value[index] = {
            ...proposal,
            status,
            rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
        };

        if (status === 'ACCEPTED') {
            const chatStore = useChatStore();
            const employerId = proposals.value[index].employerId;
            const freelancerId = proposals.value[index].freelancerId;
            const jobId = proposals.value[index].jobId; // Capture possibly undefined jobId

            const context: any = {
                relatedProposalId: proposalId
            };
            if (jobId) {
                context.relatedJobId = jobId;
            }

            const roomId = chatStore.createRoom(
                [employerId, freelancerId],
                {
                    [employerId]: proposals.value[index].employerName || 'Employer',
                    [freelancerId]: proposals.value[index].freelancerName || 'Freelancer'
                },
                context
            );

            chatStore.selectRoom(roomId);
            return roomId;
        }

        return null;
    }

    async function fetchFreelancers() {
        loading.value = true;
        error.value = null;
        console.log('freelancerStore: Fetching freelancers...');
        try {
            const userList = await authApi.getUsers({ role: 'FREELANCER' });

            console.log(`freelancerStore: Received ${userList?.length || 0} users`);

            if (userList && Array.isArray(userList)) {
                freelancers.value = userList.map((u: any) => ({
                    ...u,
                    id: String(u.id),
                    name: u.name || 'Unknown',
                    role: u.role || 'FREELANCER'
                }));
            } else {
                freelancers.value = [];
            }

            if (freelancers.value.length === 0) {
                console.warn('freelancerStore: No freelancers were found in the final list.');
            }
        } catch (err: any) {
            console.error('freelancerStore: Failed to fetch freelancers:', err);
            error.value = err.message || 'Failed to fetch freelancers';
        } finally {
            loading.value = false;
        }
    }

    return {
        freelancers,
        loading,
        error,
        proposals,
        fetchFreelancers,
        addProposal,
        getProposalsByFreelancer,
        updateProposalStatus,
    };
});
