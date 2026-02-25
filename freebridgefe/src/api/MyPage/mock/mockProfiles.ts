export interface MockFreelancerProfile {
    name: string;
    grade: string;
    avatar: string | null;
    job: string;
    introduction: string;
    careerYears: number;
    salary: number;
    workConditions: {
        type: string;
        startDate: string;
        workStyle: string;
        location: string;
    };
    skills: string[];
    expertise: {
        programming: number;
        framework: number;
        problemSolving: number;
    };
    collaboration: {
        communication: number;
        scheduleAdherence: number;
        dispute: number;
    };
    averageRating: number;
    statContact: number;
    statChat: number;
    statContract: number;
    statInteresting: number;
    statCompleted: number;
    portfolio: {
        fileUrl: string | null;
        fileName: string;
        lastUpdated: string;
    };
    aiSummary?: {
        title: string;
        description: string;
        reputationIndex?: number;
        strengths?: string[];
        weaknesses?: string[];
    };
    crmAlerts?: {
        isRateBumpEligible: boolean;
        isBurnoutWarning: boolean;
        isChurnWarning: boolean;
    };
    topPercentile?: number;
}

export interface Checklist {
    atmosphere: boolean;
    salarySatisfaction: boolean;
    scheduleAdherence: boolean;
}

export interface Review {
    id: string;
    freelancerName: string;
    freelancerJobTitle: string;
    projectName: string;
    date: string;
    rating: number; // 1-5
    content: string;
    tags: string[];
    checklist: Checklist;
}

export interface MockEmployerProfile {
    companyName: string;
    industry: string;
    size: string;
    location: string;
    website: string;
    email: string;
    phone: string;
    description: string;
    plan?: string;
    logoUrl?: string;
    activeProjects?: number;
    totalApplicants?: number;
    contractedFreelancers?: number;
    avgRating?: number;
    ratingDetails?: {
        atmosphere: number;
        requirementsDetail: number;
        scheduleAdherence: number;
    };
    projectStatusCounts?: {
        posted: number;
        screening: number;
        inProgress: number;
        completed: number;
    };
}

interface MockProfileState {
    freelancerProfile: MockFreelancerProfile;
    employerProfile: MockEmployerProfile;
}

const state: MockProfileState = {
    freelancerProfile: {
        name: 'Freelancer',
        grade: 'master',
        avatar: null,
        job: '개발자',
        introduction: '사용자 경험을 최우선으로 생각하는 프론트엔드 개발자입니다. 유지보수성과 확장성을 고려해 코드를 작성합니다.',
        careerYears: 5,
        salary: 50000,
        workConditions: {
            type: '개인',
            startDate: '2024-02-01',
            workStyle: '원격',
            location: '서울'
        },
        skills: ['React', 'Vue.js', 'TypeScript', 'Node.js', 'TailwindCSS', 'Next.js', 'GraphQL', 'AWS', 'Docker', 'Figma', 'Jest'],
        expertise: {
            programming: 4.8,
            framework: 4.9,
            problemSolving: 4.7
        },
        collaboration: {
            communication: 4.7,
            scheduleAdherence: 4.9,
            dispute: 5.0
        },
        averageRating: 4.8,
        statContact: 12,
        statChat: 3,
        statContract: 1,
        statInteresting: 5,
        statCompleted: 8,
        portfolio: {
            fileUrl: '#',
            fileName: 'Portfolio_2024_v2.pdf',
            lastUpdated: '2024.02.10'
        },
        aiSummary: {
            title: "문제 해결 능력이 뛰어나고 원활한 소통이 강점입니다.",
            description: "대부분의 고용주가 귀하의 일정 준수와 문제 해결 역량을 높게 평가했습니다. 특히 협업 과정에서의 적극적인 태도가 프로젝트 성공에 기여했다는 피드백이 많습니다.",
            reputationIndex: 92,
            strengths: ["빠른 문제 해결 및 디버깅", "프로젝트 마감 기한 엄수", "명확하고 적극적인 의사소통"],
            weaknesses: ["초기 요구사항 분석 시 추가 시간 소요", "특정 프레임워크(Vue.js) 경험 부족"]
        },
        crmAlerts: {
            isRateBumpEligible: true,
            isBurnoutWarning: false,
            isChurnWarning: false
        },
        topPercentile: 10
    },
    employerProfile: {
        companyName: '테크스타트업',
        industry: 'IT/소프트웨어',
        size: '10-50명',
        location: '서울 강남구',
        website: 'https://techstartup.com',
        email: 'contact@techstartup.com',
        phone: '02-1234-5678',
        description: '혁신적인 소프트웨어를 만드는 스타트업입니다.',
        plan: 'PRIME',
        activeProjects: 3,
        totalApplicants: 45,
        contractedFreelancers: 8,
        avgRating: 4.8,
        logoUrl: '',
        ratingDetails: {
            atmosphere: 5.0,
            requirementsDetail: 5.0,
            scheduleAdherence: 3.8
        },
        projectStatusCounts: {
            posted: 2,
            screening: 3,
            inProgress: 5,
            completed: 12
        }
    }
};

const mockReviews: Review[] = [
    {
        id: '1',
        freelancerName: '김프론트',
        freelancerJobTitle: 'React 개발자',
        projectName: '핀테크 대시보드 리뉴얼',
        date: '2024-02-10',
        rating: 5,
        content: '요구사항이 매우 명확했고, 결제 처리도 빠르고 완벽했습니다. 최고의 클라이언트입니다.',
        tags: ['명확한 업무', '빠른 정산'],
        checklist: { atmosphere: true, salarySatisfaction: true, scheduleAdherence: true },
    },
    {
        id: '2',
        freelancerName: '이디자인',
        freelancerJobTitle: 'UX/UI 디자이너',
        projectName: '쇼핑몰 앱 디자인',
        date: '2024-01-28',
        rating: 5,
        content: '전반적으로 매우 만족스러웠습니다. 충분한 보상과 자유로운 분위기 덕분에 작업이 즐거웠습니다.',
        tags: ['분위기 좋음', '만족스러운 급여'],
        checklist: { atmosphere: true, salarySatisfaction: true, scheduleAdherence: true },
    },
    {
        id: '3',
        freelancerName: '박백엔드',
        freelancerJobTitle: 'Node.js 개발자',
        projectName: '사내 관리 시스템 구축',
        date: '2023-12-15',
        rating: 4,
        content: '보수도 높고 사내 분위기도 좋았지만 일정이 약간 빠듯했습니다.',
        tags: ['급여 만족', '분위기 좋음'],
        checklist: { atmosphere: true, salarySatisfaction: true, scheduleAdherence: true },
    },
    {
        id: '4',
        freelancerName: '최모바일',
        freelancerJobTitle: 'iOS 개발자',
        projectName: '배달 앱 리팩토링',
        date: '2023-11-20',
        rating: 5,
        content: '급여와 분위기는 매우 최고였으나 일정이 매우 타이트해서 아슬아슬했습니다.',
        tags: ['최고의 대우', '일정 타이트'],
        checklist: { atmosphere: true, salarySatisfaction: true, scheduleAdherence: false },
    },
];

export const getMockReviews = (): Review[] => structuredClone(mockReviews);

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const deepMerge = <T extends Record<string, unknown>>(target: T, patch: Partial<T>): T => {
    const result = { ...target } as Record<string, unknown>;

    for (const key of Object.keys(patch) as (keyof T)[]) {
        const patchValue = patch[key];
        const targetValue = result[key as string];

        if (patchValue === undefined) {
            continue;
        }

        if (isObject(targetValue) && isObject(patchValue)) {
            result[key as string] = deepMerge(
                targetValue as Record<string, unknown>,
                patchValue as Record<string, unknown>
            );
            continue;
        }

        result[key as string] = patchValue as unknown;
    }

    return result as T;
};

export const getMockFreelancerProfile = (): MockFreelancerProfile => structuredClone(state.freelancerProfile);

export const updateMockFreelancerProfile = (patch: Partial<MockFreelancerProfile>): MockFreelancerProfile => {
    state.freelancerProfile = deepMerge(state.freelancerProfile as unknown as Record<string, unknown>, patch as Record<string, unknown>) as unknown as MockFreelancerProfile;
    return structuredClone(state.freelancerProfile);
};

export const getMockEmployerProfile = (): MockEmployerProfile => {
    const profile = structuredClone(state.employerProfile);

    // Dynamically calculate ratings from reviews
    const total = mockReviews.length;
    if (total > 0) {
        const sum = mockReviews.reduce((acc, r) => acc + r.rating, 0);
        profile.avgRating = Number((sum / total).toFixed(1));

        const atmosphereCount = mockReviews.filter(r => r.checklist.atmosphere).length;
        const salaryCount = mockReviews.filter(r => r.checklist.salarySatisfaction).length;
        const scheduleCount = mockReviews.filter(r => r.checklist.scheduleAdherence).length;

        profile.ratingDetails = {
            atmosphere: Number(((atmosphereCount / total) * 5).toFixed(1)),
            requirementsDetail: Number(((salaryCount / total) * 5).toFixed(1)),
            scheduleAdherence: Number(((scheduleCount / total) * 5).toFixed(1))
        };
    }

    return profile;
};

export const updateMockEmployerProfile = (patch: Partial<MockEmployerProfile>): MockEmployerProfile => {
    state.employerProfile = deepMerge(state.employerProfile as unknown as Record<string, unknown>, patch as Record<string, unknown>) as unknown as MockEmployerProfile;
    return structuredClone(state.employerProfile);
};
