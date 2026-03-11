import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { listContracts, type ContractListParams } from '@/api/contractApi';
import { getUserById } from '@/api/authApi';
import {
    getEmployerNextSettlement,
    getEmployerSettlementSummary,
    getFreelancerSettlementSummary,
    listEmployerSettlements,
    listFreelancerSettlements,
    verifyEmployerPayment,
    type EmployerSettlementItem,
    type EmployerSettlementSummary,
    type FreelancerSettlementItem,
    type FreelancerSettlementSummary,
    type VerifyEmployerPaymentResponse,
} from '@/api/settlementApi';

export interface Contract {
    id: number;
    contractId: number;
    projectId?: string;
    projectName: string;
    freelancerId: number;
    employerId: number;
    startDate: Date | string;
    endDate: Date | string;
    status: 'WAITING_SIGNATURE' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
    budget: number;
    commissionRate?: number;
    paymentDay?: number;
    contractPdfUrl?: string;
    signedPdfUrl?: string;
    signedDate?: Date | string;

    jobDescription?: string;
    workLocation?: string;
    workStartTime?: string;
    workEndTime?: string;
    breakStartTime?: string;
    breakEndTime?: string;
    workDaysPerWeek?: number;
    weeklyHoliday?: string;

    employerBusinessName?: string;
    employerAddress?: string;
    employerCEO?: string;

    freelancerAddress?: string;
    freelancerPhone?: string;

    employerSignature?: string;
    employerSignedDate?: Date | string;
    freelancerSignature?: string;
    freelancerSignedDate?: Date | string;

    employerSigned?: boolean;
    freelancerSigned?: boolean;
}

export interface EmployerSettlement {
    id: number;
    contractId: number;
    billingAmount: number;
    platformFee: number;
    totalPayment: number;
    installmentNumber: number;
    status: 'ISSUED' | 'PAID' | 'DISBURSED' | 'CANCELLED';
    invoicePdfUrl: string | null;
    dueDate: Date | string;
    paidDate?: Date | string;
}

export interface FreelancerSettlement {
    id: number;
    contractId: number;
    employerSettlementId: number;
    totalAmount: number;
    platformFee: number;
    tax: number;
    netAmount: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    installmentNumber: number;
    scheduledDate: Date | string;
    paidDate?: Date | string;
    receiptPdfUrl?: string | null;
}

export interface ContractWithDetails extends Contract {
    freelancerName: string;
    employerName: string;
}

export interface EmployerSettlementWithDetails extends EmployerSettlement {
    projectName: string;
    freelancerName: string;
    freelancerId: number;
    employerId: number;
    totalAmount: number;
}

export interface FreelancerSettlementWithDetails extends FreelancerSettlement {
    projectName: string;
    employerName: string;
}

const getPagedItems = <T>(payload: { content?: T[]; items?: T[] } | undefined | null): T[] => {
    if (!payload) return [];
    if (Array.isArray(payload.content)) return payload.content;
    if (Array.isArray(payload.items)) return payload.items;
    return [];
};

export const useContractStore = defineStore('contract', () => {
    const contracts = ref<ContractWithDetails[]>([]);
    const employerSettlements = ref<EmployerSettlement[]>([]);
    const freelancerSettlements = ref<FreelancerSettlement[]>([]);
    const isSettlementLoading = ref(false);
    const employerSettlementSummary = ref<EmployerSettlementSummary | null>(null);
    const freelancerSettlementSummary = ref<FreelancerSettlementSummary | null>(null);
    const employerNextSettlement = ref<EmployerSettlementItem | null>(null);

    const contractsWithDetails = computed<ContractWithDetails[]>(() => contracts.value);

    const employerSettlementsWithDetails = computed<EmployerSettlementWithDetails[]>(() => {
        return employerSettlements.value.map((settlement) => {
            const contract = contracts.value.find((c) => c.id === settlement.contractId);
            return {
                ...settlement,
                projectName: contract?.projectName || 'Unknown Project',
                freelancerName: contract?.freelancerName || 'Unknown',
                freelancerId: contract?.freelancerId || 0,
                employerId: contract?.employerId || 0,
                platformFee: settlement.platformFee,
                totalAmount: settlement.totalPayment,
            };
        });
    });

    const freelancerSettlementsWithDetails = computed<FreelancerSettlementWithDetails[]>(() => {
        return freelancerSettlements.value.map((settlement) => {
            const contract = contracts.value.find((c) => c.id === settlement.contractId);
            return {
                ...settlement,
                projectName: contract?.projectName || 'Unknown Project',
                employerName: contract?.employerName || 'Unknown',
            };
        });
    });

    async function fetchContracts(params?: ContractListParams) {
        const data = await listContracts(params);
        const items = (data.items || []) as ContractWithDetails[];
        contracts.value = items;

        const placeholderPattern = /(user|사용자)\s*#\s*\d+/i;
        const numericOnlyPattern = /^\s*#?\d+\s*$/;
        const needsName = (name?: string | null) => {
            if (!name) return true;
            const trimmed = name.trim();
            return (
                trimmed.length === 0 ||
                trimmed === 'Unknown' ||
                placeholderPattern.test(trimmed) ||
                numericOnlyPattern.test(trimmed)
            );
        };

        const collectMissingIds = (getter: (c: ContractWithDetails) => number, nameGetter: (c: ContractWithDetails) => string | undefined | null) =>
            Array.from(
                new Set(
                    items
                        .filter((c) => needsName(nameGetter(c)))
                        .map((c) => Number(getter(c)))
                        .filter((id) => Number.isFinite(id) && id > 0)
                )
            );

        const missingFreelancerIds = collectMissingIds((c) => c.freelancerId, (c) => c.freelancerName);
        const missingEmployerIds = collectMissingIds((c) => c.employerId, (c) => c.employerName);
        const missingIds = Array.from(new Set([...missingFreelancerIds, ...missingEmployerIds]));

        if (missingIds.length === 0) return;

        const results = await Promise.allSettled(missingIds.map((id) => getUserById(id)));
        const idToName = new Map<number, string>();

        results.forEach((result, index) => {
            if (result.status !== 'fulfilled') return;
            const user = result.value as Record<string, any>;
            const payload = user?.data ?? user;
            const name =
                payload?.name ||
                payload?.fullName ||
                payload?.username ||
                payload?.nickname ||
                payload?.userName ||
                payload?.memberName ||
                payload?.realName;
            if (name) {
                idToName.set(missingIds[index], String(name));
            }
        });

        if (idToName.size === 0) return;

        contracts.value = items.map((contract) => {
            const resolvedFreelancer = idToName.get(Number(contract.freelancerId));
            const resolvedEmployer = idToName.get(Number(contract.employerId));
            if (!resolvedFreelancer && !resolvedEmployer) return contract;
            return {
                ...contract,
                freelancerName: resolvedFreelancer ?? contract.freelancerName,
                employerName: resolvedEmployer ?? contract.employerName,
            };
        });
    }

    async function fetchEmployerSettlements(params?: {
        status?: string;
        dateRange?: string;
        sort?: string;
        page?: number;
        size?: number;
    }) {
        isSettlementLoading.value = true;
        try {
            const data = await listEmployerSettlements(params);
            employerSettlements.value = getPagedItems(data) as EmployerSettlement[];
        } finally {
            isSettlementLoading.value = false;
        }
    }

    async function fetchFreelancerSettlements(params?: {
        status?: string;
        dateRange?: string;
        search?: string;
        sort?: string;
        page?: number;
        size?: number;
    }) {
        isSettlementLoading.value = true;
        try {
            const data = await listFreelancerSettlements(params);
            freelancerSettlements.value = getPagedItems(data) as FreelancerSettlement[];
        } finally {
            isSettlementLoading.value = false;
        }
    }

    async function fetchEmployerSettlementSummary() {
        employerSettlementSummary.value = await getEmployerSettlementSummary();
    }

    async function fetchFreelancerSettlementSummary() {
        freelancerSettlementSummary.value = await getFreelancerSettlementSummary();
    }

    async function fetchEmployerNextSettlement() {
        employerNextSettlement.value = await getEmployerNextSettlement();
    }

    async function verifyEmployerSettlementPayment(paymentId: string, contractId: number) {
        const result = await verifyEmployerPayment({ paymentId, contractId });
        await Promise.all([
            fetchEmployerSettlements(),
            fetchEmployerSettlementSummary().catch(() => undefined),
            fetchEmployerNextSettlement().catch(() => undefined),
        ]);
        return result;
    }

    function addContract(contract: ContractWithDetails) {
        contracts.value = [...contracts.value, contract];
    }

    function updateContract(contractId: number, updates: Partial<ContractWithDetails>) {
        const index = contracts.value.findIndex((c) => c.id === contractId);
        if (index !== -1) {
            contracts.value[index] = { ...contracts.value[index], ...updates };
            contracts.value = [...contracts.value];
        }
    }

    function updateEmployerSettlement(settlementId: number, updates: Partial<EmployerSettlement>) {
        const index = employerSettlements.value.findIndex((s) => s.id === settlementId);
        if (index !== -1) {
            employerSettlements.value[index] = { ...employerSettlements.value[index], ...updates };
            employerSettlements.value = [...employerSettlements.value];
        }
    }

    function markEmployerSettlementPaid(settlementId: number) {
        updateEmployerSettlement(settlementId, {
            status: 'PAID',
            paidDate: new Date().toISOString(),
        });
    }

    function updateFreelancerSettlement(settlementId: number, updates: Partial<FreelancerSettlement>) {
        const index = freelancerSettlements.value.findIndex((s) => s.id === settlementId);
        if (index !== -1) {
            freelancerSettlements.value[index] = { ...freelancerSettlements.value[index], ...updates };
            freelancerSettlements.value = [...freelancerSettlements.value];
        }
    }

    return {
        contracts,
        employerSettlements,
        freelancerSettlements,
        isSettlementLoading,
        employerSettlementSummary,
        freelancerSettlementSummary,
        employerNextSettlement,
        contractsWithDetails,
        employerSettlementsWithDetails,
        freelancerSettlementsWithDetails,
        fetchContracts,
        fetchEmployerSettlements,
        fetchFreelancerSettlements,
        fetchEmployerSettlementSummary,
        fetchFreelancerSettlementSummary,
        fetchEmployerNextSettlement,
        verifyEmployerSettlementPayment,
        addContract,
        updateContract,
        updateEmployerSettlement,
        markEmployerSettlementPaid,
        updateFreelancerSettlement,
    };
});
