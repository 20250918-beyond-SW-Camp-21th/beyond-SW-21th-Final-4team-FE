import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, Proposal } from '@/types';

export const useFreelancerStore = defineStore('freelancer', () => {
    const freelancers = ref<User[]>([
        {
            id: 'f1',
            role: 'FREELANCER',
            name: '김프론트',
            email: 'kim.front@example.com',
            skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
            hourlyRate: 50000,
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
            hourlyRate: 60000,
            experience: 7,
            bio: '백엔드 및 DevOps 전문가입니다.',
        },
        {
            id: 'f3',
            role: 'FREELANCER',
            name: '박풀스택',
            email: 'park.full@example.com',
            skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
            hourlyRate: 70000,
            experience: 6,
            bio: '풀스택 개발자로 다양한 프로젝트 경험이 있습니다.',
        },
        {
            id: 'f4',
            role: 'FREELANCER',
            name: '최디자이너',
            email: 'choi.design@example.com',
            skills: ['Figma', 'UI/UX', 'Adobe XD'],
            hourlyRate: 45000,
            experience: 4,
            bio: '사용자 중심의 UI/UX 디자이너입니다.',
        },
        {
            id: 'f5',
            role: 'FREELANCER',
            name: '정데이터',
            email: 'jung.data@example.com',
            skills: ['Python', 'TensorFlow', 'PyTorch'],
            hourlyRate: 80000,
            experience: 5,
            bio: '데이터 분석 및 머신러닝 모델링 전문가입니다.',
        },
    ]);

    const proposals = ref<Proposal[]>([]);

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

    return {
        freelancers,
        proposals,
        addProposal,
        getProposalsByFreelancer,
    };
});
