# API Endpoints - Module 1: Authentication
## Base URL: `http://localhost:8080/api/v1`

---

## 1.1 Register User

**Endpoint**: `POST /auth/register`

**Description**: Create new user account (form creator)

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "creator",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "created_at": "2025-01-20T10:00:00Z"
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

**Error (400)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already exists",
    "details": {
      "field": "email"
    }
  },
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 1.2 Login User

**Endpoint**: `POST /auth/login`

**Description**: Authenticate user and get tokens

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "creator",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "last_login_at": "2025-01-20T10:00:00Z"
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

**Error (401)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid email or password"
  },
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 1.3 Refresh Token

**Endpoint**: `POST /auth/refresh`

**Description**: Get new access token using refresh token

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

**Error (401)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Refresh token expired or invalid"
  },
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 1.4 Logout

**Endpoint**: `POST /auth/logout`

**Description**: Invalidate tokens (client-side mainly, optional server-side blacklist)

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

**Error (401)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or missing token"
  },
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 1.5 Get Current User

**Endpoint**: `GET /auth/me`

**Description**: Get current authenticated user info

**Request**:
```bash
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "creator",
    "created_at": "2025-01-20T08:00:00Z",
    "last_login_at": "2025-01-20T10:00:00Z"
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

**Error (401)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token"
  },
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## Authentication Headers

**All authenticated endpoints require**:
```bash
Authorization: Bearer {access_token}
```

**Token expiry**:
- Access token: 15 minutes
- Refresh token: 7 days

---
