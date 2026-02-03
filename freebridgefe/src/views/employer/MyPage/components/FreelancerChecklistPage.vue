<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
  ArrowLeft,
  Search,
  Star,
  Award,
  CheckCircle,
  Heart,
  User,
  Briefcase,
  MapPin,
  Eye,
  MessageSquare,
} from 'lucide-vue-next';

defineEmits<{
  (e: 'back'): void;
}>();

type ChecklistStatus = 'reviewed' | 'recommended' | 'favorite';

interface FreelancerItem {
  id: string;
  name: string;
  grade: string;
  skills: string[];
  rating: number;
  projects: number;
  location: string;
  status: ChecklistStatus[];
  lastContact: string;
  notes: string;
}

const mockFreelancers: FreelancerItem[] = [
  {
    id: '1',
    name: '김프론트',
    grade: '고급',
    skills: ['React', 'TypeScript', 'Next.js'],
    rating: 4.8,
    projects: 15,
    location: '서울 강남구',
    status: ['reviewed', 'recommended', 'favorite'],
    lastContact: '2024-01-25',
    notes: '커뮤니케이션 우수, 일정 준수율 높음',
  },
  {
    id: '2',
    name: '이백엔드',
    grade: '특급',
    skills: ['Node.js', 'Python', 'AWS'],
    rating: 4.9,
    projects: 28,
    location: '서울 서초구',
    status: ['reviewed', 'recommended'],
    lastContact: '2024-01-23',
    notes: '기술력 뛰어남, 문제 해결 능력 우수',
  },
  {
    id: '3',
    name: '박풀스택',
    grade: '중급',
    skills: ['React', 'Node.js', 'MongoDB'],
    rating: 4.5,
    projects: 8,
    location: '경기 성남시',
    status: ['reviewed', 'favorite'],
    lastContact: '2024-01-20',
    notes: '성실함, 성장 가능성 높음',
  },
];

const searchTerm = ref('');
const statusFilter = ref<ChecklistStatus | 'all'>('all');

const getGradeColor = (grade: string) => {
  switch (grade) {
    case '특급': return 'bg-purple-500';
    case '고급': return 'bg-blue-500';
    case '중급': return 'bg-green-500';
    default: return 'bg-slate-500';
  }
};

const filteredFreelancers = computed(() => {
  return mockFreelancers.filter((freelancer) => {
    const matchesSearch =
      freelancer.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      freelancer.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.value.toLowerCase())
      );

    const matchesStatus =
      statusFilter.value === 'all' ||
      freelancer.status.includes(statusFilter.value);

    return matchesSearch && matchesStatus;
  });
});

const counts = computed(() => ({
  all: mockFreelancers.length,
  reviewed: mockFreelancers.filter((f) => f.status.includes('reviewed')).length,
  recommended: mockFreelancers.filter((f) => f.status.includes('recommended')).length,
  favorite: mockFreelancers.filter((f) => f.status.includes('favorite')).length,
}));
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-8 py-8 text-white">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <button
          @click="$emit('back')"
          class="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ArrowLeft class="w-5 h-5 text-white/60" />
        </button>
        <div>
          <h1 class="text-2xl font-bold">프리랜서 체크리스트</h1>
          <p class="text-sm text-white/40 mt-1">관심있는 프리랜서를 관리하세요</p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div
        v-for="(count, key, index) in counts"
        :key="key"
        class="bg-[#1e293b]/50 rounded-xl border border-white/10 p-6"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-slate-400 text-sm capitalize">
            {{
              key === 'all' ? '전체' :
              key === 'reviewed' ? '검토 완료' :
              key === 'recommended' ? '추천' :
              '즐겨찾기'
            }}
          </span>
          <component
            :is="
              key === 'all' ? User :
              key === 'reviewed' ? CheckCircle :
              key === 'recommended' ? Award :
              Heart
            "
            class="w-5 h-5"
            :class="
              key === 'all' ? 'text-slate-400' :
              key === 'reviewed' ? 'text-green-400' :
              key === 'recommended' ? 'text-blue-400' :
              'text-red-400'
            "
          />
        </div>
        <div class="text-3xl font-bold">{{ count }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="bg-[#1e293b]/50 rounded-2xl border border-white/10 p-6 mb-6"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 0.4 } }"
    >
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="이름 또는 스킬로 검색..."
              v-model="searchTerm"
              class="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div class="flex gap-2 flex-wrap">
          <button
            v-for="status in ['all', 'reviewed', 'recommended', 'favorite']"
            :key="status"
            @click="statusFilter = status as any"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="
              statusFilter === status
                ? status === 'reviewed' ? 'bg-green-500 text-white' :
                  status === 'recommended' ? 'bg-blue-500 text-white' :
                  status === 'favorite' ? 'bg-red-500 text-white' :
                  'bg-blue-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            "
          >
            {{
              status === 'all' ? '전체' :
              status === 'reviewed' ? '검토 완료' :
              status === 'recommended' ? '추천' :
              '즐겨찾기'
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Freelancer List -->
    <div class="space-y-4">
      <div
        v-for="(freelancer, index) in filteredFreelancers"
        :key="freelancer.id"
        class="bg-[#1e293b]/50 rounded-2xl border border-white/10 p-6 hover:bg-[#1e293b]/70 transition-colors"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.5 + index * 0.1 } }"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <User class="w-8 h-8 text-white" />
            </div>
            <div>
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-bold">{{ freelancer.name }}</h3>
                <span :class="`${getGradeColor(freelancer.grade)} text-white text-xs px-3 py-1 rounded-full font-bold`">
                  {{ freelancer.grade }}
                </span>
              </div>
              <div class="flex items-center gap-4 text-sm text-slate-400">
                <span class="flex items-center gap-1">
                  <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {{ freelancer.rating }}
                </span>
                <span class="flex items-center gap-1">
                  <Briefcase class="w-4 h-4" />
                  {{ freelancer.projects }}개 프로젝트
                </span>
                <span class="flex items-center gap-1">
                  <MapPin class="w-4 h-4" />
                  {{ freelancer.location }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <div v-if="freelancer.status.includes('reviewed')" class="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle class="w-4 h-4 text-green-400" />
            </div>
            <div v-if="freelancer.status.includes('recommended')" class="p-2 bg-blue-500/20 rounded-lg">
              <Award class="w-4 h-4 text-blue-400" />
            </div>
            <div v-if="freelancer.status.includes('favorite')" class="p-2 bg-red-500/20 rounded-lg">
              <Heart class="w-4 h-4 text-red-400 fill-red-400" />
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="skill in freelancer.skills"
            :key="skill"
            class="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300"
          >
            {{ skill }}
          </span>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-white/10">
          <div class="flex-1">
            <div class="text-xs text-slate-500 mb-1">메모</div>
            <div class="text-sm text-slate-300">{{ freelancer.notes }}</div>
            <div class="text-xs text-slate-500 mt-2">
              마지막 연락: {{ freelancer.lastContact }}
            </div>
          </div>
          <div class="flex gap-2">
            <button class="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10 flex items-center gap-2">
              <Eye class="w-4 h-4" />
              상세보기
            </button>
            <button class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
              <MessageSquare class="w-4 h-4" />
              연락하기
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredFreelancers.length === 0" class="text-center py-12">
        <User class="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p class="text-slate-400">검색 결과가 없습니다.</p>
      </div>
    </div>
  </div>
</template>
