import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Contract Entity (based on entity.md)
export interface Contract {
    id: number;
    contractId: number;
    projectName: string;
    freelancerId: number;
    employerId: number;
    startDate: Date | string;
    endDate: Date | string;
    status: 'WAITING_SIGNATURE' | 'IN_PROGRESS' | 'COMPLETED';
    budget: number;
    commissionRate: number;
    paymentDay: number;                       // 매월 정기 지급일 (예: 10, 25)
    contractPdfUrl: string;
    signedPdfUrl?: string;
    signedDate?: Date | string;               // 최종 서명 완료일 (양측 모두 서명 후)
    // Signature tracking
    employerSignature?: string;               // 고용주 서명 이미지 (data URL)
    employerSignedDate?: Date | string;       // 고용주 서명일
    freelancerSignature?: string;             // 프리랜서 서명 이미지 (data URL)
    freelancerSignedDate?: Date | string;     // 프리랜서 서명일
}

// EmployerSettlement Entity (Invoice - based on entity.md)
export interface EmployerSettlement {
    id: number;
    contractId: number;
    billingAmount: number;
    installmentNumber: number;
    status: 'ISSUED' | 'PAID' | 'DISBURSED';
    invoicePdfUrl: string;
    dueDate: Date | string;
    paidDate?: Date | string;
}

export interface FreelancerSettlement {
    id: number;
    contractId: number;
    employerSettlementId: number;
    totalAmount: number;
    tax: number;
    netAmount: number;
    status: 'HOLDING' | 'PROCESSING' | 'PAID';
    installmentNumber: number;
    expectedPaidDate: Date | string;
    paidDate?: Date | string;
    receiptPdfUrl?: string;
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
    // Calculated fields for UI
    platformFee: number;      // billingAmount * commissionRate
    totalAmount: number;      // billingAmount + platformFee
}

export interface FreelancerSettlementWithDetails extends FreelancerSettlement {
    projectName: string;
    employerName: string;
}

export const useContractStore = defineStore('contract', () => {
    // Mock Users for joining
    const users = {
        f1: { id: 1, name: '김프론트', role: 'FREELANCER' },
        f2: { id: 2, name: '이백엔드', role: 'FREELANCER' },
        f3: { id: 3, name: '박디자인', role: 'FREELANCER' },
        f4: { id: 4, name: '최풀스택', role: 'FREELANCER' },
        e1: { id: 1, name: '스타트업 A', role: 'EMPLOYER' },
        e2: { id: 2, name: '테크기업 B', role: 'EMPLOYER' },
        e3: { id: 3, name: '이커머스 C', role: 'EMPLOYER' },
    };

    // Contracts (based on entity.md structure)
    const contracts = ref<Contract[]>([
        {
            id: 1,
            contractId: 1001,
            projectName: 'SaaS 대시보드 리뉴얼',
            freelancerId: 1,
            employerId: 1,
            startDate: new Date('2026-01-05'),
            endDate: new Date('2026-03-20'),
            status: 'IN_PROGRESS',
            budget: 5000000,
            commissionRate: 0.05,
            paymentDay: 25,
            contractPdfUrl: '/contracts/1001_contract.pdf',
            signedPdfUrl: '/contracts/1001_signed.pdf',
            signedDate: new Date('2026-01-05'),
            employerSignature: 'data:image/png;base64,employer_sig_1',
            employerSignedDate: new Date('2026-01-03'),
            freelancerSignature: 'data:image/png;base64,freelancer_sig_1',
            freelancerSignedDate: new Date('2026-01-05'),
        },
        {
            id: 2,
            contractId: 1002,
            projectName: '모바일 결제 시스템 구축',
            freelancerId: 1,
            employerId: 1,
            startDate: new Date('2026-03-01'),
            endDate: new Date('2026-06-30'),
            status: 'WAITING_SIGNATURE',
            budget: 15000000,
            commissionRate: 0.05,
            paymentDay: 25,
            contractPdfUrl: '/contracts/1002_contract.pdf',
            employerSignature: 'data:image/png;base64,employer_sig_2',
            employerSignedDate: new Date('2026-02-10'),
            // 프리랜서 서명 대기 중
        },
    ]);

    // EmployerSettlements (Invoice - based on entity.md)
    const employerSettlements = ref<EmployerSettlement[]>([
        // Contract 1: SaaS 대시보드 리뉴얼 (3 installments)
        {
            id: 1,
            contractId: 1,
            billingAmount: 1500000,
            installmentNumber: 1,
            status: 'DISBURSED',
            invoicePdfUrl: '/invoices/es1.pdf',
            dueDate: new Date('2026-02-10'),
            paidDate: new Date('2026-02-08'),
        },
        {
            id: 2,
            contractId: 1,
            billingAmount: 2000000,
            installmentNumber: 2,
            status: 'PAID',
            invoicePdfUrl: '/invoices/es2.pdf',
            dueDate: new Date('2026-02-15'),
            paidDate: new Date('2026-02-12'),
        },
        {
            id: 3,
            contractId: 1,
            billingAmount: 1500000,
            installmentNumber: 3,
            status: 'ISSUED',
            invoicePdfUrl: '/invoices/es3.pdf',
            dueDate: new Date('2026-03-25'),
        },
    ]);

    // FreelancerSettlements (Disbursement - based on entity.md)
    // netAmount = totalAmount - tax (3.3%) - freelancers don't pay platform fee
    const freelancerSettlements = ref<FreelancerSettlement[]>([
        // === Contract 1: SaaS 대시보드 리뉴얼 (freelancerId: 1) ===
        // Linked to EmployerSettlement 1 (DISBURSED) - PAID
        {
            id: 1,
            contractId: 1,
            employerSettlementId: 1,
            totalAmount: 1500000,
            tax: 49500, // 3.3%
            netAmount: 1450500, // totalAmount - tax
            status: 'PAID',
            installmentNumber: 1,
            expectedPaidDate: new Date('2026-01-25'),
            paidDate: new Date('2026-01-25'),
            receiptPdfUrl: '/receipts/fs1.pdf',
        },
        // Linked to EmployerSettlement 2 (PAID -> processing) - PROCESSING
        {
            id: 2,
            contractId: 1,
            employerSettlementId: 2,
            totalAmount: 2000000,
            tax: 66000, // 3.3%
            netAmount: 1934000,
            status: 'PROCESSING',
            installmentNumber: 2,
            expectedPaidDate: new Date('2026-02-25'),
        },
        // Linked to EmployerSettlement 3 (ISSUED -> waiting) - HOLDING
        {
            id: 3,
            contractId: 1,
            employerSettlementId: 3,
            totalAmount: 1500000,
            tax: 49500,
            netAmount: 1450500,
            status: 'HOLDING',
            installmentNumber: 3,
            expectedPaidDate: new Date('2026-03-25'),
        },
    ]);

    // Helper function to get username by id and role
    const getUserName = (id: number, role: 'FREELANCER' | 'EMPLOYER'): string => {
        const key = role === 'FREELANCER' ? `f${id}` : `e${id}`;
        return users[key as keyof typeof users]?.name || 'Unknown';
    };

    // Computed: Contracts with joined usernames
    const contractsWithDetails = computed<ContractWithDetails[]>(() => {
        return contracts.value.map((contract) => ({
            ...contract,
            freelancerName: getUserName(contract.freelancerId, 'FREELANCER'),
            employerName: getUserName(contract.employerId, 'EMPLOYER'),
        }));
    });

    // Computed: EmployerSettlements with contract details and calculated fields
    const employerSettlementsWithDetails = computed<EmployerSettlementWithDetails[]>(() => {
        return employerSettlements.value.map((settlement) => {
            const contract = contracts.value.find((c) => c.id === settlement.contractId);
            const commissionRate = contract?.commissionRate || 0.05;
            const platformFee = Math.floor(settlement.billingAmount * commissionRate);
            const totalAmount = settlement.billingAmount + platformFee;

            return {
                ...settlement,
                projectName: contract?.projectName || 'Unknown Project',
                freelancerName: contract ? getUserName(contract.freelancerId, 'FREELANCER') : 'Unknown',
                freelancerId: contract?.freelancerId || 0,
                employerId: contract?.employerId || 0,
                platformFee,
                totalAmount,
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
                employerName: contract ? getUserName(contract.employerId, 'EMPLOYER') : 'Unknown',
            };
        });
    });

    // Actions
    function addContract(contract: Contract) {
        contracts.value = [...contracts.value, contract];
    }

    function updateContract(contractId: number, updates: Partial<Contract>) {
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

    // Mark employer settlement as paid and create/update freelancer settlement
    function markEmployerSettlementPaid(settlementId: number) {
        const settlement = employerSettlements.value.find((s) => s.id === settlementId);
        if (!settlement || settlement.status !== 'ISSUED') return;

        const contract = contracts.value.find((c) => c.id === settlement.contractId);
        if (!contract) return;

        // Update employer settlement status
        updateEmployerSettlement(settlementId, {
            status: 'PAID',
            paidDate: new Date(),
        });

        // Create freelancer settlement (HOLDING status)
        // Freelancers only pay tax (3.3%), not platform fee
        const tax = Math.floor(settlement.billingAmount * 0.033); // 3.3%
        const netAmount = settlement.billingAmount - tax;

        const newFreelancerSettlement: FreelancerSettlement = {
            id: freelancerSettlements.value.length + 1,
            contractId: settlement.contractId,
            employerSettlementId: settlementId,
            totalAmount: settlement.billingAmount,
            tax,
            netAmount,
            status: 'HOLDING',
            installmentNumber: settlement.installmentNumber,
            expectedPaidDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
        };

        freelancerSettlements.value = [...freelancerSettlements.value, newFreelancerSettlement];
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
        addContract,
        updateContract,
        updateEmployerSettlement,
        updateFreelancerSettlement,
        markEmployerSettlementPaid,
        // Helper
        getUserName,
    };
});