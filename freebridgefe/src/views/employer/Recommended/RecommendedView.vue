<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { TrendingUp, Send, Star } from "lucide-vue-next";
import { useFreelancerStore } from "@/stores/freelancerStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useJobStore } from "@/stores/jobStore";
import { getEmployerSubscription } from "@/api/MyPage/accountApi";
import ProposalModal from "./components/ProposalModal.vue";
import type { User } from "@/types";

const freelancerStore = useFreelancerStore();
const favoritesStore = useFavoritesStore();
const jobStore = useJobStore();
const selectedFreelancer = ref<User | null>(null);

const formatSkills = (skills?: string[]) => {
  return skills?.slice(0, 4) || [];
};

const isFavorite = (id: string) => favoritesStore.favoriteIds.includes(id);

const toggleFavorite = (id: string) => favoritesStore.toggleFavorite(id);

// --- Access Control ---
import { useRouter } from "vue-router";
import { Lock, Crown } from "lucide-vue-next";

const router = useRouter();

type PlanType = "FREE" | "PRO" | "PRIME";
const currentPlan = ref<PlanType>("FREE");

const normalizePlan = (plan?: string): PlanType => {
  const normalizedPlan = (plan ?? "FREE").trim().toUpperCase();

  if (["PRO", "PARTNER", "프로 플랜".toUpperCase()].includes(normalizedPlan)) {
    return "PRO";
  }

  if (
    ["PRIME", "ENTERPRISE", "프라임 플랜".toUpperCase()].includes(
      normalizedPlan,
    )
  ) {
    return "PRIME";
  }

  return "FREE";
};

const planLoading = ref(true);
const planFetchError = ref<string | null>(null);

const fetchCurrentPlan = async () => {
  planLoading.value = true;
  try {
    const subscription = await getEmployerSubscription();
    currentPlan.value = normalizePlan(subscription.currentPlan);
  } catch (error) {
    console.error("Failed to fetch employer plan:", error);
    planFetchError.value = "subscription_fetch_failed";
  } finally {
    planLoading.value = false;
  }
};

const hasAccess = computed(
  () => !planLoading.value && ["PRO", "PRIME"].includes(currentPlan.value),
);

const loadRecommendedFreelancers = async () => {
  let jobs = jobStore.myJobs;

  if (!jobs.length) {
    try {
      await jobStore.fetchJobPostings();
      jobs = jobStore.myJobs;
    } catch (error) {
      freelancerStore.freelancers = [];
      freelancerStore.recommendedFetchError =
        error instanceof Error && error.message
          ? error.message
          : "프로젝트 공고를 불러오지 못했습니다.";
      return;
    }
  }

  if (!jobs.length) {
    freelancerStore.freelancers = [];
    freelancerStore.recommendedFetchError =
      "등록된 프로젝트 공고가 없습니다. 공고를 먼저 등록해주세요.";
    return;
  }

  const firstJobId = jobs[0].id;
  if (typeof firstJobId === "number" || /^\d+$/.test(String(firstJobId))) {
    await freelancerStore.fetchRecommendedFreelancers(Number(firstJobId));
    return;
  }

  freelancerStore.freelancers = [];
  freelancerStore.recommendedFetchError =
    "유효하지 않은 프로젝트 공고 ID입니다.";
};

onMounted(async () => {
  await fetchCurrentPlan();
  if (planFetchError.value) {
    freelancerStore.freelancers = [];
    freelancerStore.recommendedFetchError =
      "구독 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
    return;
  }

  if (!hasAccess.value) {
    freelancerStore.recommendedFetchError = null;
    return;
  }

  await loadRecommendedFreelancers();
});

const goToUpgrade = () => {
  // Navigate to MyPage where Account Management is located
  // Ideally pass a query param to open Account tab directly: /employer/mypage?tab=account
  router.push({ name: "employer.mypage", query: { tab: "account" } });
};
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-8 text-white">
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-2">
        <TrendingUp class="w-6 h-6 text-[#2D5BFF]" />
        <h1 class="text-3xl font-bold">추천 프리랜서</h1>
      </div>
      <p class="text-white/60">AI가 선별한 최적의 프리랜서를 만나보세요</p>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="planLoading || jobStore.isLoading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="n in 6"
        :key="n"
        class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 animate-pulse"
      >
        <div class="flex items-start gap-4 mb-4">
          <div class="w-16 h-16 rounded-full bg-white/10"></div>
          <div class="flex-1 space-y-2">
            <div class="h-6 bg-white/10 rounded w-3/4"></div>
            <div class="h-4 bg-white/10 rounded w-1/4"></div>
          </div>
        </div>
        <div class="space-y-2 mb-4">
          <div class="h-4 bg-white/10 rounded"></div>
          <div class="h-4 bg-white/10 rounded w-5/6"></div>
        </div>
        <div class="flex gap-2 mb-4">
          <div class="h-6 w-16 bg-white/10 rounded-full"></div>
          <div class="h-6 w-16 bg-white/10 rounded-full"></div>
        </div>
        <div
          class="pt-4 border-t border-white/10 flex justify-between items-center"
        >
          <div class="h-4 w-24 bg-white/10 rounded"></div>
          <div class="flex gap-2">
            <div class="w-10 h-10 bg-white/10 rounded-lg"></div>
            <div class="w-24 h-10 bg-white/10 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="freelancerStore.recommendedFetchError"
      class="bg-red-500/5 backdrop-blur-sm rounded-xl border border-red-500/10 p-12 text-center"
    >
      <div
        class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"
      >
        <TrendingUp class="w-8 h-8 text-red-400" />
      </div>
      <h3 class="text-xl font-semibold mb-2 text-red-200">
        추천을 불러오지 못했습니다
      </h3>
      <p class="text-red-300/60">{{ freelancerStore.recommendedFetchError }}</p>
    </div>

    <!-- Fetching State -->
    <div
      v-else-if="freelancerStore.isFetchingRecommended"
      class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12 flex flex-col items-center justify-center text-center"
    >
      <div
        class="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4 opacity-70"
      ></div>
      <h3 class="text-xl font-semibold mb-2 text-white/80">AI 분석 중...</h3>
      <p class="text-white/50">
        등록하신 프로젝트에 딱 맞는 프리랜서를 찾고 있습니다
      </p>
    </div>

    <div v-else-if="hasAccess" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="freelancer in freelancerStore.freelancers"
        :key="freelancer.id"
        class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-white/20 hover:bg-white/10 transition-all"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
      >
        <div class="flex items-start gap-4 mb-4">
          <div
            class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
          >
            {{ freelancer.name[0] }}
          </div>
          <div class="flex-1">
            <router-link
              :to="{
                name: 'employer.freelancer.profile',
                params: { id: freelancer.id },
              }"
              class="text-xl font-bold mb-1 hover:text-blue-400 transition-colors cursor-pointer block"
            >
              {{ freelancer.name }}
            </router-link>
            <p class="text-sm text-white/60">
              {{ freelancer.experience }}년 경력
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-2">
          <div
            v-if="freelancer.matchScore !== undefined"
            class="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-1"
          >
            <TrendingUp class="w-3 h-3" />
            AI 적합도 {{ (freelancer.matchScore * 100).toFixed(0) }}%
          </div>
        </div>
        <p class="text-white/60 text-sm mb-4 line-clamp-2 h-10">
          {{ freelancer.bio }}
        </p>

        <div class="flex flex-wrap gap-2 mb-4 h-16 content-start">
          <span
            v-for="skill in formatSkills(freelancer.skills)"
            :key="skill"
            class="px-3 py-1 bg-[#2D5BFF]/10 text-[#2D5BFF] text-xs rounded-full border border-[#2D5BFF]/20"
          >
            {{ skill }}
          </span>
        </div>

        <div
          class="flex items-center justify-between pt-4 border-t border-white/10"
        >
          <div class="text-sm">
            <span class="text-white/60">희망 급여 </span>
            <span
              class="font-medium text-white"
              v-if="freelancer.monthlySalary"
            >
              {{ freelancer.monthlySalary?.toLocaleString() }}원
            </span>
            <span class="font-medium text-white/50" v-else> 협의 필요 </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="toggleFavorite(freelancer.id)"
              class="px-3 py-2 rounded-lg border transition-all"
              :class="
                isFavorite(freelancer.id)
                  ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-300'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              "
            >
              <Star
                class="w-4 h-4"
                :class="
                  isFavorite(freelancer.id)
                    ? 'fill-yellow-400 text-yellow-400'
                    : ''
                "
              />
            </button>
            <button
              type="button"
              @click="selectedFreelancer = freelancer"
              class="px-4 py-2 bg-[#2D5BFF] text-white rounded-lg hover:bg-[#2D5BFF]/90 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Send class="w-4 h-4" />
              제안하기
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Access Restricted UI -->
    <div
      v-else
      class="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm"
    >
      <div
        class="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6"
      >
        <Lock class="w-10 h-10 text-slate-400" />
      </div>
      <h2 class="text-2xl font-bold mb-2 text-white">
        프로 플랜 이상 전용 서비스입니다
      </h2>
      <p class="text-slate-400 mb-8 max-w-md mx-auto">
        AI 기반 맞춤형 프리랜서 추천 기능은 프로 플랜 이상 구독 시 이용하실 수
        있습니다. 지금 바로 업그레이드하고 최적의 인재를 만나보세요.
      </p>
      <button
        @click="goToUpgrade"
        class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 group"
      >
        <Crown class="w-5 h-5 group-hover:text-yellow-300 transition-colors" />
        구독 플랜 업그레이드하기
      </button>
    </div>

    <ProposalModal
      v-if="selectedFreelancer"
      :freelancer="selectedFreelancer"
      @close="selectedFreelancer = null"
    />
  </div>
</template>
