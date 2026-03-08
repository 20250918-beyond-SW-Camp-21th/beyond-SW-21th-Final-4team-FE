import apiClient from "@/api/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface FreelancerProfileResponseDto {
  basicProfile: {
    avatarUrl: string | null;
    name: string | null;
    job: string | null;
    introduction: string | null;
    grade: string | null;
    careerYears: number | null;
    wage: number | null;
    skills: string[] | null;
    status: string | null;
  };
  stats: {
    statContact: number | null;
    statChat: number | null;
    statContract: number | null;
  };
}

export interface FreelancerProfileDashboard {
  name: string;
  grade: string;
  avatar: string | null;
  job: string;
  introduction: string;
  careerYears: number;
  salary: number;
  workConditions: {
    type: string;
    startDate: string;
    workStyle: string;
    location: string;
  };
  skills: string[];
  expertise: {
    programming: number;
    framework: number;
    problemSolving: number;
  };
  collaboration: {
    communication: number;
    scheduleAdherence: number;
    dispute: number;
  };
  averageRating: number;
  statContact: number;
  statChat: number;
  statContract: number;
  statInteresting: number;
  statCompleted: number;
  portfolio: {
    fileUrl: string | null;
    fileName: string;
    lastUpdated: string;
  };
  aiSummary?: {
    positivityScore: number;
    grade: string;
    strengths: string[];
    weaknesses: string[];
  };
  crmAlerts?: {
    isRateBumpEligible: boolean;
    isBurnoutWarning: boolean;
    isChurnWarning: boolean;
  };
  topPercentile?: number;
}

const GUEST_FREELANCER_PROFILE: FreelancerProfileDashboard = {
  name: "Guest",
  grade: "basic",
  avatar: null,
  job: "Frontend Developer",
  introduction: "Guest profile for preview.",
  careerYears: 0,
  salary: 0,
  workConditions: {
    type: "Guest",
    startDate: "",
    workStyle: "",
    location: "",
  },
  skills: ["React", "Vue"],
  expertise: {
    programming: 0,
    framework: 0,
    problemSolving: 0,
  },
  collaboration: {
    communication: 0,
    scheduleAdherence: 0,
    dispute: 0,
  },
  averageRating: 0,
  statContact: 0,
  statChat: 0,
  statContract: 0,
  statInteresting: 0,
  statCompleted: 0,
  portfolio: {
    fileUrl: null,
    fileName: "",
    lastUpdated: "",
  },
};

export const getFreelancerProfile = async (
  _userId: string,
): Promise<FreelancerProfileDashboard> => {
  if (_userId === "guest") {
    return {
      ...GUEST_FREELANCER_PROFILE,
      workConditions: { ...GUEST_FREELANCER_PROFILE.workConditions },
      skills: [...GUEST_FREELANCER_PROFILE.skills],
      expertise: { ...GUEST_FREELANCER_PROFILE.expertise },
      collaboration: { ...GUEST_FREELANCER_PROFILE.collaboration },
      portfolio: { ...GUEST_FREELANCER_PROFILE.portfolio },
    };
  }
  const response = await apiClient.get<ApiResponse<FreelancerProfileResponseDto>>(
    "/api/freelancer/mypage/profile",
  );
  const dto = response.data.data;
  const basic = dto?.basicProfile ?? {};
  const stats = dto?.stats ?? {};

  return {
    name: basic.name ?? "",
    grade: basic.grade ?? "",
    avatar: basic.avatarUrl ?? null,
    job: basic.job ?? "",
    introduction: basic.introduction ?? "",
    careerYears: basic.careerYears ?? 0,
    salary: basic.wage ?? 0,
    workConditions: {
      type: "",
      startDate: "",
      workStyle: "",
      location: "",
    },
    skills: basic.skills ?? [],
    expertise: {
      programming: 0,
      framework: 0,
      problemSolving: 0,
    },
    collaboration: {
      communication: 0,
      scheduleAdherence: 0,
      dispute: 0,
    },
    averageRating: 0,
    statContact: stats.statContact ?? 0,
    statChat: stats.statChat ?? 0,
    statContract: stats.statContract ?? 0,
    statInteresting: 0,
    statCompleted: 0,
    portfolio: {
      fileUrl: null,
      fileName: "",
      lastUpdated: "",
    },
  };
};

export const updateFreelancerProfile = async (
  _userId: string,
  updatedProfile: Partial<FreelancerProfileDashboard>,
): Promise<FreelancerProfileDashboard> => {
  await apiClient.put<ApiResponse<null>>("/api/freelancer/mypage/profile", {
    job: updatedProfile.job ?? "",
    introduction: updatedProfile.introduction ?? "",
    careerYears: updatedProfile.careerYears ?? 0,
    wage: updatedProfile.salary ?? 0,
    skills: updatedProfile.skills ?? [],
  });

  const refreshed = await getFreelancerProfile("me");
  return {
    ...refreshed,
    avatar: updatedProfile.avatar ?? refreshed.avatar,
    workConditions: updatedProfile.workConditions ?? refreshed.workConditions,
    portfolio: updatedProfile.portfolio ?? refreshed.portfolio,
  };
};

export const uploadFreelancerAvatar = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append("file", file);
  const response = await apiClient.post<ApiResponse<string>>(
    "/api/freelancer/mypage/profile/avatar",
    form,
  );
  return response.data.data;
};
