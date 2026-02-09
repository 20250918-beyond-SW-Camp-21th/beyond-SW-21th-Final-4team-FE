<script setup lang="ts">
import { ref, computed } from 'vue';
import {
    FileText,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    TrendingUp,
    Eye,
    Sparkles,
    Search,
    ChevronDown,
    PenTool,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useContractStore, type ContractWithDetails } from '@/stores/contractStore';
import ContractDetailModal from '@/views/employer/Contracts/components/ContractDetailModal.vue';
import SignaturePadModal from '@/views/employer/Contracts/components/SignaturePadModal.vue';

const authStore = useAuthStore();
const contractStore = useContractStore();

const selectedContract = ref<ContractWithDetails | null>(null);
const signingContractId = ref<number | null>(null);

// Search and filter state
const searchQuery = ref('');
const selectedStatus = ref<string>('ALL');
const sortOption = ref<string>('most_recent');
const isDropdownOpen = ref(false);

const sortOptions = [
    { value: 'most_recent', label: '최신순' },
    { value: 'oldest', label: '오래된순' },
    { value: 'most_expensive', label: '금액 높은순' },
    { value: 'least_expensive', label: '금액 낮은순' },
];

const statusFilters = [
    { value: 'ALL', label: '전체' },
    { value: 'WAITING_SIGNATURE', label: '서명 대기' },
    { value: 'IN_PROGRESS', label: '진행 중' },
    { value: 'COMPLETED', label: '완료' },
];

const myContracts = computed(() => {
    if (!authStore.user) return [];
    // Filter contracts where user is freelancer
    return contractStore.contractsWithDetails.filter((c) => c.freelancerId === Number(authStore.user!.id));
});

const filteredAndSortedContracts = computed(() => {
    let result = [...myContracts.value];

    // Filter by search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        result = result.filter(
            (c) =>
                c.projectName.toLowerCase().includes(query) ||
                c.employerName.toLowerCase().includes(query)
        );
    }

    // Filter by status
    if (selectedStatus.value !== 'ALL') {
        result = result.filter((c) => c.status === selectedStatus.value);
    }

    // Sort
    switch (sortOption.value) {
        case 'most_recent':
            result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
            break;
        case 'oldest':
            result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
            break;
        case 'most_expensive':
            result.sort((a, b) => b.budget - a.budget);
            break;
        case 'least_expensive':
            result.sort((a, b) => a.budget - b.budget);
            break;
    }

    return result;
});

const statusConfig: Record<
    string,
    { label: string; bgColor: string; icon: typeof CheckCircle | typeof Clock }
> = {
    DRAFT: {
        label: '작성 중',
        bgColor: 'bg-gray-500',
        icon: PenTool,
    },
    WAITING_SIGNATURE: {
        label: '서명 대기',
        bgColor: 'bg-orange-500',
        icon: Clock,
    },
    IN_PROGRESS: {
        label: '진행 중',
        bgColor: 'bg-blue-500',
        icon: TrendingUp,
    },
    COMPLETED: {
        label: '완료',
        bgColor: 'bg-green-500',
        icon: CheckCircle,
    },
};

// Calculate progress based on contract status (Mock logic matching Employer view)
const calculateProgress = (contract: ContractWithDetails) => {
    switch (contract.status) {
        case 'WAITING_SIGNATURE': return 10;
        case 'IN_PROGRESS': return 50;
        case 'COMPLETED': return 100;
        default: return 0;
    }
};

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR');
};

const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + '원';
};

const selectSortOption = (value: string) => {
    sortOption.value = value;
    isDropdownOpen.value = false;
};

const currentSortLabel = computed(() => {
    return sortOptions.find((o) => o.value === sortOption.value)?.label || '정렬';
});

const handleFreelancerSign = (signatureDataUrl: string) => {
    if (!signingContractId.value) return;
    contractStore.updateContract(signingContractId.value, {
        freelancerSignature: signatureDataUrl,
        freelancerSignedDate: new Date(),
        status: 'IN_PROGRESS', // Mock transition
        signedDate: new Date(),
    });
    signingContractId.value = null;
    selectedContract.value = null; // Close detail modal if open
};

const openSignModal = (contract: ContractWithDetails) => {
    signingContractId.value = contract.id;
};
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 text-white font-sans">
    <!-- Header -->
    <div
      class="mb-12"
      data-tour="freelancer-contracts-header"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
    >
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
            <p class="text-white/60">진행 중인 계약서를 관리하세요</p>
        </div>

        <!-- Search, Sort, and Filter -->
        <div
            class="mb-8 space-y-4 relative z-20"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
        >
            <!-- Search Bar and Sort Dropdown -->
            <div class="flex flex-col sm:flex-row gap-4">
                <!-- Search Bar -->
                <div class="relative flex-1">
                    <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="프로젝트명 또는 고용주 이름으로 검색..."
                        class="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-blue-500/50 focus:outline-none transition-colors"
                    />
                </div>

                <!-- Sort Dropdown -->
                <div class="relative">
                    <button
                        @click="isDropdownOpen = !isDropdownOpen"
                        class="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors min-w-[160px] justify-between"
                    >
                        <span>{{ currentSortLabel }}</span>
                        <ChevronDown
                            class="w-4 h-4 transition-transform"
                            :class="{ 'rotate-180': isDropdownOpen }"
                        />
                    </button>
                    <div
                        v-if="isDropdownOpen"
                        class="absolute top-full mt-2 right-0 w-full bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-xl"
                    >
                        <button
                            v-for="option in sortOptions"
                            :key="option.value"
                            @click="selectSortOption(option.value)"
                            class="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors"
                            :class="{ 'bg-white/5': sortOption === option.value }"
                        >
                            {{ option.label }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Status Filter Chips -->
            <div class="flex flex-wrap gap-2">
                <button
                    v-for="filter in statusFilters"
                    :key="filter.value"
                    @click="selectedStatus = filter.value"
                    class="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    :class="
                        selectedStatus === filter.value
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    "
                >
                    {{ filter.label }}
                </button>
            </div>
        </div>

        <!-- Results Count -->
        <div class="mb-6 text-white/60 text-sm">
            {{ filteredAndSortedContracts.length }}개의 계약서
        </div>

        <!-- Empty State -->
        <div
            v-if="filteredAndSortedContracts.length === 0"
            class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 text-center"
            v-motion
            :initial="{ opacity: 0, scale: 0.95 }"
            :enter="{ opacity: 1, scale: 1 }"
        >
            <div
                class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6"
                v-motion
                :initial="{ scale: 0 }"
                :enter="{ scale: 1, transition: { type: 'spring', delay: 0.2 } }"
            >
                <FileText class="w-10 h-10 text-white/60" />
            </div>
            <h3 class="text-2xl font-semibold mb-3">
                {{ searchQuery || selectedStatus !== 'ALL' ? '검색 결과가 없습니다' : '계약이 없습니다' }}
            </h3>
            <p class="text-white/60">
                {{ searchQuery || selectedStatus !== 'ALL' ? '다른 검색어나 필터를 시도해보세요' : '새로운 프로젝트를 찾아서 계약을 진행해보세요' }}
            </p>
        </div>

        <!-- Contract List -->
        <div v-else class="space-y-6">
            <div
                v-for="(contract, index) in filteredAndSortedContracts"
                :key="contract.id"
                class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:border-white/20 transition-all"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }"
                :hover="{ y: -4 }"
            >
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex items-center gap-3 mb-3 flex-wrap">
                        <h2 class="text-3xl font-bold">{{ contract.projectName }}</h2>
                        <div
                            v-if="statusConfig[contract.status]"
                            :class="`px-4 py-2 rounded-full ${statusConfig[contract.status].bgColor} text-white text-sm font-medium shadow-lg flex items-center gap-2`"
                        >
                            <component
                                :is="statusConfig[contract.status].icon"
                                class="w-4 h-4"
                            />
                            {{ statusConfig[contract.status].label }}
                        </div>
                    </div>
                    <div class="text-white/60 flex items-center gap-2">
                        <Sparkles class="w-4 h-4" />
                        고용주: {{ contract.employerName }}
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-white/60 font-medium">전체 진행률</span>
                        <span class="text-3xl font-bold"
                            >{{ calculateProgress(contract) }}%</span
                        >
                    </div>
                    <div
                        class="h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl"
                    >
                        <div
                            class="h-full bg-blue-500 rounded-full shadow-lg transition-all duration-1000 ease-out"
                            :style="{ width: `${calculateProgress(contract)}%` }"
                        ></div>
                    </div>
                </div>

                <!-- Footer -->
                <div
                    class="flex flex-col lg:flex-row items-start lg:items-center justify-between pt-8 border-t border-white/10 gap-4"
                >
                    <div class="flex flex-wrap gap-6 text-white/60">
                        <div class="flex items-center gap-2">
                            <Calendar class="w-4 h-4" />
                            <span class="text-sm">
                                {{ formatDate(contract.startDate) }} ~
                                {{ formatDate(contract.endDate) }}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <DollarSign class="w-4 h-4" />
                            <span class="text-sm font-medium"
                                >총 {{ formatCurrency(contract.budget) }}</span
                            >
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                         <button
                            v-if="contract.status === 'WAITING_SIGNATURE' && !contract.freelancerSignature"
                            @click="openSignModal(contract)"
                            class="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            <PenTool class="w-4 h-4" />
                            서명하기
                        </button>
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
        </div>

        <!-- Contract Detail Modal -->
        <ContractDetailModal
            v-if="selectedContract"
            :contract="selectedContract"
            :isFreelancer="true"
            @close="selectedContract = null"
            @sign="openSignModal(selectedContract!)"
        />

        <!-- Freelancer Signature Modal -->
        <SignaturePadModal
            v-if="signingContractId && authStore.user"
            :signerName="authStore.user.name"
            @sign="handleFreelancerSign"
            @close="signingContractId = null"
        />
    </div>
</template>