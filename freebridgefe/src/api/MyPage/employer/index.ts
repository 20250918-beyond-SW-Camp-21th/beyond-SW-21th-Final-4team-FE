// 고용주 마이페이지 관련 API 인터페이스 및 함수
export interface EmployerProfileData {
    companyName: string;
    industry: string;
    size: string;
    location: string;
    website: string;
    email: string;
    phone: string;
    description: string;
    plan?: string;
}

// API 함수 예시 (실제 구현 시 axios 인스턴스 사용)
// export const fetchEmployerProfile = async (): Promise<EmployerProfileData> => { ... }
// export const updateEmployerProfile = async (data: EmployerProfileData): Promise<void> => { ... }
