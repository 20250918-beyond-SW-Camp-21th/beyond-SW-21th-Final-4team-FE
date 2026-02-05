<script setup lang="ts">
import { ref, computed } from 'vue';
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
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import SettlementDetailModal from './components/SettlementDetailModal.vue';

interface EmployerSettlement {
    id: string;
    contractId: string;
    billingAmount: number;
    installmentNumber: number;
    status: 'ISSUED' | 'PAID' | 'DISBURSED';
    invoicePdfUrl: string;
    projectName: string;
    freelancerName: string;
    freelancerId: string;
    employerId: string;
    dueDate: Date | string;
    paidDate?: Date | string;
}

const authStore = useAuthStore();

// Mock data for employer settlements
const allSettlements = ref<EmployerSettlement[]>([
    {
        id: 'es1',
        contractId: 'c1',
        billingAmount: 1500000,
        installmentNumber: 1,
        status: 'DISBURSED',
        invoicePdfUrl: '/invoices/es1.pdf',
        projectName: 'SaaS 대시보드 리뉴얼',
        freelancerName: '김프론트',
        freelancerId: 'f1',
        employerId: 'e1',
        dueDate: new Date('2024-01-31'),
        paidDate: new Date('2024-01-28'),
    },
    {
        id: 'es2',
        contractId: 'c1',
        billingAmount: 2000000,
        installmentNumber: 2,
        status: 'PAID',
        invoicePdfUrl: '/invoices/es2.pdf',
        projectName: 'SaaS 대시보드 리뉴얼',
        freelancerName: '김프론트',
        freelancerId: 'f1',
        employerId: 'e1',
        dueDate: new Date('2024-02-28'),
        paidDate: new Date('2024-02-25'),
    },
    {
        id: 'es3',
        contractId: 'c1',
        billingAmount: 1500000,
        installmentNumber: 3,
        status: 'ISSUED',
        invoicePdfUrl: '/invoices/es3.pdf',
        projectName: 'SaaS 대시보드 리뉴얼',
        freelancerName: '김프론트',
        freelancerId: 'f1',
        employerId: 'e1',
        dueDate: new Date('2024-03-31'),
    },
    {
        id: 'es4',
        contractId: 'c2',
        billingAmount: 3000000,
        installmentNumber: 1,
        status: 'DISBURSED',
        invoicePdfUrl: '/invoices/es4.pdf',
        projectName: 'API 서버 마이그레이션',
        freelancerName: '이백엔드',
        freelancerId: 'f2',
        employerId: 'e1',
        dueDate: new Date('2023-11-30'),
        paidDate: new Date('2023-11-25'),
    },
    {
        id: 'es5',
        contractId: 'c2',
        billingAmount: 2500000,
        installmentNumber: 2,
        status: 'DISBURSED',
        invoicePdfUrl: '/invoices/es5.pdf',
        projectName: 'API 서버 마이그레이션',
        freelancerName: '이백엔드',
        freelancerId: 'f2',
        employerId: 'e1',
        dueDate: new Date('2023-12-15'),
        paidDate: new Date('2023-12-12'),
    },
    {
        id: 'es6',
        contractId: 'c2',
        billingAmount: 2500000,
        installmentNumber: 3,
        status: 'DISBURSED',
        invoicePdfUrl: '/invoices/es6.pdf',
        projectName: 'API 서버 마이그레이션',
        freelancerName: '이백엔드',
        freelancerId: 'f2',
        employerId: 'e1',
        dueDate: new Date('2023-12-31'),
        paidDate: new Date('2023-12-28'),
    },
    {
        id: 'es7',
        contractId: 'c3',
        billingAmount: 2000000,
        installmentNumber: 1,
        status: 'ISSUED',
        invoicePdfUrl: '/invoices/es7.pdf',
        projectName: '모바일 앱 개발',
        freelancerName: '김프론트',
        freelancerId: 'f1',
        employerId: 'e1',
        dueDate: new Date('2024-02-29'),
    },
    {
        id: 'es8',
        contractId: 'c3',
        billingAmount: 6000000,
        installmentNumber: 2,
        status: 'ISSUED',
        invoicePdfUrl: '/invoices/es8.pdf',
        projectName: '모바일 앱 개발',
        freelancerName: '김프론트',
        freelancerId: 'f1',
        employerId: 'e1',
        dueDate: new Date('2024-04-30'),
    },
]);

const selectedSettlement = ref<EmployerSettlement | null>(null);
const selectedStatus = ref<string>('ALL');
const isDropdownOpen = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;

const statusFilters = [
    { value: 'ALL', label: '전체' },
    { value: 'ISSUED', label: '청구됨' },
    { value: 'PAID', label: '결제 완료' },
    { value: 'DISBURSED', label: '지급 완료' },
];

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle }> = {
    ISSUED: { label: '청구됨', icon: Clock },
    PAID: { label: '결제 완료', icon: CheckCircle },
    DISBURSED: { label: '지급 완료', icon: Send },
};

// Filter settlements by current employer
const mySettlements = computed(() => {
    if (!authStore.user) return allSettlements.value;
    return allSettlements.value.filter((s) => s.employerId === authStore.user!.id);
});

// Get next upcoming settlement (first ISSUED settlement by due date)
const nextSettlement = computed(() => {
    const issuedSettlements = mySettlements.value
        .filter((s) => s.status === 'ISSUED')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return issuedSettlements[0] || null;
});

// Filter by status
const filteredSettlements = computed(() => {
    let result = [...mySettlements.value];
    if (selectedStatus.value !== 'ALL') {
        result = result.filter((s) => s.status === selectedStatus.value);
    }
    // Sort by due date descending
    result.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
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
}));

// Total amounts
const totalPending = computed(() =>
    mySettlements.value
        .filter((s) => s.status === 'ISSUED')
        .reduce((sum, s) => sum + s.billingAmount, 0)
);

const totalPaid = computed(() =>
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

const calculateDday = (dueDate: Date | string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const selectStatusFilter = (value: string) => {
    selectedStatus.value = value;
    isDropdownOpen.value = false;
    currentPage.value = 1;
};

const currentStatusLabel = computed(() => {
    return statusFilters.find((f) => f.value === selectedStatus.value)?.label || '전체';
});

const handleDownload = (settlement: EmployerSettlement) => {
    // Mock download - in real app, this would download from invoicePdfUrl
    console.log('Downloading invoice:', settlement.invoicePdfUrl);
    alert(`청구서 다운로드: ${settlement.projectName} - ${settlement.installmentNumber}차`);
};

const handleMarkAsPaid = (settlement: EmployerSettlement) => {
    const index = allSettlements.value.findIndex((s) => s.id === settlement.id);
    if (index !== -1) {
        allSettlements.value[index] = {
            ...allSettlements.value[index],
            status: 'PAID',
            paidDate: new Date(),
        };
    }
};

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};
</script>

<template>
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 text-white">
        <!-- Header -->
        <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }" class="mb-8">
            <div class="flex items-center gap-3 mb-3">
                <Receipt class="w-10 h-10 text-white" />
                <h1 class="text-4xl font-bold text-white">정산 관리</h1>
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
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent"></div>
                <div class="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

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
                                    <div class="text-sm text-white/40 mb-1">납부 기한</div>
                                    <div class="text-lg font-medium text-white">
                                        {{ formatDate(nextSettlement.dueDate) }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col items-center gap-4">
                            <div
                                class="text-center px-8 py-4 rounded-2xl border-2"
                                :class="{
                                    'bg-red-500/20 border-red-500/50': calculateDday(nextSettlement.dueDate) <= 7,
                                    'bg-orange-500/20 border-orange-500/50':
                                        calculateDday(nextSettlement.dueDate) > 7 &&
                                        calculateDday(nextSettlement.dueDate) <= 30,
                                    'bg-blue-500/20 border-blue-500/50': calculateDday(nextSettlement.dueDate) > 30,
                                }"
                            >
                                <div
                                    class="text-xs mb-1 font-medium"
                                    :class="{
                                        'text-red-400': calculateDday(nextSettlement.dueDate) <= 7,
                                        'text-orange-400':
                                            calculateDday(nextSettlement.dueDate) > 7 &&
                                            calculateDday(nextSettlement.dueDate) <= 30,
                                        'text-blue-400': calculateDday(nextSettlement.dueDate) > 30,
                                    }"
                                >
                                    D-Day
                                </div>
                                <div
                                    class="text-3xl font-bold"
                                    :class="{
                                        'text-red-400': calculateDday(nextSettlement.dueDate) <= 7,
                                        'text-orange-400':
                                            calculateDday(nextSettlement.dueDate) > 7 &&
                                            calculateDday(nextSettlement.dueDate) <= 30,
                                        'text-blue-400': calculateDday(nextSettlement.dueDate) > 30,
                                    }"
                                >
                                    {{
                                        calculateDday(nextSettlement.dueDate) > 0
                                            ? `-${calculateDday(nextSettlement.dueDate)}`
                                            : calculateDday(nextSettlement.dueDate) === 0
                                              ? 'Today'
                                              : `+${Math.abs(calculateDday(nextSettlement.dueDate))}`
                                    }}
                                </div>
                            </div>

                            <button
                                @click="handleMarkAsPaid(nextSettlement)"
                                class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                            >
                                <CheckCircle class="w-5 h-5" />
                                결제 완료 처리
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

        <!-- Filter -->
        <div
            class="mb-6 flex items-center justify-between"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
        >
            <div class="text-white/60 text-sm">
                {{ filteredSettlements.length }}개의 정산 내역
            </div>

            <!-- Status Dropdown -->
            <div class="relative">
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
                    class="absolute top-full mt-2 right-0 w-full bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-20"
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

        <div v-else class="space-y-4">
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
                        <div
                            class="px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 border border-white/10"
                        >
                            {{ statusConfig[settlement.status].label }}
                        </div>

                        <button
                            v-if="settlement.status === 'ISSUED'"
                            @click="handleMarkAsPaid(settlement)"
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            결제 완료
                        </button>

                        <button
                            @click="selectedSettlement = settlement"
                            class="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="상세보기"
                        >
                            <Eye class="w-5 h-5 text-white/60" />
                        </button>

                        <button
                            @click="handleDownload(settlement)"
                            class="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="다운로드"
                        >
                            <Download class="w-5 h-5 text-white/60" />
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