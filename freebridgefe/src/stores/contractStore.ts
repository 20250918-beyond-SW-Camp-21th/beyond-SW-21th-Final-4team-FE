import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ContractDocument, Settlement } from '@/types/contract';

export const useContractStore = defineStore('contract', () => {
    // Mock Milestones
    const mockMilestones = {
        c1: [
            {
                id: 'm1',
                name: '요구사항 분석 및 설계',
                description: 'UI/UX 설계 및 기술 스택 확정',
                dueDate: new Date('2024-01-31'),
                amount: 1500000,
                status: 'COMPLETED' as const,
                completedDate: new Date('2024-01-28'),
            },
            {
                id: 'm2',
                name: '프론트엔드 개발',
                description: 'React 컴포넌트 개발 및 API 연동',
                dueDate: new Date('2024-02-28'),
                amount: 2000000,
                status: 'IN_PROGRESS' as const,
            },
            {
                id: 'm3',
                name: '테스트 및 배포',
                description: 'QA, 버그 수정, 프로덕션 배포',
                dueDate: new Date('2024-03-31'),
                amount: 1500000,
                status: 'PENDING' as const,
            },
        ],
        c2: [
            {
                id: 'm4',
                name: '서버 마이그레이션',
                description: 'AWS로 인프라 이전',
                dueDate: new Date('2023-11-30'),
                amount: 3000000,
                status: 'COMPLETED' as const,
                completedDate: new Date('2023-11-25'),
            },
            {
                id: 'm5',
                name: 'API 리팩토링',
                description: 'REST API 성능 최적화',
                dueDate: new Date('2023-12-15'),
                amount: 2500000,
                status: 'COMPLETED' as const,
                completedDate: new Date('2023-12-12'),
            },
            {
                id: 'm6',
                name: '모니터링 설정',
                description: 'CloudWatch 및 알림 설정',
                dueDate: new Date('2023-12-31'),
                amount: 2500000,
                status: 'COMPLETED' as const,
                completedDate: new Date('2023-12-28'),
            },
        ],
    };

    const contracts = ref<ContractDocument[]>([
        {
            id: 'contract-1',
            contractId: 'c1',
            projectName: 'SaaS 대시보드 리뉴얼',
            freelancerId: 'f1',
            freelancerName: '김프론트',
            employerId: 'e1',
            employerName: '스타트업 A',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-03-31'),
            status: 'IN_PROGRESS',
            budget: 5000000,
            milestones: mockMilestones.c1,
            terms: `1. 프로젝트 범위
   - React 기반 대시보드 UI 개발
   - Tailwind CSS를 이용한 반응형 디자인
   - API 연동 및 데이터 시각화

2. 계약 기간
   - 2024년 1월 1일 ~ 2024년 3월 31일 (3개월)

3. 비용 및 지급 조건
   - 총 계약금: 5,000,000원
   - 마일스톤별 분할 지급
   - 각 마일스톤 완료 후 7일 이내 지급

4. 지적 재산권
   - 모든 결과물의 저작권은 고용주에게 귀속됨

5. 계약 해지
   - 양측 합의 시 계약 해지 가능
   - 해지 시 완료된 작업에 대한 비용 정산`,
            signedByFreelancer: true,
            signedByEmployer: true,
            signedDate: new Date('2023-12-28'),
        },
        {
            id: 'contract-2',
            contractId: 'c2',
            projectName: 'API 서버 마이그레이션',
            freelancerId: 'f2',
            freelancerName: '이백엔드',
            employerId: 'e1',
            employerName: '스타트업 A',
            startDate: new Date('2023-10-01'),
            endDate: new Date('2023-12-31'),
            status: 'COMPLETED',
            budget: 8000000,
            milestones: mockMilestones.c2,
            terms: `1. 프로젝트 범위
   - 기존 서버 AWS로 마이그레이션
   - REST API 성능 최적화
   - 모니터링 시스템 구축

2. 계약 기간
   - 2023년 10월 1일 ~ 2023년 12월 31일 (3개월)

3. 비용 및 지급 조건
   - 총 계약금: 8,000,000원
   - 마일스톤별 분할 지급

4. 보안 및 기밀 유지
   - 프로젝트 관련 정보 외부 유출 금지`,
            signedByFreelancer: true,
            signedByEmployer: true,
            signedDate: new Date('2023-09-28'),
        },
        {
            id: 'contract-3',
            contractId: 'c3',
            projectName: '모바일 앱 개발',
            freelancerId: 'f1',
            freelancerName: '김프론트',
            employerId: 'e2',
            employerName: '테크기업 B',
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-05-31'),
            status: 'ACTIVE',
            budget: 10000000,
            milestones: [
                {
                    id: 'm7',
                    name: 'UI/UX 디자인',
                    description: 'Figma 디자인 및 프로토타입',
                    dueDate: new Date('2024-02-29'),
                    amount: 2000000,
                    status: 'PENDING',
                },
                {
                    id: 'm8',
                    name: 'React Native 개발',
                    description: 'iOS/Android 앱 개발',
                    dueDate: new Date('2024-04-30'),
                    amount: 6000000,
                    status: 'PENDING',
                },
                {
                    id: 'm9',
                    name: '앱 스토어 출시',
                    description: '앱 등록 및 심사 대응',
                    dueDate: new Date('2024-05-31'),
                    amount: 2000000,
                    status: 'PENDING',
                },
            ],
            terms: '표준 모바일 앱 개발 계약',
            signedByFreelancer: true,
            signedByEmployer: true,
            signedDate: new Date('2024-01-25'),
        },
    ]);

    const settlements = ref<Settlement[]>([
        {
            id: 's1',
            freelancerId: 'f1',
            contractId: 'c1',
            projectName: 'SaaS 대시보드 리뉴얼',
            employerName: '스타트업 A',
            totalAmount: 1500000,
            platformFee: 75000, // 5%
            tax: 150000, // 10%
            netAmount: 1275000,
            status: 'PAID',
            requestDate: new Date('2024-01-29'),
            paidDate: new Date('2024-02-02'),
            bankAccount: '국민은행 ***-****-1234',
        },
        {
            id: 's2',
            freelancerId: 'f1',
            contractId: 'c1',
            projectName: 'SaaS 대시보드 리뉴얼',
            employerName: '스타트업 A',
            totalAmount: 2000000,
            platformFee: 100000,
            tax: 200000,
            netAmount: 1700000,
            status: 'PROCESSING',
            requestDate: new Date('2024-02-15'),
            bankAccount: '국민은행 ***-****-1234',
        },
        {
            id: 's3',
            freelancerId: 'f2',
            contractId: 'c2',
            projectName: 'API 서버 마이그레이션',
            employerName: '스타트업 A',
            totalAmount: 8000000,
            platformFee: 320000, // 4% (골드 등급)
            tax: 800000,
            netAmount: 6880000,
            status: 'PAID',
            requestDate: new Date('2024-01-02'),
            paidDate: new Date('2024-01-09'),
            bankAccount: '신한은행 ***-****-5678',
        },
    ]);

    return {
        contracts,
        settlements,
    };
});
