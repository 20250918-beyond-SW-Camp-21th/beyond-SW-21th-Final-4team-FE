<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { requestIssueBillingKey, requestPayment, PaymentPayMethod, BillingKeyMethod } from '@portone/browser-sdk/v2';
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
    ArrowLeft,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useContractStore, type ContractWithDetails } from '@/stores/contractStore';
import { updateEmployerSubscription } from '@/api/MyPage/accountApi';

const authStore = useAuthStore();
const contractStore = useContractStore();
const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const selectedSort = ref<'due_soon' | 'amount_desc' | 'amount_asc'>('due_soon');
const payingContractId = ref<number | null>(null);
const paymentError = ref<string | null>(null);
const paymentSuccess = ref<string | null>(null);
const subscriptionError = ref<string | null>(null);
const subscriptionSuccess = ref<string | null>(null);
const isSubscriptionProcessing = ref(false);

const storeId = import.meta.env.VITE_PORTONE_STORE_ID as string | undefined;
const channelKey = import.meta.env.VITE_PORTONE_CHANNEL_KEY as string | undefined;
const isDev = import.meta.env.DEV;

const maskValue = (value?: string) => {
    if (!value) return '(empty)';
    if (value.length <= 8) return `${value.slice(0, 2)}***`;
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const debugPortOneInfo = computed(() => {
    return {
        storeId: maskValue(storeId),
        channelKey: maskValue(channelKey),
    };
});

type SubscriptionPlanType = 'PRO' | 'PRIME';

const subscriptionMode = computed(() => route.query.mode === 'subscription');
const requestedSubscriptionPlan = computed<SubscriptionPlanType | null>(() => {
    const plan = typeof route.query.plan === 'string' ? route.query.plan.toUpperCase() : '';
    return plan === 'PRO' || plan === 'PRIME' ? (plan as SubscriptionPlanType) : null;
});

const subscriptionPlanMeta: Record<SubscriptionPlanType, { label: string; price: number; description: string }> = {
    PRO: {
        label: 'PRO PLAN',
        price: 9000,
        description: '추천 기능과 수수료 할인 혜택이 포함된 고용주 구독 플랜',
    },
    PRIME: {
        label: 'PRIME PLAN',
        price: 19000,
        description: '추천 기능, 더 큰 수수료 할인, AI 컨설팅 혜택이 포함된 최상위 플랜',
    },
};

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

const createBillingIssueId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `billing-${crypto.randomUUID()}`;
    }
    return `billing-${Date.now()}`;
};

const goBackFromSubscriptionPayment = async () => {
    await router.push({
        name: 'employer.mypage',
        query: { tab: 'account' },
    });
};

const handleSubscriptionPayment = async () => {
    subscriptionError.value = null;
    subscriptionSuccess.value = null;

    const plan = requestedSubscriptionPlan.value;
    if (!plan) {
        subscriptionError.value = '결제할 구독 플랜 정보가 없습니다.';
        return;
    }

    if (!storeId || !channelKey) {
        subscriptionError.value = '포트원 설정이 누락되었습니다. VITE_PORTONE_STORE_ID와 VITE_PORTONE_CHANNEL_KEY를 확인해주세요.';
        return;
    }

    try {
        isSubscriptionProcessing.value = true;
        const billingResponse = await requestIssueBillingKey({
            storeId,
            channelKey,
            billingKeyMethod: BillingKeyMethod.CARD,
            issueId: createBillingIssueId(),
            issueName: `${subscriptionPlanMeta[plan].label} 구독 결제 수단 등록`,
            customer: {
                customerId: authStore.user?.id ? String(authStore.user.id) : undefined,
                fullName: authStore.user?.name,
                email: authStore.user?.email,
            },
            customData: {
                mode: 'subscription',
                planType: plan,
            },
            redirectUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        });

        if (!billingResponse) {
            subscriptionError.value = '빌링키 발급이 취소되었거나 완료되지 않았습니다.';
            return;
        }

        if (billingResponse.code) {
            subscriptionError.value = billingResponse.message || `빌링키 발급 실패 (${billingResponse.code})`;
            return;
        }

        const result = await updateEmployerSubscription(plan, billingResponse.billingKey);
        subscriptionSuccess.value = result.message || `${subscriptionPlanMeta[plan].label} 결제가 완료되었습니다.`;
    } catch (error: any) {
        const apiErrorMessage = error?.response?.data?.error?.message
            || error?.response?.data?.message
            || error?.message;
        subscriptionError.value = apiErrorMessage || '구독 결제 처리 중 오류가 발생했습니다.';
        console.error('Subscription payment failed:', error);
    } finally {
        isSubscriptionProcessing.value = false;
    }
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
        console.error('Payment verify failed:', {
            status: error?.response?.status,
            data: error?.response?.data,
            contractId: contract.id,
            paymentId,
            requestedAmount: totalAmount,
            budget: contract.budget,
        });
    } finally {
        payingContractId.value = null;
    }
};

onMounted(async () => {
    if (subscriptionMode.value) {
        return;
    }

    try {
        await Promise.all([
            contractStore.fetchContracts(),
            contractStore.fetchEmployerSettlements(),
            contractStore.fetchEmployerSettlementSummary().catch(() => undefined),
        ]);
    } catch (error) {
        console.error('Failed to initialize payment page:', error);
    }
});
</script>

<template>
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-12 text-white">
        <template v-if="subscriptionMode">
            <div class="max-w-3xl mx-auto">
                <button
                    @click="goBackFromSubscriptionPayment"
                    class="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft class="w-4 h-4" />
                    구독 관리로 돌아가기
                </button>

                <div class="bg-[#1e293b]/60 border border-white/10 rounded-[28px] p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.75)]">
                    <div class="flex items-center gap-3 mb-4">
                        <CreditCard class="w-8 h-8 text-sky-300" />
                        <div>
                            <h1 class="text-3xl font-bold">구독 결제</h1>
                            <p class="text-white/60 text-sm mt-1">빌링키를 발급한 뒤 선택한 구독 플랜으로 즉시 전환합니다.</p>
                        </div>
                    </div>

                    <div v-if="requestedSubscriptionPlan" class="rounded-2xl bg-white/5 border border-white/10 p-6 mb-6">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <div class="text-sm text-white/50 mb-2">선택한 플랜</div>
                                <div class="text-2xl font-bold">{{ subscriptionPlanMeta[requestedSubscriptionPlan].label }}</div>
                                <p class="text-sm text-white/60 mt-2">{{ subscriptionPlanMeta[requestedSubscriptionPlan].description }}</p>
                            </div>
                            <div class="text-right">
                                <div class="text-sm text-white/50 mb-2">즉시 결제 금액</div>
                                <div class="text-3xl font-bold">{{ formatCurrency(subscriptionPlanMeta[requestedSubscriptionPlan].price) }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-2xl bg-sky-500/10 border border-sky-400/20 p-5 text-sm text-sky-100 mb-6">
                        <div class="font-semibold mb-2">결제 전 확인</div>
                        <ul class="space-y-2 text-sky-50/85">
                            <li>카드 정보를 등록하면 선택한 구독 플랜으로 즉시 변경됩니다.</li>
                            <li>이후 정기 결제는 저장된 billingKey를 기준으로 진행됩니다.</li>
                            <li>결제가 실패하면 플랜 변경도 적용되지 않습니다.</li>
                        </ul>
                    </div>

                    <div
                        v-if="subscriptionError"
                        class="mb-4 p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 flex items-start gap-2"
                    >
                        <AlertCircle class="w-5 h-5 mt-0.5" />
                        <span>{{ subscriptionError }}</span>
                    </div>

                    <div
                        v-if="subscriptionSuccess"
                        class="mb-4 p-4 rounded-xl border border-green-500/40 bg-green-500/10 text-green-200 flex items-start gap-2"
                    >
                        <CheckCircle2 class="w-5 h-5 mt-0.5" />
                        <span>{{ subscriptionSuccess }}</span>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                        <button
                            @click="goBackFromSubscriptionPayment"
                            class="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            @click="handleSubscriptionPayment"
                            :disabled="isSubscriptionProcessing || !requestedSubscriptionPlan"
                            class="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 min-w-[180px]"
                        >
                            <Loader2 v-if="isSubscriptionProcessing" class="w-4 h-4 animate-spin" />
                            <CreditCard v-else class="w-4 h-4" />
                            {{ isSubscriptionProcessing ? '결제 처리 중' : '카드 등록 후 결제하기' }}
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <template v-else>
        <div class="mb-8">
            <div class="flex items-center gap-3 mb-3">
                <CreditCard class="w-10 h-10 text-white" />
                <h1 class="text-4xl font-bold">결제 관리</h1>
            </div>
            <p class="text-white/60">진행 중인 계약의 선결제를 진행하고 정산 생성을 시작하세요.</p>
            <div
                v-if="isDev"
                class="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-300"
            >
                <span>DEBUG</span>
                <span>storeId={{ debugPortOneInfo.storeId }}</span>
                <span>channelKey={{ debugPortOneInfo.channelKey }}</span>
            </div>
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
        </template>
    </div>
</template>
