# Contract and Payment Modules: Technical Overview

This document provides a comprehensive guide to the **Contract** and **Payment** modules within the Freebridge system. It is intended to help developers (and LLMs) understand how to integrate or modify the frontend to interact with these services.

---

## 1. Contract Module

### Core Purpose
Manages the lifecycle of project agreements between **Employers** and **Freelancers**. It handles draft creation, electronic signatures (Base64), and PDF document generation.

### Domain Entities
- **`Contract`**: The central entity containing project details (name, budget, dates), partner IDs, signature data, and PDF URLs.
- **`ContractStatus`**:
    - `WAITING_SIGNATURE`: Initial state after creation.
    - `IN_PROGRESS`: Both parties have signed; work has officially started.
    - `COMPLETED`: Project finished.
    - `REJECTED`: Agreement declined by one party.

### Provided Services
- **API (ContractController)**:
    - `POST /api/v1/contracts`: Create a new contract (Employer only).
    - `GET /api/v1/contracts`: List contracts for the authenticated user.
    - `GET /api/v1/contracts/{id}`: Detailed view.
    - `PATCH /api/v1/contracts/{id}/sign`: Submit a signature (Base64). If both sign, the status flips to `IN_PROGRESS`.
    - `PATCH /api/v1/contracts/{id}/complete`: Finalize contract (Employer).
    - `GET /api/v1/contracts/{id}/pdf`: Fetch URL for the contract document.
- **Logic (ContractService)**:
    - Calculates commission rates (default 5%).
    - Generates PDFs via `ContractPdfService` (Preview and Signed versions).
    - Publishes **`ContractActivatedEvent`** when a contract starts.

---

## 2. Payment Module

### Core Purpose
Handles financial transactions, escrow management, and settlement processing. It integrates with **PortOne (V2)** for payment processing and manages internal "Wallets."

### Domain Entities
- **`Wallet`**: Represents a balance container.
    - `EMPLOYER`/`FREELANCER`: User-specific wallets for tracking spending/earnings.
    - `PLATFORM_ESCROW`: Holds funds securely during projects.
    - `PLATFORM_REVENUE`: Platform fees and subscription income.
- **`EmployerSettlement`**: Installments paid by the employer. Tracks `billingAmount` (base) + `platformFee`.
- **`FreelancerSettlement`**: Installments to be paid to the freelancer. Linked 1:1 to employer settlements. Tracks `netAmount` after deductions (Fee + 3.3% Tax).

### Key Workflows
1. **Contract Upfront Payment**:
    - When a contract is signed, the Employer pays the *total budget* via PortOne.
    - The backend verifies this via `WebhookController` or `InternalPaymentController`.
    - Funds are moved into `PLATFORM_ESCROW`.
    - `EmployerSettlement` and `FreelancerSettlement` records are generated for each month of the project.
2. **Monthly Disbursement**:
    - On the scheduled `paymentDay`, the platform "disburses" the monthly installment.
    - Funds move from `PLATFORM_ESCROW` to the `Freelancer` wallet (net) and `PLATFORM_REVENUE` wallet (fee).
3. **Refunds/Cancellations**:
    - If a contract is cancelled, pending `FreelancerSettlement` amounts are returned to the Employer's wallet/card.

### Provided Services (APIs)
- **`EmployerSettlementController`**: List/Summarize earnings/spending, verify payments, download invoices.
- **`FreelancerSettlementController`**: List/Summarize pending/paid amounts, request tax invoices, download receipts.
- **`WalletController`**: Check balance and transaction history.
- **`InternalPaymentController`**: Handles PortOne billing key logic for subscriptions.

---

## 3. Integration Details for Frontend

### What the Frontend Needs to Provide
- **Signatures**: The signing process expects a Base64 encoded data URL of the signature image.
- **PortOne Integration**: The frontend must use the PortOne SDK to initiate payments and pass the `paymentId` (or `imp_uid`) to the backend for verification.
- **PDF Viewing**: Backend returns URLs to S3 (or local) PDF files. Use standard PDF viewers or simple `<a>` links.

### Critical Considerations
- **Authentication**: All APIs require a valid JWT. The user ID and Role are extracted from the token.
- **Currency**: All amounts are handled in KRW as `Long` types to avoid floating point issues.
- **Validation**: Dates must follow `YYYY-MM-DD` format.

---

## 4. Module Dependencies
- **Common Module**: Uses `ApiResponse`, `ErrorCode`, and `BusinessException` for standardized communication.
- **Communication Flow**: `Contract` module -> (Event) -> `Payment` module.
