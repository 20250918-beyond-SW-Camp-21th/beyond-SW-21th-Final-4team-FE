// Enum Definitions
export type FreelancerGrade = 'JUNIOR' | 'MID' | 'SENIOR' | 'MASTER';
export type WorkType = 'PERSONAL' | 'TEAM';
export type WorkStyle = 'REMOTE' | 'ONSITE' | 'HYBRID'; // Added HYBRID as common option
export type EmployerSize = 'SIZE_1_TO_10' | 'SIZE_10_TO_50' | 'SIZE_50_TO_100' | 'SIZE_100_TO_500' | 'SIZE_500_PLUS';

export interface FreelancerProfile {
    // Step 1: Basic Info
    name: string;
    grade: FreelancerGrade;
    avatar_url?: string;
    introduction: string; // Bio
    career_years: number;
    hope_salary: number; // Monthly

    // Step 2: Work Conditions & Skills
    work_type: WorkType;
    start_date: Date | string;
    work_style: WorkStyle;
    location: string;
    freelancer_skills: string[]; // Skill names
}

export interface EmployerProfile {
    // Step 1: Basic Info
    company_name: string;
    email: string;
    phone: string;
    logo_url?: string;
    description: string;

    // Step 2: Details
    industry: string;
    size: EmployerSize;
    location: string;
    website?: string;
}
