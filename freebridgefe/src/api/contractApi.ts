import apiClient from './axios';

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    httpStatus?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit?: number;
    size?: number;
}

// Types matching the contract store
export interface Contract {
    id: number;
    contractId: number;
    projectId?: string;
    projectName: string;
    freelancerId: number;
    employerId: number;
    startDate: Date | string;
    endDate: Date | string;
    status: 'WAITING_SIGNATURE' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
    budget: number;
    commissionRate: number;
    paymentDay: number;
    contractPdfUrl: string;
    signedPdfUrl?: string;
    signedDate?: Date | string;
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
    employerSignedDate?: Date | string;
    freelancerSignature?: string;
    freelancerSignedDate?: Date | string;
    freelancerName?: string;
    employerName?: string;
}

export interface EmployerSettlement {
    settlementId: number;
    contractId: number;
    projectName?: string;
    amount: number;
    commissionRate?: number;
    commissionAmount?: number;
    netAmount?: number;
    status: 'PENDING' | 'PAID' | 'DISBURSED' | 'CANCELLED';
    dueDate: Date | string;
    paidDate?: Date | string;
    disbursedDate?: Date | string;
}

export interface FreelancerSettlement {
    settlementId: number;
    contractId: number;
    projectName?: string;
    grossAmount?: number;
    amount: number;
    commissionAmount?: number;
    netAmount?: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    scheduledDate: Date | string;
    disbursedDate?: Date | string;
}

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
    employerSignature: string;
}

export interface SignContractRequest {
    signature: string;
}

// ==================== Contract APIs ====================

/**
 * Create a new contract
 */
export const createContract = async (data: CreateContractRequest): Promise<Contract> => {
    try {
        const response = await apiClient.post<ApiResponse<Contract>>('/api/v1/contracts', data);
        return response.data.data;
    } catch (error) {
        console.error('Failed to create contract:', error);
        throw error;
    }
};

/**
 * Get contract list with pagination
 */
export const getContractList = async (params?: {
    status?: string[];
    search?: string;
    page?: number;
    limit?: number;
}): Promise<PaginatedResponse<Contract>> => {
    try {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Contract>>>(
            '/api/v1/contracts',
            { params }
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch contracts:', error);
        throw error;
    }
};

/**
 * Get a single contract by ID
 */
export const getContractById = async (contractId: number): Promise<Contract> => {
    try {
        const response = await apiClient.get<ApiResponse<Contract>>(`/api/v1/contracts/${contractId}`);
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch contract:', error);
        throw error;
    }
};

/**
 * Sign contract (employer or freelancer)
 */
export const signContract = async (
    contractId: number,
    data: SignContractRequest
): Promise<Contract> => {
    try {
        const response = await apiClient.patch<ApiResponse<Contract>>(
            `/api/v1/contracts/${contractId}/sign`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to sign contract:', error);
        throw error;
    }
};

/**
 * Complete a contract (employer only)
 */
export const completeContract = async (contractId: number): Promise<{ contractId: number; status: string }> => {
    try {
        const response = await apiClient.patch<ApiResponse<{ contractId: number; status: string }>>(
            `/api/v1/contracts/${contractId}/complete`
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to complete contract:', error);
        throw error;
    }
};

/**
 * Reject a contract
 */
export const rejectContract = async (contractId: number): Promise<{ contractId: number; status: string }> => {
    try {
        const response = await apiClient.patch<ApiResponse<{ contractId: number; status: string }>>(
            `/api/v1/contracts/${contractId}/reject`
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to reject contract:', error);
        throw error;
    }
};

/**
 * Get contract PDF URL
 */
export const getContractPdfUrl = async (contractId: number): Promise<string> => {
    try {
        const response = await apiClient.get<ApiResponse<string>>(
            `/api/v1/contracts/${contractId}/pdf`
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to get contract PDF URL:', error);
        throw error;
    }
};

// ==================== Employer Settlement APIs ====================

/**
 * Get employer settlement list
 */
export const getEmployerSettlements = async (params?: {
    status?: string;
    dateRange?: string;
    search?: string;
    sort?: string;
    page?: number;
    size?: number;
}): Promise<PaginatedResponse<EmployerSettlement>> => {
    try {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<EmployerSettlement>>>(
            '/api/v1/settlements/employer',
            { params }
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch employer settlements:', error);
        throw error;
    }
};

/**
 * Get employer settlement summary
 */
export const getEmployerSettlementSummary = async (): Promise<{
    totalPaid: number;
    completedCount: number;
    pendingAmount: number;
}> => {
    try {
        const response = await apiClient.get<ApiResponse<any>>(
            '/api/v1/settlements/employer/summary'
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch employer settlement summary:', error);
        throw error;
    }
};

/**
 * Get next settlement due
 */
export const getNextSettlementDue = async (): Promise<EmployerSettlement | null> => {
    try {
        const response = await apiClient.get<ApiResponse<EmployerSettlement>>(
            '/api/v1/settlements/employer/next'
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch next settlement:', error);
        return null;
    }
};

/**
 * Get employer settlement detail
 */
export const getEmployerSettlementDetail = async (settlementId: number): Promise<EmployerSettlement> => {
    try {
        const response = await apiClient.get<ApiResponse<EmployerSettlement>>(
            `/api/v1/settlements/employer/${settlementId}`
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch settlement detail:', error);
        throw error;
    }
};

/**
 * Download invoice PDF URL
 */
export const getInvoicePdfUrl = async (settlementId: number): Promise<string> => {
    try {
        const response = await apiClient.get<ApiResponse<string>>(
            `/api/v1/settlements/employer/${settlementId}/invoice`
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to get invoice PDF URL:', error);
        throw error;
    }
};

/**
 * Verify payment (PortOne)
 */
export const verifyPayment = async (data: {
    paymentId: string;
    contractId: number;
}): Promise<any> => {
    try {
        const response = await apiClient.post<ApiResponse<any>>(
            '/api/v1/settlements/employer/verify-payment',
            data
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to verify payment:', error);
        throw error;
    }
};

/**
 * Cancel contract and refund
 */
export const cancelAndRefund = async (contractId: number, reason?: string): Promise<void> => {
    try {
        await apiClient.post<ApiResponse<null>>(
            '/api/v1/settlements/employer/cancel-refund',
            null,
            {
                params: {
                    contractId,
                    reason: reason || '계약 취소',
                },
            }
        );
    } catch (error) {
        console.error('Failed to cancel and refund:', error);
        throw error;
    }
};

// ==================== Freelancer Settlement APIs ====================

/**
 * Get freelancer settlement list
 */
export const getFreelancerSettlements = async (params?: {
    status?: string;
    dateRange?: string;
    search?: string;
    sort?: string;
    page?: number;
    size?: number;
}): Promise<PaginatedResponse<FreelancerSettlement>> => {
    try {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<FreelancerSettlement>>>(
            '/api/v1/settlements/freelancer',
            { params }
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch freelancer settlements:', error);
        throw error;
    }
};

/**
 * Get freelancer settlement summary
 */
export const getFreelancerSettlementSummary = async (): Promise<{
    pendingAmount: number;
    totalReceived: number;
    receivedCount: number;
}> => {
    try {
        const response = await apiClient.get<ApiResponse<any>>(
            '/api/v1/settlements/freelancer/summary'
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch freelancer settlement summary:', error);
        throw error;
    }
};

/**
 * Get freelancer settlement detail
 */
export const getFreelancerSettlementDetail = async (settlementId: number): Promise<FreelancerSettlement> => {
    try {
        const response = await apiClient.get<ApiResponse<FreelancerSettlement>>(
            `/api/v1/settlements/freelancer/${settlementId}`
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to fetch settlement detail:', error);
        throw error;
    }
};

/**
 * Download receipt PDF URL
 */
export const getReceiptPdfUrl = async (settlementId: number): Promise<string> => {
    try {
        const response = await apiClient.get<ApiResponse<string>>(
            `/api/v1/settlements/freelancer/${settlementId}/receipt`
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to get receipt PDF URL:', error);
        throw error;
    }
};

/**
 * Request tax invoice
 */
export const requestTaxInvoice = async (
    settlementId: number,
    data: {
        businessRegistrationNumber: string;
        businessName: string;
        representativeName: string;
        businessAddress: string;
        email: string;
    }
): Promise<any> => {
    try {
        const response = await apiClient.post<ApiResponse<any>>(
            `/api/v1/settlements/freelancer/${settlementId}/tax-invoice`,
            data
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to request tax invoice:', error);
        throw error;
    }
};