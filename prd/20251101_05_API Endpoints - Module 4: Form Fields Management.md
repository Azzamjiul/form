# API Endpoints - Module 4: Form Fields Management
## Base URL: `http://localhost:8080/api/v1`
## Authentication: Required (Bearer token)

---

## 4.1 Create Field

**Endpoint**: `POST /forms/{form_id}/fields`

**Description**: Add question or content to form

**Request (Input Field)**:
```bash
curl -X POST http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/fields \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "input_field",
    "field_type": "text",
    "label": "What is your full name?",
    "description": "Please enter your official name",
    "order_global": 2,
    "order_in_section": 1,
    "section_id": "s1-uuid",
    "is_required": true,
    "points": 0,
    "answer_key": null
  }'
```

**Request (Display Text)**:
```bash
curl -X POST http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/fields \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "display_text",
    "label": "This information will be kept confidential.",
    "order_global": 4,
    "order_in_section": 3,
    "section_id": "s1-uuid"
  }'
```

**Request (Section Break)**:
```bash
curl -X POST http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/fields \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "section",
    "label": "Employment Information",
    "description": "Tell us about your work",
    "order_global": 5
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "field_id": "f1-uuid",
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "content_type": "input_field",
    "field_type": "text",
    "label": "What is your full name?",
    "description": "Please enter your official name",
    "order_global": 2,
    "order_in_section": 1,
    "section_id": "s1-uuid",
    "is_required": true,
    "points": 0,
    "answer_key": null,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
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
    "message": "Input fields must specify field_type",
    "details": {
      "field": "field_type"
    }
  },
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 4.2 Update Field

**Endpoint**: `PUT /forms/{form_id}/fields/{field_id}`

**Description**: Update field/question details

**Request**:
```bash
curl -X PUT http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/fields/f1-uuid \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Updated question text",
    "description": "Updated help text",
    "is_required": false
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "field_id": "f1-uuid",
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "content_type": "input_field",
    "field_type": "text",
    "label": "Updated question text",
    "description": "Updated help text",
    "order_global": 2,
    "order_in_section": 1,
    "section_id": "s1-uuid",
    "is_required": false,
    "points": 0,
    "answer_key": null,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T11:00:00Z"
  },
  "error": null,
  "timestamp": "2025-01-20T11:00:00Z"
}
```

---

## 4.3 Delete Field

**Endpoint**: `DELETE /forms/{form_id}/fields/{field_id}`

**Description**: Delete field (associated answers also deleted)

**Request**:
```bash
curl -X DELETE http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/fields/f1-uuid \
  -H "Authorization: Bearer {token}"
```

**Response (204 No Content)**:
```
(Empty body)
```

---

## 4.4 Get Field Details

**Endpoint**: `GET /forms/{form_id}/fields/{field_id}`

**Description**: Get single field details

**Request**:
```bash
curl -X GET http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/fields/f1-uuid \
  -H "Authorization: Bearer {token}"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "field_id": "f1-uuid",
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "content_type": "input_field",
    "field_type": "text",
    "label": "What is your full name?",
    "description": "Please enter your official name",
    "order_global": 2,
    "order_in_section": 1,
    "section_id": "s1-uuid",
    "is_required": true,
    "points": 0,
    "answer_key": null,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 4.5 List Form Fields

**Endpoint**: `GET /forms/{form_id}/fields`

**Description**: Get all fields in form (ordered by order_global)

**Request**:
```bash
curl -X GET http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/fields \
  -H "Authorization: Bearer {token}"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "fields": [
      {
        "field_id": "s1-uuid",
        "content_type": "section",
        "label": "Personal Information",
        "order_global": 1,
        "section_id": null
      },
      {
        "field_id": "f1-uuid",
        "content_type": "input_field",
        "field_type": "text",
        "label": "What is your full name?",
        "order_global": 2,
        "order_in_section": 1,
        "section_id": "s1-uuid",
        "is_required": true,
        "points": 0
      },
      {
        "field_id": "f2-uuid",
        "content_type": "input_field",
        "field_type": "email",
        "label": "What is your email?",
        "order_global": 3,
        "order_in_section": 2,
        "section_id": "s1-uuid",
        "is_required": true,
        "points": 0
      },
      {
        "field_id": "f3-uuid",
        "content_type": "display_text",
        "label": "Email will be used for confirmation",
        "order_global": 4,
        "section_id": "s1-uuid"
      }
    ]
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 4.6 Reorder Fields

**Endpoint**: `PATCH /forms/{form_id}/fields/reorder`

**Description**: Reorder fields (change order_global and section assignments)

**Request**:
```bash
curl -X PATCH http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/fields/reorder \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "field_id": "s1-uuid",
        "order_global": 1,
        "section_id": null,
        "order_in_section": null
      },
      {
        "field_id": "f2-uuid",
        "order_global": 2,
        "section_id": "s1-uuid",
        "order_in_section": 1
      },
      {
        "field_id": "f1-uuid",
        "order_global": 3,
        "section_id": "s1-uuid",
        "order_in_section": 2
      },
      {
        "field_id": "f3-uuid",
        "order_global": 4,
        "section_id": "s1-uuid",
        "order_in_section": 3
      },
      {
        "field_id": "s2-uuid",
        "order_global": 5,
        "section_id": null,
        "order_in_section": null
      }
    ]
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "field_id": "s1-uuid",
        "order_global": 1,
        "section_id": null,
        "order_in_section": null
      },
      {
        "field_id": "f2-uuid",
        "order_global": 2,
        "section_id": "s1-uuid",
        "order_in_section": 1
      },
      {
        "field_id": "f1-uuid",
        "order_global": 3,
        "section_id": "s1-uuid",
        "order_in_section": 2
      },
      {
        "field_id": "f3-uuid",
        "order_global": 4,
        "section_id": "s1-uuid",
        "order_in_section": 3
      },
      {
        "field_id": "s2-uuid",
        "order_global": 5,
        "section_id": null,
        "order_in_section": null
      }
    ],
    "message": "Fields reordered successfully"
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## Supported Field Types

**content_type: 'input_field'**
- field_type: text, multiple_choice, paragraph, checkbox, dropdown, date, time, file_upload, linear_scale, grid

**content_type: 'section'**
- For section breaks/headers only
- field_type: NULL
- is_required: false
- points: 0

**content_type: 'display_text'**
- For explanatory text only
- field_type: NULL
- is_required: false
- points: 0

---
