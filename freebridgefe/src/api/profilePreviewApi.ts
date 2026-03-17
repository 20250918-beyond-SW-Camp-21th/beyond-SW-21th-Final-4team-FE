import apiClient from '@/api/axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface EmployerProfilePreview {
  employerId: number;
  userId: number;
  companyName: string | null;
  industry: string | null;
  scale: string | null;
  location: string | null;
  websiteUrl: string | null;
  phone: string | null;
  description: string | null;
  logoUrl: string | null;
}

export interface FreelancerProfilePreview {
  freelancerId: number;
  userId: number;
  name: string | null;
  avatarUrl: string | null;
  job: string | null;
  introduction: string | null;
  grade: string | null;
  careerYears: number | null;
  wage: number | null;
  skills: string[] | null;
  birthDate: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  portfolioFileUrl: string | null;
  portfolioFileName: string | null;
  portfolioLastUpdated: string | null;
}

export const getEmployerProfilePreview = async (
  employerId: string | number,
): Promise<EmployerProfilePreview> => {
  const response = await apiClient.get<ApiResponse<EmployerProfilePreview>>(
    `/api/freelancer/employers/${employerId}/preview`,
  );
  return response.data.data;
};

export const getFreelancerProfilePreview = async (
  freelancerId: string | number,
): Promise<FreelancerProfilePreview> => {
  const response = await apiClient.get<ApiResponse<FreelancerProfilePreview>>(
    `/api/employer/freelancers/${freelancerId}/preview`,
  );
  return response.data.data;
};
