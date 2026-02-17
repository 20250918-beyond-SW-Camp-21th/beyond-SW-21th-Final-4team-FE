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
            description: "대부분의 고용주가 귀하의 일정 준수와 문제 해결 역량을 높게 평가했습니다. 특히 협업 과정에서의 적극적인 태도가 프로젝트 성공에 기여했다는 피드백이 많습니다."
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
            atmosphere: 4.9,
            requirementsDetail: 4.7,
            scheduleAdherence: 4.8
        },
        projectStatusCounts: {
            posted: 2,
            screening: 3,
            inProgress: 5,
            completed: 12
        }
    }
};

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
    state.freelancerProfile = deepMerge(state.freelancerProfile as Record<string, unknown>, patch as Record<string, unknown>) as MockFreelancerProfile;
    return structuredClone(state.freelancerProfile);
};

export const getMockEmployerProfile = (): MockEmployerProfile => structuredClone(state.employerProfile);

export const updateMockEmployerProfile = (patch: Partial<MockEmployerProfile>): MockEmployerProfile => {
    state.employerProfile = deepMerge(state.employerProfile as Record<string, unknown>, patch as Record<string, unknown>) as MockEmployerProfile;
    return structuredClone(state.employerProfile);
};
