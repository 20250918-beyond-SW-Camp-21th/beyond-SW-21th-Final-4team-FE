<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { requestPayment, PaymentPayMethod } from '@portone/browser-sdk/v2';
import {
    CreditCard,
    Search,
    Filter,
    Wallet,
    Calendar,
    CircleDollarSign,
    Loader2,
    AlertCircle,
    CheckCircle2,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useContractStore, type ContractWithDetails } from '@/stores/contractStore';

const authStore = useAuthStore();
const contractStore = useContractStore();

const searchQuery = ref('');
const selectedSort = ref<'due_soon' | 'amount_desc' | 'amount_asc'>('due_soon');
const payingContractId = ref<number | null>(null);
const paymentError = ref<string | null>(null);
const paymentSuccess = ref<string | null>(null);

const storeId = import.meta.env.VITE_PORTONE_STORE_ID as string | undefined;
const channelKey = import.meta.env.VITE_PORTONE_CHANNEL_KEY as string | undefined;
const myContracts = computed(() => {
    if (!authStore.user) return [];
    return contractStore.contractsWithDetails.filter((contract) => {
        return contract.employerId === Number(authStore.user!.id) && contract.status === 'IN_PROGRESS';
    });
});

const paidContractIds = computed(() => {
    return new Set(
        contractStore.employerSettlements
            .filter((settlement) => settlement.status === 'PAID' || settlement.status === 'DISBURSED')
            .map((settlement) => settlement.contractId)
    );
});

const payableContracts = computed(() => {
    let result = myContracts.value.filter((contract) => !paidContractIds.value.has(contract.id));

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        result = result.filter((contract) => {
            return contract.projectName.toLowerCase().includes(query) || contract.freelancerName.toLowerCase().includes(query);
        });
    }

    const sorted = [...result];
    if (selectedSort.value === 'due_soon') {
        sorted.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    }
    if (selectedSort.value === 'amount_desc') {
        sorted.sort((a, b) => calculateTotalAmount(b) - calculateTotalAmount(a));
    }
    if (selectedSort.value === 'amount_asc') {
        sorted.sort((a, b) => calculateTotalAmount(a) - calculateTotalAmount(b));
    }

    return sorted;
});

const paymentSummary = computed(() => {
    const payableCount = payableContracts.value.length;
    const totalAmount = payableContracts.value.reduce((sum, contract) => sum + calculateTotalAmount(contract), 0);
    return {
        payableCount,
        totalAmount,
    };
});

const calculateTotalAmount = (contract: ContractWithDetails) => {
    const commissionRate = contract.commissionRate ?? 0.05;
    return Math.round(contract.budget * (1 + commissionRate));
};

const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('ko-KR');
const formatCurrency = (amount: number) => `${amount.toLocaleString()}원`;

const createPaymentId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `payment-${crypto.randomUUID()}`;
    }
    return `payment-${Date.now()}`;
};

const handlePayContract = async (contract: ContractWithDetails) => {
    paymentError.value = null;
    paymentSuccess.value = null;

    if (!storeId || !channelKey) {
        paymentError.value = '포트원 설정이 누락되었습니다. VITE_PORTONE_STORE_ID와 VITE_PORTONE_CHANNEL_KEY를 확인해주세요.';
        return;
    }

    payingContractId.value = contract.id;
    let paymentId: string | null = null;
    let totalAmount = 0;

    try {
        totalAmount = calculateTotalAmount(contract);
        paymentId = createPaymentId();

        const response = await requestPayment({
            storeId,
            channelKey,
            paymentId,
            orderName: `${contract.projectName} 계약 결제`,
            totalAmount,
            currency: 'KRW',
            payMethod: PaymentPayMethod.CARD,
            customer: {
                fullName: authStore.user?.name,
                email: authStore.user?.email,
            },
            // Backend expects a JSON string in customData during webhook verification flow.
            customData: JSON.stringify({
                contractId: contract.id,
                employerId: Number(authStore.user?.id || 0),
            }) as unknown as Record<string, any>,
        });

        if (!response) {
            paymentError.value = '결제가 취소되었거나 리디렉션 방식으로 처리되었습니다.';
            return;
        }

        if (response.code) {
            paymentError.value = response.message || `결제 실패 (${response.code})`;
            return;
        }

        const verifyResult = await contractStore.verifyEmployerSettlementPayment(response.paymentId, contract.id);
        paymentSuccess.value = `${contract.projectName} 결제가 완료되었습니다. (${verifyResult.installmentsCreated}건 정산 생성)`;
    } catch (error: any) {
        const apiErrorCode = error?.response?.data?.errorCode
            || error?.response?.data?.code
            || error?.response?.data?.error?.code;
        const apiErrorMessage = error?.response?.data?.message
            || error?.response?.data?.error?.message;
        paymentError.value = apiErrorCode
            ? `${apiErrorCode}: ${apiErrorMessage || '결제 검증에 실패했습니다.'}`
            : apiErrorMessage || error?.message || '결제 처리 중 오류가 발생했습니다.';
    } finally {
        payingContractId.value = null;
    }
};

onMounted(async () => {
    try {
        await Promise.all([
            contractStore.fetchContracts(),
            contractStore.fetchEmployerSettlements(),
            contractStore.fetchEmployerSettlementSummary().catch(() => undefined),
        ]);
    } catch {
        paymentError.value = '결제 페이지 초기화에 실패했습니다.';
    }
});
</script>

<template>
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 text-white">
        <div class="mb-8">
            <div class="flex items-center gap-3 mb-3">
                <CreditCard class="w-10 h-10 text-white" />
                <h1 class="text-4xl font-bold">결제 관리</h1>
            </div>
            <p class="text-white/60">진행 중인 계약의 선결제를 진행하고 정산 생성을 시작하세요.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div class="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-6">
                <div class="text-sm text-white/60 mb-2 flex items-center gap-2">
                    <Wallet class="w-4 h-4" />
                    결제 가능 계약
                </div>
                <div class="text-3xl font-bold">{{ paymentSummary.payableCount }}건</div>
            </div>
            <div class="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-6">
                <div class="text-sm text-white/60 mb-2 flex items-center gap-2">
                    <CircleDollarSign class="w-4 h-4" />
                    총 결제 예정 금액
                </div>
                <div class="text-3xl font-bold">{{ formatCurrency(paymentSummary.totalAmount) }}</div>
            </div>
        </div>

        <div class="bg-[#1e293b]/50 border border-white/10 rounded-2xl p-5 mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div class="relative w-full md:max-w-sm">
                <Search class="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="프로젝트명 또는 프리랜서 검색"
                    class="w-full pl-10 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500"
                />
            </div>
            <div class="flex items-center gap-2 text-sm">
                <Filter class="w-4 h-4 text-white/60" />
                <select
                    v-model="selectedSort"
                    class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus:outline-none"
                >
                    <option value="due_soon">종료일 빠른순</option>
                    <option value="amount_desc">금액 높은순</option>
                    <option value="amount_asc">금액 낮은순</option>
                </select>
            </div>
        </div>

        <div v-if="paymentError" class="mb-4 p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 flex items-start gap-2">
            <AlertCircle class="w-5 h-5 mt-0.5" />
            <span>{{ paymentError }}</span>
        </div>

        <div v-if="paymentSuccess" class="mb-4 p-4 rounded-xl border border-green-500/40 bg-green-500/10 text-green-200 flex items-start gap-2">
            <CheckCircle2 class="w-5 h-5 mt-0.5" />
            <span>{{ paymentSuccess }}</span>
        </div>

        <div v-if="payableContracts.length === 0" class="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-white/70">
            결제 가능한 진행 중 계약이 없습니다.
        </div>

        <div v-else class="space-y-4">
            <div
                v-for="contract in payableContracts"
                :key="contract.id"
                class="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center gap-4 justify-between"
            >
                <div class="flex-1">
                    <div class="font-bold text-xl mb-2">{{ contract.projectName }}</div>
                    <div class="text-white/60 text-sm mb-1">프리랜서: {{ contract.freelancerName }}</div>
                    <div class="text-white/60 text-sm flex items-center gap-2">
                        <Calendar class="w-4 h-4" />
                        {{ formatDate(contract.startDate) }} ~ {{ formatDate(contract.endDate) }}
                    </div>
                </div>

                <div class="text-left lg:text-right min-w-[200px]">
                    <div class="text-sm text-white/50">예상 총 결제 금액</div>
                    <div class="text-2xl font-bold">{{ formatCurrency(calculateTotalAmount(contract)) }}</div>
                    <div class="text-xs text-white/40 mt-1">
                        월 {{ formatCurrency(contract.budget) }} · 수수료 {{ ((contract.commissionRate ?? 0.05) * 100).toFixed(1) }}%
                    </div>
                </div>

                <button
                    @click="handlePayContract(contract)"
                    :disabled="payingContractId === contract.id"
                    class="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 min-w-[140px]"
                >
                    <Loader2 v-if="payingContractId === contract.id" class="w-4 h-4 animate-spin" />
                    <CreditCard v-else class="w-4 h-4" />
                    {{ payingContractId === contract.id ? '결제 처리 중' : '결제하기' }}
                </button>
            </div>
        </div>
    </div>
</template>
