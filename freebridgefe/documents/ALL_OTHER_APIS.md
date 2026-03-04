# Project API Specification (Excluding User Service)

This document outlines the REST APIs for all modules in the project, excluding the `UserController` which was documented separately.

---

## 1. Chatting Module

### `ChatMessageController` (STOMP WebSocket)
- `MESSAGE /chat/message`: (Client -> Server) 클라이언트에서 메시지 패킷 전송 시 수신

### `ChatRoomController` (`/api/chat/rooms`)
- `POST /api/chat/rooms`: 채팅방 생성 (본인이 포함된 채팅방만 생성 가능)
- `GET /api/chat/rooms`: 내 채팅방 목록 조회
- `GET /api/chat/rooms/{roomId}/messages`: 특정 채팅방의 이전 메시지 목록 조회 (Cursor Pagination)

---

## 2. Email Module

### `EmailController` (`/api/auth`)
- `POST /api/auth/send-verification`: 이메일 인증코드 발송
- `POST /api/auth/verify-email`: 이메일 인증코드 확인
- `POST /api/auth/resend-verification`: 인증코드 재발송

---

## 3. Matchs Module

### `MatchsController` (`/api/v1`)
**Employer (고용주)**
- `POST /api/v1/employer/proposals`: 프리랜서 제안 등록 (고용주 -> 프리랜서)
- `GET /api/v1/employer/proposals`: 발송한 제안 목록 조회
- `GET /api/v1/employer/proposals/{proposalId}`: 발송한 제안 상세 조회
- `GET /api/v1/employer/applications`: 받은 지원 목록 조회
- `GET /api/v1/employer/applications/{applicationId}`: 받은 지원 상세 조회
- `PATCH /api/v1/employer/agree/{applicationId}`: 지원 수락 및 프로젝트 생성
- `PATCH /api/v1/employer/deny/{applicationId}`: 지원 거절

**Freelancer (프리랜서)**
- `POST /api/v1/freelancer/application`: 프로젝트 지원 등록 (프리랜서 -> 프로젝트)
- `GET /api/v1/freelancer/application`: 내 지원 목록 조회
- `GET /api/v1/freelancer/application/{applicationId}`: 내 지원 상세 조회
- `GET /api/v1/freelancer/proposal`: 받은 제안 목록 조회
- `GET /api/v1/freelancer/proposal/{proposalId}`: 받은 제안 상세 조회
- `PATCH /api/v1/freelancer/agree/{proposalId}`: 제안 수락 및 프로젝트 생성
- `PATCH /api/v1/freelancer/deny/{proposalId}`: 제안 거절

---

## 4. Recruitment Module

### `JobPostingEmployerController` (`/api/v1/employer`)
- `GET /api/v1/employer/jobs`: 내 채용 공고 목록 조회
- `GET /api/v1/employer/project`: 고용주 자신의 프로젝트 조회
- `POST /api/v1/employer/jobs/post`: 새 채용 공고 등록
- `PUT /api/v1/employer/jobs/put`: 채용 공고 수정
- `DELETE /api/v1/employer/jobs/del`: 채용 공고 삭제

### `JobPostingFreelancerController` (`/api/v1/freelancer`)
- `GET /api/v1/freelancer/jobs`: 조건에 맞는 채용 공고 검색 및 목록 조회
- `POST /api/v1/freelancer/jobs/{jobPostingId}/like`: 관심 공고 등록 (Like)
- `DELETE /api/v1/freelancer/jobs/{jobPostingId}/like`: 관심 공고 해제

---

## 5. Review Module

### `EmployerReviewController` (`/api/v1/employer/reviews` & `/api/v1/employer/projects/{projectId}/reviews`)
- `GET /api/v1/employer/reviews`: 고용주가 받은 전체 후기 조회
- `GET /api/v1/employer/reviews/written`: 고용주가 작성한 전체 후기 조회
- `POST /api/v1/employer/projects/{projectId}/reviews`: 고용주 후기 작성
- `PUT /api/v1/employer/reviews/{reviewId}`: 고용주 후기 수정
- `DELETE /api/v1/employer/reviews/{reviewId}`: 고용주 후기 삭제

### `FreelancerReviewController` (`/api/v1/freelancer/reviews` & `/api/v1/freelancer/projects/{projectId}/reviews`)
- `GET /api/v1/freelancer/reviews`: 프리랜서가 받은 전체 리뷰 조회
- `GET /api/v1/freelancer/reviews/written`: 프리랜서가 작성한 전체 리뷰 조회
- `POST /api/v1/freelancer/projects/{projectId}/reviews`: 프리랜서 리뷰 작성
- `PUT /api/v1/freelancer/reviews/{reviewId}`: 프리랜서 리뷰 수정
- `DELETE /api/v1/freelancer/reviews/{reviewId}`: 프리랜서 리뷰 삭제

---

## 6. MyPage & UserLike Modules (User)

### `EmployerAccountController` (`/api/employer/mypage/account`)
- `GET /subscription`: 현재 구독 정보 조회
- `PUT /subscription`: 구독 플랜 변경 신청
- `PUT /password`: 비밀번호 변경
- `GET /notifications` & `PUT /notifications`: 알림 설정 조회 및 변경

### `EmployerProfileController` (`/api/employer/mypage/profile`)
- `GET /` & `PUT /`: 고용주 프로필 조회 및 수정
- `POST /logo`: 로고 이미지 S3 업로드 및 수정

### `EmployerProjectController` (`/api/employer/mypage/projects`)
- `GET /stats`: 누적 프로젝트 수 등 통계 조회
- `GET /`: 내 프로젝트 목록 조회
- `GET /{projectId}/applicants/status`: 특정 프로젝트 지원자 현황 조회

### `EmployerReviewController` (`/api/employer/mypage`)
- `GET /reviews/summary`: 평판 요약 평균 조회
- `GET /reviews`: 내게 남긴 리뷰 조회
- `GET /reputation/ai`: AI 신뢰도 점수 및 리포트 조회

### `FreelancerAccountController` (`/api/freelancer/mypage/account`)
- `GET /notifications` & `PUT /notifications`: 알림 설정 조회/수정
- `PUT /password`: 비밀번호 변경

### `FreelancerProfileController` (`/api/freelancer/mypage/profile`)
- `GET /` & `PUT /`: 프리랜서 프로필 조회/수정
- `POST /avatar`: 프로필 아바타 이미지 변경 (S3 업로드)

### `FreelancerProjectController` (`/api/freelancer/mypage/projects`)
- `GET /stats`: 상태별 프로젝트 통계 조회
- `GET /`: 내 지원 및 진행 프로젝트 목록 조회

### `FreelancerResumeController` (`/api/freelancer/mypage/resume`)
- `GET /`: 이력서 (학력/경력) 병합 조회

### `FreelancerReviewController` (`/api/freelancer/mypage/reviews`)
- `GET /summary`: 내 평판/등급 요약 평균 조회
- `GET /`: 고용주가 남긴 리뷰 목록 조회

### `EmployerFreelancerFavoriteController` (`/api/v1/employer/freelancers/{freelancerId}/like`)
- `POST /`: 프리랜서 즐겨찾기 등록
- `DELETE /`: 프리랜서 즐겨찾기 취소

---

## 7. Payment Module

### `AdminSettlementController` (`/api/v1/settlements` - Admin Only)
- `POST /generate`: 정산 레코드 수동 생성
- `POST /disburse/run`: 자동 지급 스케줄러 수동 실행
- `POST /cancel`: 계약 정산 취소
- `GET /admin`: 전체 정산 목록 조회

### `EmployerSettlementController` (`/api/v1/settlements/employer`)
- `GET /`: 고용주 정산 목록 조회
- `GET /summary`: 고용주 정산 통계 조회
- `GET /next`: 다음 정산 예정회차 조회
- `GET /{settlementId}`: 정산 상세 조회
- `GET /{settlementId}/invoice`: 청구서 PDF 다운로드 URL 반환
- `POST /verify-payment`: 계약 선불 결제 검증 (PortOne)
- `POST /cancel-refund`: 계약 취소 및 환불 요청

### `FreelancerSettlementController` (`/api/v1/settlements/freelancer`)
- `GET /`: 프리랜서 정산 목록 조회
- `GET /summary`: 프리랜서 정산 통계 조회
- `GET /{settlementId}`: 정산 상세 조회
- `GET /{settlementId}/receipt`: 지급 영수증 PDF 다운로드 URL 반환
- `POST /{settlementId}/tax-invoice`: 세금계산서 발행 요청

### `InternalPaymentController` (`/api/v1/internal/payments`)
- `POST /subscription`: 구독 결제 처리 (PortOne SDK 빌링키 전송받아 처리)
- `GET /subscription/{billingId}`: [Internal] 구독 결제 내역 단건 조회

### `SubscriptionBillingController` (`/api/v1/subscriptions`)
- `GET /billing-history`: 사용자 구독 결제 내역 조회 (Pagination)

### `WalletController` (`/api/v1/wallets`)
- `GET /employer/summary` & `GET /employer/transactions`: 고용주 지갑 요약 / 거래 내역
- `GET /freelancer/summary` & `GET /freelancer/transactions`: 프리랜서 지갑 요약 / 거래 내역
- `GET /platform/escrow` & `GET /platform/revenue`: 플랫폼 보유 에스크로/수익 조회 (Admin)

### `WebhookController` (`/api/v1/payments/webhook`)
- `POST /webhook`: 포트원 결제 / 결제 실패 등 웹훅 수신 핸들러

---

## 8. Contract Module

### `ContractController` (`/api/v1/contracts`)
- `POST /`: 계약 생성 (Employer 전용)
- `GET /`: 본인 관련 계약 목록 페이지네이션 조회
- `GET /{contractId}`: 계약 단건 상세 조회
- `PATCH /{contractId}/sign`: 계약 서명 (Employer / Freelancer 공통)
- `PATCH /{contractId}/complete`: 계약 완료 처리 (Employer 전용)
- `PATCH /{contractId}/reject`: 계약 거절 (Employer / Freelancer 공통)
- `GET /{contractId}/pdf`: 서명본/미리보기 PDF URL 조회
