export interface Education {
    id: number;
    schoolType: '고등학교' | '대학교' | '대학원';
    schoolName: string;
    major?: string;
    status: '재학' | '졸업' | '수료' | '휴학';
    entranceDate: string;
    graduationDate: string;
}

export interface Career {
    id: number;
    companyName: string;
    department: string;
    position: string;
    jobType: string;
    employmentType: '정규직' | '계약직' | '프리랜서' | '인턴';
    startDate: string;
    endDate: string;
    description?: string;
}

export interface Certification {
    id: number;
    name: string;
    issuer: string;
    acquisitionDate: string;
}

export interface ResumeDetail {
    id: number;
    name: string;
    birthDate: string;
    phone: string;
    email: string;
    address: string;
    educations: Education[];
    careers: Career[];
    certifications: Certification[];
}

const MOCK_RESUME_DETAIL: ResumeDetail = {
    id: 1,
    name: '김개발',
    birthDate: '1995-05-15',
    phone: '010-1234-5678',
    email: 'dev.kim@example.com',
    address: '서울특별시 강남구 테헤란로 123',
    educations: [
        {
            id: 1,
            schoolType: '대학교',
            schoolName: '한국대학교',
            major: '컴퓨터공학과',
            status: '졸업',
            entranceDate: '2014.03',
            graduationDate: '2018.02',
        },
        {
            id: 2,
            schoolType: '고등학교',
            schoolName: '서울고등학교',
            status: '졸업',
            entranceDate: '2011.03',
            graduationDate: '2014.02',
        }
    ],
    careers: [
        {
            id: 1,
            companyName: '테크스타트업',
            department: '개발팀',
            position: '대리',
            jobType: '백엔드 개발',
            employmentType: '정규직',
            startDate: '2020.01',
            endDate: '재직중',
            description: 'Spring Boot 기반 MSA 서비스 구축 및 유지보수',
        },
        {
            id: 2,
            companyName: 'IT솔루션',
            department: 'SI사업부',
            position: '사원',
            jobType: '웹 개발',
            employmentType: '계약직',
            startDate: '2018.03',
            endDate: '2019.12',
            description: '공공기관 웹사이트 유지보수 및 기능 개선',
        }
    ],
    certifications: [
        {
            id: 1,
            name: '정보처리기사',
            issuer: '한국산업인력공단',
            acquisitionDate: '2017.11',
        },
        {
            id: 2,
            name: 'SQLD',
            issuer: '한국데이터산업진흥원',
            acquisitionDate: '2018.05',
        }
    ]
};

export const getResumeDetail = async (userId: number): Promise<ResumeDetail> => {
    console.log(`Fetching resume detail for user ${userId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_RESUME_DETAIL);
        }, 500);
    });
};

export const saveResumeDetail = async (data: ResumeDetail): Promise<boolean> => {
    -    console.log('Saving resume data:', data);
    +    console.log('Saving resume data requested');
    return new Promise((resolve) => {
        setTimeout(() => {
            +            Object.assign(MOCK_RESUME_DETAIL, data);
            resolve(true);
        }, 800);
    });
};
