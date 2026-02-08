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
    status: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'TERMINATED';
    budget: number;
    milestones: Milestone[];
    terms: string;
    signedByFreelancer: boolean;
    signedByEmployer: boolean;
    signedDate?: Date | string;
}

export interface Settlement {
    id: string;
    freelancerId: string;
    contractId: string;
    projectName: string;
    employerName: string;
    totalAmount: number;
    platformFee: number;
    tax: number;
    netAmount: number;
    status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'PAID' | 'REJECTED';
    requestDate: Date | string;
    paidDate?: Date | string;
    bankAccount: string;
    installmentNumber?: number;
}
