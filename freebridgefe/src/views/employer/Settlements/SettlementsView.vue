<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    Receipt,
    Calendar,
    Clock,
    CheckCircle,
    Send,
    DollarSign,
    Eye,
    Download,
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CreditCard,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useContractStore, type EmployerSettlementWithDetails } from '@/stores/contractStore';
import SettlementDetailModal from './components/SettlementDetailModal.vue';
import { useNow } from '@vueuse/core';

const now = useNow();
const router = useRouter();

const authStore = useAuthStore();
const contractStore = useContractStore();

const selectedSettlement = ref<EmployerSettlementWithDetails | null>(null);
const selectedStatus = ref<string>('ALL');
const isDropdownOpen = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;
const searchQuery = ref('');
const selectedDateRange = ref('ALL');

const dateRangeOptions = [
    { value: 'ALL', label: '전체 기간' },
    { value: 'THIS_MONTH', label: '이번 달' },
    { value: 'LAST_MONTH', label: '지난 달' },
    { value: 'LAST_3_MONTHS', label: '최근 3개월' },
];

const statusFilters = [
    { value: 'ALL', label: '전체' },
    { value: 'ISSUED', label: '청구됨' },
    { value: 'PAID', label: '결제 완료' },
    { value: 'DISBURSED', label: '지급 완료' },
    { value: 'CANCELLED', label: '취소됨' },
];

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle }> = {
    ISSUED: { label: '청구됨', icon: Clock },
    PAID: { label: '결제 완료', icon: CheckCircle },
    DISBURSED: { label: '지급 완료', icon: Send },
    CANCELLED: { label: '취소됨', icon: AlertCircle },
};

// Filter settlements by current employer
const mySettlements = computed(() => {
    if (!authStore.user) return [];
    return contractStore.employerSettlementsWithDetails.filter(
        (s) => s.employerId === Number(authStore.user!.id)
    );
});

// Get next upcoming settlement (first ISSUED settlement by due date)
const nextSettlement = computed(() => {
    if (!mySettlements.value || mySettlements.value.length === 0) return null;
    const issuedSettlements = mySettlements.value
        .filter((s) => s.status === 'ISSUED')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return issuedSettlements[0] || null;
});

// Filter by status, search query, and date range
const filteredSettlements = computed(() => {
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
                s.freelancerName.toLowerCase().includes(query)
        );
    }

    // Date Range Filter
    const today = new Date();
    if (selectedDateRange.value === 'THIS_MONTH') {
        result = result.filter((s) => {
            const d = new Date(s.dueDate);
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        });
    } else if (selectedDateRange.value === 'LAST_MONTH') {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        result = result.filter((s) => {
            const d = new Date(s.dueDate);
            return (
                d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear()
            );
        });
    } else if (selectedDateRange.value === 'LAST_3_MONTHS') {
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        result = result.filter((s) => new Date(s.dueDate) >= threeMonthsAgo);
    }

    // Sort by due date ascending (upcoming payments first)
    result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return result;
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredSettlements.value.length / itemsPerPage));

const paginatedSettlements = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredSettlements.value.slice(start, end);
});

// Status counts
const statusCounts = computed(() => ({
    ISSUED: mySettlements.value.filter((s) => s.status === 'ISSUED').length,
    PAID: mySettlements.value.filter((s) => s.status === 'PAID').length,
    DISBURSED: mySettlements.value.filter((s) => s.status === 'DISBURSED').length,
    CANCELLED: mySettlements.value.filter((s) => s.status === 'CANCELLED').length,
}));

// Total amounts
const totalPending = computed(() =>
    mySettlements.value
        .filter((s) => s.status === 'ISSUED')
        .reduce((sum, s) => sum + s.billingAmount, 0)
);

const totalPaid = computed(() =>
    contractStore.employerSettlementSummary?.totalPaidAmount ??
    mySettlements.value
        .filter((s) => s.status === 'PAID' || s.status === 'DISBURSED')
        .reduce((sum, s) => sum + s.billingAmount, 0)
);

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR');
};

const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + '원';
};

const selectStatusFilter = (value: string) => {
    selectedStatus.value = value;
    isDropdownOpen.value = false;
    currentPage.value = 1;
};

const currentStatusLabel = computed(() => {
    return statusFilters.find((f) => f.value === selectedStatus.value)?.label || '전체';
});

watch(searchQuery, () => {
    currentPage.value = 1;
});

watch(selectedDateRange, () => {
    currentPage.value = 1;
});

const triggerPdfDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const handleDownload = (settlement: EmployerSettlementWithDetails) => {
    if (!settlement.invoicePdfUrl) {
        alert('다운로드 가능한 청구서가 없습니다.');
        return;
    }
    triggerPdfDownload(settlement.invoicePdfUrl, `invoice-${settlement.id}.pdf`);
};

const downloadSettlementList = () => {
    const downloadable = filteredSettlements.value.filter((s) => !!s.invoicePdfUrl);
    if (downloadable.length === 0) {
        alert('다운로드 가능한 청구서가 없습니다.');
        return;
    }

    downloadable.forEach((settlement) => {
        if (!settlement.invoicePdfUrl) return;
        triggerPdfDownload(settlement.invoicePdfUrl, `invoice-${settlement.id}.pdf`);
    });
};

const goToPaymentPage = () => {
    router.push({ name: 'employer.payments' });
};

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const resetFilters = () => {
    searchQuery.value = '';
    selectedStatus.value = 'ALL';
    selectedDateRange.value = 'ALL';
    isDropdownOpen.value = false;
    currentPage.value = 1;
};

onMounted(async () => {
    try {
        await Promise.all([
            contractStore.fetchContracts(),
            contractStore.fetchEmployerSettlements(),
            contractStore.fetchEmployerSettlementSummary().catch(() => undefined),
            contractStore.fetchEmployerNextSettlement().catch(() => undefined),
        ]);
    } catch {
        // Initial load failures surface via UI that depends on store data.
    }
});
</script>

<template>
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 text-white">
        <!-- Header -->
        <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }" class="mb-8">
            <div class="flex items-center justify-between flex-wrap gap-3 mb-3">
                <div class="flex items-center gap-3">
                    <Receipt class="w-10 h-10 text-white" />
                    <h1 class="text-4xl font-bold text-white">정산 관리</h1>
                </div>
                <button
                    @click="goToPaymentPage"
                    class="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-semibold flex items-center gap-2 transition-colors"
                >
                    <CreditCard class="w-4 h-4" />
                    결제 페이지 이동
                </button>
            </div>
            <p class="text-white/60">프리랜서 정산 내역을 확인하고 관리하세요</p>
        </div>

        <!-- Next Settlement Card -->
        <div
            class="mb-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
        >
            <div
                v-if="nextSettlement"
                class="relative overflow-hidden bg-[#1e293b]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl"
            >
                <div class="relative z-10">
                    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div>
                            <div class="flex items-center gap-2 text-blue-400 mb-2 font-medium">
                                <AlertCircle class="w-4 h-4" />
                                다음 정산 예정
                            </div>
                            <div class="text-3xl font-bold text-white mb-2">
                                {{ nextSettlement.projectName }}
                            </div>
                            <div class="text-white/60 mb-4">
                                {{ nextSettlement.freelancerName }} · {{ nextSettlement.installmentNumber }}차 청구
                            </div>
                            <div class="flex items-center gap-6">
                                <div>
                                    <div class="text-sm text-white/40 mb-1">청구 금액</div>
                                    <div class="text-2xl font-bold text-white">
                                        {{ formatCurrency(nextSettlement.billingAmount) }}
                                    </div>
                                </div>
                                <div>
                                    <div class="text-sm text-white/40 mb-1">결제일</div>
                                    <div class="text-lg font-medium text-white">
                                        {{ formatDate(nextSettlement.dueDate) }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col items-center gap-4">
                            <div class="px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-medium">
                                결제 대기
                            </div>
                            <button
                                @click="goToPaymentPage"
                                class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                                v-motion
                                :hover="{ scale: 1.02 }"
                                :tap="{ scale: 0.98 }"
                            >
                                <CreditCard class="w-5 h-5" />
                                결제하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- No upcoming settlements -->
            <div
                v-else
                class="bg-[#1e293b]/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center"
            >
                <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle class="w-8 h-8 text-green-400" />
                </div>
                <h3 class="text-xl font-semibold mb-2">예정된 정산이 없습니다</h3>
                <p class="text-white/60">모든 청구서가 처리되었습니다</p>
            </div>
        </div>

        <!-- Summary Stats -->
        <div
            class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
        >
            <div class="bg-[#1e293b]/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
                <div class="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <DollarSign class="w-4 h-4" />
                    미결제 금액
                </div>
                <div class="text-2xl font-bold text-white">{{ formatCurrency(totalPending) }}</div>
            </div>
            <div class="bg-[#1e293b]/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
                <div class="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <CheckCircle class="w-4 h-4" />
                    결제 완료
                </div>
                <div class="text-2xl font-bold text-white">{{ formatCurrency(totalPaid) }}</div>
            </div>
            <div class="bg-[#1e293b]/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
                <div class="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <Clock class="w-4 h-4" />
                    청구 대기
                </div>
                <div class="text-2xl font-bold text-white">{{ statusCounts.ISSUED }}건</div>
            </div>
            <div class="bg-[#1e293b]/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
                <div class="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <Send class="w-4 h-4" />
                    지급 완료
                </div>
                <div class="text-2xl font-bold text-white">{{ statusCounts.DISBURSED }}건</div>
            </div>
        </div>

        <!-- Filters & Search -->
        <div
            class="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-20"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
        >
            <div class="flex items-center gap-4 w-full md:w-auto">
                <!-- Search Bar -->
                <div class="relative flex-1 md:flex-initial">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="프로젝트 또는 프리랜서 검색"
                        class="w-full md:w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <!-- Date Range Filter -->
                <div class="flex bg-white/5 p-1 rounded-xl border border-white/10">
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

                <button
                    type="button"
                    @click="resetFilters"
                    class="px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors"
                >
                    초기화
                </button>
            </div>

            <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div class="text-white/60 text-sm">
                    {{ filteredSettlements.length }}개의 정산 내역
                </div>

                <button
                    type="button"
                    @click="downloadSettlementList"
                    class="px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <Download class="w-4 h-4" />
                    다운로드
                </button>

                <!-- Status Dropdown -->
                <div class="relative z-30">
                    <button
                        @click="isDropdownOpen = !isDropdownOpen"
                        class="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors min-w-[140px] justify-between"
                    >
                        <span>{{ currentStatusLabel }}</span>
                        <ChevronDown
                            class="w-4 h-4 transition-transform"
                            :class="{ 'rotate-180': isDropdownOpen }"
                        />
                    </button>
                    <div
                        v-if="isDropdownOpen"
                        class="absolute top-full mt-2 right-0 w-full bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
                    >
                        <button
                            v-for="filter in statusFilters"
                            :key="filter.value"
                            @click="selectStatusFilter(filter.value)"
                            class="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors"
                            :class="{ 'bg-white/5': selectedStatus === filter.value }"
                        >
                            {{ filter.label }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Settlement List -->
        <div
            v-if="paginatedSettlements.length === 0"
            class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 text-center"
            v-motion
            :initial="{ opacity: 0, scale: 0.95 }"
            :enter="{ opacity: 1, scale: 1 }"
        >
            <div class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Receipt class="w-10 h-10 text-white/60" />
            </div>
            <h3 class="text-2xl font-semibold mb-3">정산 내역이 없습니다</h3>
            <p class="text-white/60">선택한 필터에 해당하는 정산 내역이 없습니다</p>
        </div>

        <div v-else class="space-y-4 relative z-10">
            <div
                v-for="(settlement, index) in paginatedSettlements"
                :key="settlement.id"
                class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 + index * 0.05 } }"
            >
                <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <!-- Left: Info -->
                    <div class="flex items-center gap-4 flex-1">
                        <div
                            class="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10"
                        >
                            <component
                                :is="statusConfig[settlement.status].icon"
                                class="w-6 h-6 text-white/60"
                            />
                        </div>
                        <div>
                            <div class="font-bold text-white mb-1">
                                {{ settlement.projectName }}
                            </div>
                            <div class="text-sm text-white/60">
                                {{ settlement.freelancerName }} · {{ settlement.installmentNumber }}차 청구
                            </div>
                        </div>
                    </div>

                    <!-- Center: Amount -->
                    <div class="text-center lg:text-right">
                        <div class="text-sm text-white/40 mb-1">
                            {{ settlement.status === 'ISSUED' ? '청구 금액' : '결제 금액' }}
                        </div>
                        <div class="text-xl font-bold text-white">
                            {{ formatCurrency(settlement.billingAmount) }}
                        </div>
                    </div>

                    <!-- Right: Status & Actions -->
                    <div class="flex items-center gap-3">
                        <!-- Status Badge -->
                        <div
                            v-if="settlement.status === 'ISSUED'"
                            class="px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 flex items-center gap-2"
                        >
                            결제 대기
                            <span
                                v-if="new Date(settlement.dueDate) < now"
                                class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30"
                            >
                                연체
                            </span>
                        </div>
                        <div
                            v-else-if="settlement.status === 'PAID'"
                            class="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/20 border border-blue-500/30 text-blue-400"
                        >
                            결제 완료
                        </div>
                        <div
                            v-else-if="settlement.status === 'DISBURSED'"
                            class="px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/20 border border-green-500/30 text-green-400"
                        >
                            지급 완료
                        </div>
                        <div
                            v-else
                            class="px-3 py-1.5 rounded-full text-sm font-medium bg-rose-500/20 border border-rose-500/30 text-rose-400"
                        >
                            취소됨
                        </div>

                        <!-- Pay Button (only for ISSUED) -->
                        <button
                            v-if="settlement.status === 'ISSUED'"
                            @click="goToPaymentPage"
                            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            <CreditCard class="w-4 h-4" />
                            결제
                        </button>

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
        </div>

        <!-- Pagination -->
        <div
            v-if="totalPages > 1"
            class="mt-8 flex items-center justify-center gap-2"
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { delay: 0.5 } }"
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

        <!-- Settlement Detail Modal -->
        <SettlementDetailModal
            v-if="selectedSettlement"
            :settlement="selectedSettlement"
            @close="selectedSettlement = null"
            @download="handleDownload"
        />

    </div>
</template>
