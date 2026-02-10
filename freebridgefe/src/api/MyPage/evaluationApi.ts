export interface DetailedScore {
    professionalism: {
        programming: number;
        framework: number;
        problemSolving: number;
    };
    collaboration: {
        communication: number;
        scheduleAdherence: number;
        dispute: number;
    };
}

export interface Evaluation {
    id: number;
    companyName: string;
    projectName: string;
    score: number; // 0~5
    comment: string;
    tags: string[]; // ['친절해요', '결제가 빨라요']
    createdAt: string; // YYYY-MM-DD
    detailedScores: DetailedScore;
}

export const MOCK_EVALUATIONS: Evaluation[] = [
    {
        id: 1,
        companyName: '(주)테크인',
        projectName: '사내 관리자 대시보드 구축',
        score: 4.8,
        comment: '전반적인 개발 실력이 매우 뛰어납니다. 특히 복잡한 요구사항을 기술적으로 잘 풀어내주셨습니다. 일정 관리도 완벽했습니다.',
        tags: ['소통이 원활해요', '일정이 정확해요', '결과물이 훌륭해요'],
        createdAt: '2025-11-20',
        detailedScores: {
            professionalism: {
                programming: 5,
                framework: 4.5,
                problemSolving: 5
            },
            collaboration: {
                communication: 5,
                scheduleAdherence: 5,
                dispute: 4.5
            }
        }
    },
    {
        id: 2,
        companyName: '스타트업 A',
        projectName: '랜딩 페이지 리뉴얼',
        score: 4.2,
        comment: '디자인 감각이 좋으셔서 기획 의도보다 더 예쁜 결과물이 나왔습니다. 다만 초기 소통 과정에서 약간의 오해가 있었지만 잘 해결되었습니다.',
        tags: ['감각적이에요', '피드백이 빨라요'],
        createdAt: '2025-10-15',
        detailedScores: {
            professionalism: {
                programming: 4,
                framework: 4.5,
                problemSolving: 4
            },
            collaboration: {
                communication: 3.5,
                scheduleAdherence: 4.5,
                dispute: 4
            }
        }
    },
    {
        id: 3,
        companyName: '솔루션 B',
        projectName: 'API 연동 모듈 개발',
        score: 5.0,
        comment: '기술적인 난이도가 높은 작업이었는데, 문제 해결 능력이 탁월하십니다. 코드 퀄리티도 매우 만족스러워 유지보수가 쉬울 것 같습니다.',
        tags: ['기술력이 좋아요', '코드가 깔끔해요'],
        createdAt: '2025-09-01',
        detailedScores: {
            professionalism: {
                programming: 5,
                framework: 5,
                problemSolving: 5
            },
            collaboration: {
                communication: 5,
                scheduleAdherence: 5,
                dispute: 5
            }
        }
    }
];

export interface RejectionFeedback {
    id: number;
    companyName: string;
    projectName: string;
    reason: string;
    createdAt: string;
}

export const MOCK_REJECTION_FEEDBACKS: RejectionFeedback[] = [
    {
        id: 1,
        companyName: '넥스트레벨',
        projectName: '쇼핑몰 고도화 프로젝트',
        reason: '포트폴리오는 훌륭했으나, 저희가 현재 도입하려는 Vue 3 Composition API 경험이 다소 부족해 보여 아쉽게도 함께하지 못하게 되었습니다.',
        createdAt: '2025-12-05'
    },
    {
        id: 2,
        companyName: 'Global IT',
        projectName: '사내 메신저 개발',
        reason: '제시해주신 견적이 저희 내부 예산 범위를 초과하여 부득이하게 계약을 진행하기 어렵게 되었습니다.',
        createdAt: '2025-11-10'
    }
];

export const getRejectionFeedbacks = async (userId: number): Promise<RejectionFeedback[]> => {
    console.log(`Fetching rejection feedbacks for user ${userId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_REJECTION_FEEDBACKS);
        }, 500);
    });
};

export const getEvaluations = async (userId: number): Promise<Evaluation[]> => {
    console.log(`Fetching evaluations for user ${userId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_EVALUATIONS);
        }, 500);
    });
};
