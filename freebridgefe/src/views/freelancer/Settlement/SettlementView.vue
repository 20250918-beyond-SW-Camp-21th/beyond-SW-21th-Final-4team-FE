<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
  AlertCircle,
  Plus,
  Download,
  Sparkles,
  Zap,
  Wallet
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useContractStore } from '@/stores/contractStore';
import type { Settlement } from '@/types/contract';
import SettlementRequestModal from './components/SettlementRequestModal.vue';
import SettlementDetailModal from './components/SettlementDetailModal.vue';

const authStore = useAuthStore();
const contractStore = useContractStore();

const showRequestModal = ref(false);
const selectedSettlement = ref<Settlement | null>(null);

const mySettlements = computed(() => {
  if (!authStore.user) return [];
  return contractStore.settlements.filter((s) => s.freelancerId === authStore.user!.id);
});

// 사용 가능 잔액 계산
const availableBalance = computed(() => mySettlements.value
    .filter((s) => s.status === 'APPROVED' || s.status === 'PROCESSING')
    .reduce((sum, s) => sum + s.netAmount, 0));

// 대기 중 금액
const pendingAmount = computed(() => mySettlements.value
    .filter((s) => s.status === 'PENDING')
    .reduce((sum, s) => sum + s.netAmount, 0));

// 지급 완료 금액
const paidAmount = computed(() => mySettlements.value
    .filter((s) => s.status === 'PAID')
    .reduce((sum, s) => sum + s.netAmount, 0));

// 상태별 정산 건수
const statusCounts = computed(() => ({
    PENDING: mySettlements.value.filter((s) => s.status === 'PENDING').length,
    PROCESSING: mySettlements.value.filter((s) => s.status === 'PROCESSING').length,
    APPROVED: mySettlements.value.filter((s) => s.status === 'APPROVED').length,
    PAID: mySettlements.value.filter((s) => s.status === 'PAID').length,
}));

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: '승인 대기', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
    PROCESSING: { label: '처리 중', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    APPROVED: { label: '승인 완료', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
    PAID: { label: '지급 완료', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
    REJECTED: { label: '반려', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('ko-KR');
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
      <div class="flex flex-col md:flex-row items-start md:items-center gap-4 mb-3">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent flex items-center gap-3">
           <Wallet class="w-10 h-10 text-white" />
           정산 관리
        </h1>
      </div>
      <p class="text-white/60">수입 내역과 정산을 손쉽게 관리하세요</p>
    </div>

    <!-- Balance Card Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Main Balance -->
        <div
            class="lg:col-span-2 relative overflow-hidden bg-[#1e293b]/80 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-xl group"
            v-motion
            :initial="{ opacity: 0, scale: 0.95 }"
            :enter="{ opacity: 1, scale: 1, transition: { delay: 100 } }"
        >
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors duration-500"></div>
            
            <div class="relative z-10">
                <div class="flex items-center gap-2 text-blue-400 mb-2 font-medium">
                    <Sparkles class="w-4 h-4" />
                    사용 가능 잔액
                </div>
                <div class="flex items-end gap-3 mb-8">
                    <div class="text-6xl font-bold text-white tracking-tight">
                        {{ availableBalance.toLocaleString() }}
                    </div>
                    <div class="text-2xl text-white/40 mb-2 font-medium">원</div>
                </div>

                <div class="flex gap-4">
                    <button
                        @click="showRequestModal = true"
                        class="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20 font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-blue-500/50"
                    >
                        <Plus class="w-5 h-5" />
                        정산 요청
                    </button>
                    <button class="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/10">
                        계좌 관리
                    </button>
                </div>
            </div>
        </div>

        <!-- Summary Stats (Right Column) -->
        <div class="space-y-6">
            <div
                class="bg-[#1e293b]/50 backdrop-blur-sm rounded-3xl p-6 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all"
                v-motion
                :initial="{ opacity: 0, x: 20 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 200 } }"
            >
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-2 text-white/60 text-sm font-medium">
                        <Clock class="w-4 h-4 text-yellow-500" />
                        정산 대기
                    </div>
                    <div class="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 group-hover:bg-yellow-500/20 transition-colors">
                        <TrendingUp class="w-4 h-4" />
                    </div>
                </div>
                <div class="text-3xl font-bold text-white mb-1">{{ pendingAmount.toLocaleString() }}<span class="text-lg text-white/40 ml-1">원</span></div>
            </div>

            <div
                class="bg-[#1e293b]/50 backdrop-blur-sm rounded-3xl p-6 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all"
                v-motion
                :initial="{ opacity: 0, x: 20 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 300 } }"
            >
                <div class="flex justify-between items-start mb-4">
                     <div class="flex items-center gap-2 text-white/60 text-sm font-medium">
                         <CheckCircle class="w-4 h-4 text-green-500" />
                        총 지급 완료
                    </div>
                    <div class="p-2 bg-green-500/10 rounded-lg text-green-500 group-hover:bg-green-500/20 transition-colors">
                        <Award class="w-4 h-4" />
                    </div>
                </div>
                 <div class="text-3xl font-bold text-white mb-1">{{ paidAmount.toLocaleString() }}<span class="text-lg text-white/40 ml-1">원</span></div>
            </div>
        </div>
    </div>
    
    <!-- Status Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div
            v-for="(stat, index) in [
                { label: '승인 대기', count: statusCounts.PENDING, icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
                { label: '처리 중', count: statusCounts.PROCESSING, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
                { label: '승인 완료', count: statusCounts.APPROVED, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
                { label: '지급 완료', count: statusCounts.PAID, icon: Wallet, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
            ]"
            :key="stat.label"
            class="rounded-2xl p-5 border backdrop-blur-sm flex items-center justify-between group hover:brightness-110 transition-all cursor-default"
            :class="[stat.bg]"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400 + index * 100 } }"
        >
            <div>
                 <div class="text-xs text-white/50 mb-1 font-medium">{{ stat.label }}</div>
                 <div class="text-2xl font-bold text-white">{{ stat.count }}<span class="text-xs text-white/30 ml-1">건</span></div>
            </div>
            <div :class="`p-2 rounded-xl ${stat.bg.split(' ')[0]} ${stat.color}`">
                <component :is="stat.icon" class="w-5 h-5" />
            </div>
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
                    최근 정산 내역
                </h2>
                <button class="text-sm text-slate-400 hover:text-white transition-colors">전체보기</button>
            </div>

            <div v-if="mySettlements.length === 0" class="text-center py-20">
                <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign class="w-8 h-8 text-white/20" />
                </div>
                <p class="text-white/40">정산 내역이 없습니다</p>
            </div>

            <div v-else class="space-y-3">
                <div
                    v-for="(settlement, index) in mySettlements"
                    :key="settlement.id"
                    @click="selectedSettlement = settlement"
                    class="group bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer flex items-center justify-between"
                >
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 rounded-xl flex items-center justify-center border"
                            :class="statusConfig[settlement.status].bg"
                        >
                             <DollarSign class="w-5 h-5" :class="statusConfig[settlement.status].color" />
                        </div>
                        <div>
                            <div class="font-bold text-white mb-1 group-hover:text-blue-200 transition-colors">{{ settlement.projectName }}</div>
                            <div class="text-xs text-white/40">{{ formatDate(settlement.requestDate) }} · {{ statusConfig[settlement.status].label }}</div>
                        </div>
                    </div>
                    <div class="text-right">
                         <div class="text-lg font-bold text-white">{{ settlement.netAmount.toLocaleString() }}원</div>
                         <div class="text-xs text-white/40">실 수령액</div>
                    </div>
                </div>
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

            <!-- Tip Card -->
            <div
                class="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6"
                 v-motion
                :initial="{ opacity: 0, x: 20 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 700 } }"
            >
                <div class="flex items-start gap-3">
                    <AlertCircle class="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div>
                         <div class="font-bold text-blue-300 text-sm mb-1">정산 안내</div>
                        <p class="text-xs text-blue-200/60 leading-relaxed">
                            정산 요청 후 승인까지 영업일 기준 평균 3-5일이 소요됩니다.
                            입금이 지연될 경우 1:1 문의를 이용해주세요.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <SettlementRequestModal
        v-if="showRequestModal"
        @close="showRequestModal = false"
    />
    <SettlementDetailModal
        v-if="selectedSettlement"
        :settlement="selectedSettlement"
        @close="selectedSettlement = null"
    />
  </div>
</template>
