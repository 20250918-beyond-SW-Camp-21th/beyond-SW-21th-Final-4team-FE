import apiClient from '@/api/axiosInstance';

export interface CreateContractRequest {
    projectName: string;
    freelancerId: number;
    freelancerName?: string;     // 계약서 PDF에 표시될 프리랜서 이름
    startDate: string;
    endDate: string;
    budget: number;
    paymentDay: number;
    jobDescription: string;
    workLocation: string;
    workStartTime: string;
    workEndTime: string;
    breakStartTime: string;
    breakEndTime: string;
    workDaysPerWeek: number;
    weeklyHoliday: string;
    employerBusinessName: string;
    employerAddress: string;
    employerCEO: string;
    freelancerAddress?: string;  // 프리랜서가 서명 시 직접 입력 (고용주 생성 시 불필요)
    freelancerPhone?: string;    // 프리랜서가 서명 시 직접 입력 (고용주 생성 시 불필요)
    employerSignature?: string;
}

export interface SignContractRequest {
    signature: string;
    freelancerAddress?: string;  // 프리랜서 서명 시에만 사용
    freelancerPhone?: string;    // 프리랜서 서명 시에만 사용
}

export interface ContractListParams {
    status?: string | string[];
    search?: string;
    page?: number;
    limit?: number;
}

// GET /api/employer/project — employer's job posting projects
// Backend EmployerProjectSearchDTO: projectId, jobPostingId, freelancerId, projectName, headcount, startDate, endDate, status
export interface EmployerProject {
    projectId: number;
    jobPostingId: number;
    freelancerId: number;
    projectName: string;
    headcount: number;
    startDate: string;
    endDate: string;
    status: string;
}

export interface EmployerProjectsResponse {
    content: EmployerProject[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

// GET /api/employer/projects/{projectId}/matched-freelancers
export interface MatchedFreelancer {
    projectId: number;
    freelancerId: number;
    freelancerName: string;
    job: string;
    grade: string;
    avatarUrl: string;
    status: string;
}

export interface MatchedFreelancersResponse {
    content: MatchedFreelancer[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export async function listContracts(params?: ContractListParams) {
    const response = await apiClient.get('/api/contracts', { params });
    return response.data.data; // { items: ContractSummary[], pagination: {...} }
}

export async function getContract(contractId: number) {
    const response = await apiClient.get(`/api/contracts/${contractId}`);
    return response.data.data; // ContractResponse
}

export async function getContractPdfUrl(contractId: number): Promise<string> {
    const response = await apiClient.get(`/api/contracts/${contractId}/pdf`);
    return response.data.data; // string URL
}

export async function createContract(data: CreateContractRequest) {
    const response = await apiClient.post('/api/contracts', data);
    return response.data.data; // ContractResponse
}

export async function signContract(contractId: number, data: SignContractRequest) {
    const response = await apiClient.patch(`/api/contracts/${contractId}/sign`, data);
    return response.data.data; // ContractResponse
}

export async function completeContract(contractId: number) {
    const response = await apiClient.patch(`/api/contracts/${contractId}/complete`);
    return response.data.data;
}

export async function rejectContract(contractId: number) {
    const response = await apiClient.patch(`/api/contracts/${contractId}/reject`);
    return response.data.data;
}

export async function getEmployerRecruitmentProjects(
    page = 0,
    size = 100,
): Promise<EmployerProjectsResponse> {
    const response = await apiClient.get('/api/employer/project', { params: { page, size } });
    return response.data.data;
}

export async function getMatchedFreelancers(
    projectId: number,
    page = 0,
    size = 10,
): Promise<MatchedFreelancersResponse> {
    const response = await apiClient.get(
        `/api/employer/projects/${projectId}/matched-freelancers`,
        { params: { page, size } },
    );
    return response.data.data;
}