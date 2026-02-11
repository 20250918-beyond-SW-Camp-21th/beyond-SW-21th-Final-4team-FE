export type UserRole = 'EMPLOYER' | 'FREELANCER';

export type JobStatus = 'OPEN' | 'IN_PROGRESS' | 'CONTRACTED' | 'CLOSED';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

import type { EmployerProfile, FreelancerProfile } from './onboarding';

export interface User {
    id: string | number;
    role: UserRole;
    name: string;
    email: string;
    avatar?: string;
    createdAt?: string | Date;
    agreedToTermsAt?: string | Date;
    isEmailVerified?: boolean;

    // Profiles (Additive for Onboarding)
    employerProfile?: EmployerProfile;
    freelancerProfile?: FreelancerProfile;

    // Legacy/Existing fields (Keep for compatibility)
    // Freelancer specific
    skills?: string[];
    monthlySalary?: number;
    experience?: number; // years
    portfolio?: string;
    bio?: string;
    // Employer specific
    companyName?: string;
    companySize?: string;
    portfolioItems?: PortfolioItem[];
}

export interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    projectUrl?: string;
    skills: string[];
    createdAt: Date;
}

export interface JobPosting {
    id: string;
    employerId: string;
    employerName: string;
    title: string;
    description: string;
    techStack: string[];
    budget: number;
    duration: number; // months
    status: JobStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface Application {
    id: string;
    jobId: string;
    freelancerId: string;
    freelancerName: string;
    message: string;
    portfolioUrl?: string;
    resumeUrl?: string;
    status: ApplicationStatus;
    rejectionReason?: string;
    createdAt: Date;
}

export interface Proposal {
    id: string;
    employerId: string;
    employerName: string;
    freelancerId: string;
    freelancerName: string;
    jobId?: string;
    message: string;
    status: ApplicationStatus;
    rejectionReason?: string;
    createdAt: Date;
}

export interface RejectionReason {
    type: 'SKILL_MISMATCH' | 'LACK_EXPERIENCE' | 'SCHEDULE_MISMATCH' | 'OTHER';
    customReason?: string;
}
