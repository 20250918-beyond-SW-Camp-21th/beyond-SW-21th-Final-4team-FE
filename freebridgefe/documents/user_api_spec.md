# User Service API Specification

This document outlines the REST APIs exposed by the `UserController` in the `user-service` module.

## Base URL
`/api/users`

## Endpoints

### 1. Get All Users by Role
- **URL**: `/api/users`
- **Method**: `GET`
- **Description**: Retrieves a list of users, optionally filtered by role.
- **Query Parameters**:
  - `role` (String, Optional) - e.g. `FREELANCER` or `EMPLOYER`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "role": "FREELANCER",
        "termsAgreed": true,
        "privacyAgreed": true,
        "emailVerified": true,
        "createdAt": "2026-03-04T12:00:00"
      }
    ]
  }
  ```

---

### 2. User Registration (Signup)
- **URL**: `/api/users/signup`
- **Method**: `POST`
- **Description**: Registers a new user.
- **Request Body** (`SignupRequestDto`):
  ```json
  {
    "email": "user@example.com", // Required, valid email
    "password": "password123",   // Required
    "name": "John Doe",          // Required
    "role": "FREELANCER",        // Required (e.g., FREELANCER or EMPLOYER)
    "termsAgreed": true,         // Required
    "privacyAgreed": true        // Required
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "회원가입이 완료되었습니다.",
    "data": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "FREELANCER",
      "termsAgreed": true,
      "privacyAgreed": true,
      "emailVerified": false,
      "createdAt": "2026-03-04T12:00:00"
    }
  }
  ```
- **Error Response** (400 Bad Request):
  ```json
  {
    "success": false,
    "message": "Error message (e.g., Email already exists)"
  }
  ```

---

### 2. User Login
- **URL**: `/api/users/login`
- **Method**: `POST`
- **Description**: Authenticates a user and returns a JWT access token.
- **Request Body** (`LoginRequestDto`):
  ```json
  {
    "email": "user@example.com", // Required
    "password": "password123"    // Required
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "로그인 성공",
    "data": {
      "accessToken": "eyJhbGci...",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "role": "FREELANCER",
        "termsAgreed": true,
        "privacyAgreed": true,
        "emailVerified": true,
        "createdAt": "2026-03-04T12:00:00"
      },
      "grade": "JUNIOR" // Only present if role is FREELANCER
    }
  }
  ```
- **Error Response** (400 Bad Request):
  ```json
  {
    "success": false,
    "message": "Error message (e.g., Invalid credentials)"
  }
  ```

---

### 3. Check Email Duplication
- **URL**: `/api/users/check-email`
- **Method**: `GET`
- **Description**: Checks if an email is already in use.
- **Query Parameters**:
  - `email` (String, Required)
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "exists": false,
    "available": true
  }
  ```

---

### 4. Get User by ID
- **URL**: `/api/users/{id}`
- **Method**: `GET`
- **Description**: Retrieves user information by their ID.
- **Path Parameters**:
  - `id` (Long, Required)
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "FREELANCER",
      "termsAgreed": true,
      "privacyAgreed": true,
      "emailVerified": true,
      "createdAt": "2026-03-04T12:00:00"
    }
  }
  ```

---

### 5. Get User by Email
- **URL**: `/api/users/by-email`
- **Method**: `GET`
- **Description**: Retrieves user information by their email address.
- **Query Parameters**:
  - `email` (String, Required)
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      // UserResponseDto details
    }
  }
  ```

---

### 6. Test JWT Filter
- **URL**: `/api/users/me/test`
- **Method**: `GET`
- **Description**: Returns the authenticated user's details based on the JWT token.
- **Headers**:
  - `Authorization: Bearer <accessToken>`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "JWT 필터 해독 성공!",
    "data": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "FREELANCER",
      "grade": "JUNIOR"
    }
  }
  ```
- **Error Response** (401 Unauthorized):
  ```json
  {
    "success": false,
    "message": "인증 정보가 없습니다. (토큰 없음 또는 만료)"
  }
  ```
