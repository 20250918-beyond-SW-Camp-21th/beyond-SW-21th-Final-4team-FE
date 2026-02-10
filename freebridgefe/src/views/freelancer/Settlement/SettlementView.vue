<script setup lang="ts">
import { ref, computed } from 'vue';

import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
  AlertCircle,
  Download,
  Zap,
  Wallet,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  CreditCard
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useContractStore, type FreelancerSettlementWithDetails } from '@/stores/contractStore';
import SettlementDetailModal from './components/SettlementDetailModal.vue';
import BankAccountModal from './components/BankAccountModal.vue';

const authStore = useAuthStore();
const contractStore = useContractStore();

const showBankAccountModal = ref(false);
const selectedSettlement = ref<FreelancerSettlementWithDetails | null>(null);

// Filters & Pagination State
const searchQuery = ref('');
const selectedStatus = ref<string>('ALL');
const selectedDateRange = ref('ALL');
const isDropdownOpen = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;

const dateRangeOptions = [
    { value: 'ALL', label: '전체 기간' },
    { value: 'THIS_MONTH', label: '이번 달' },
    { value: 'LAST_MONTH', label: '지난 달' },
    { value: 'LAST_3_MONTHS', label: '최근 3개월' },
];

const statusFilters = [
    { value: 'ALL', label: '전체' },
    { value: 'HOLDING', label: '지급 예정' },
    { value: 'PAID', label: '지급 완료' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; badgeBg: string; icon: any }> = {
    HOLDING: { label: '지급 예정', color: 'text-blue-400', bg: 'bg-white/5 border-white/10', badgeBg: 'bg-blue-500/20 border border-blue-500/30 text-blue-400', icon: Calendar },
    PROCESSING: { label: '지급 예정', color: 'text-blue-400', bg: 'bg-white/5 border-white/10', badgeBg: 'bg-blue-500/20 border border-blue-500/30 text-blue-400', icon: Calendar },
    PAID: { label: '지급 완료', color: 'text-green-400', bg: 'bg-white/5 border-white/10', badgeBg: 'bg-green-500/20 border border-green-500/30 text-green-400', icon: CheckCircle },
};

// Base Data
const mySettlements = computed(() => {
  if (!authStore.user) return [];
  const settlements = contractStore.freelancerSettlementsWithDetails || [];
  // Filter settlements by finding contracts where freelancerId matches current user
  return settlements.filter((settlement) => {
    const contract = contractStore.contracts.find((c) => c.id === settlement.contractId);
    return contract && contract.freelancerId === Number(authStore.user!.id);
  });
});

// Filtered Data
const filteredSettlements = computed(() => {
    if (!mySettlements.value || mySettlements.value.length === 0) return [];
    let result = [...mySettlements.value];

    // Status Filter
    if (selectedStatus.value !== 'ALL') {
        result = result.filter((s) => s.status === selectedStatus.value);
    }

    // Search Filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
            (s) =>
                s.projectName.toLowerCase().includes(query) ||
                s.employerName.toLowerCase().includes(query)
        );
    }

    // Date Range Filter
    const today = new Date();
    if (selectedDateRange.value === 'THIS_MONTH') {
        result = result.filter((s) => {
            const d = new Date(s.expectedPaidDate);
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        });
    } else if (selectedDateRange.value === 'LAST_MONTH') {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        result = result.filter((s) => {
            const d = new Date(s.expectedPaidDate);
            return (
                d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear()
            );
        });
    } else if (selectedDateRange.value === 'LAST_3_MONTHS') {
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        result = result.filter((s) => new Date(s.expectedPaidDate) >= threeMonthsAgo);
    }

    // Sort by expectedPaidDate descending
    result.sort((a, b) => new Date(b.expectedPaidDate).getTime() - new Date(a.expectedPaidDate).getTime());
    return result;
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredSettlements.value.length / itemsPerPage));

const paginatedSettlements = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredSettlements.value.slice(start, end);
});


// 지급 예정 금액 (HOLDING or PROCESSING)
const pendingAmount = computed(() => mySettlements.value
    .filter((s) => s.status === 'HOLDING' || s.status === 'PROCESSING')
    .reduce((sum, s) => sum + s.netAmount, 0));

// 지급 완료 금액 (PAID)
const paidAmount = computed(() => mySettlements.value
    .filter((s) => s.status === 'PAID')
    .reduce((sum, s) => sum + s.netAmount, 0));



const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('ko-KR');
};



const selectStatusFilter = (value: string) => {
    selectedStatus.value = value;
    isDropdownOpen.value = false;
    currentPage.value = 1;
};

const currentStatusLabel = computed(() => {
    return statusFilters.find((f) => f.value === selectedStatus.value)?.label || '전체';
});

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const handleDownload = (settlement: FreelancerSettlementWithDetails) => {
    // Mock download
    alert(`정산 내역서 다운로드: ${settlement.projectName}`);
};

const handleSaveAccount = (account: { bankName: string; accountNumber: string }) => {
    alert(`계좌가 저장되었습니다: ${account.bankName} ${account.accountNumber}`);
};
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 font-sans text-white">
    <!-- Header -->
    <div
      class="mb-12"
      data-tour="freelancer-settlement-header"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
    >
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3">
        <div>
             <h1 class="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                <Wallet class="w-10 h-10 text-white" />
                정산 관리
             </h1>
             <p class="text-white/60">수입 내역과 정산을 손쉽게 관리하세요</p>
        </div>
        <button
            @click="showBankAccountModal = true"
            class="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/10 flex items-center gap-2"
        >
            <CreditCard class="w-5 h-5" />
            계좌 관리
        </button>
      </div>
    </div>

    <!-- Summary Stats Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div
            class="bg-[#1e293b]/50 backdrop-blur-sm rounded-3xl p-8 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all"
            v-motion
            :initial="{ opacity: 0, x: 20 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 200 } }"
        >
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-2 text-white/60 text-lg font-medium">
                    <Calendar class="w-5 h-5 text-blue-400" />
                    지급 예정
                </div>
                <div class="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <TrendingUp class="w-5 h-5" />
                </div>
            </div>
            <div class="text-4xl font-bold text-white mb-1">{{ pendingAmount.toLocaleString() }}<span class="text-xl text-white/40 ml-1">원</span></div>
        </div>

        <div
            class="bg-[#1e293b]/50 backdrop-blur-sm rounded-3xl p-8 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all"
            v-motion
            :initial="{ opacity: 0, x: 20 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 300 } }"
        >
            <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-2 text-white/60 text-lg font-medium">
                        <CheckCircle class="w-5 h-5 text-green-500" />
                    총 지급 완료
                </div>
                <div class="p-2 bg-green-500/10 rounded-lg text-green-500 group-hover:bg-green-500/20 transition-colors">
                    <Award class="w-5 h-5" />
                </div>
            </div>
                <div class="text-4xl font-bold text-white mb-1">{{ paidAmount.toLocaleString() }}<span class="text-xl text-white/40 ml-1">원</span></div>
        </div>
    </div>
    


    <div class="grid lg:grid-cols-3 gap-6">
        <!-- Settlement History -->
        <div
            class="lg:col-span-2 bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
        >
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-xl font-bold text-white flex items-center gap-2">
                    <Clock class="w-5 h-5 text-blue-400" />
                    정산 내역
                </h2>
                <div class="text-white/60 text-sm">
                    {{ filteredSettlements.length }}건의 내역
                </div>
            </div>

            <!-- Filters & Search -->
            <div class="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-4 w-full md:w-auto">
                    <!-- Search Bar -->
                    <div class="relative flex-1 md:flex-initial">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="프로젝트 검색"
                            class="w-full md:w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <!-- Date Range Filter -->
                    <div class="hidden md:flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            v-for="option in dateRangeOptions"
                            :key="option.value"
                            @click="selectedDateRange = option.value"
                            class="px-3 py-1 text-sm rounded-lg transition-colors"
                            :class="
                                selectedDateRange === option.value
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            "
                        >
                            {{ option.label }}
                        </button>
                    </div>
                </div>

                <!-- Status Filter Dropdown -->
                <div class="relative z-30 w-full md:w-auto">
                    <button
                        @click="isDropdownOpen = !isDropdownOpen"
                        class="flex items-center justify-between w-full md:w-auto gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors min-w-[140px]"
                    >
                        <span>{{ currentStatusLabel }}</span>
                        <ChevronDown
                            class="w-4 h-4 transition-transform"
                            :class="{ 'rotate-180': isDropdownOpen }"
                        />
                    </button>
                    <div
                        v-if="isDropdownOpen"
                        class="absolute top-full mt-2 right-0 w-full md:w-48 bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
                    >
                        <button
                            v-for="filter in statusFilters"
                            :key="filter.value"
                            @click="selectStatusFilter(filter.value)"
                            class="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors text-sm"
                            :class="{ 'bg-white/5': selectedStatus === filter.value }"
                        >
                            {{ filter.label }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- List -->
            <div v-if="paginatedSettlements.length === 0" class="text-center py-20">
                <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign class="w-8 h-8 text-white/20" />
                </div>
                <p class="text-white/40">정산 내역이 없습니다</p>
            </div>

            <div v-else class="space-y-3">
                <div
                    v-for="settlement in paginatedSettlements"
                    :key="settlement.id"
                    class="group bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-between"
                >
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 rounded-xl flex items-center justify-center border"
                            :class="statusConfig[settlement.status].bg"
                        >
                             <component :is="statusConfig[settlement.status].icon" class="w-5 h-5" :class="statusConfig[settlement.status].color" />
                        </div>
                        <div>
                            <div class="font-bold text-white mb-1 group-hover:text-blue-200 transition-colors">
                                {{ settlement.projectName }}
                            </div>
                            <div class="text-xs text-white/40">
                                {{ settlement.installmentNumber }}차 정산
                                <span v-if="settlement.paidDate"> · {{ formatDate(settlement.paidDate) }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="text-right">
                             <div class="text-lg font-bold text-white">{{ settlement.netAmount.toLocaleString() }}원</div>
                             <div class="text-xs text-white/40">실 수령액</div>
                        </div>
                        <!-- Status Badge -->
                        <div
                            class="px-3 py-1.5 rounded-full text-sm font-medium"
                            :class="statusConfig[settlement.status].badgeBg"
                        >
                            {{ statusConfig[settlement.status].label }}
                        </div>
                        <button
                            @click="selectedSettlement = settlement"
                            class="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="상세보기"
                        >
                            <Eye class="w-5 h-5 text-white/60" />
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Pagination -->
            <div
                v-if="totalPages > 1"
                class="mt-8 flex items-center justify-center gap-2"
            >
                <button
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft class="w-5 h-5 text-white" />
                </button>

                <template v-for="page in totalPages" :key="page">
                    <button
                        @click="goToPage(page)"
                        class="w-10 h-10 rounded-lg font-medium transition-colors"
                        :class="
                            currentPage === page
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                        "
                    >
                        {{ page }}
                    </button>
                </template>

                <button
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight class="w-5 h-5 text-white" />
                </button>
            </div>
        </div>

        <!-- Right Column Actions -->
        <div class="space-y-6">
            <div
                class="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
                v-motion
                :initial="{ opacity: 0, x: 20 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 600 } }"
            >
                <h2 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Zap class="w-5 h-5 text-yellow-400" />
                    빠른 작업
                </h2>
                <div class="space-y-3">
                    <button class="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl flex items-center gap-3 transition-all text-left group">
                         <div class="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                             <Download class="w-5 h-5" />
                         </div>
                         <div>
                             <div class="font-bold text-white text-sm">내역 다운로드</div>
                             <div class="text-xs text-white/40">PDF/Excel 형식 지원</div>
                         </div>
                    </button>
                    <button class="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl flex items-center gap-3 transition-all text-left group">
                         <div class="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                             <Award class="w-5 h-5" />
                         </div>
                         <div>
                             <div class="font-bold text-white text-sm">세금계산서 발행</div>
                             <div class="text-xs text-white/40">전자세금계산서 신청</div>
                         </div>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <!-- Modals -->
    <BankAccountModal
        v-if="showBankAccountModal"
        @save="handleSaveAccount"
        @close="showBankAccountModal = false"
    />
    <SettlementDetailModal
        v-if="selectedSettlement"
        :settlement="selectedSettlement"
        @close="selectedSettlement = null"
        @download="handleDownload"
    />
  </div>
</template>
