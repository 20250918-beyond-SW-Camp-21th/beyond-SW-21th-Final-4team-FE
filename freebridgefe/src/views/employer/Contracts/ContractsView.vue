<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
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
    FilePlus,
    Search,
    ChevronDown,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useContractStore } from '@/stores/contractStore';
import type { ContractDocument } from '@/types/contract';
import ContractDetailModal from './components/ContractDetailModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const contractStore = useContractStore();

const selectedContract = ref<ContractDocument | null>(null);

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
    { value: 'DRAFT', label: '서명 대기' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'TERMINATED', label: 'Terminated' },
];

const myContracts = computed(() => {
    if (!authStore.user) return [];
    return contractStore.contracts.filter((c) => c.employerId === authStore.user!.id);
});

const filteredAndSortedContracts = computed(() => {
    let result = [...myContracts.value];

    // Filter by search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        result = result.filter(
            (c) =>
                c.projectName.toLowerCase().includes(query) ||
                c.freelancerName.toLowerCase().includes(query)
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

const calculateDday = (endDate: Date | string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const statusConfig: Record<
    string,
    { label: string; gradient: string; icon: typeof CheckCircle }
> = {
    DRAFT: {
        label: '서명 대기',
        gradient: 'from-orange-500 to-yellow-500',
        icon: Clock,
    },
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

const calculateProgress = (contract: ContractDocument) => {
    if (contract.milestones.length === 0) return 0;
    const completed = contract.milestones.filter((m) => m.status === 'COMPLETED').length;
    return Math.round((completed / contract.milestones.length) * 100);
};

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR');
};

const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + '원';
};

const navigateToCreateContract = () => {
    router.push('/employer/contracts/create');
};

const selectSortOption = (value: string) => {
    sortOption.value = value;
    isDropdownOpen.value = false;
};

const currentSortLabel = computed(() => {
    return sortOptions.find((o) => o.value === sortOption.value)?.label || '정렬';
});
</script>

<template>
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 text-white">
        <!-- Header -->
        <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }" class="mb-8">
            <div class="flex items-center justify-between flex-wrap gap-4 mb-3">
                <div class="flex items-center gap-3">
                    <FileText class="w-10 h-10 text-white" />
                    <h1
                        class="text-4xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent"
                    >
                        Active Contracts
                    </h1>
                </div>
                <button
                    @click="navigateToCreateContract"
                    class="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg"
                    v-motion
                    :hover="{ scale: 1.05 }"
                    :tap="{ scale: 0.95 }"
                >
                    <FilePlus class="w-5 h-5" />
                    계약서 작성
                </button>
            </div>
            <p class="text-white/60">프리랜서와의 계약을 확인하세요</p>
        </div>

        <!-- Search, Sort, and Filter -->
        <div
            class="mb-8 space-y-4"
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
                        placeholder="프로젝트명 또는 프리랜서 이름으로 검색..."
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
                        class="absolute top-full mt-2 right-0 w-full bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-20"
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
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
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
                {{ searchQuery || selectedStatus !== 'ALL' ? '다른 검색어나 필터를 시도해보세요' : '새로운 프로젝트를 시작해보세요' }}
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
                <div
                    class="flex flex-col lg:flex-row items-start justify-between mb-8 gap-6"
                >
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-3 flex-wrap">
                            <h2 class="text-3xl font-bold">{{ contract.projectName }}</h2>
                            <div
                                v-if="statusConfig[contract.status]"
                                :class="`px-4 py-2 rounded-full bg-gradient-to-r ${statusConfig[contract.status].gradient} text-white text-sm font-medium shadow-lg flex items-center gap-2`"
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
                            담당자: {{ contract.freelancerName }}
                        </div>
                    </div>

                    <!-- D-day -->
                    <div
                        class="text-center px-8 py-4 rounded-2xl border-2 transition-transform hover:scale-105"
                        :class="{
                            'bg-red-500/20 border-red-500/50':
                                calculateDday(contract.endDate) <= 7,
                            'bg-orange-500/20 border-orange-500/50':
                                calculateDday(contract.endDate) > 7 &&
                                calculateDday(contract.endDate) <= 30,
                            'bg-blue-500/20 border-blue-500/50':
                                calculateDday(contract.endDate) > 30,
                        }"
                    >
                        <div
                            class="text-xs mb-2 font-medium"
                            :class="{
                                'text-red-400': calculateDday(contract.endDate) <= 7,
                                'text-orange-400':
                                    calculateDday(contract.endDate) > 7 &&
                                    calculateDday(contract.endDate) <= 30,
                                'text-blue-400': calculateDday(contract.endDate) > 30,
                            }"
                        >
                            D-Day
                        </div>
                        <div
                            class="text-4xl font-bold"
                            :class="{
                                'text-red-400': calculateDday(contract.endDate) <= 7,
                                'text-orange-400':
                                    calculateDday(contract.endDate) > 7 &&
                                    calculateDday(contract.endDate) <= 30,
                                'text-blue-400': calculateDday(contract.endDate) > 30,
                            }"
                        >
                            {{
                                calculateDday(contract.endDate) > 0
                                    ? `-${calculateDday(contract.endDate)}`
                                    : calculateDday(contract.endDate) === 0
                                      ? 'Today'
                                      : `+${Math.abs(calculateDday(contract.endDate))}`
                            }}
                        </div>
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
                            class="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full shadow-lg transition-all duration-1000 ease-out"
                            :style="{ width: `${calculateProgress(contract)}%` }"
                        ></div>
                    </div>
                </div>

                <!-- Milestones -->
                <div v-if="contract.milestones.length > 0" class="mb-8">
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
                                'bg-green-500/20 border-green-500/50':
                                    milestone.status === 'COMPLETED',
                                'bg-blue-500/20 border-blue-500/50':
                                    milestone.status === 'IN_PROGRESS',
                                'bg-white/5 border-white/10':
                                    milestone.status === 'PENDING',
                            }"
                            v-motion
                            :initial="{ opacity: 0, scale: 0.9 }"
                            :enter="{
                                opacity: 1,
                                scale: 1,
                                transition: { delay: 0.3 + idx * 0.05 },
                            }"
                        >
                            <div class="flex items-start gap-3 mb-3">
                                <CheckCircle
                                    v-if="milestone.status === 'COMPLETED'"
                                    class="w-5 h-5 text-green-400 flex-shrink-0"
                                />
                                <Clock
                                    v-else-if="milestone.status === 'IN_PROGRESS'"
                                    class="w-5 h-5 text-blue-400 flex-shrink-0 animate-pulse"
                                />
                                <AlertCircle
                                    v-else
                                    class="w-5 h-5 text-white/40 flex-shrink-0"
                                />

                                <div class="flex-1 min-w-0">
                                    <div class="font-medium truncate">
                                        {{ milestone.name }}
                                    </div>
                                    <div class="text-sm text-white/60 mt-1">
                                        {{ formatCurrency(milestone.amount) }}
                                    </div>
                                </div>
                            </div>
                        </div>
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

        <!-- Contract Detail Modal -->
        <ContractDetailModal
            v-if="selectedContract"
            :contract="selectedContract"
            @close="selectedContract = null"
        />
    </div>
</template>