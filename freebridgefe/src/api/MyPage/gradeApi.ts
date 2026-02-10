
export type GradeLevel = '초급' | '중급' | '고급' | '특급' | '';
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

// Backend logic simulation
const calculateInternal = (req: GradeCalculationRequest): GradeLevel => {
    const { type, education, certification, yearsOfExperience: years } = req;

    if (type === 'education' && education) {
        if (education === '박사') {
            if (years >= 4) return '특급';
            if (years >= 1) return '고급';
            return '중급';
        }
        if (education === '석사') {
            if (years >= 9) return '특급';
            if (years >= 6) return '고급';
            if (years >= 3) return '중급';
            return '초급';
        }
        if (education === '학사') {
            if (years >= 12) return '특급';
            if (years >= 9) return '고급';
            if (years >= 6) return '중급';
            return '초급';
        }
        if (education === '전문학사') {
            if (years >= 15) return '특급';
            if (years >= 12) return '고급';
            if (years >= 9) return '중급';
            if (years >= 3) return '초급';
            return '';
        }
    } else if (type === 'certification' && certification) {
        if (certification === '기사') {
            if (years >= 10) return '특급';
            if (years >= 7) return '고급';
            if (years >= 4) return '중급';
            return '초급';
        }
        if (certification === '산업기사') {
            if (years >= 13) return '특급';
            if (years >= 10) return '고급';
            if (years >= 7) return '중급';
            return '초급';
        }
    }
    return '';
};


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
    console.log('Calculating grade for:', req);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(calculateInternal(req));
        }, 800);
    });
};

export const saveGrade = async (req: GradeSaveRequest): Promise<boolean> => {
    console.log('Saving grade:', req);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true); // Success
        }, 1000);
    });
};
