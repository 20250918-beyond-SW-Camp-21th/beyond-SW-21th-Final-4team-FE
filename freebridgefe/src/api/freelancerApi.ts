
export interface FreelancerProfileDashboard {
    name: string;
    grade: string;
    avatar: string | null;
    introduction: string;
    careerYears: number;
    salary: string;       // 희망 몸값
    workConditions: {     // 희망 근무 환경
        type: string;     //    개인or단체
        startDate: string;
        workStyle: string;
        location: string;
    };
    skills: string[];
    expertise: {
        programming: number;      // 프로그래밍이해도
        framework: number;        // 프레임워크/라이브러리 활용력
        problemSolving: number;   // 문제해결능력
    };
    collaboration: {
        communication: number;    // 의사소통
        scheduleAdherence: number;// 일정준수
        dispute: number;          // 분쟁여부 (5.0: 없음/완벽, 1.0: 잦음) - 점수화
    };
    averageRating: number;
    statContact: number;   // 접촉 수
    statChat: number;      // 채팅 수
    statContract: number;  // 계약 완료
    statInteresting: number; // 진행중 프로젝트
}

// MOCK DATA
const MOCK_PROFILE: FreelancerProfileDashboard = {
    name: 'Freelancer',
    grade: 'master',
    avatar: null,
    introduction: '안녕하세요, 사용자 경험을 최우선으로 생각하는 프론트엔드 개발자입니다. 효율적이고 확장 가능한 코드를 작성하기 위해 항상 고민합니다.',
    careerYears: 5,
    salary: '월 800만원',
    workConditions: {
        type: '개인',
        startDate: '2024-02-01',
        workStyle: '원격',
        location: '서울'
    },
    skills: ['React', 'Vue.js', 'TypeScript', 'Node.js', 'TailwindCSS'],
    expertise: {
        programming: 4.8,
        framework: 4.9,
        problemSolving: 4.7
    },
    collaboration: {
        communication: 4.7,
        scheduleAdherence: 4.9,
        dispute: 5.0
    },
    averageRating: 4.8,
    statContact: 12,
    statChat: 3,
    statContract: 1,
    statInteresting: 5
};


export const getFreelancerProfile = async (userId: string): Promise<FreelancerProfileDashboard> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 실제 API 연동 시:
            // return axios.get(`/api/freelancers/${userId}/profile`).then(res => res.data);

            // 현재: Mock Data 반환
            // userId에 따라 다른 데이터를 줄 수도 있지만, 지금은 고정된 Mock Data 반환
            resolve(MOCK_PROFILE);
        }, 500); // 0.5초 지연 시뮬레이션
    });
};
