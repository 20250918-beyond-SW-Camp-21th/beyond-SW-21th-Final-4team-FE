import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as contractApi from '@/api/contractApi';

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
    commissionRate: number;
    paymentDay: number;                       // 매월 정기 지급일 (예: 10, 25)
    contractPdfUrl: string;
    signedPdfUrl?: string;
    signedDate?: Date | string;               // 최종 서명 완료일 (양측 모두 서명 후)

    jobDescription: string;                   // 업무의 내용
    workLocation: string;                     // 근무장소 (기본: 원격근무)
    workStartTime: string;                    // 근무 시작시간 (예: "09:00")
    workEndTime: string;                      // 근무 종료시간 (예: "18:00")
    breakStartTime: string;                   // 휴게 시작시간
    breakEndTime: string;                     // 휴게 종료시간
    workDaysPerWeek: number;                  // 주 근무일수
    weeklyHoliday: string;                    // 주휴일 (예: "토, 일")

    employerBusinessName: string;             // 사업체명
    employerAddress: string;                  // 사업주 주소
    employerCEO: string;                      // 대표자명

    freelancerAddress: string;                // 프리랜서 주소
    freelancerPhone: string;                  // 프리랜서 연락처

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

    const contracts = ref<Contract[]>([]);
    const employerSettlements = ref<EmployerSettlement[]>([]);
    const freelancerSettlements = ref<FreelancerSettlement[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

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
    async function createContract(data: contractApi.CreateContractRequest) {
        loading.value = true;
        try {
            const newContract = await contractApi.createContract(data);
            contracts.value = [newContract, ...contracts.value];
            return newContract;
        } catch (err: any) {
            console.error('Failed to create contract:', err);
            error.value = err.message || 'Failed to create contract';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function signContract(contractId: number, signature: string) {
        loading.value = true;
        try {
            const updatedContract = await contractApi.signContract(contractId, { signature });
            const index = contracts.value.findIndex(c => (c.id === contractId || c.contractId === contractId));
            if (index !== -1) {
                contracts.value[index] = updatedContract;
            } else {
                contracts.value = [updatedContract, ...contracts.value];
            }
            return updatedContract;
        } catch (err: any) {
            console.error('Failed to sign contract:', err);
            error.value = err.message || 'Failed to sign contract';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function verifyPayment(paymentId: string, contractId: number) {
        loading.value = true;
        try {
            await contractApi.verifyPayment({ paymentId, contractId });
            await fetchContracts();
        } catch (err: any) {
            console.error('Failed to verify payment:', err);
            error.value = err.message || 'Failed to verify payment';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    function addContract(contract: Contract) {
        contracts.value = [...contracts.value, contract];
    }

    function updateContract(contractId: number, updates: Partial<Contract>) {
        const index = contracts.value.findIndex((c) => (c.id === contractId || c.contractId === contractId));
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

        // Check if freelancer settlement already exists for this employer settlement
        const existingFreelancerSettlement = freelancerSettlements.value.find(
            (fs) => fs.employerSettlementId === settlementId
        );

        if (existingFreelancerSettlement) {
            // Update existing freelancer settlement to PROCESSING
            updateFreelancerSettlement(existingFreelancerSettlement.id, {
                status: 'PROCESSING',
                expectedPaidDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            });
        } else {
            // Create new freelancer settlement (HOLDING → will become PROCESSING)
            // Freelancers only pay tax (3.3%), not platform fee
            const tax = Math.floor(settlement.billingAmount * 0.033); // 3.3%
            const netAmount = settlement.billingAmount - tax;

            const newFreelancerSettlement: FreelancerSettlement = {
                id: Date.now(), // Use timestamp for unique ID
                contractId: settlement.contractId,
                employerSettlementId: settlementId,
                totalAmount: settlement.billingAmount,
                tax,
                netAmount,
                status: 'PROCESSING',
                installmentNumber: settlement.installmentNumber,
                expectedPaidDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
            };

            freelancerSettlements.value = [...freelancerSettlements.value, newFreelancerSettlement];
        }
    }

    // Simulate disbursement - freelancer receives payment
    function disburseFreelancerSettlement(freelancerSettlementId: number) {
        const fSettlement = freelancerSettlements.value.find((s) => s.id === freelancerSettlementId);
        if (!fSettlement || fSettlement.status !== 'PROCESSING') return;

        // Update freelancer settlement to PAID
        updateFreelancerSettlement(freelancerSettlementId, {
            status: 'PAID',
            paidDate: new Date(),
        });

        // Update linked employer settlement to DISBURSED
        updateEmployerSettlement(fSettlement.employerSettlementId, {
            status: 'DISBURSED',
        });
    }

    // API Fetch Functions
    const fetchContracts = async () => {
        try {
            console.log('Fetching contracts from API...');
            const response = await contractApi.getContractList();
            console.log('Contracts fetched:', response);

            // Map API response to store format
            contracts.value = response.items.map((item: any) => ({
                ...item,
                id: item.id || item.contractId,
            }));
        } catch (error) {
            console.error('Failed to fetch contracts, using mock data:', error);
            // Keep using mock data on error
        }
    };

    const fetchEmployerSettlements = async () => {
        try {
            console.log('Fetching employer settlements from API...');
            const response = await contractApi.getEmployerSettlements();
            console.log('Employer settlements fetched:', response);

            // Map API response to store format
            employerSettlements.value = response.items.map((item: any) => ({
                id: item.settlementId,
                contractId: item.contractId,
                billingAmount: item.amount,
                installmentNumber: 1, // API doesn't return this, default to 1
                status: item.status,
                invoicePdfUrl: '', // Will be fetched separately if needed
                dueDate: item.dueDate,
                paidDate: item.paidDate,
            }));
        } catch (error) {
            console.error('Failed to fetch employer settlements, using mock data:', error);
            // Keep using mock data on error
        }
    };

    const fetchFreelancerSettlements = async () => {
        try {
            console.log('Fetching freelancer settlements from API...');
            const response = await contractApi.getFreelancerSettlements();
            console.log('Freelancer settlements fetched:', response);

            // Map API response to store format
            freelancerSettlements.value = response.items.map((item: any) => ({
                id: item.settlementId,
                contractId: item.contractId,
                employerSettlementId: 0, // Not in API response
                totalAmount: item.amount,
                tax: item.commissionAmount || 0,
                netAmount: item.netAmount || item.amount,
                status: item.status === 'PAID' ? 'PAID' : (item.status === 'PENDING' ? 'HOLDING' : 'PROCESSING'),
                installmentNumber: 1,
                expectedPaidDate: item.scheduledDate,
                paidDate: item.disbursedDate,
                receiptPdfUrl: '',
            }));
        } catch (error) {
            console.error('Failed to fetch freelancer settlements, using mock data:', error);
            // Keep using mock data on error
        }
    };

    return {
        // Raw data
        contracts,
        employerSettlements,
        freelancerSettlements,
        loading,
        error,
        // Computed with details
        contractsWithDetails,
        employerSettlementsWithDetails,
        freelancerSettlementsWithDetails,
        // Actions
        createContract,
        signContract,
        verifyPayment,
        addContract,
        updateContract,
        updateEmployerSettlement,
        updateFreelancerSettlement,
        markEmployerSettlementPaid,
        disburseFreelancerSettlement,
        // API Fetch
        fetchContracts,
        fetchEmployerSettlements,
        fetchFreelancerSettlements,
    };
});
