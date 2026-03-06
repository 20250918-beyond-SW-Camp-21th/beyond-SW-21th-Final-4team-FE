import apiClient from '@/api/axiosInstance';

export interface AccountInfo {
    id: number;
    email: string;
    name: string;
    phone: string;
}

export interface PasswordChange {
    current: string;
    new: string;
    confirm: string;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface EmployerSubscriptionResponse {
    currentPlan: string;
    features: string[];
    nextBillingDate: string | null;
}

export interface EmployerNotificationSettings {
    emailEnabled: boolean;
}

export interface FreelancerNotificationSettings {
    requestNotificationEnabled: boolean;
    contractNotificationEnabled: boolean;
}

export const getAccountInfo = async (): Promise<AccountInfo> => {
    const response = await apiClient.get<ApiResponse<any>>('/api/users/me/test');
    const data = response.data.data;
    return {
        id: data.id,
        email: data.email ?? '',
        name: data.name ?? '',
        phone: '' // User API에 phone이 없어 빈 값 처리
    };
};

export const updateAccountInfo = async (_data: Partial<AccountInfo>): Promise<boolean> => {
    // User API에 계정 수정 엔드포인트가 없어 임시로 true 반환
    return true;
};

export const changeEmployerPassword = async (data: PasswordChange): Promise<boolean> => {
    await apiClient.put<ApiResponse<null>>('/api/employer/mypage/account/password', {
        currentPassword: data.current,
        newPassword: data.new
    });
    return true;
};

export const changeFreelancerPassword = async (data: PasswordChange): Promise<boolean> => {
    await apiClient.put<ApiResponse<null>>('/api/freelancer/mypage/account/password', {
        currentPassword: data.current,
        newPassword: data.new
    });
    return true;
};

export const getEmployerSubscription = async (): Promise<EmployerSubscriptionResponse> => {
    const response = await apiClient.get<ApiResponse<EmployerSubscriptionResponse>>(
        '/api/employer/mypage/account/subscription'
    );
    return response.data.data;
};

export const updateEmployerSubscription = async (targetPlan: string): Promise<boolean> => {
    await apiClient.put<ApiResponse<null>>('/api/employer/mypage/account/subscription', {
        targetPlan
    });
    return true;
};

export const getEmployerNotificationSettings = async (): Promise<EmployerNotificationSettings> => {
    const response = await apiClient.get<ApiResponse<EmployerNotificationSettings>>(
        '/api/employer/mypage/account/notifications'
    );
    return response.data.data;
};

export const updateEmployerNotificationSettings = async (emailEnabled: boolean): Promise<boolean> => {
    await apiClient.put<ApiResponse<null>>('/api/employer/mypage/account/notifications', {
        emailEnabled
    });
    return true;
};

export const getFreelancerNotificationSettings = async (): Promise<FreelancerNotificationSettings> => {
    const response = await apiClient.get<ApiResponse<FreelancerNotificationSettings>>(
        '/api/freelancer/mypage/account/notifications'
    );
    return response.data.data;
};

export const updateFreelancerNotificationSettings = async (
    requestNotificationEnabled: boolean,
    contractNotificationEnabled: boolean
): Promise<boolean> => {
    await apiClient.put<ApiResponse<null>>('/api/freelancer/mypage/account/notifications', {
        requestNotificationEnabled,
        contractNotificationEnabled
    });
    return true;
};

export const deleteAccount = async (): Promise<boolean> => {
    // User API에 계정 삭제 엔드포인트가 없어 임시로 true 반환
    return true;
};
