import apiClient from '@/api/axiosInstance';

export interface CreateContractRequest {
    projectName: string;
    freelancerId: number;
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
    freelancerAddress: string;
    freelancerPhone: string;
    employerSignature?: string;
}

export interface ContractListParams {
    status?: string | string[];
    search?: string;
    page?: number;
    limit?: number;
}

export async function listContracts(params?: ContractListParams) {
    const response = await apiClient.get('/api/v1/contracts', { params });
    return response.data.data; // { items: ContractSummary[], pagination: {...} }
}

export async function getContract(contractId: number) {
    const response = await apiClient.get(`/api/v1/contracts/${contractId}`);
    return response.data.data; // ContractResponse
}

export async function createContract(data: CreateContractRequest) {
    const response = await apiClient.post('/api/v1/contracts', data);
    return response.data.data; // ContractResponse
}

export async function signContract(contractId: number, signature: string) {
    const response = await apiClient.patch(`/api/v1/contracts/${contractId}/sign`, { signature });
    return response.data.data; // ContractResponse
}

export async function completeContract(contractId: number) {
    const response = await apiClient.patch(`/api/v1/contracts/${contractId}/complete`);
    return response.data.data;
}

export async function rejectContract(contractId: number) {
    const response = await apiClient.patch(`/api/v1/contracts/${contractId}/reject`);
    return response.data.data;
}