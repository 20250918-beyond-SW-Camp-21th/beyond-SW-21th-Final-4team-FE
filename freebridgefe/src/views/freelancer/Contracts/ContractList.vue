<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  Sparkles,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useContractStore } from '@/stores/contractStore';
import type { ContractDocument } from '@/types/contract';
import ContractDetailModal from '@/views/employer/Contracts/components/ContractDetailModal.vue';

const authStore = useAuthStore();
const contractStore = useContractStore();

const selectedContract = ref<ContractDocument | null>(null);
const activeTab = ref<'ACTIVE' | 'COMPLETED'>('ACTIVE');

const isFreelancer = computed(() => authStore.user?.role === 'FREELANCER');

const myContracts = computed(() => {
  if (!authStore.user) return [];
  return contractStore.contracts.filter((c) =>
    isFreelancer.value ? c.freelancerId === authStore.user!.id : c.employerId === authStore.user!.id
  );
});

const activeContracts = computed(() =>
  myContracts.value.filter((c) => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS')
);

const completedContracts = computed(() =>
  myContracts.value.filter((c) => c.status === 'COMPLETED')
);

const currentList = computed(() =>
  activeTab.value === 'ACTIVE' ? activeContracts.value : completedContracts.value
);

const calculateDday = (endDate: Date | string) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const calculateProgress = (contract: ContractDocument) => {
  const completed = contract.milestones.filter((m) => m.status === 'COMPLETED').length;
  return Math.round((completed / contract.milestones.length) * 100);
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('ko-KR');
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString() + '원';
};

const statusConfig = {
  ACTIVE: {
    label: 'Active',
    gradient: 'from-green-500 to-emerald-500',
    icon: CheckCircle,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    gradient: 'from-blue-500 to-cyan-500',
    icon: TrendingUp,
  },
  COMPLETED: {
    label: 'Completed',
    gradient: 'from-gray-500 to-gray-600',
    icon: CheckCircle,
  },
  TERMINATED: {
    label: 'Terminated',
    gradient: 'from-red-500 to-red-600',
    icon: AlertCircle,
  },
};

const stats = computed(() => [
  {
    id: 'ACTIVE',
    icon: TrendingUp,
    label: '진행 중인 계약',
    value: activeContracts.value.length,
    gradient: 'from-blue-500 to-cyan-500',
    onClick: () => (activeTab.value = 'ACTIVE'),
  },
  {
    id: 'COMPLETED',
    icon: CheckCircle,
    label: '완료된 계약',
    value: completedContracts.value.length,
    gradient: 'from-green-500 to-emerald-500',
    onClick: () => (activeTab.value = 'COMPLETED'),
  },
  {
    icon: DollarSign,
    label: '누적 계약금',
    value: formatCurrency(myContracts.value.reduce((sum, c) => sum + c.budget, 0)),
    gradient: 'from-purple-500 to-pink-500',
    isAmount: true,
  },
]);
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 text-white font-sans">
    <!-- Header -->
    <div class="mb-12" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }">
      <div class="flex items-center gap-3 mb-3">
        <FileText class="w-10 h-10 text-white" />
        <h1 class="text-4xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          내 계약서
        </h1>
      </div>
      <p class="text-white/60">
        진행 중인 프로젝트 계약을 안전하게 관리하세요
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid md:grid-cols-3 gap-6 mb-12">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        @click="stat.onClick && stat.onClick()"
        class="bg-white/5 backdrop-blur-xl rounded-3xl border p-8 transition-all relative overflow-hidden"
        :class="[
          (stat.id && activeTab === stat.id) ? 'border-white/40 bg-white/10 ring-2 ring-white/20' : 'border-white/10 hover:border-white/20',
          stat.onClick ? 'cursor-pointer' : ''
        ]"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }"
        :hover="{ y: -4 }"
      >
        <div class="flex items-center gap-4 relative z-10">
          <div :class="`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`">
            <component :is="stat.icon" class="w-8 h-8 text-white" />
          </div>
          <div>
            <div class="text-sm text-white/60 mb-1">{{ stat.label }}</div>
            <div :class="`font-bold text-white ${stat.isAmount ? 'text-2xl' : 'text-4xl'}`">
              {{ stat.value }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contract List -->
    <div v-if="currentList.length === 0" class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 text-center">
      <div
        class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6"
        v-motion
        :initial="{ scale: 0 }"
        :enter="{ scale: 1, transition: { type: 'spring', delay: 0.2 } }"
      >
        <FileText class="w-10 h-10 text-white/60" />
      </div>
      <h3 class="text-2xl font-semibold mb-3">
        {{ activeTab === 'ACTIVE' ? '진행 중인 계약이 없습니다' : '완료된 계약이 없습니다' }}
      </h3>
      <p class="text-white/60">
        {{ activeTab === 'ACTIVE' ? '새로운 프로젝트에 지원해보세요' : '프로젝트를 성공적으로 완료해보세요' }}
      </p>
    </div>

    <div v-else class="space-y-8">
      <div
        v-for="(contract, index) in currentList"
        :key="contract.id"
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:border-white/20 transition-all"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }"
        :hover="{ y: -4 }"
      >
        <!-- Contract Header -->
        <div class="flex flex-col lg:flex-row items-start justify-between mb-8 gap-6">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3 flex-wrap">
              <h2 class="text-3xl font-bold">{{ contract.projectName }}</h2>
              <div :class="`px-4 py-2 rounded-full bg-gradient-to-r ${statusConfig[contract.status].gradient} text-white text-sm font-medium shadow-lg flex items-center gap-2`">
                <component :is="statusConfig[contract.status].icon" class="w-4 h-4" />
                {{ statusConfig[contract.status].label }}
              </div>
            </div>
            <div class="text-white/60 flex items-center gap-2">
              <Sparkles class="w-4 h-4" />
              <span>발주자: {{ contract.employerName }}</span>
            </div>
          </div>

          <!-- D-day -->
          <div
            class="text-center px-8 py-4 rounded-2xl border-2 transition-transform hover:scale-105"
            :class="{
              'bg-red-500/20 border-red-500/50': calculateDday(contract.endDate) <= 7,
              'bg-orange-500/20 border-orange-500/50': calculateDday(contract.endDate) > 7 && calculateDday(contract.endDate) <= 30,
              'bg-blue-500/20 border-blue-500/50': calculateDday(contract.endDate) > 30
            }"
          >
            <div
              class="text-xs mb-2 font-medium"
              :class="{
                'text-red-400': calculateDday(contract.endDate) <= 7,
                'text-orange-400': calculateDday(contract.endDate) > 7 && calculateDday(contract.endDate) <= 30,
                'text-blue-400': calculateDday(contract.endDate) > 30
              }"
            >
              종료일까지
            </div>
            <div
              class="text-4xl font-bold"
              :class="{
                'text-red-400': calculateDday(contract.endDate) <= 7,
                'text-orange-400': calculateDday(contract.endDate) > 7 && calculateDday(contract.endDate) <= 30,
                'text-blue-400': calculateDday(contract.endDate) > 30
              }"
            >
              D{{ calculateDday(contract.endDate) >= 0 ? '-' + Math.abs(calculateDday(contract.endDate)) : '+' + Math.abs(calculateDday(contract.endDate)) }}
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <span class="text-white/60 font-medium">전체 진행률</span>
            <span class="text-3xl font-bold">{{ calculateProgress(contract) }}%</span>
          </div>
          <div class="h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl">
            <div
              class="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full shadow-lg transition-all duration-1000 ease-out"
              :style="{ width: `${calculateProgress(contract)}%` }"
            ></div>
          </div>
        </div>

        <!-- Milestones -->
        <div class="mb-8">
          <div class="text-white/60 font-medium mb-4 flex items-center gap-2">
            <Clock class="w-4 h-4" />
            마일스톤
          </div>
          <div class="grid md:grid-cols-3 gap-4">
            <div
              v-for="(milestone, idx) in contract.milestones"
              :key="milestone.id"
              class="p-5 rounded-2xl border-2 transition-all"
              :class="{
                'bg-green-500/20 border-green-500/50': milestone.status === 'COMPLETED',
                'bg-blue-500/20 border-blue-500/50': milestone.status === 'IN_PROGRESS',
                'bg-white/5 border-white/10': milestone.status === 'PENDING'
              }"
              v-motion
              :initial="{ opacity: 0, scale: 0.9 }"
              :enter="{ opacity: 1, scale: 1, transition: { delay: 0.6 + idx * 0.1 } }"
            >
              <div class="flex items-start gap-3 mb-3">
                <CheckCircle v-if="milestone.status === 'COMPLETED'" class="w-5 h-5 text-green-400 flex-shrink-0" />
                <Clock v-else-if="milestone.status === 'IN_PROGRESS'" class="w-5 h-5 text-blue-400 flex-shrink-0 animate-pulse" />
                <AlertCircle v-else class="w-5 h-5 text-white/40 flex-shrink-0" />
                
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">{{ milestone.name }}</div>
                  <div class="text-sm text-white/60 mt-1">
                    {{ formatCurrency(milestone.amount) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between pt-8 border-t border-white/10 gap-4">
          <div class="flex flex-wrap gap-6 text-white/60">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4" />
              <span class="text-sm">
                {{ formatDate(contract.startDate) }} ~ {{ formatDate(contract.endDate) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <DollarSign class="w-4 h-4" />
              <span class="text-sm font-medium">총 {{ formatCurrency(contract.budget) }}</span>
            </div>
          </div>

          <button
            @click="selectedContract = contract"
            class="px-6 py-3 bg-white text-black rounded-full font-semibold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Eye class="w-4 h-4" />
            상세보기
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <ContractDetailModal
      v-if="selectedContract"
      :contract="selectedContract"
      @close="selectedContract = null"
    />
  </div>
</template>
