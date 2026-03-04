# Contract & Payment API Specification

## Base Configuration

- **Backend Base URL**: `http://localhost:8080`
- **Frontend Dev URL**: `http://localhost:5173`
- **CORS**: Configured to allow requests from `http://localhost:5173`
- **Authentication**: JWT Bearer Token (required for all endpoints except webhooks)

### Authentication Header
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. User & Authentication API

Base Path: `/api/users`

### 1.1 User Signup

**POST** `/api/users/signup`

Register a new user account (EMPLOYER or FREELANCER).

**Authentication**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "EMPLOYER",
  "termsAgreed": true,
  "privacyAgreed": true
}
```

**Field Details**:
- `email`: Valid email address (required)
- `password`: Password (required)
- `name`: User's full name (required)
- `role`: Either `EMPLOYER` or `FREELANCER` (required)
- `termsAgreed`: Must be `true` (required)
- `privacyAgreed`: Must be `true` (required)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "EMPLOYER",
    "termsAgreed": true,
    "privacyAgreed": true,
    "emailVerified": false,
    "createdAt": "2024-01-01T10:00:00"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "이미 존재하는 이메일입니다."
}
```

---

### 1.2 User Login

**POST** `/api/users/login`

Authenticate user and receive JWT access token.

**Authentication**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "EMPLOYER",
      "termsAgreed": true,
      "privacyAgreed": true,
      "emailVerified": false,
      "createdAt": "2024-01-01T10:00:00"
    },
    "grade": null
  }
}
```

**Note**: The `grade` field is only populated for FREELANCER users (e.g., "JUNIOR", "SENIOR").

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "이메일 또는 비밀번호가 일치하지 않습니다."
}
```

**Important**: Save the `accessToken` in your frontend (localStorage or secure storage) and include it in the `Authorization` header for all subsequent API requests.

---

### 1.3 Check Email Availability

**GET** `/api/users/check-email`

Check if an email is already registered.

**Authentication**: None required

**Query Parameters**:
- `email`: Email address to check

**Example Request**:
```
GET /api/users/check-email?email=user@example.com
```

**Response** (200 OK):
```json
{
  "success": true,
  "exists": false,
  "available": true
}
```

**Field Details**:
- `exists`: `true` if email is already registered
- `available`: `true` if email is available for registration (opposite of `exists`)

---

### 1.4 Get User by ID

**GET** `/api/users/{id}`

Get user information by user ID.

**Authentication**: Required

**Path Parameters**:
- `id`: User ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "EMPLOYER",
    "termsAgreed": true,
    "privacyAgreed": true,
    "emailVerified": false,
    "createdAt": "2024-01-01T10:00:00"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "사용자를 찾을 수 없습니다."
}
```

---

### 1.5 Get User by Email

**GET** `/api/users/by-email`

Get user information by email address.

**Authentication**: Required

**Query Parameters**:
- `email`: User's email address

**Example Request**:
```
GET /api/users/by-email?email=user@example.com
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "EMPLOYER",
    "termsAgreed": true,
    "privacyAgreed": true,
    "emailVerified": false,
    "createdAt": "2024-01-01T10:00:00"
  }
}
```

---

### 1.6 Test JWT Authentication

**GET** `/api/users/me/test`

Test endpoint to verify JWT token and get authenticated user information.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "message": "JWT 필터 해독 성공!",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "EMPLOYER",
    "grade": null
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "message": "인증 정보가 없습니다. (토큰 없음 또는 만료)"
}
```

**Use Case**: Use this endpoint to verify that your JWT token is valid and to retrieve the current authenticated user's information.

---

## 2. Contract Module API

Base Path: `/api/v1/contracts`

### 1.1 Create Contract

**POST** `/api/v1/contracts`

Creates a new contract. Only EMPLOYER role can create contracts.

**Authentication**: Required (EMPLOYER role only)

**Request Body**:
```json
{
  "projectName": "Web Development Project",
  "freelancerId": 123,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "budget": 5000000,
  "paymentDay": 25,
  "jobDescription": "Full-stack web development",
  "workLocation": "원격근무",
  "workStartTime": "09:00",
  "workEndTime": "18:00",
  "breakStartTime": "12:00",
  "breakEndTime": "13:00",
  "workDaysPerWeek": 5,
  "weeklyHoliday": "토, 일",
  "employerBusinessName": "ABC Company",
  "employerAddress": "Seoul, Korea",
  "employerCEO": "John Doe",
  "freelancerAddress": "Seoul, Korea",
  "freelancerPhone": "010-1234-5678",
  "employerSignature": "data:image/png;base64,..."
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "id": 1,
    "contractId": 1001,
    "projectName": "Web Development Project",
    "freelancerId": 123,
    "employerId": 456,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "status": "WAITING_SIGNATURE",
    "budget": 5000000,
    "commissionRate": 0.05,
    "paymentDay": 25,
    "contractPdfUrl": "https://s3.../contract_1001_preview.pdf",
    "signedPdfUrl": null,
    "signedDate": null,
    "jobDescription": "Full-stack web development",
    "workLocation": "원격근무",
    "workStartTime": "09:00",
    "workEndTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00",
    "workDaysPerWeek": 5,
    "weeklyHoliday": "토, 일",
    "employerBusinessName": "ABC Company",
    "employerAddress": "Seoul, Korea",
    "employerCEO": "John Doe",
    "freelancerAddress": "Seoul, Korea",
    "freelancerPhone": "010-1234-5678",
    "employerSignature": "data:image/png;base64,...",
    "employerSignedDate": "2024-01-01T10:30:00",
    "freelancerSignature": null,
    "freelancerSignedDate": null,
    "freelancerName": "Jane Smith",
    "employerName": "John Doe"
  },
  "httpStatus": "CREATED"
}
```

---

### 1.2 Get Contract List

**GET** `/api/v1/contracts`

Get paginated list of contracts for the authenticated user.

**Authentication**: Required (EMPLOYER or FREELANCER)

**Query Parameters**:
- `status` (optional, array): Filter by status (e.g., `WAITING_SIGNATURE`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`)
- `search` (optional): Search term
- `page` (default: 1): Page number
- `limit` (default: 10): Items per page

**Example Request**:
```
GET /api/v1/contracts?status=IN_PROGRESS&status=COMPLETED&page=1&limit=10
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "items": [
      {
        "contractId": 1001,
        "projectName": "Web Development Project",
        "status": "IN_PROGRESS",
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "budget": 5000000
      }
    ],
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "limit": 10
  },
  "httpStatus": "OK"
}
```

---

### 1.3 Get Contract Detail

**GET** `/api/v1/contracts/{contractId}`

Get detailed information about a specific contract.

**Authentication**: Required (Only parties in the contract)

**Path Parameters**:
- `contractId`: Contract ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "id": 1,
    "contractId": 1001,
    "projectName": "Web Development Project",
    "freelancerId": 123,
    "employerId": 456,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "status": "IN_PROGRESS",
    "budget": 5000000,
    "commissionRate": 0.05,
    "paymentDay": 25,
    "contractPdfUrl": "https://s3.../contract_1001_preview.pdf",
    "signedPdfUrl": "https://s3.../contract_1001_signed.pdf",
    "signedDate": "2024-01-02T14:30:00",
    "employerSignature": "data:image/png;base64,...",
    "employerSignedDate": "2024-01-01T10:30:00",
    "freelancerSignature": "data:image/png;base64,...",
    "freelancerSignedDate": "2024-01-02T14:30:00",
    "freelancerName": "Jane Smith",
    "employerName": "John Doe"
  },
  "httpStatus": "OK"
}
```

---

### 1.4 Sign Contract

**PATCH** `/api/v1/contracts/{contractId}/sign`

Sign a contract as EMPLOYER or FREELANCER. When both parties sign, status changes to `IN_PROGRESS`.

**Authentication**: Required (EMPLOYER or FREELANCER)

**Path Parameters**:
- `contractId`: Contract ID

**Request Body**:
```json
{
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "contractId": 1001,
    "status": "IN_PROGRESS",
    "freelancerSignature": "data:image/png;base64,...",
    "freelancerSignedDate": "2024-01-02T14:30:00"
  },
  "httpStatus": "OK"
}
```

---

### 1.5 Complete Contract

**PATCH** `/api/v1/contracts/{contractId}/complete`

Mark a contract as completed. Only EMPLOYER can complete contracts.

**Authentication**: Required (EMPLOYER role only)

**Path Parameters**:
- `contractId`: Contract ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "contractId": 1001,
    "status": "COMPLETED"
  },
  "httpStatus": "OK"
}
```

---

### 1.6 Reject Contract

**PATCH** `/api/v1/contracts/{contractId}/reject`

Reject a contract. Both EMPLOYER and FREELANCER can reject.

**Authentication**: Required (EMPLOYER or FREELANCER)

**Path Parameters**:
- `contractId`: Contract ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "contractId": 1001,
    "status": "REJECTED"
  },
  "httpStatus": "OK"
}
```

---

### 1.7 Get Contract PDF URL

**GET** `/api/v1/contracts/{contractId}/pdf`

Get the PDF URL for a contract. Returns preview PDF if not signed, signed PDF if completed.

**Authentication**: Required (Only parties in the contract)

**Path Parameters**:
- `contractId`: Contract ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": "https://s3.amazonaws.com/bucket/contract_1001_signed.pdf",
  "httpStatus": "OK"
}
```

---

## 3. Payment Module API

### 3.1 Wallet API

Base Path: `/api/v1/wallets`

#### 3.1.1 Get Employer Wallet Summary

**GET** `/api/v1/wallets/employer/summary`

Get total spending and transaction count for employer.

**Authentication**: Required (EMPLOYER)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "totalSpent": 15000000,
    "transactionCount": 25
  },
  "httpStatus": "OK"
}
```

---

#### 3.1.2 Get Employer Transactions

**GET** `/api/v1/wallets/employer/transactions`

Get paginated transaction history for employer.

**Authentication**: Required (EMPLOYER)

**Query Parameters**:
- `referenceType` (default: "ALL"): Filter by type (CONTRACT, SUBSCRIPTION, REFUND, ALL)
- `page` (default: 1): Page number
- `size` (default: 10): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "items": [
      {
        "transactionId": 1,
        "type": "CONTRACT",
        "amount": 5000000,
        "description": "Contract payment for Project ABC",
        "createdAt": "2024-01-01T10:00:00",
        "referenceId": 1001
      }
    ],
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "size": 10
  },
  "httpStatus": "OK"
}
```

---

#### 3.1.3 Get Freelancer Wallet Summary

**GET** `/api/v1/wallets/freelancer/summary`

Get total received and pending amounts for freelancer.

**Authentication**: Required (FREELANCER)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "totalReceived": 8000000,
    "pendingAmount": 2000000,
    "transactionCount": 15
  },
  "httpStatus": "OK"
}
```

---

#### 3.1.4 Get Freelancer Transactions

**GET** `/api/v1/wallets/freelancer/transactions`

Get paginated transaction history for freelancer.

**Authentication**: Required (FREELANCER)

**Query Parameters**:
- `page` (default: 1): Page number
- `size` (default: 10): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "items": [
      {
        "transactionId": 1,
        "type": "PAYMENT",
        "amount": 500000,
        "description": "Monthly payment for Project ABC",
        "createdAt": "2024-01-25T10:00:00",
        "referenceId": 1001
      }
    ],
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "size": 10
  },
  "httpStatus": "OK"
}
```

---

#### 3.1.5 Get Platform Escrow Balance (Admin Only)

**GET** `/api/v1/wallets/platform/escrow`

Get platform escrow balance (funds held for freelancers).

**Authentication**: Required (ADMIN role only)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "walletType": "PLATFORM_ESCROW",
    "balance": 50000000
  },
  "httpStatus": "OK"
}
```

---

#### 3.1.6 Get Platform Revenue Balance (Admin Only)

**GET** `/api/v1/wallets/platform/revenue`

Get platform revenue balance (fees and subscription income).

**Authentication**: Required (ADMIN role only)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "walletType": "PLATFORM_REVENUE",
    "balance": 10000000
  },
  "httpStatus": "OK"
}
```

---

### 3.2 Employer Settlement API

Base Path: `/api/v1/settlements/employer`

#### 3.2.1 Get Employer Settlement List

**GET** `/api/v1/settlements/employer`

Get paginated settlement list for employer.

**Authentication**: Required (EMPLOYER)

**Query Parameters**:
- `status` (default: "ALL"): Filter by status (PAID, PENDING, DISBURSED, CANCELLED, ALL)
- `dateRange` (default: "ALL"): Date range filter (THIS_MONTH, LAST_MONTH, THIS_YEAR, ALL)
- `search` (optional): Search term
- `sort` (default: "DUE_DATE_ASC"): Sort order
- `page` (default: 1): Page number
- `size` (default: 10): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "items": [
      {
        "settlementId": 1,
        "contractId": 1001,
        "projectName": "Web Development Project",
        "amount": 500000,
        "status": "PAID",
        "dueDate": "2024-01-25",
        "paidDate": "2024-01-01T10:00:00"
      }
    ],
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 12,
    "size": 10
  },
  "httpStatus": "OK"
}
```

---

#### 3.2.2 Get Employer Settlement Summary

**GET** `/api/v1/settlements/employer/summary`

Get settlement statistics for employer.

**Authentication**: Required (EMPLOYER)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "totalPaid": 6000000,
    "completedCount": 12,
    "pendingAmount": 1000000
  },
  "httpStatus": "OK"
}
```

---

#### 3.2.3 Get Next Settlement Due

**GET** `/api/v1/settlements/employer/next`

Get the next upcoming settlement due date.

**Authentication**: Required (EMPLOYER)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "settlementId": 5,
    "contractId": 1001,
    "projectName": "Web Development Project",
    "amount": 500000,
    "dueDate": "2024-02-25"
  },
  "httpStatus": "OK"
}
```

---

#### 3.2.4 Get Settlement Detail

**GET** `/api/v1/settlements/employer/{settlementId}`

Get detailed settlement information.

**Authentication**: Required (EMPLOYER)

**Path Parameters**:
- `settlementId`: Settlement ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "settlementId": 1,
    "contractId": 1001,
    "projectName": "Web Development Project",
    "amount": 500000,
    "commissionRate": 0.05,
    "commissionAmount": 25000,
    "netAmount": 475000,
    "status": "PAID",
    "dueDate": "2024-01-25",
    "paidDate": "2024-01-01T10:00:00",
    "disbursedDate": "2024-01-25T10:00:00"
  },
  "httpStatus": "OK"
}
```

---

#### 3.2.5 Download Invoice PDF

**GET** `/api/v1/settlements/employer/{settlementId}/invoice`

Get invoice PDF URL (S3 pre-signed URL).

**Authentication**: Required (EMPLOYER)

**Path Parameters**:
- `settlementId`: Settlement ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": "https://s3.amazonaws.com/bucket/invoice_1.pdf",
  "httpStatus": "OK"
}
```

---

#### 3.2.6 Verify Payment (PortOne)

**POST** `/api/v1/settlements/employer/verify-payment`

Verify contract payment via PortOne and activate contract. Idempotent - returns existing result for duplicate calls.

**Authentication**: Required (EMPLOYER)

**Request Body**:
```json
{
  "paymentId": "payment_abc123xyz",
  "contractId": 1001
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "paymentId": "payment_abc123xyz",
    "contractId": 1001,
    "amount": 5000000,
    "status": "VERIFIED",
    "verifiedAt": "2024-01-01T10:00:00"
  },
  "httpStatus": "OK"
}
```

---

#### 3.2.7 Cancel Contract and Refund

**POST** `/api/v1/settlements/employer/cancel-refund`

Cancel contract and refund pending settlements via PortOne.

**Authentication**: Required (EMPLOYER)

**Query Parameters**:
- `contractId`: Contract ID to cancel
- `reason` (default: "계약 취소"): Cancellation reason

**Example Request**:
```
POST /api/v1/settlements/employer/cancel-refund?contractId=1001&reason=계약%20취소
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": null,
  "httpStatus": "OK"
}
```

---

### 3.3 Freelancer Settlement API

Base Path: `/api/v1/settlements/freelancer`

#### 3.3.1 Get Freelancer Settlement List

**GET** `/api/v1/settlements/freelancer`

Get paginated settlement list for freelancer.

**Authentication**: Required (FREELANCER)

**Query Parameters**:
- `status` (default: "ALL"): Filter by status (PENDING, PAID, CANCELLED, ALL)
- `dateRange` (default: "ALL"): Date range filter
- `search` (optional): Search term
- `sort` (default: "SCHEDULED_DATE_ASC"): Sort order
- `page` (default: 1): Page number
- `size` (default: 10): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "items": [
      {
        "settlementId": 1,
        "contractId": 1001,
        "projectName": "Web Development Project",
        "amount": 475000,
        "status": "PAID",
        "scheduledDate": "2024-01-25",
        "disbursedDate": "2024-01-25T10:00:00"
      }
    ],
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "size": 10
  },
  "httpStatus": "OK"
}
```

---

#### 3.3.2 Get Freelancer Settlement Summary

**GET** `/api/v1/settlements/freelancer/summary`

Get settlement statistics for freelancer.

**Authentication**: Required (FREELANCER)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "pendingAmount": 1000000,
    "totalReceived": 5000000,
    "receivedCount": 10
  },
  "httpStatus": "OK"
}
```

---

#### 3.3.3 Get Freelancer Settlement Detail

**GET** `/api/v1/settlements/freelancer/{settlementId}`

Get detailed settlement information for freelancer.

**Authentication**: Required (FREELANCER)

**Path Parameters**:
- `settlementId`: Settlement ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "settlementId": 1,
    "contractId": 1001,
    "projectName": "Web Development Project",
    "grossAmount": 500000,
    "commissionAmount": 25000,
    "netAmount": 475000,
    "status": "PAID",
    "scheduledDate": "2024-01-25",
    "disbursedDate": "2024-01-25T10:00:00"
  },
  "httpStatus": "OK"
}
```

---

#### 3.3.4 Download Receipt PDF

**GET** `/api/v1/settlements/freelancer/{settlementId}/receipt`

Get receipt PDF URL (S3 pre-signed URL).

**Authentication**: Required (FREELANCER)

**Path Parameters**:
- `settlementId`: Settlement ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": "https://s3.amazonaws.com/bucket/receipt_1.pdf",
  "httpStatus": "OK"
}
```

---

#### 3.3.5 Request Tax Invoice

**POST** `/api/v1/settlements/freelancer/{settlementId}/tax-invoice`

Request tax invoice for a paid settlement. Only allowed for PAID settlements.

**Authentication**: Required (FREELANCER)

**Path Parameters**:
- `settlementId`: Settlement ID

**Request Body**:
```json
{
  "businessRegistrationNumber": "123-45-67890",
  "businessName": "Freelancer Inc.",
  "representativeName": "Jane Smith",
  "businessAddress": "Seoul, Korea",
  "email": "jane@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "taxInvoiceId": 1,
    "settlementId": 1,
    "status": "REQUESTED",
    "requestedAt": "2024-01-26T10:00:00"
  },
  "httpStatus": "OK"
}
```

---

### 3.4 Subscription Billing API

Base Path: `/api/v1/subscriptions`

#### 3.4.1 Get Subscription Billing History

**GET** `/api/v1/subscriptions/billing-history`

Get paginated subscription billing history for employer.

**Authentication**: Required (EMPLOYER)

**Query Parameters**:
- `status` (default: "ALL"): Filter by status (SUCCESS, FAILED, PENDING, ALL)
- `page` (default: 1): Page number
- `size` (default: 10): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "items": [
      {
        "billingId": 1,
        "planType": "PRO",
        "amount": 29900,
        "status": "SUCCESS",
        "billedAt": "2024-01-01T00:00:00",
        "nextBillingDate": "2024-02-01"
      }
    ],
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 3,
    "size": 10
  },
  "httpStatus": "OK"
}
```

---

### 2.5 Internal Payment API (Subscription)

Base Path: `/api/v1/internal/payments`

#### 2.5.1 Process Subscription Payment

**POST** `/api/v1/internal/payments/subscription`

Process subscription payment after obtaining billing key from PortOne SDK.

**Authentication**: Required (EMPLOYER)

**Request Body**:
```json
{
  "planType": "PRO",
  "amount": 29900,
  "billingKey": "billing_key_abc123"
}
```

**Note**: `employerId` is extracted from JWT token, not from request body.

**Test Mode**:
- Test card: `4111 1111 1111 1111` (VISA)
- Expiry: Any future date (e.g., 12/26)
- CVC: Any 3 digits
- No actual payment is made in test mode

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "billingId": 1,
    "planType": "PRO",
    "amount": 29900,
    "status": "SUCCESS",
    "billedAt": "2024-01-01T10:00:00"
  },
  "httpStatus": "OK"
}
```

---

#### 3.5.2 Get Subscription Billing by ID

**GET** `/api/v1/internal/payments/subscription/{billingId}`

Get subscription billing record by ID.

**Authentication**: Required

**Path Parameters**:
- `billingId`: Billing ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "billingId": 1,
    "planType": "PRO",
    "amount": 29900,
    "status": "SUCCESS",
    "billedAt": "2024-01-01T00:00:00"
  },
  "httpStatus": "OK"
}
```

---

### 3.6 Webhook API

Base Path: `/api/v1/payments`

#### 2.6.1 PortOne Payment Webhook

**POST** `/api/v1/payments/webhook`

Receives payment notifications from PortOne.

**Authentication**: None (called by PortOne)

**Request Body**:
```json
{
  "type": "Transaction.Paid",
  "data": {
    "paymentId": "payment_abc123xyz"
  }
}
```

**Response** (200 OK):
```
OK
```

**Note**: This endpoint is for internal use and called by PortOne payment gateway. It verifies payments and updates settlement records.

---

### 3.7 Admin Settlement API

Base Path: `/api/v1/settlements`

**Note**: All endpoints require ADMIN role.

#### 2.7.1 Generate Settlements Manually

**POST** `/api/v1/settlements/generate`

Manually generate settlement records for a contract.

**Authentication**: Required (ADMIN role only)

**Query Parameters**:
- `contractId`: Contract ID

**Example Request**:
```
POST /api/v1/settlements/generate?contractId=1001
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": null,
  "httpStatus": "OK"
}
```

---

#### 2.7.2 Run Disbursement Scheduler

**POST** `/api/v1/settlements/disburse/run`

Manually trigger automatic disbursement for pending settlements.

**Authentication**: Required (ADMIN role only)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": null,
  "httpStatus": "OK"
}
```

---

#### 3.7.3 Cancel Contract Settlements

**POST** `/api/v1/settlements/cancel`

Cancel all pending settlements for a contract.

**Authentication**: Required (ADMIN role only)

**Query Parameters**:
- `contractId`: Contract ID

**Example Request**:
```
POST /api/v1/settlements/cancel?contractId=1001
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "contractId": 1001,
    "cancelledCount": 5,
    "totalRefundAmount": 2500000
  },
  "httpStatus": "OK"
}
```

---

#### 3.7.4 Get All Settlements (Admin)

**GET** `/api/v1/settlements/admin`

Get all settlement records with pagination.

**Authentication**: Required (ADMIN role only)

**Query Parameters**:
- `status` (default: "ALL"): Filter by status
- `page` (default: 1): Page number
- `size` (default: 10): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "items": [
      {
        "settlementId": 1,
        "contractId": 1001,
        "projectName": "Web Development Project",
        "amount": 500000,
        "status": "PAID",
        "dueDate": "2024-01-25",
        "paidDate": "2024-01-01T10:00:00"
      }
    ],
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 95,
    "size": 10
  },
  "httpStatus": "OK"
}
```

---

## 4. Common Response Format

All API endpoints follow this response structure:

```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": { },
  "httpStatus": "OK"
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "에러 메시지",
  "data": null,
  "httpStatus": "BAD_REQUEST"
}
```

### Common HTTP Status Codes

- `200 OK`: Success
- `201 CREATED`: Resource created successfully
- `400 BAD_REQUEST`: Invalid request
- `401 UNAUTHORIZED`: Authentication required
- `403 FORBIDDEN`: Insufficient permissions
- `404 NOT_FOUND`: Resource not found
- `409 CONFLICT`: Conflict (e.g., duplicate request)
- `500 INTERNAL_SERVER_ERROR`: Server error

---

## 5. Authentication Flow

1. **Login**: Call user login endpoint to get JWT token
2. **Store Token**: Save token in localStorage or secure storage
3. **Set Header**: Include token in all API requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```

---

## 6. Contract Status Flow

```
WAITING_SIGNATURE → IN_PROGRESS → COMPLETED
                  ↘ REJECTED
```

- **WAITING_SIGNATURE**: Created, waiting for both parties to sign
- **IN_PROGRESS**: Both parties signed, contract active
- **COMPLETED**: Employer marked as complete
- **REJECTED**: Either party rejected

---

## 7. Settlement Status Flow

### Employer Settlement:
```
PENDING → PAID → DISBURSED
         ↓
      CANCELLED
```

- **PENDING**: Created, waiting for payment
- **PAID**: Payment verified, held in escrow
- **DISBURSED**: Funds released to freelancer
- **CANCELLED**: Settlement cancelled, refund processed

### Freelancer Settlement:
```
PENDING → PAID
         ↓
      CANCELLED
```

- **PENDING**: Waiting for scheduled disbursement date
- **PAID**: Funds disbursed to freelancer
- **CANCELLED**: Settlement cancelled

---

## 8. Integration Notes

### CORS Configuration
Already configured to allow:
- Origin: `http://localhost:5173`
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Headers: All
- Credentials: Enabled

### PortOne Integration

**Frontend Flow**:
1. User initiates payment on frontend
2. Frontend calls PortOne SDK to get `paymentId` or `billingKey`
3. Frontend calls backend verification endpoint with `paymentId`
4. Backend verifies with PortOne API and processes payment

**Webhook Flow**:
1. PortOne sends webhook to `/api/v1/payments/webhook`
2. Backend verifies payment with PortOne API
3. Backend updates settlement records
4. Returns 200 OK to PortOne

### Recommended Frontend Libraries

**Axios Configuration**:
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## 9. Testing

### Quick Test Endpoints

**Health Check** (if available):
```bash
curl http://localhost:8080/actuator/health
```

**Test Contract Creation** (requires JWT):
```bash
curl -X POST http://localhost:8080/api/v1/contracts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Test Project",
    "freelancerId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "budget": 5000000,
    "paymentDay": 25,
    "jobDescription": "Test",
    "workLocation": "원격근무",
    "workStartTime": "09:00",
    "workEndTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00",
    "workDaysPerWeek": 5,
    "weeklyHoliday": "토, 일",
    "employerBusinessName": "Test Company",
    "employerAddress": "Seoul",
    "employerCEO": "John Doe",
    "freelancerAddress": "Seoul",
    "freelancerPhone": "010-1234-5678"
  }'
```

---

## 9. Environment Variables

Configure these in your Vue.js `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_PORTONE_CHANNEL_KEY=your_channel_key
VITE_PORTONE_API_SECRET=your_api_secret
```

---

This API specification should provide all the information needed to integrate your Vue.js frontend with the Contract and Payment modules of your backend.