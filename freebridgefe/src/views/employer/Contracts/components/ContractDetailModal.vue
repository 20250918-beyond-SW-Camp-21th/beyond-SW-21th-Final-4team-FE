<script setup lang="ts">
import { computed } from 'vue';
import { X, FileText, Calendar, DollarSign, CheckCircle, User, PenTool } from 'lucide-vue-next';
import type { ContractDocument } from '@/types/contract';

const props = defineProps<{
    contract: ContractDocument;
    isFreelancer?: boolean;
}>();

defineEmits<{
    (e: 'close'): void;
    (e: 'sign'): void;
}>();

const canSign = computed(() => {
    if (props.contract.status !== 'DRAFT') return false;
    if (props.isFreelancer) {
        return props.contract.signedByEmployer && !props.contract.signedByFreelancer;
    }
    return false;
});

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR');
};

const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + '원';
};
</script>

<template>
    <div
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
        <div
            class="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            v-motion
            :initial="{ opacity: 0, scale: 0.95, y: 20 }"
            :enter="{ opacity: 1, scale: 1, y: 0 }"
            :leave="{ opacity: 0, scale: 0.95, y: 20 }"
        >
            <!-- Header -->
            <div
                class="sticky top-0 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between z-10"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
                    >
                        <FileText class="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-white">계약서 상세</h2>
                        <div class="text-sm text-white/60">
                            Contract ID: {{ contract.id }}
                        </div>
                    </div>
                </div>
                <button
                    @click="$emit('close')"
                    class="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    v-motion
                    :hover="{ scale: 1.1, rotate: 90 }"
                    :tap="{ scale: 0.9 }"
                >
                    <X class="w-6 h-6 text-white" />
                </button>
            </div>

            <div class="p-6 space-y-6 text-white">
                <!-- Project Info -->
                <div
                    class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
                >
                    <h3 class="text-xl font-bold mb-4">프로젝트 정보</h3>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <div class="text-sm text-white/60 mb-1">프로젝트명</div>
                            <div class="text-lg font-medium">
                                {{ contract.projectName }}
                            </div>
                        </div>
                        <div>
                            <div class="text-sm text-white/60 mb-1">계약 상태</div>
                            <div class="text-lg font-medium">{{ contract.status }}</div>
                        </div>
                        <div>
                            <div class="text-sm text-white/60 mb-1">프리랜서</div>
                            <div class="text-lg font-medium flex items-center gap-2">
                                <User class="w-4 h-4" />
                                {{ contract.freelancerName }}
                            </div>
                        </div>
                        <div>
                            <div class="text-sm text-white/60 mb-1">고용주</div>
                            <div class="text-lg font-medium flex items-center gap-2">
                                <User class="w-4 h-4" />
                                {{ contract.employerName }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Period & Budget -->
                <div class="grid md:grid-cols-2 gap-6">
                    <div
                        class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
                    >
                        <div class="flex items-center gap-3 mb-3">
                            <Calendar class="w-6 h-6 text-blue-400" />
                            <h3 class="text-lg font-bold">계약 기간</h3>
                        </div>
                        <div class="text-sm text-white/60 mb-1">시작일</div>
                        <div class="text-lg font-medium mb-3">
                            {{ formatDate(contract.startDate) }}
                        </div>
                        <div class="text-sm text-white/60 mb-1">종료일</div>
                        <div class="text-lg font-medium">
                            {{ formatDate(contract.endDate) }}
                        </div>
                    </div>

                    <div
                        class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
                    >
                        <div class="flex items-center gap-3 mb-3">
                            <DollarSign class="w-6 h-6 text-green-400" />
                            <h3 class="text-lg font-bold">계약 금액</h3>
                        </div>
                        <div class="text-sm text-white/60 mb-1">총 계약금</div>
                        <div class="text-3xl font-bold text-green-400">
                            {{ formatCurrency(contract.budget) }}
                        </div>
                    </div>
                </div>

                <!-- Milestones -->
                <div
                    class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
                >
                    <h3 class="text-lg font-bold mb-4">마일스톤 상세</h3>
                    <div class="space-y-4">
                        <div
                            v-for="(milestone, index) in contract.milestones"
                            :key="milestone.id"
                            class="border-l-4 border-blue-500 pl-4 bg-white/5 rounded-r-xl p-4"
                            v-motion
                            :initial="{ opacity: 0, x: -20 }"
                            :enter="{
                                opacity: 1,
                                x: 0,
                                transition: { delay: index * 0.1 },
                            }"
                        >
                            <div class="flex items-start justify-between mb-2">
                                <div class="flex-1">
                                    <div class="flex items-center gap-3 mb-2">
                                        <span class="text-lg font-medium">{{
                                            milestone.name
                                        }}</span>
                                        <CheckCircle
                                            v-if="milestone.status === 'COMPLETED'"
                                            class="w-5 h-5 text-green-400"
                                        />
                                    </div>
                                    <p class="text-sm text-white/60 mb-2">
                                        {{ milestone.description }}
                                    </p>
                                    <div class="flex items-center gap-4 text-sm">
                                        <div class="text-white/60">
                                            마감일:
                                            {{ formatDate(milestone.dueDate) }}
                                        </div>
                                        <div class="font-medium text-green-400">
                                            {{ formatCurrency(milestone.amount) }}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="px-3 py-1 rounded-full text-xs font-semibold"
                                    :class="{
                                        'bg-green-500/20 text-green-300 border border-green-500/30':
                                            milestone.status === 'COMPLETED',
                                        'bg-blue-500/20 text-blue-300 border border-blue-500/30':
                                            milestone.status === 'IN_PROGRESS',
                                        'bg-gray-500/20 text-gray-300 border border-gray-500/30':
                                            milestone.status === 'PENDING',
                                    }"
                                >
                                    {{
                                        milestone.status === 'COMPLETED'
                                            ? '완료'
                                            : milestone.status === 'IN_PROGRESS'
                                              ? '진행중'
                                              : '대기'
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Terms -->
                <div
                    class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
                >
                    <h3 class="text-lg font-bold mb-4">계약 조건</h3>
                    <div
                        class="text-sm text-white/70 whitespace-pre-line leading-relaxed"
                    >
                        {{ contract.terms }}
                    </div>
                </div>

                <!-- Signatures -->
                <div
                    class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
                >
                    <h3 class="text-lg font-bold mb-4">서명 정보</h3>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div class="flex items-center gap-3">
                            <CheckCircle
                                v-if="contract.signedByFreelancer"
                                class="w-6 h-6 text-green-400"
                            />
                            <div
                                v-else
                                class="w-6 h-6 rounded-full border-2 border-white/30"
                            />
                            <div>
                                <div class="text-sm text-white/60">프리랜서</div>
                                <div class="font-medium">
                                    {{
                                        contract.signedByFreelancer
                                            ? '서명 완료'
                                            : '서명 대기'
                                    }}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <CheckCircle
                                v-if="contract.signedByEmployer"
                                class="w-6 h-6 text-green-400"
                            />
                            <div
                                v-else
                                class="w-6 h-6 rounded-full border-2 border-white/30"
                            />
                            <div>
                                <div class="text-sm text-white/60">고용주</div>
                                <div class="font-medium">
                                    {{
                                        contract.signedByEmployer
                                            ? '서명 완료'
                                            : '서명 대기'
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="contract.signedDate"
                        class="mt-4 pt-4 border-t border-white/10"
                    >
                        <div class="text-sm text-white/60">
                            서명일: {{ formatDate(contract.signedDate) }}
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                    <button
                        v-if="canSign"
                        @click="$emit('sign')"
                        class="flex-1 py-4 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                        v-motion
                        :hover="{ scale: 1.02 }"
                        :tap="{ scale: 0.98 }"
                    >
                        <PenTool class="w-5 h-5" />
                        서명하기
                    </button>
                    <button
                        @click="$emit('close')"
                        class="flex-1 py-4 bg-white/10 border border-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl hover:shadow-xl transition-all"
                        v-motion
                        :hover="{ scale: 1.02 }"
                        :tap="{ scale: 0.98 }"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>