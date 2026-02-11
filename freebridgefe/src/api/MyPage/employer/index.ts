// 고용주 마이페이지 관련 API 인터페이스 및 함수

export interface EmployerProfileData {
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
    // Stats for Dashboard
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

export interface Application {
    id: string;
    jobId: string;
    freelancerId: string;
    freelancerName: string;
    message: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    rejectionReason?: string;
    createdAt: string;
    resumeUrl?: string;
    portfolioUrl?: string;
}

export interface ApplicationGroup {
    jobId: string;
    jobTitle: string;
    applications: Application[];
}

// Mock API Functions
export const getApplications = async (): Promise<ApplicationGroup[]> => {
    // TODO: Replace with actual API call
    // return axios.get('/api/v1/employer/applications');

    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

    return [
        {
            jobId: 'j1',
            jobTitle: 'React 기반 핀테크 대시보드 개발',
            applications: [
                {
                    id: 'a1',
                    jobId: 'j1',
                    freelancerId: 'f1',
                    freelancerName: '김프론트',
                    message: '안녕하세요, 5년차 프론트엔드 개발자입니다. React와 TypeScript 경험이 풍부하며, 핀테크 프로젝트 경험도 있습니다.',
                    status: 'PENDING',
                    createdAt: '2024-02-10',
                    resumeUrl: '#',
                    portfolioUrl: '#'
                },
                {
                    id: 'a2',
                    jobId: 'j1',
                    freelancerId: 'f2',
                    freelancerName: '이풀스택',
                    message: '풀스택 개발 가능합니다. 맡겨주시면 최선을 다하겠습니다.',
                    status: 'REJECTED',
                    rejectionReason: '기술 스택 불일치',
                    createdAt: '2024-02-09',
                    resumeUrl: '#'
                }
            ]
        },
        {
            jobId: 'j2',
            jobTitle: '쇼핑몰 어드민 페이지 리뉴얼',
            applications: [
                {
                    id: 'a3',
                    jobId: 'j2',
                    freelancerId: 'f3',
                    freelancerName: '박퍼블',
                    message: '퍼블리싱 전문입니다. 웹접근성 준수하여 작업 가능합니다.',
                    status: 'ACCEPTED',
                    createdAt: '2024-02-08',
                    portfolioUrl: '#'
                }
            ]
        }
    ];
};

export const acceptApplication = async (applicationId: string): Promise<void> => {
    // TODO: Replace with actual API call
    // await axios.patch(`/api/v1/applications/${applicationId}/status`, { status: 'ACCEPTED' });
    console.log(`Accepted application: ${applicationId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
};

export const rejectApplication = async (applicationId: string, reason: string): Promise<void> => {
    // TODO: Replace with actual API call
    // await axios.patch(`/api/v1/applications/${applicationId}/status`, { status: 'REJECTED', rejectionReason: reason });
    console.log(`Rejected application: ${applicationId}, reason: ${reason}`);
    await new Promise(resolve => setTimeout(resolve, 500));
};

// API 함수 예시 (실제 구현 시 axios 인스턴스 사용)
// export const fetchEmployerProfile = async (): Promise<EmployerProfileData> => { ... }
// export const updateEmployerProfile = async (data: EmployerProfileData): Promise<void> => { ... }

// Mock Data for Employer Profile (Session Persistence)
let employerProfileMock: EmployerProfileData = {
    companyName: '테크스타트업',
    industry: 'IT/소프트웨어',
    size: '10-50명',
    location: '서울 강남구',
    website: 'https://techstartup.com',
    email: 'contact@techstartup.com',
    phone: '02-1234-5678',
    description: '우리는 혁신적인 소프트웨어를 만드는 스타트업입니다.',
    plan: 'PRO',
    activeProjects: 3,
    totalApplicants: 45,
    contractedFreelancers: 8,
    avgRating: 4.8,
    logoUrl: '',
    ratingDetails: {
        atmosphere: 4.9,
        requirementsDetail: 4.7,
        scheduleAdherence: 4.8,
    },
    projectStatusCounts: {
        posted: 2,
        screening: 3,
        inProgress: 5,
        completed: 12
    }
};

export const getEmployerProfile = async (): Promise<EmployerProfileData> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    return { ...employerProfileMock };
};

export const updateEmployerProfile = async (data: EmployerProfileData): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    employerProfileMock = { ...employerProfileMock, ...data };
};
