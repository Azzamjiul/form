# API Endpoints - Module 5: Whitelist & Access Control
## Base URL: `http://localhost:8080/api/v1`
## Authentication: Required (Bearer token)

---

## 5.1 Create Whitelist Entry

**Endpoint**: `POST /forms/{form_id}/whitelist`

**Description**: Add single respondent access (usually from CRM)

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/whitelist \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "external_user_id": "CRM_USER_123",
    "email": "respondent@example.com",
    "name": "John Respondent",
    "max_attempts": 1,
    "expires_at": "2025-02-20T23:59:59Z",
    "metadata": {
      "department": "Sales",
      "manager": "Jane Manager",
      "employee_id": "EMP_456"
    }
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "whitelist_id": "w1-uuid",
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "access_token": "TjK9mL2pQ5wXyZ8vB3nM6kP",
    "external_user_id": "CRM_USER_123",
    "email": "respondent@example.com",
    "name": "John Respondent",
    "max_attempts": 1,
    "attempts_used": 0,
    "expires_at": "2025-02-20T23:59:59Z",
    "metadata": {
      "department": "Sales",
      "manager": "Jane Manager",
      "employee_id": "EMP_456"
    },
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z",
    "quiz_url": "http://localhost:3000/quiz/TjK9mL2pQ5wXyZ8vB3nM6kP"
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 5.2 Batch Create Whitelist

**Endpoint**: `POST /forms/{form_id}/whitelist/batch`

**Description**: Bulk add multiple respondents (CRM integration)

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/whitelist/batch \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [
      {
        "external_user_id": "CRM_USER_123",
        "email": "user1@example.com",
        "name": "User One",
        "max_attempts": 1,
        "expires_at": "2025-02-20T23:59:59Z",
        "metadata": {"department": "Sales"}
      },
      {
        "external_user_id": "CRM_USER_124",
        "email": "user2@example.com",
        "name": "User Two",
        "max_attempts": 2,
        "expires_at": "2025-02-20T23:59:59Z",
        "metadata": {"department": "Marketing"}
      }
    ]
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "created_count": 2,
    "failed_count": 0,
    "entries": [
      {
        "whitelist_id": "w1-uuid",
        "access_token": "TjK9mL2pQ5wXyZ8vB3nM6kP",
        "external_user_id": "CRM_USER_123",
        "email": "user1@example.com",
        "name": "User One",
        "quiz_url": "http://localhost:3000/quiz/TjK9mL2pQ5wXyZ8vB3nM6kP"
      },
      {
        "whitelist_id": "w2-uuid",
        "access_token": "AmK8nL3pR6xYzA9vC4nM7kQ",
        "external_user_id": "CRM_USER_124",
        "email": "user2@example.com",
        "name": "User Two",
        "quiz_url": "http://localhost:3000/quiz/AmK8nL3pR6xYzA9vC4nM7kQ"
      }
    ]
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 5.3 Get Whitelist Entry

**Endpoint**: `GET /forms/{form_id}/whitelist/{whitelist_id}`

**Description**: Get single whitelist entry details

**Request**:
```bash
curl -X GET http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/whitelist/w1-uuid \
  -H "Authorization: Bearer {token}"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "whitelist_id": "w1-uuid",
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "access_token": "TjK9mL2pQ5wXyZ8vB3nM6kP",
    "external_user_id": "CRM_USER_123",
    "email": "respondent@example.com",
    "name": "John Respondent",
    "max_attempts": 1,
    "attempts_used": 0,
    "expires_at": "2025-02-20T23:59:59Z",
    "is_expired": false,
    "can_attempt": true,
    "metadata": {
      "department": "Sales"
    },
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 5.4 List Whitelist Entries

**Endpoint**: `GET /forms/{form_id}/whitelist`

**Description**: Get all whitelist entries for form (paginated)

**Query Parameters**:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20)
- `sort_by`: 'created' or 'name' (default: 'created')

**Request**:
```bash
curl -X GET "http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/whitelist?page=1&per_page=20" \
  -H "Authorization: Bearer {token}"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "whitelist_id": "w1-uuid",
        "external_user_id": "CRM_USER_123",
        "email": "user1@example.com",
        "name": "User One",
        "max_attempts": 1,
        "attempts_used": 0,
        "expires_at": "2025-02-20T23:59:59Z",
        "is_expired": false,
        "can_attempt": true,
        "created_at": "2025-01-20T10:00:00Z"
      },
      {
        "whitelist_id": "w2-uuid",
        "external_user_id": "CRM_USER_124",
        "email": "user2@example.com",
        "name": "User Two",
        "max_attempts": 2,
        "attempts_used": 1,
        "expires_at": "2025-02-20T23:59:59Z",
        "is_expired": false,
        "can_attempt": true,
        "created_at": "2025-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_items": 2,
      "total_pages": 1
    }
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 5.5 Update Whitelist Entry

**Endpoint**: `PUT /forms/{form_id}/whitelist/{whitelist_id}`

**Description**: Update whitelist entry (extend expiry, adjust attempts)

**Request**:
```bash
curl -X PUT http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/whitelist/w1-uuid \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "max_attempts": 2,
    "expires_at": "2025-03-20T23:59:59Z",
    "metadata": {
      "department": "Sales",
      "notes": "Updated 2025-01-20"
    }
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "whitelist_id": "w1-uuid",
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "access_token": "TjK9mL2pQ5wXyZ8vB3nM6kP",
    "external_user_id": "CRM_USER_123",
    "email": "respondent@example.com",
    "name": "John Respondent",
    "max_attempts": 2,
    "attempts_used": 0,
    "expires_at": "2025-03-20T23:59:59Z",
    "is_expired": false,
    "can_attempt": true,
    "metadata": {
      "department": "Sales",
      "notes": "Updated 2025-01-20"
    },
    "updated_at": "2025-01-20T11:00:00Z"
  },
  "error": null,
  "timestamp": "2025-01-20T11:00:00Z"
}
```

---

## 5.6 Revoke Whitelist Entry

**Endpoint**: `DELETE /forms/{form_id}/whitelist/{whitelist_id}`

**Description**: Revoke access (prevent further quiz attempts)

**Request**:
```bash
curl -X DELETE http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/whitelist/w1-uuid \
  -H "Authorization: Bearer {token}"
```

**Response (204 No Content)**:
```
(Empty body)
```

**Note**: Revoked entry cannot be used to access quiz anymore

---

## 5.7 Validate Token (No Auth Required)

**Endpoint**: `GET /whitelist/validate/{access_token}`

**Description**: Check if token is valid (used by quiz taker)

**Request**:
```bash
curl -X GET http://localhost:8080/api/v1/whitelist/validate/TjK9mL2pQ5wXyZ8vB3nM6kP
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "is_valid": true,
    "whitelist_id": "w1-uuid",
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "external_user_id": "CRM_USER_123",
    "email": "respondent@example.com",
    "name": "John Respondent",
    "can_attempt": true,
    "attempts_remaining": 1,
    "expires_at": "2025-02-20T23:59:59Z",
    "form": {
      "form_id": "660f9511-f4bc-42d5-a826-557766551111",
      "title": "Customer Feedback Survey",
      "form_type": "survey",
      "time_limit_minutes": 0
    }
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

**Error (404)**:
```json
{
  "success": false,
  "data": {
    "is_valid": false
  },
  "error": {
    "code": "NOT_FOUND",
    "message": "Invalid or expired access token"
  },
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## Whitelist Validations

Before quiz start, check:
- ✅ Token valid (exists, not revoked)
- ✅ Not expired (expires_at >= now)
- ✅ Attempts available (attempts_used < max_attempts)
- ✅ Form published (is_published = true)

If any check fails: **DENY ACCESS**

---
