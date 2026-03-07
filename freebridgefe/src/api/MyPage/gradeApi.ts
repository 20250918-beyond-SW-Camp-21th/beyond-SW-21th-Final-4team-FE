import apiClient from '@/api/axiosInstance';

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export type GradeLevel = '특급' | '고급' | '중급' | '초급' | '';
export type EducationType = '전문학사' | '학사' | '석사' | '박사';
export type CertificationType = '산업기사' | '기사';

export interface EducationOption {
    value: EducationType;
    label: string;
}

export interface CertificationOption {
    value: CertificationType;
    label: string;
}

export interface GradeCriteriaItem {
    grade: GradeLevel;
    color: string;
    edu: string;
    cert: string;
}

export interface GradeCalculationRequest {
    type: 'education' | 'certification';
    education?: EducationType;
    certification?: CertificationType;
    yearsOfExperience: number;
}

export interface GradeCalculationResponse {
    grade: GradeLevel;
}

export interface GradeSaveRequest {
    type: 'education' | 'certification';
    education?: EducationType;
    certification?: CertificationType;
    yearsOfExperience: number;
    grade: GradeLevel;
}

const MOCK_EDUCATION_OPTIONS: EducationOption[] = [
    { value: '전문학사', label: '전문학사' },
    { value: '학사', label: '학사' },
    { value: '석사', label: '석사' },
    { value: '박사', label: '박사' }
];

const MOCK_CERTIFICATION_OPTIONS: CertificationOption[] = [
    { value: '산업기사', label: '산업기사' },
    { value: '기사', label: '기사' }
];

const MOCK_CRITERIA_ITEMS: GradeCriteriaItem[] = [
    { grade: '특급', color: 'bg-purple-600', edu: '박사+4년 / 석사+9년 / 학사+12년 / 전문학사+15년', cert: '기사+10년 / 산업기사+13년' },
    { grade: '고급', color: 'bg-blue-500', edu: '박사+1년 / 석사+6년 / 학사+9년 / 전문학사+12년', cert: '기사+7년 / 산업기사+10년' },
    { grade: '중급', color: 'bg-green-500', edu: '박사 / 석사+3년 / 학사+6년 / 전문학사+9년', cert: '기사+4년 / 산업기사+7년' },
    { grade: '초급', color: 'bg-slate-500', edu: '석사 / 학사 / 전문학사+3년', cert: '기사 / 산업기사' },
];

export const getEducationOptions = async (): Promise<EducationOption[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_EDUCATION_OPTIONS), 300));
};

export const getCertificationOptions = async (): Promise<CertificationOption[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_CERTIFICATION_OPTIONS), 300));
};

export const getGradeCriteria = async (): Promise<GradeCriteriaItem[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_CRITERIA_ITEMS), 300));
};

export const calculateGrade = async (req: GradeCalculationRequest): Promise<GradeLevel> => {
    const response = await apiClient.post<ApiResponse<GradeCalculationResponse>>(
        '/api/freelancer/mypage/grade-calculator/calculate',
        req
    );
    return response.data.data.grade;
};

export const saveGrade = async (_req: GradeSaveRequest): Promise<boolean> => {
    // TODO: 등급 저장 API가 준비되면 연동
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 1000);
    });
};
