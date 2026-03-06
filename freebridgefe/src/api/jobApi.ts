import apiClient from './axiosInstance';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    httpStatus?: string;
}

interface PagedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export type RecruitmentJobStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'COMPLETED';

export interface EmployerJobPostingResponse {
    jobPostingId: number;
    employerName: string;
    title: string;
    description: string;
    techStack: string[];
    budget: number;
    duration: number;
    headcount: number;
    matchedHeadcount: number;
    status: RecruitmentJobStatus;
}

export interface FreelancerJobPostingResponse {
    jobPostingId: number;
    employerId?: number | string | null;
    employerName: string;
    title: string;
    description: string;
    techStack: string[];
    budget: number;
    duration: number;
    headcount: number;
    matchedHeadcount: number;
    status?: RecruitmentJobStatus | null;
    favorite: boolean;
}

export interface JobPostingCreateRequest {
    title: string;
    description: string;
    techStack: string[];
    budget: number;
    duration: number;
    headcount: number;
}

export interface JobPostingUpdateRequest {
    title?: string;
    description?: string;
    techStack?: string[];
    budget?: number;
    duration?: number;
    headcount?: number;
    status?: RecruitmentJobStatus;
}

const extractContent = <T>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
        return payload as T[];
    }

    if (payload && typeof payload === 'object') {
        const wrapped = payload as ApiResponse<unknown>;
        const data = wrapped.data;

        if (Array.isArray(data)) {
            return data as T[];
        }

        if (data && typeof data === 'object') {
            const paged = data as PagedResponse<T>;
            if (Array.isArray(paged.content)) {
                return paged.content;
            }
        }
    }

    return [];
};

export const getEmployerJobPostings = async (params?: { page?: number; size?: number }): Promise<EmployerJobPostingResponse[]> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<EmployerJobPostingResponse>>>(
        '/api/employer/jobs',
        { params }
    );
    return extractContent<EmployerJobPostingResponse>(response.data);
};

export const searchFreelancerJobPostings = async (params?: {
    keyword?: string;
    liked?: boolean;
    page?: number;
    size?: number;
}): Promise<FreelancerJobPostingResponse[]> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<FreelancerJobPostingResponse>>>(
        '/api/freelancer/jobs',
        { params }
    );
    return extractContent<FreelancerJobPostingResponse>(response.data);
};

export const createEmployerJobPosting = async (payload: JobPostingCreateRequest): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/api/employer/jobs/post', payload);
};

export const updateEmployerJobPosting = async (jobPostingId: number, payload: JobPostingUpdateRequest): Promise<void> => {
    await apiClient.put<ApiResponse<void>>('/api/employer/jobs/put', payload, {
        params: { jobsNumber: jobPostingId }
    });
};

export const deleteEmployerJobPosting = async (jobPostingId: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>('/api/employer/jobs/del', {
        params: { jobsNumber: jobPostingId }
    });
};

export const addFavoriteJobPosting = async (jobPostingId: number): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/api/freelancer/jobs/${jobPostingId}/like`);
};

export const removeFavoriteJobPosting = async (jobPostingId: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/api/freelancer/jobs/${jobPostingId}/like`);
};
