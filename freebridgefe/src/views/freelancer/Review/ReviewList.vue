<script setup lang="ts">
import { ref } from 'vue';
import { Star, MessageSquareQuote, UserCheck, ClipboardEdit, Pencil, Trash2, X } from 'lucide-vue-next';

const evaluationItems = [
  { key: 'atmosphere', label: '사내 분위기' },
  { key: 'requirementDetail', label: '요구사항 디테일' },
  { key: 'schedule', label: '일정 준수' },
] as const;

type ReviewRatingKey = typeof evaluationItems[number]['key'];

type ReviewBase = Record<ReviewRatingKey, number> & {
  id: string;
  projectName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const freelancerToEmployerReviews = ref<Array<
  ReviewBase & {
    companyName: string;
  }
>>([
  {
    id: 'fe-1',
    companyName: '프리브릿지',
    projectName: '대시보드 고도화',
    rating: 4.6,
    atmosphere: 5,
    requirementDetail: 4,
    schedule: 4,
    comment:
      '요구사항이 명확했고 커뮤니케이션이 원활했습니다. 일정 조율도 합리적으로 진행되었습니다.',
    createdAt: '2024-09-20',
  },
  {
    id: 'fe-2',
    companyName: '브랜드랩',
    projectName: '브랜딩 UI 리뉴얼',
    rating: 4.2,
    atmosphere: 4,
    requirementDetail: 4,
    schedule: 4,
    comment:
      '프로젝트 범위 변경이 있었지만 합리적으로 합의되었습니다. 전반적으로 만족스러웠습니다.',
    createdAt: '2024-07-28',
  },
  {
    id: 'fe-3',
    companyName: '인사이트웍스',
    projectName: '리포트 자동화 구축',
    rating: 4.7,
    atmosphere: 5,
    requirementDetail: 5,
    schedule: 4,
    comment:
      '요구사항 문서가 잘 정리되어 있었고 결정이 빨라 진행이 매끄러웠습니다.',
    createdAt: '2024-06-18',
  },
  {
    id: 'fe-4',
    companyName: '클라우드나우',
    projectName: '클라우드 마이그레이션',
    rating: 4.1,
    atmosphere: 4,
    requirementDetail: 3,
    schedule: 5,
    comment:
      '일정 준수는 훌륭했고 협업 분위기도 좋았습니다. 요구사항은 초기에 보완이 필요했습니다.',
    createdAt: '2024-05-02',
  },
]);

const employerToFreelancerReviews: Array<
  ReviewBase & {
    reviewerName: string;
  }
> = [
  {
    id: 'ef-1',
    reviewerName: '프리브릿지',
    projectName: '모바일 앱 리팩토링',
    rating: 4.7,
    atmosphere: 5,
    requirementDetail: 5,
    schedule: 4,
    comment:
      '업무 결과물의 퀄리티가 높았고 커뮤니케이션도 원활했습니다.',
    createdAt: '2024-10-03',
  },
  {
    id: 'ef-2',
    reviewerName: '브랜드랩',
    projectName: 'API 성능 개선',
    rating: 4.3,
    atmosphere: 4,
    requirementDetail: 4,
    schedule: 4,
    comment:
      '요구사항 대응이 빠르고 일정 준수가 좋았습니다.',
    createdAt: '2024-08-12',
  },
];

const editingReviewId = ref<string | null>(null);
const editForm = ref<(ReviewBase & { companyName: string }) | null>(null);

const toReviewForm = (review: ReviewBase & { companyName: string }) =>
  JSON.parse(JSON.stringify(review)) as ReviewBase & { companyName: string };

const computeOverallRating = (review: ReviewBase) => {
  const total = evaluationItems.reduce((sum, item) => sum + review[item.key], 0);
  return Number((total / evaluationItems.length).toFixed(1));
};

const startEdit = (review: ReviewBase & { companyName: string }) => {
  editingReviewId.value = review.id;
  editForm.value = toReviewForm(review);
};

const cancelEdit = () => {
  editingReviewId.value = null;
  editForm.value = null;
};

const saveEdit = () => {
  if (!editForm.value) return;
  if (!window.confirm('후기를 수정하시겠습니까?')) return;
  const index = freelancerToEmployerReviews.value.findIndex((r) => r.id === editForm.value?.id);
  if (index === -1) return;
  editForm.value.rating = computeOverallRating(editForm.value);
  freelancerToEmployerReviews.value[index] = toReviewForm(editForm.value);
  cancelEdit();
};

const deleteReview = (id: string) => {
  if (!window.confirm('후기를 삭제하시겠습니까?')) return;
  freelancerToEmployerReviews.value = freelancerToEmployerReviews.value.filter((review) => review.id !== id);
  if (editingReviewId.value === id) {
    cancelEdit();
  }
};
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
        <p class="text-white/60">내가 남긴 후기와 기업이 남긴 피드백을 확인하세요</p>
      </div>
      <div class="flex items-center gap-2 text-white/60">
        <MessageSquareQuote class="w-5 h-5" />
        <span>Review Center</span>
      </div>
    </div>

    <div class="flex justify-end mb-10">
      <RouterLink
        to="/freelancer/review/write"
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
          <div v-if="freelancerToEmployerReviews.length === 0" class="text-center py-12 text-white/40">
            아직 작성된 후기가 없습니다.
          </div>
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
                <div class="text-lg font-semibold text-white">{{ review.companyName }}</div>
                <div class="text-sm text-white/60">{{ review.projectName }}</div>
              </div>
              <div class="flex items-center gap-3 text-sm text-white/60">
                {{ new Date(review.createdAt).toLocaleDateString('ko-KR') }}
                <button
                  type="button"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                  @click="startEdit(review)"
                >
                  <Pencil class="w-4 h-4" />
                  수정
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
                  @click="deleteReview(review.id)"
                >
                  <Trash2 class="w-4 h-4" />
                  삭제
                </button>
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

            <div
              v-if="editingReviewId === review.id && editForm"
              class="mt-6 border-t border-white/10 pt-6"
            >
              <div class="flex items-center gap-2 mb-4">
                <ClipboardEdit class="w-5 h-5 text-blue-300" />
                <h3 class="text-lg font-semibold">후기 수정</h3>
              </div>
              <div class="grid md:grid-cols-2 gap-6 mb-6">
                <div
                  v-for="item in evaluationItems"
                  :key="item.key"
                  class="bg-black/20 border border-white/10 rounded-2xl p-4"
                >
                  <div class="flex items-center justify-between mb-3">
                    <span class="font-semibold text-white">{{ item.label }}</span>
                    <span class="text-white/60 text-sm">{{ editForm[item.key] }} / 5</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button
                      v-for="star in 5"
                      :key="star"
                      type="button"
                      class="transition-transform hover:scale-110"
                      @click="editForm && (editForm[item.key] = star)"
                    >
                      <Star
                        class="w-5 h-5"
                        :class="star <= editForm[item.key] ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <label class="flex flex-col gap-2 mb-6">
                <span class="text-sm text-white/60">후기 내용</span>
                <textarea
                  v-model="editForm.comment"
                  rows="4"
                  class="bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="후기 내용을 수정해 주세요."
                ></textarea>
              </label>

              <div class="flex flex-col md:flex-row md:items-center gap-3">
                <button
                  type="button"
                  @click="saveEdit"
                  class="px-6 py-3 bg-white text-black rounded-full font-semibold hover:scale-105 transition-transform"
                >
                  수정 저장
                </button>
                <button
                  type="button"
                  @click="cancelEdit"
                  class="px-6 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2"
                >
                  <X class="w-4 h-4" />
                  취소
                </button>
              </div>
            </div>
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
          <h2 class="text-2xl font-bold">기업이 남긴 후기</h2>
        </div>
        <div class="space-y-4">
          <div v-if="employerToFreelancerReviews.length === 0" class="text-center py-12 text-white/40">
            아직 기업에서 남긴 후기가 없습니다.
          </div>
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
