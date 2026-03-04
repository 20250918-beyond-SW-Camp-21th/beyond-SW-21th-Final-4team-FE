import apiClient from '../axios';

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
    try {
        await apiClient.put('/api/account', data);
        return true;
    } catch (error) {
        console.error('Failed to update account info:', error);
        throw error;
    }
};

export const changePassword = async (data: PasswordChange): Promise<boolean> => {
    try {
        await apiClient.put('/api/account/password', {
            currentPassword: data.current,
            newPassword: data.new,
        });
        return true;
    } catch (error) {
        console.error('Failed to change password:', error);
        throw error;
    }
};

export const deleteAccount = async (): Promise<boolean> => {
    try {
        await apiClient.delete('/api/account');
        return true;
    } catch (error) {
        console.error('Failed to delete account:', error);
        throw error;
    }
};
