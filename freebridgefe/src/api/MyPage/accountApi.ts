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

export interface GradeInfo {
    currentGrade: 'Junior' | 'Middle' | 'Senior' | 'Master';
    score: number;
    nextGradeScore: number;
    totalProjects: number;
    averageRating: number;
}

export const getGradeInfo = async (userId: number): Promise<GradeInfo> => {
    console.log(`Fetching grade info for user ${userId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                currentGrade: 'Senior',
                score: 350,
                nextGradeScore: 500,
                totalProjects: 12,
                averageRating: 4.8
            });
        }, 600);
    });
};

export const updateAccountInfo = async (data: Partial<AccountInfo>): Promise<boolean> => {
    console.log('Update account info:', data);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true); // 성공 가정
        }, 800);
    });
};

export const changePassword = async (data: PasswordChange): Promise<boolean> => {
    console.log('Change password:', data);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true); // 성공 가정
        }, 800);
    });
};

export const deleteAccount = async (): Promise<boolean> => {
    console.log('Delete account requested');
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true); // 성공 가정
        }, 1000);
    });
};
