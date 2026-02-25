import {
    getMockEmployerProfile,
    updateMockEmployerProfile
} from '@/api/MyPage/mock/mockProfiles';

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
    crmAlerts?: {
        isPremiumUpsellEligible: boolean;
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

export const getApplications = async (): Promise<ApplicationGroup[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return [
        {
            jobId: 'j1',
            jobTitle: 'React Dashboard Development',
            applications: [
                {
                    id: 'a1',
                    jobId: 'j1',
                    freelancerId: 'f1',
                    freelancerName: 'Kim Frontend',
                    message: '5 years of React and TypeScript experience.',
                    status: 'PENDING',
                    createdAt: '2024-02-10',
                    resumeUrl: '#',
                    portfolioUrl: '#'
                },
                {
                    id: 'a2',
                    jobId: 'j1',
                    freelancerId: 'f2',
                    freelancerName: 'Lee Fullstack',
                    message: 'Ready to contribute immediately.',
                    status: 'REJECTED',
                    rejectionReason: 'Skill mismatch',
                    createdAt: '2024-02-09',
                    resumeUrl: '#'
                }
            ]
        },
        {
            jobId: 'j2',
            jobTitle: 'Shopping Mall Admin Renewal',
            applications: [
                {
                    id: 'a3',
                    jobId: 'j2',
                    freelancerId: 'f3',
                    freelancerName: 'Park Publisher',
                    message: 'Specialized in responsive UI implementation.',
                    status: 'ACCEPTED',
                    createdAt: '2024-02-08',
                    portfolioUrl: '#'
                }
            ]
        }
    ];
};

export const acceptApplication = async (applicationId: string): Promise<void> => {
    console.log(`Accepted application: ${applicationId}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
};

export const rejectApplication = async (applicationId: string, reason: string): Promise<void> => {
    console.log(`Rejected application: ${applicationId}, reason: ${reason}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
};

export const getEmployerProfile = async (_employerId?: string | number): Promise<EmployerProfileData> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getMockEmployerProfile() as EmployerProfileData;
};

export const updateEmployerProfile = async (data: EmployerProfileData): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateMockEmployerProfile(data);
};
