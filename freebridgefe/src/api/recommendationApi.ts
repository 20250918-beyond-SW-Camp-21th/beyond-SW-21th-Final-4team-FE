import apiClient from "./axiosInstance";

export interface AiRecommendationResponseDTO {
  id: number;
  nameOrTitle: string;
  matchScore: number;
  skills?: string[];
  description?: string;
  budget?: number;
  duration?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Get freelancer recommendations for a specific job posting
 */
export const getFreelancerRecommendations = async (
  jobPostingId: number | string,
  signal?: AbortSignal,
): Promise<AiRecommendationResponseDTO[]> => {
  const response = await apiClient.get<
    ApiResponse<AiRecommendationResponseDTO[]>
  >(`/api/v1/employer/jobs/${jobPostingId}/recommendations`, { signal });

  if (!response.data.success) {
    throw new Error(
      response.data.message || "추천 프리랜서 조회에 실패했습니다.",
    );
  }
  return response.data.data;
};

/**
 * Get job recommendations for the current freelancer
 */
export const getJobRecommendationsForFreelancer = async (): Promise<
  AiRecommendationResponseDTO[]
> => {
  const response = await apiClient.get<
    ApiResponse<AiRecommendationResponseDTO[]>
  >("/api/v1/freelancer/jobs/recommendations");

  if (!response.data.success) {
    throw new Error(
      response.data.message || "추천 프로젝트 조회에 실패했습니다.",
    );
  }
  return response.data.data;
};
