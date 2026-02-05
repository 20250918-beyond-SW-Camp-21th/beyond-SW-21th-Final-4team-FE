<script setup lang="ts">
import { Star, MessageSquareQuote, UserCheck, ClipboardEdit } from 'lucide-vue-next';

const evaluationItems = [
  { key: 'language', label: '프로그래밍 언어 이해도' },
  { key: 'framework', label: '프레임워크/라이브러리 활용력' },
  { key: 'debugging', label: '디버깅 및 문제 해결 능력' },
  { key: 'communication', label: '의사소통' },
  { key: 'schedule', label: '일정 준수' },
  { key: 'dispute', label: '분쟁 여부' },
] as const;

type ReviewRatingKey = typeof evaluationItems[number]['key'];

type ReviewBase = Record<ReviewRatingKey, number> & {
  id: string;
  projectName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const employerToFreelancerReviews: Array<
  ReviewBase & {
    freelancerName: string;
  }
> = [
  {
    id: 'ef-1',
    freelancerName: '김프리',
    projectName: '대시보드 고도화',
    rating: 4.8,
    language: 5,
    framework: 5,
    debugging: 4,
    communication: 4,
    schedule: 5,
    dispute: 5,
    comment:
      '요구사항을 빠르게 이해하고 제안까지 해주셔서 프로젝트 방향이 명확해졌습니다. 일정도 잘 지켜 주셔서 믿고 맡길 수 있었습니다.',
    createdAt: '2024-10-03',
  },
  {
    id: 'ef-2',
    freelancerName: '박디자인',
    projectName: '브랜딩 UI 리뉴얼',
    rating: 4.4,
    language: 4,
    framework: 4,
    debugging: 4,
    communication: 5,
    schedule: 4,
    dispute: 5,
    comment:
      '커뮤니케이션이 매우 매끄럽고 피드백 반영이 빨랐습니다. 마감 일정은 약간 여유가 필요했지만 결과물 만족도가 높았습니다.',
    createdAt: '2024-08-12',
  },
];

const freelancerToEmployerReviews: Array<
  ReviewBase & {
    reviewerName: string;
  }
> = [
  {
    id: 'fe-1',
    reviewerName: '이프리랜서',
    projectName: '모바일 앱 리팩토링',
    rating: 4.6,
    language: 4,
    framework: 5,
    debugging: 4,
    communication: 5,
    schedule: 4,
    dispute: 5,
    comment:
      '업무 범위가 명확하고 의사 결정이 빠른 편이라 진행이 수월했습니다. 일정 협의도 원활했습니다.',
    createdAt: '2024-09-20',
  },
  {
    id: 'fe-2',
    reviewerName: '정개발자',
    projectName: 'API 성능 개선',
    rating: 4.2,
    language: 4,
    framework: 4,
    debugging: 4,
    communication: 4,
    schedule: 4,
    dispute: 5,
    comment:
      '요구사항이 중간에 일부 변경되었지만 조율이 잘 되었고, 정산도 깔끔하게 처리되었습니다.',
    createdAt: '2024-07-28',
  },
];
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 font-sans text-white">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
    >
      <div>
        <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          내 리뷰
        </h1>
        <p class="text-white/60">내가 남긴 후기와 프리랜서가 남긴 피드백을 확인하세요</p>
      </div>
      <div class="flex items-center gap-2 text-white/60">
        <MessageSquareQuote class="w-5 h-5" />
        <span>Review Center</span>
      </div>
    </div>

    <div class="flex justify-end mb-10">
      <RouterLink
        to="/employer/review/write"
        class="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-semibold hover:scale-105 transition-transform"
      >
        <ClipboardEdit class="w-5 h-5" />
        후기 작성
      </RouterLink>
    </div>

    <!-- Reviews -->
    <div class="grid gap-8">
      <div
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
      >
        <div class="flex items-center gap-2 mb-6">
          <UserCheck class="w-5 h-5 text-green-300" />
          <h2 class="text-2xl font-bold">내가 남긴 후기</h2>
        </div>
        <div class="space-y-4">
          <div
            v-for="(review, index) in employerToFreelancerReviews"
            :key="review.id"
            class="bg-white/5 border border-white/10 rounded-2xl p-6"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 50 } }"
          >
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <div class="text-lg font-semibold text-white">{{ review.freelancerName }}</div>
                <div class="text-sm text-white/60">{{ review.projectName }}</div>
              </div>
              <div class="text-sm text-white/60">
                {{ new Date(review.createdAt).toLocaleDateString('ko-KR') }}
              </div>
            </div>
            <div class="flex items-center gap-2 mb-4">
              <div class="flex items-center gap-1">
                <Star
                  v-for="star in 5"
                  :key="star"
                  class="w-4 h-4"
                  :class="star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'"
                />
              </div>
              <span class="text-white font-medium">{{ review.rating.toFixed(1) }}</span>
              <span class="text-white/40">/ 5.0</span>
            </div>
            <div class="flex flex-wrap gap-6 text-sm text-white/60 mb-4">
              <div v-for="item in evaluationItems" :key="item.key">
                {{ item.label }} <span class="text-white font-medium ml-1">{{ review[item.key] }}</span>
              </div>
            </div>
            <p class="text-white/80 leading-relaxed bg-black/20 rounded-xl p-4">
              {{ review.comment }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
      >
        <div class="flex items-center gap-2 mb-6">
          <MessageSquareQuote class="w-5 h-5 text-purple-300" />
          <h2 class="text-2xl font-bold">프리랜서가 남긴 후기</h2>
        </div>
        <div class="space-y-4">
          <div
            v-for="(review, index) in freelancerToEmployerReviews"
            :key="review.id"
            class="bg-white/5 border border-white/10 rounded-2xl p-6"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 50 } }"
          >
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <div class="text-lg font-semibold text-white">{{ review.reviewerName }}</div>
                <div class="text-sm text-white/60">{{ review.projectName }}</div>
              </div>
              <div class="text-sm text-white/60">
                {{ new Date(review.createdAt).toLocaleDateString('ko-KR') }}
              </div>
            </div>
            <div class="flex items-center gap-2 mb-4">
              <div class="flex items-center gap-1">
                <Star
                  v-for="star in 5"
                  :key="star"
                  class="w-4 h-4"
                  :class="star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'"
                />
              </div>
              <span class="text-white font-medium">{{ review.rating.toFixed(1) }}</span>
              <span class="text-white/40">/ 5.0</span>
            </div>
            <div class="flex flex-wrap gap-6 text-sm text-white/60 mb-4">
              <div v-for="item in evaluationItems" :key="item.key">
                {{ item.label }} <span class="text-white font-medium ml-1">{{ review[item.key] }}</span>
              </div>
            </div>
            <p class="text-white/80 leading-relaxed bg-black/20 rounded-xl p-4">
              {{ review.comment }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
