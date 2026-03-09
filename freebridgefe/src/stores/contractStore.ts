import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { listContracts, type ContractListParams } from '@/api/contractApi';

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

    // Signature tracking
    employerSignature?: string;
    employerSignedDate?: Date | string;
    freelancerSignature?: string;
    freelancerSignedDate?: Date | string;

    // From list/detail API responses
    employerSigned?: boolean;
    freelancerSigned?: boolean;
}

// EmployerSettlement Entity
export interface EmployerSettlement {
    id: number;
    contractId: number;
    billingAmount: number;
    platformFee: number;
    totalPayment: number;
    installmentNumber: number;
    status: 'PAID' | 'DISBURSED' | 'CANCELLED';
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

// Helper interface for UI display (joined data)
export interface ContractWithDetails extends Contract {
    freelancerName: string;
    employerName: string;
}

export interface EmployerSettlementWithDetails extends EmployerSettlement {
    projectName: string;
    freelancerName: string;
    freelancerId: number;
    employerId: number;
    totalAmount: number; // alias for totalPayment for UI compatibility
}

export interface FreelancerSettlementWithDetails extends FreelancerSettlement {
    projectName: string;
    employerName: string;
}

export const useContractStore = defineStore('contract', () => {
    const contracts = ref<ContractWithDetails[]>([]);
    const employerSettlements = ref<EmployerSettlement[]>([]);
    const freelancerSettlements = ref<FreelancerSettlement[]>([]);

    // Computed: contracts already include names from API response
    const contractsWithDetails = computed<ContractWithDetails[]>(() => contracts.value);

    // Computed: EmployerSettlements with contract details
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

    // Computed: FreelancerSettlements with contract details
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

    // Actions
    async function fetchContracts(params?: ContractListParams) {
        const data = await listContracts(params);
        contracts.value = data.items || [];
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

    function updateFreelancerSettlement(settlementId: number, updates: Partial<FreelancerSettlement>) {
        const index = freelancerSettlements.value.findIndex((s) => s.id === settlementId);
        if (index !== -1) {
            freelancerSettlements.value[index] = { ...freelancerSettlements.value[index], ...updates };
            freelancerSettlements.value = [...freelancerSettlements.value];
        }
    }

    return {
        // Raw data
        contracts,
        employerSettlements,
        freelancerSettlements,
        // Computed with details
        contractsWithDetails,
        employerSettlementsWithDetails,
        freelancerSettlementsWithDetails,
        // Actions
        fetchContracts,
        addContract,
        updateContract,
        updateEmployerSettlement,
        updateFreelancerSettlement,
    };
});