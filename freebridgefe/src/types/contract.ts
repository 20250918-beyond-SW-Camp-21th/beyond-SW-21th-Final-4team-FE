export interface Milestone {
    id: string;
    name: string;
    description: string;
    dueDate: Date | string;
    amount: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    completedDate?: Date | string;
}

export interface ContractDocument {
    id: string;
    contractId: string;
    projectName: string;
    freelancerId: string;
    freelancerName: string;
    employerId: string;
    employerName: string;
    startDate: Date | string;
    endDate: Date | string;
    status: 'DRAFT' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'TERMINATED';
    budget: number;
    milestones: Milestone[];
    terms: string;
    signedByFreelancer: boolean;
    signedByEmployer: boolean;
    freelancerSignature?: string;
    employerSignature?: string;
    signedDate?: Date | string;
    paymentDate?: Date | string;
}

export interface Settlement {
    id: string;
    freelancerId: string;
    contractId: string;
    employerSettlementId: string;
    projectName: string;
    employerName: string;
    totalAmount: number;
    tax: number;
    netAmount: number;
    installmentNumber: number;
    status: 'HOLDING' | 'PROCESSING' | 'PAID';
    paidDate?: Date | string;
    bankAccount: string;
    paymentDay: number;
}
