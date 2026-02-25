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

export const updateAccountInfo = async (data: Partial<AccountInfo>): Promise<boolean> => {
    console.log('Update account info requested, keys:', Object.keys(data));
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true); // 성공 가정
        }, 800);
    });
};

export const changePassword = async (data: PasswordChange): Promise<boolean> => {
    console.log('Change password requested', data);
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
