# API Endpoints - Module 2: Form Management
## Base URL: `http://localhost:8080/api/v1`
## Authentication: Required (Bearer token)

---

## 2.1 Create Form

**Endpoint**: `POST /forms`

**Description**: Create new form (survey or quiz)

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/forms \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Customer Feedback Survey",
    "description": "Quick survey about your experience",
    "form_type": "survey",
    "time_limit_minutes": 0,
    "show_correct_answers": false,
    "shuffle_questions": false
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "title": "Customer Feedback Survey",
    "description": "Quick survey about your experience",
    "form_type": "survey",
    "creator_id": "550e8400-e29b-41d4-a716-446655440000",
    "time_limit_minutes": 0,
    "passing_score": null,
    "show_correct_answers": false,
    "shuffle_questions": false,
    "is_published": false,
    "total_points": 0,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 2.2 Get Single Form

**Endpoint**: `GET /forms/{form_id}`

**Description**: Get form details with all sections and fields

**Request**:
```bash
curl -X GET http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111 \
  -H "Authorization: Bearer {token}"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "title": "Customer Feedback Survey",
    "description": "Quick survey about your experience",
    "form_type": "survey",
    "creator_id": "550e8400-e29b-41d4-a716-446655440000",
    "time_limit_minutes": 0,
    "passing_score": null,
    "show_correct_answers": false,
    "shuffle_questions": false,
    "is_published": false,
    "total_points": 0,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z",
    "sections": [
      {
        "section_id": "s1-uuid",
        "title": "Personal Information",
        "description": "Tell us about you",
        "order_global": 1,
        "visibility_type": "always",
        "prerequisite_section_id": null,
        "fields": [
          {
            "field_id": "f1-uuid",
            "content_type": "input_field",
            "field_type": "text",
            "label": "Full Name",
            "description": null,
            "order_global": 2,
            "order_in_section": 1,
            "is_required": true,
            "points": 0
          },
          {
            "field_id": "f2-uuid",
            "content_type": "input_field",
            "field_type": "email",
            "label": "Email",
            "description": null,
            "order_global": 3,
            "order_in_section": 2,
            "is_required": true,
            "points": 0
          }
        ]
      }
    ]
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

**Error (403)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "You don't have permission to access this form"
  },
  "timestamp": "2025-01-20T10:00:00Z"
}
```

**Error (404)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Form not found"
  },
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 2.3 Update Form

**Endpoint**: `PUT /forms/{form_id}`

**Description**: Update form settings (partial update)

**Request**:
```bash
curl -X PUT http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Form Title",
    "description": "Updated description",
    "time_limit_minutes": 30,
    "show_correct_answers": true
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "title": "Updated Form Title",
    "description": "Updated description",
    "form_type": "survey",
    "creator_id": "550e8400-e29b-41d4-a716-446655440000",
    "time_limit_minutes": 30,
    "passing_score": null,
    "show_correct_answers": true,
    "shuffle_questions": false,
    "is_published": false,
    "total_points": 0,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T11:00:00Z"
  },
  "error": null,
  "timestamp": "2025-01-20T11:00:00Z"
}
```

---

## 2.4 List User Forms

**Endpoint**: `GET /forms`

**Description**: Get all forms created by current user (paginated)

**Query Parameters**:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)
- `sort_by`: 'created' or 'modified' (default: 'modified')
- `order`: 'asc' or 'desc' (default: 'desc')

**Request**:
```bash
curl -X GET "http://localhost:8080/api/v1/forms?page=1&per_page=10&sort_by=modified&order=desc" \
  -H "Authorization: Bearer {token}"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "forms": [
      {
        "form_id": "660f9511-f4bc-42d5-a826-557766551111",
        "title": "Customer Feedback Survey",
        "description": "Quick survey about your experience",
        "form_type": "survey",
        "is_published": false,
        "response_count": 0,
        "total_questions": 5,
        "created_at": "2025-01-20T10:00:00Z",
        "updated_at": "2025-01-20T11:00:00Z"
      },
      {
        "form_id": "770g0622-g5cd-53e6-b937-668877662222",
        "title": "Quiz: General Knowledge",
        "description": "Test your knowledge",
        "form_type": "quiz",
        "is_published": true,
        "response_count": 25,
        "total_questions": 10,
        "created_at": "2025-01-19T14:00:00Z",
        "updated_at": "2025-01-19T15:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total_items": 2,
      "total_pages": 1
    }
  },
  "error": null,
  "timestamp": "2025-01-20T11:00:00Z"
}
```

---

## 2.5 Delete Form

**Endpoint**: `DELETE /forms/{form_id}`

**Description**: Delete form (soft delete)

**Request**:
```bash
curl -X DELETE http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111 \
  -H "Authorization: Bearer {token}"
```

**Response (204 No Content)**:
```
(Empty body)
```

**Error (403)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "You don't have permission to delete this form"
  },
  "timestamp": "2025-01-20T11:00:00Z"
}
```

---

## 2.6 Duplicate Form

**Endpoint**: `POST /forms/{form_id}/duplicate`

**Description**: Create a copy of form with all settings and questions

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/duplicate \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "new_title": "Customer Feedback Survey - Copy"
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "form_id": "880h1733-h6de-64f7-c948-779988773333",
    "title": "Customer Feedback Survey - Copy",
    "description": "Quick survey about your experience",
    "form_type": "survey",
    "creator_id": "550e8400-e29b-41d4-a716-446655440000",
    "time_limit_minutes": 0,
    "passing_score": null,
    "show_correct_answers": false,
    "shuffle_questions": false,
    "is_published": false,
    "total_points": 0,
    "created_at": "2025-01-20T11:30:00Z",
    "updated_at": "2025-01-20T11:30:00Z",
    "message": "Form duplicated successfully with all sections and fields"
  },
  "error": null,
  "timestamp": "2025-01-20T11:30:00Z"
}
```

---

## 2.7 Publish Form

**Endpoint**: `PATCH /forms/{form_id}/publish`

**Description**: Publish form (make it available for respondents)

**Request**:
```bash
curl -X PATCH http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/publish \
  -H "Authorization: Bearer {token}"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "title": "Customer Feedback Survey",
    "is_published": true,
    "published_at": "2025-01-20T12:00:00Z",
    "message": "Form published successfully"
  },
  "error": null,
  "timestamp": "2025-01-20T12:00:00Z"
}
```

**Error (400)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot publish form without at least one question"
  },
  "timestamp": "2025-01-20T12:00:00Z"
}
```

---

## Form Response Format Notes

**form_type**: 'survey' or 'quiz'
- Survey: No scoring, no time limit requirement
- Quiz: Requires passing_score, time_limit_minutes, scoring logic

**is_published**: false = draft, true = available for respondents

**response_count**: Number of completed submissions

---
