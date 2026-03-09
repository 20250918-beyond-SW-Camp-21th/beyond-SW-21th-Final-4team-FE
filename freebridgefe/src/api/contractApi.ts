import apiClient from '@/api/axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ContractSummaryDto {
  id: number;
  contractId: number;
  projectName: string;
  freelancerId: number;
  employerId: number;
  startDate: string;
  endDate: string;
  status: string;
  budget: number;
  employerSigned: boolean;
  freelancerSigned: boolean;
  freelancerName?: string | null;
  employerName?: string | null;
}

export interface ContractListResponseDto {
  items: ContractSummaryDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListContractsParams {
  status?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export const listContracts = async (
  params: ListContractsParams = {},
): Promise<ContractListResponseDto> => {
  const response = await apiClient.get<ApiResponse<ContractListResponseDto>>('/api/v1/contracts', {
    params: {
      status: params.status,
      search: params.search,
      page: params.page ?? 1,
      limit: params.limit ?? 100,
    },
  });

  return response.data.data;
};
