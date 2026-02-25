import {
    getMockFreelancerProfile,
    updateMockFreelancerProfile
} from '@/api/MyPage/mock/mockProfiles';

export interface FreelancerProfileDashboard {
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

export const getFreelancerProfile = async (userId: string): Promise<FreelancerProfileDashboard> => {
    console.log(`Getting profile for ${userId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            // TODO: replace with real API
            // return axios.get(`/api/freelancers/${userId}/profile`).then(res => res.data);
            resolve(getMockFreelancerProfile() as FreelancerProfileDashboard);
        }, 500);
    });
};

export const updateFreelancerProfile = async (
    userId: string,
    updatedProfile: Partial<FreelancerProfileDashboard>
): Promise<FreelancerProfileDashboard> => {
    console.log(`Updating profile for ${userId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            // TODO: replace with real API
            // return axios.patch(`/api/freelancers/${userId}/profile`, updatedProfile).then(res => res.data);
            const updated = updateMockFreelancerProfile(updatedProfile);
            resolve(updated as FreelancerProfileDashboard);
        }, 800);
    });
};
