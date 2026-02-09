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
            projectName: 'API 서버 마이그레이션',
            freelancerId: 2,
            employerId: 1,
            startDate: new Date('2026-01-05'),
            endDate: new Date('2026-03-20'),
            status: 'COMPLETED',
            budget: 8000000,
            commissionRate: 0.04,
            paymentDay: 10,
            contractPdfUrl: '/contracts/1002_contract.pdf',
            signedPdfUrl: '/contracts/1002_signed.pdf',
            signedDate: new Date('2026-01-05'),
            employerSignature: 'data:image/png;base64,employer_sig_2',
            employerSignedDate: new Date('2026-01-03'),
            freelancerSignature: 'data:image/png;base64,freelancer_sig_2',
            freelancerSignedDate: new Date('2026-01-05'),
        },
        {
            id: 3,
            contractId: 1003,
            projectName: '모바일 앱 개발',
            freelancerId: 1,
            employerId: 2,
            startDate: new Date('2026-01-05'),
            endDate: new Date('2026-03-20'),
            status: 'IN_PROGRESS',
            budget: 10000000,
            commissionRate: 0.05,
            paymentDay: 15,
            contractPdfUrl: '/contracts/1003_contract.pdf',
            signedPdfUrl: '/contracts/1003_signed.pdf',
            signedDate: new Date('2026-01-05'),
            employerSignature: 'data:image/png;base64,employer_sig_3',
            employerSignedDate: new Date('2026-01-03'),
            freelancerSignature: 'data:image/png;base64,freelancer_sig_3',
            freelancerSignedDate: new Date('2026-01-05'),
        },
        {
            id: 4,
            contractId: 1004,
            projectName: '웹 쇼핑몰 리뉴얼',
            freelancerId: 1,
            employerId: 3,
            startDate: new Date('2026-01-05'),
            endDate: new Date('2026-03-20'),
            status: 'WAITING_SIGNATURE',
            budget: 12000000,
            commissionRate: 0.05,
            paymentDay: 25,
            contractPdfUrl: '/contracts/1004_contract.pdf',
            employerSignature: 'data:image/png;base64,employer_sig_4',
            employerSignedDate: new Date('2026-01-03'),
            // 프리랜서 아직 서명하지 않음
        },
        {
            id: 5,
            contractId: 1005,
            projectName: 'UI/UX 디자인 리뉴얼',
            freelancerId: 3,
            employerId: 1,
            startDate: new Date('2026-01-05'),
            endDate: new Date('2026-03-20'),
            status: 'IN_PROGRESS',
            budget: 3500000,
            commissionRate: 0.05,
            paymentDay: 10,
            contractPdfUrl: '/contracts/1005_contract.pdf',
            signedPdfUrl: '/contracts/1005_signed.pdf',
            signedDate: new Date('2026-01-05'),
            employerSignature: 'data:image/png;base64,employer_sig_5',
            employerSignedDate: new Date('2026-01-03'),
            freelancerSignature: 'data:image/png;base64,freelancer_sig_5',
            freelancerSignedDate: new Date('2026-01-05'),
        },
        {
            id: 6,
            contractId: 1006,
            projectName: '데이터 분석 대시보드',
            freelancerId: 4,
            employerId: 1,
            startDate: new Date('2026-01-05'),
            endDate: new Date('2026-03-20'),
            status: 'COMPLETED',
            budget: 4000000,
            commissionRate: 0.04,
            paymentDay: 25,
            contractPdfUrl: '/contracts/1006_contract.pdf',
            signedPdfUrl: '/contracts/1006_signed.pdf',
            signedDate: new Date('2026-01-05'),
            employerSignature: 'data:image/png;base64,employer_sig_6',
            employerSignedDate: new Date('2026-01-03'),
            freelancerSignature: 'data:image/png;base64,freelancer_sig_6',
            freelancerSignedDate: new Date('2026-01-05'),
        },
        {
            id: 7,
            contractId: 1007,
            projectName: '실시간 채팅 시스템',
            freelancerId: 2,
            employerId: 1,
            startDate: new Date('2026-01-05'),
            endDate: new Date('2026-03-20'),
            status: 'WAITING_SIGNATURE',
            budget: 7000000,
            commissionRate: 0.05,
            paymentDay: 15,
            contractPdfUrl: '/contracts/1007_contract.pdf',
            employerSignature: 'data:image/png;base64,employer_sig_7',
            employerSignedDate: new Date('2026-01-03'),
            // 프리랜서 아직 서명하지 않음
        },
        // Sample for DRAFT status (For Freelancer 1)
        {
            id: 8,
            contractId: 1008,
            projectName: '내부 관리자 페이지',
            freelancerId: 1,
            employerId: 2,
            startDate: new Date('2026-05-01'),
            endDate: new Date('2026-08-31'),
            status: 'DRAFT',
            budget: 15000000,
            commissionRate: 0.05,
            paymentDay: 10,
            // Draft has no PDF yet usually, or maybe it does
        },
        // Sample for COMPLETED status (For Freelancer 1 - Existing COMPLETED was for f2)
        {
            id: 10,
            contractId: 1010,
            projectName: '랜딩 페이지 제작',
            freelancerId: 1,
            employerId: 3,
            startDate: new Date('2025-09-01'),
            endDate: new Date('2025-10-31'),
            status: 'COMPLETED',
            budget: 2000000,
            commissionRate: 0.05,
            paymentDay: 15,
            signedDate: new Date('2025-09-01'),
        }
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