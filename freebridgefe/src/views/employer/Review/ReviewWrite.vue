<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Star, ClipboardEdit, ArrowLeft } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useReviewStore } from '@/stores/reviewStore';

const evaluationItems = [
  { key: 'language', label: '프로그래밍 언어 이해도' },
  { key: 'framework', label: '프레임워크/라이브러리 활용력' },
  { key: 'debugging', label: '디버깅 및 문제 해결 능력' },
  { key: 'communication', label: '의사소통' },
  { key: 'schedule', label: '일정 준수' },
  { key: 'dispute', label: '분쟁 여부' },
] as const;

type ReviewRatingKey = typeof evaluationItems[number]['key'];

type ReviewFormRatings = Record<ReviewRatingKey, number>;

const employerProjects = [
  { id: 'p1', title: '대시보드 고도화', freelancerName: '김프리' },
  { id: 'p2', title: '브랜딩 UI 리뉴얼', freelancerName: '박디자인' },
  { id: 'p3', title: '데이터 파이프라인 개선', freelancerName: '오데이터' },
];

const form = reactive({
  projectId: '',
  ratings: {
    language: 0,
    framework: 0,
    debugging: 0,
    communication: 0,
    schedule: 0,
    dispute: 0,
  } as ReviewFormRatings,
  comment: '',
});

const formError = ref('');
const formSuccess = ref('');
const authStore = useAuthStore();
const reviewStore = useReviewStore();

const selectedProject = computed(() => employerProjects.find((p) => p.id === form.projectId));

const overallRating = computed(() => {
  const values = Object.values(form.ratings);
  if (values.some((v) => v === 0)) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
});

const setRating = (field: ReviewRatingKey, value: number) => {
  form.ratings[field] = value;
};

const resetForm = () => {
  form.projectId = '';
  form.ratings = {
    language: 0,
    framework: 0,
    debugging: 0,
    communication: 0,
    schedule: 0,
    dispute: 0,
  };
  form.comment = '';
};

const handleSubmit = () => {
  formError.value = '';
  formSuccess.value = '';

  if (!form.projectId) {
    formError.value = '프로젝트를 선택해 주세요.';
    return;
  }

  if (Object.values(form.ratings).some((v) => v === 0)) {
    formError.value = '모든 평가 항목을 입력해 주세요.';
    return;
  }

  if (!form.comment.trim()) {
    formError.value = '후기 내용을 입력해 주세요.';
    return;
  }

  if (!window.confirm('후기를 등록하시겠습니까?')) {
    return;
  }

  if (!selectedProject.value) {
    formError.value = '프로젝트 정보를 찾을 수 없습니다.';
    return;
  }

  reviewStore.addEmployerToFreelancerReview({
    employerId: authStore.user?.id,
    employerName: authStore.user?.companyName || authStore.user?.name || '고용주',
    freelancerName: selectedProject.value.freelancerName,
    projectName: selectedProject.value.title,
    language: form.ratings.language,
    framework: form.ratings.framework,
    debugging: form.ratings.debugging,
    communication: form.ratings.communication,
    schedule: form.ratings.schedule,
    dispute: form.ratings.dispute,
    comment: form.comment.trim(),
  });

  formSuccess.value = '후기가 등록되었습니다.';
  resetForm();
};
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-4 md:px-8 py-12 font-sans text-white">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
      <div>
        <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          후기 작성
        </h1>
        <p class="text-white/60">프리랜서와의 프로젝트 경험을 상세하게 기록하세요</p>
      </div>
      <RouterLink
        to="/employer/review"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        목록으로
      </RouterLink>
    </div>

    <div
      class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
    >
      <div class="flex items-center gap-2 mb-6">
        <ClipboardEdit class="w-5 h-5 text-blue-300" />
        <h2 class="text-2xl font-bold">프리랜서 후기 작성</h2>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <label class="flex flex-col gap-2">
          <span class="text-sm text-white/60">프로젝트 선택</span>
          <select
            v-model="form.projectId"
            class="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="" disabled>프로젝트를 선택하세요</option>
            <option v-for="project in employerProjects" :key="project.id" :value="project.id">
              {{ project.title }} · {{ project.freelancerName }}
            </option>
          </select>
        </label>

        <div class="flex flex-col gap-2">
          <span class="text-sm text-white/60">선택된 프리랜서</span>
          <div class="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white/80">
            {{ selectedProject?.freelancerName || '프로젝트를 선택해 주세요' }}
          </div>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <div
          v-for="item in evaluationItems"
          :key="item.key"
          class="bg-black/20 border border-white/10 rounded-2xl p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="font-semibold text-white">{{ item.label }}</span>
            <span class="text-white/60 text-sm">{{ form.ratings[item.key] }} / 5</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="transition-transform hover:scale-110"
              @click="setRating(item.key, star)"
            >
              <Star
                class="w-5 h-5"
                :class="star <= form.ratings[item.key] ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'"
              />
            </button>
          </div>
        </div>
      </div>

      <label class="flex flex-col gap-2 mb-6">
        <span class="text-sm text-white/60">후기 내용</span>
        <textarea
          v-model="form.comment"
          rows="4"
          class="bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white/90 focus:outline-none focus:ring-2 focus:ring-white/30"
          placeholder="프로젝트 진행 경험과 느낀 점을 작성해 주세요."
        ></textarea>
      </label>

      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <div class="text-white/60">
          전체 평점 <span class="text-white font-semibold">{{ overallRating.toFixed(1) }}</span> / 5.0
        </div>
        <button
          type="button"
          @click="handleSubmit"
          class="px-6 py-3 bg-white text-black rounded-full font-semibold hover:scale-105 transition-transform"
        >
          후기 등록
        </button>
        <button
          type="button"
          @click="resetForm"
          class="px-6 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors"
        >
          초기화
        </button>
        <span v-if="formError" class="text-red-300 text-sm">{{ formError }}</span>
        <span v-if="formSuccess" class="text-green-300 text-sm">{{ formSuccess }}</span>
      </div>
    </div>
  </div>
</template>
