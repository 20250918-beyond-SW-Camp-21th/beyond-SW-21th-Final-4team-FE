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
    status: 'DRAFT' | 'WAITING_SIGNATURE' | 'IN_PROGRESS' | 'COMPLETED' | 'TERMINATED';
    budget: number;
    commissionRate: number;
    contractPdfUrl: string;
    signedPdfUrl?: string;
    signedDate?: Date | string;
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

// FreelancerSettlement Entity (Disbursement - based on entity.md)
export interface FreelancerSettlement {
    id: number;
    contractId: number;
    employerSettlementId: number;
    totalAmount: number;
    platformFee: number;
    tax: number;
    netAmount: number;
    status: 'HOLDING' | 'PROCESSING' | 'PAID';
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
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-03-31'),
            status: 'IN_PROGRESS',
            budget: 5000000,
            commissionRate: 0.05,
            contractPdfUrl: '/contracts/1001_contract.pdf',
            signedPdfUrl: '/contracts/1001_signed.pdf',
            signedDate: new Date('2023-12-28'),
        },
        {
            id: 2,
            contractId: 1002,
            projectName: 'API 서버 마이그레이션',
            freelancerId: 2,
            employerId: 1,
            startDate: new Date('2023-10-01'),
            endDate: new Date('2023-12-31'),
            status: 'COMPLETED',
            budget: 8000000,
            commissionRate: 0.04,
            contractPdfUrl: '/contracts/1002_contract.pdf',
            signedPdfUrl: '/contracts/1002_signed.pdf',
            signedDate: new Date('2023-09-28'),
        },
        {
            id: 3,
            contractId: 1003,
            projectName: '모바일 앱 개발',
            freelancerId: 1,
            employerId: 2,
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-05-31'),
            status: 'IN_PROGRESS',
            budget: 10000000,
            commissionRate: 0.05,
            contractPdfUrl: '/contracts/1003_contract.pdf',
            signedPdfUrl: '/contracts/1003_signed.pdf',
            signedDate: new Date('2024-01-25'),
        },
        {
            id: 4,
            contractId: 1004,
            projectName: '웹 쇼핑몰 리뉴얼',
            freelancerId: 1,
            employerId: 3,
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-06-30'),
            status: 'WAITING_SIGNATURE',
            budget: 12000000,
            commissionRate: 0.05,
            contractPdfUrl: '/contracts/1004_contract.pdf',
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
            dueDate: new Date('2024-01-31'),
            paidDate: new Date('2024-01-28'),
        },
        {
            id: 2,
            contractId: 1,
            billingAmount: 2000000,
            installmentNumber: 2,
            status: 'PAID',
            invoicePdfUrl: '/invoices/es2.pdf',
            dueDate: new Date('2024-02-28'),
            paidDate: new Date('2024-02-25'),
        },
        {
            id: 3,
            contractId: 1,
            billingAmount: 1500000,
            installmentNumber: 3,
            status: 'ISSUED',
            invoicePdfUrl: '/invoices/es3.pdf',
            dueDate: new Date('2024-03-31'),
        },
        // Contract 2: API 서버 마이그레이션 (3 installments - all completed)
        {
            id: 4,
            contractId: 2,
            billingAmount: 3000000,
            installmentNumber: 1,
            status: 'DISBURSED',
            invoicePdfUrl: '/invoices/es4.pdf',
            dueDate: new Date('2023-11-30'),
            paidDate: new Date('2023-11-25'),
        },
        {
            id: 5,
            contractId: 2,
            billingAmount: 2500000,
            installmentNumber: 2,
            status: 'DISBURSED',
            invoicePdfUrl: '/invoices/es5.pdf',
            dueDate: new Date('2023-12-15'),
            paidDate: new Date('2023-12-12'),
        },
        {
            id: 6,
            contractId: 2,
            billingAmount: 2500000,
            installmentNumber: 3,
            status: 'DISBURSED',
            invoicePdfUrl: '/invoices/es6.pdf',
            dueDate: new Date('2023-12-31'),
            paidDate: new Date('2023-12-28'),
        },
        // Contract 3: 모바일 앱 개발 (2 issued)
        {
            id: 7,
            contractId: 3,
            billingAmount: 2000000,
            installmentNumber: 1,
            status: 'ISSUED',
            invoicePdfUrl: '/invoices/es7.pdf',
            dueDate: new Date('2024-02-29'),
        },
        {
            id: 8,
            contractId: 3,
            billingAmount: 6000000,
            installmentNumber: 2,
            status: 'ISSUED',
            invoicePdfUrl: '/invoices/es8.pdf',
            dueDate: new Date('2024-04-30'),
        },
    ]);

    // FreelancerSettlements (Disbursement - based on entity.md)
    const freelancerSettlements = ref<FreelancerSettlement[]>([
        // Linked to EmployerSettlement 1 (DISBURSED)
        {
            id: 1,
            contractId: 1,
            employerSettlementId: 1,
            totalAmount: 1500000,
            platformFee: 75000, // 5%
            tax: 49500, // 3.3%
            netAmount: 1375500,
            status: 'PAID',
            expectedPaidDate: new Date('2024-02-02'),
            paidDate: new Date('2024-02-02'),
            receiptPdfUrl: '/receipts/fs1.pdf',
        },
        // Linked to EmployerSettlement 2 (PAID -> processing disbursement)
        {
            id: 2,
            contractId: 1,
            employerSettlementId: 2,
            totalAmount: 2000000,
            platformFee: 100000, // 5%
            tax: 66000, // 3.3%
            netAmount: 1834000,
            status: 'PROCESSING',
            expectedPaidDate: new Date('2024-03-01'),
        },
        // Linked to EmployerSettlement 4 (DISBURSED)
        {
            id: 3,
            contractId: 2,
            employerSettlementId: 4,
            totalAmount: 3000000,
            platformFee: 120000, // 4%
            tax: 99000, // 3.3%
            netAmount: 2781000,
            status: 'PAID',
            expectedPaidDate: new Date('2023-11-30'),
            paidDate: new Date('2023-11-30'),
            receiptPdfUrl: '/receipts/fs3.pdf',
        },
        // Linked to EmployerSettlement 5 (DISBURSED)
        {
            id: 4,
            contractId: 2,
            employerSettlementId: 5,
            totalAmount: 2500000,
            platformFee: 100000, // 4%
            tax: 82500, // 3.3%
            netAmount: 2317500,
            status: 'PAID',
            expectedPaidDate: new Date('2023-12-17'),
            paidDate: new Date('2023-12-17'),
            receiptPdfUrl: '/receipts/fs4.pdf',
        },
        // Linked to EmployerSettlement 6 (DISBURSED)
        {
            id: 5,
            contractId: 2,
            employerSettlementId: 6,
            totalAmount: 2500000,
            platformFee: 100000, // 4%
            tax: 82500, // 3.3%
            netAmount: 2317500,
            status: 'PAID',
            expectedPaidDate: new Date('2024-01-02'),
            paidDate: new Date('2024-01-02'),
            receiptPdfUrl: '/receipts/fs5.pdf',
        },
    ]);

    // Helper function to get user name by id and role
    const getUserName = (id: number, role: 'FREELANCER' | 'EMPLOYER'): string => {
        const key = role === 'FREELANCER' ? `f${id}` : `e${id}`;
        return users[key as keyof typeof users]?.name || 'Unknown';
    };

    // Computed: Contracts with joined user names
    const contractsWithDetails = computed<ContractWithDetails[]>(() => {
        return contracts.value.map((contract) => ({
            ...contract,
            freelancerName: getUserName(contract.freelancerId, 'FREELANCER'),
            employerName: getUserName(contract.employerId, 'EMPLOYER'),
        }));
    });

    // Computed: EmployerSettlements with contract details
    const employerSettlementsWithDetails = computed<EmployerSettlementWithDetails[]>(() => {
        return employerSettlements.value.map((settlement) => {
            const contract = contracts.value.find((c) => c.id === settlement.contractId);
            return {
                ...settlement,
                projectName: contract?.projectName || 'Unknown Project',
                freelancerName: contract ? getUserName(contract.freelancerId, 'FREELANCER') : 'Unknown',
                freelancerId: contract?.freelancerId || 0,
                employerId: contract?.employerId || 0,
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
        const platformFee = Math.floor(settlement.billingAmount * contract.commissionRate);
        const tax = Math.floor(settlement.billingAmount * 0.033); // 3.3%
        const netAmount = settlement.billingAmount - platformFee - tax;

        const newFreelancerSettlement: FreelancerSettlement = {
            id: freelancerSettlements.value.length + 1,
            contractId: settlement.contractId,
            employerSettlementId: settlementId,
            totalAmount: settlement.billingAmount,
            platformFee,
            tax,
            netAmount,
            status: 'HOLDING',
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