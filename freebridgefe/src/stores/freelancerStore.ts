import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, Proposal } from '@/types';
import { useChatStore } from '@/stores/chatStore';

export const useFreelancerStore = defineStore('freelancer', () => {
    const freelancers = ref<User[]>([
        {
            id: 'f1',
            role: 'FREELANCER',
            name: '김프론트',
            email: 'kim.front@example.com',
            skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
            monthlySalary: 5000000,
            experience: 5,
            bio: '5년차 프론트엔드 개발자입니다. React 생태계에 전문성이 있습니다.',
            portfolioItems: [
                {
                    id: 'pi1',
                    title: 'E-commerce Dashboard',
                    description: 'React와 TypeScript를 사용한 대시보드 프로젝트입니다.',
                    skills: ['React', 'TypeScript', 'Chart.js'],
                    createdAt: new Date('2023-01-15')
                },
                {
                    id: 'pi2',
                    title: 'Corporate Website',
                    description: 'Next.js 기반의 기업 소개 웹사이트입니다.',
                    skills: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
                    createdAt: new Date('2023-06-20')
                }
            ]
        },
        {
            id: 'f2',
            role: 'FREELANCER',
            name: '이백엔드',
            email: 'lee.back@example.com',
            skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
            monthlySalary: 6000000,
            experience: 7,
            bio: '백엔드 및 DevOps 전문가입니다.',
        },
        {
            id: 'f3',
            role: 'FREELANCER',
            name: '박풀스택',
            email: 'park.full@example.com',
            skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
            monthlySalary: 7000000,
            experience: 6,
            bio: '풀스택 개발자로 다양한 프로젝트 경험이 있습니다.',
        },
        {
            id: 'f4',
            role: 'FREELANCER',
            name: '최디자이너',
            email: 'choi.design@example.com',
            skills: ['Figma', 'UI/UX', 'Adobe XD'],
            monthlySalary: 4500000,
            experience: 4,
            bio: '사용자 중심의 UI/UX 디자이너입니다.',
        },
        {
            id: 'f5',
            role: 'FREELANCER',
            name: '정데이터',
            email: 'jung.data@example.com',
            skills: ['Python', 'TensorFlow', 'PyTorch'],
            monthlySalary: 8000000,
            experience: 5,
            bio: '데이터 분석 및 머신러닝 모델링 전문가입니다.',
        },
    ]);

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

    return {
        freelancers,
        proposals,
        addProposal,
        getProposalsByFreelancer,
        updateProposalStatus,
    };
});
