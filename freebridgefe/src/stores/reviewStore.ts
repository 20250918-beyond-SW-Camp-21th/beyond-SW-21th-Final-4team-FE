import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export interface FreelancerToEmployerReview {
  id: string;
  freelancerId?: string | number;
  freelancerName: string;
  companyName: string;
  projectName: string;
  atmosphere: number;
  requirementDetail: number;
  schedule: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface EmployerToFreelancerReview {
  id: string;
  employerId?: string | number;
  employerName: string;
  freelancerId?: string | number;
  freelancerName: string;
  projectName: string;
  language: number;
  framework: number;
  debugging: number;
  communication: number;
  schedule: number;
  dispute: number;
  rating: number;
  comment: string;
  createdAt: string;
}

const STORAGE_KEY = 'review-store-v1';

const defaultFreelancerToEmployerReviews: FreelancerToEmployerReview[] = [
  {
    id: 'fe-1',
    freelancerId: 'f1',
    freelancerName: '김프론트',
    companyName: '프리브릿지',
    projectName: '대시보드 고도화',
    rating: 4.6,
    atmosphere: 5,
    requirementDetail: 4,
    schedule: 4,
    comment: '요구사항이 명확했고 커뮤니케이션이 원활했습니다. 일정 조율도 합리적으로 진행되었습니다.',
    createdAt: '2024-09-20',
  },
];

const defaultEmployerToFreelancerReviews: EmployerToFreelancerReview[] = [
  {
    id: 'ef-1',
    employerId: 'e1',
    employerName: '프리브릿지',
    freelancerId: 'f1',
    freelancerName: '김프론트',
    projectName: '모바일 앱 리팩토링',
    rating: 4.7,
    language: 5,
    framework: 5,
    debugging: 4,
    communication: 5,
    schedule: 4,
    dispute: 5,
    comment: '업무 결과물의 퀄리티가 높았고 커뮤니케이션도 원활했습니다.',
    createdAt: '2024-10-03',
  },
];

export const useReviewStore = defineStore('review', () => {
  const freelancerToEmployerReviews = ref<FreelancerToEmployerReview[]>([...defaultFreelancerToEmployerReviews]);
  const employerToFreelancerReviews = ref<EmployerToFreelancerReview[]>([...defaultEmployerToFreelancerReviews]);

  const loadFromStorage = () => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        freelancerToEmployerReviews?: FreelancerToEmployerReview[];
        employerToFreelancerReviews?: EmployerToFreelancerReview[];
      };

      if (Array.isArray(parsed.freelancerToEmployerReviews)) {
        freelancerToEmployerReviews.value = parsed.freelancerToEmployerReviews;
      }
      if (Array.isArray(parsed.employerToFreelancerReviews)) {
        employerToFreelancerReviews.value = parsed.employerToFreelancerReviews;
      }
    } catch (error) {
      console.error('Failed to parse review store from localStorage', error);
    }
  };

  const persist = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        freelancerToEmployerReviews: freelancerToEmployerReviews.value,
        employerToFreelancerReviews: employerToFreelancerReviews.value,
      })
    );
  };

  const average = (scores: number[]) => Number((scores.reduce((acc, v) => acc + v, 0) / scores.length).toFixed(1));

  function addFreelancerToEmployerReview(
    payload: Omit<FreelancerToEmployerReview, 'id' | 'createdAt' | 'rating'>
  ) {
    const review: FreelancerToEmployerReview = {
      ...payload,
      id: `fe-${Date.now()}`,
      createdAt: new Date().toISOString(),
      rating: average([payload.atmosphere, payload.requirementDetail, payload.schedule]),
    };
    freelancerToEmployerReviews.value = [review, ...freelancerToEmployerReviews.value];
  }

  function addEmployerToFreelancerReview(
    payload: Omit<EmployerToFreelancerReview, 'id' | 'createdAt' | 'rating'>
  ) {
    const review: EmployerToFreelancerReview = {
      ...payload,
      id: `ef-${Date.now()}`,
      createdAt: new Date().toISOString(),
      rating: average([
        payload.language,
        payload.framework,
        payload.debugging,
        payload.communication,
        payload.schedule,
        payload.dispute,
      ]),
    };
    employerToFreelancerReviews.value = [review, ...employerToFreelancerReviews.value];
  }

  function updateFreelancerToEmployerReview(id: string, updates: Partial<FreelancerToEmployerReview>) {
    const index = freelancerToEmployerReviews.value.findIndex((review) => review.id === id);
    if (index === -1) return;
    const next = { ...freelancerToEmployerReviews.value[index], ...updates };
    next.rating = average([next.atmosphere, next.requirementDetail, next.schedule]);
    freelancerToEmployerReviews.value[index] = next;
  }

  function updateEmployerToFreelancerReview(id: string, updates: Partial<EmployerToFreelancerReview>) {
    const index = employerToFreelancerReviews.value.findIndex((review) => review.id === id);
    if (index === -1) return;
    const next = { ...employerToFreelancerReviews.value[index], ...updates };
    next.rating = average([
      next.language,
      next.framework,
      next.debugging,
      next.communication,
      next.schedule,
      next.dispute,
    ]);
    employerToFreelancerReviews.value[index] = next;
  }

  function deleteFreelancerToEmployerReview(id: string) {
    freelancerToEmployerReviews.value = freelancerToEmployerReviews.value.filter((review) => review.id !== id);
  }

  function deleteEmployerToFreelancerReview(id: string) {
    employerToFreelancerReviews.value = employerToFreelancerReviews.value.filter((review) => review.id !== id);
  }

  loadFromStorage();

  watch(
    [freelancerToEmployerReviews, employerToFreelancerReviews],
    () => {
      persist();
    },
    { deep: true }
  );

  return {
    freelancerToEmployerReviews,
    employerToFreelancerReviews,
    addFreelancerToEmployerReview,
    addEmployerToFreelancerReview,
    updateFreelancerToEmployerReview,
    updateEmployerToFreelancerReview,
    deleteFreelancerToEmployerReview,
    deleteEmployerToFreelancerReview,
  };
});
