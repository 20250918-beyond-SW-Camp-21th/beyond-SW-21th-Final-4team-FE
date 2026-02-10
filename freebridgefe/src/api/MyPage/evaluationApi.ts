export interface Evaluation {
    id: number;
    companyName: string;
    projectName: string;
    score: number; // 0~5
    comment: string;
    tags: string[]; // ['친절해요', '결제가 빨라요']
    createdAt: string; // YYYY-MM-DD
}

export const MOCK_EVALUATIONS: Evaluation[] = [
    {
        id: 1,
        companyName: '(주)테크인',
        projectName: '사내 관리자 대시보드 구축',
        score: 5,
        comment: '요구사항을 정확하게 파악하고 빠르게 개발해주셨습니다. 다음에도 꼭 같이 일하고 싶어요!',
        tags: ['소통이 원활해요', '일정이 정확해요', '결과물이 훌륭해요'],
        createdAt: '2025-11-20'
    },
    {
        id: 2,
        companyName: '스타트업 A',
        projectName: '랜딩 페이지 리뉴얼',
        score: 4,
        comment: '디자인 감각이 뛰어나시고 피드백 반영이 빠릅니다.',
        tags: ['감각적이에요', '피드백이 빨라요'],
        createdAt: '2025-10-15'
    },
    {
        id: 3,
        companyName: '솔루션 B',
        projectName: 'API 연동 모듈 개발',
        score: 5,
        comment: '복잡한 로직이었는데 깔끔하게 해결해주셨습니다.',
        tags: ['기술력이 좋아요', '코드가 깔끔해요'],
        createdAt: '2025-09-01'
    }
];

export const getEvaluations = async (userId: number): Promise<Evaluation[]> => {
    console.log(`Fetching evaluations for user ${userId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_EVALUATIONS);
        }, 500);
    });
};
