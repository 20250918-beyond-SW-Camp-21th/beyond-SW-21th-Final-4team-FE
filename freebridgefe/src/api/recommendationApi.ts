import apiClient from "./axiosInstance";

export interface AiRecommendationResponseDTO {
  id: number;
  nameOrTitle: string;
  matchScore: number;
  skills: string[];
  experience: number;
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
  jobPostingId: number,
): Promise<AiRecommendationResponseDTO[]> => {
  const response = await apiClient.get<
    ApiResponse<AiRecommendationResponseDTO[]>
  >(`/api/v1/employer/jobs/${jobPostingId}/recommendations`);
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
  return response.data.data;
};
