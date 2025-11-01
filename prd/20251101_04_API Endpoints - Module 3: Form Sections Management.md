# API Endpoints - Module 3: Form Sections Management
## Base URL: `http://localhost:8080/api/v1`
## Authentication: Required (Bearer token)

---

## 3.1 Create Section

**Endpoint**: `POST /forms/{form_id}/sections`

**Description**: Add new section to form

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/sections \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Personal Information",
    "description": "Tell us about yourself",
    "order_global": 1,
    "visibility_type": "always",
    "prerequisite_section_id": null
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "section_id": "s1-uuid",
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "title": "Personal Information",
    "description": "Tell us about yourself",
    "order_global": 1,
    "visibility_type": "always",
    "prerequisite_section_id": null,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 3.2 Update Section

**Endpoint**: `PUT /forms/{form_id}/sections/{section_id}`

**Description**: Update section details

**Request**:
```bash
curl -X PUT http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/sections/s1-uuid \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Section Title",
    "description": "Updated description"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "section_id": "s1-uuid",
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "title": "Updated Section Title",
    "description": "Updated description",
    "order_global": 1,
    "visibility_type": "always",
    "prerequisite_section_id": null,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T11:00:00Z"
  },
  "error": null,
  "timestamp": "2025-01-20T11:00:00Z"
}
```

---

## 3.3 Delete Section

**Endpoint**: `DELETE /forms/{form_id}/sections/{section_id}`

**Description**: Delete section (fields become orphaned/standalone)

**Request**:
```bash
curl -X DELETE http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/sections/s1-uuid \
  -H "Authorization: Bearer {token}"
```

**Response (204 No Content)**:
```
(Empty body)
```

**Note**: Fields in this section will have section_id set to NULL (become standalone)

---

## 3.4 Get Section Details

**Endpoint**: `GET /forms/{form_id}/sections/{section_id}`

**Description**: Get section with all its fields

**Request**:
```bash
curl -X GET http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/sections/s1-uuid \
  -H "Authorization: Bearer {token}"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "section_id": "s1-uuid",
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "title": "Personal Information",
    "description": "Tell us about yourself",
    "order_global": 1,
    "visibility_type": "always",
    "prerequisite_section_id": null,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z",
    "fields": [
      {
        "field_id": "f1-uuid",
        "content_type": "input_field",
        "field_type": "text",
        "label": "Full Name",
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
        "order_global": 3,
        "order_in_section": 2,
        "is_required": true,
        "points": 0
      }
    ]
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 3.5 List All Sections

**Endpoint**: `GET /forms/{form_id}/sections`

**Description**: Get all sections in form (ordered)

**Request**:
```bash
curl -X GET http://localhost:8080/api/v1/forms/660f9511-f4bc-42d5-a826-557766551111/sections \
  -H "Authorization: Bearer {token}"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "section_id": "s1-uuid",
        "title": "Personal Information",
        "description": "Tell us about yourself",
        "order_global": 1,
        "visibility_type": "always",
        "prerequisite_section_id": null,
        "fields_count": 2
      },
      {
        "section_id": "s2-uuid",
        "title": "Employment Details",
        "description": "Tell us about your work",
        "order_global": 4,
        "visibility_type": "after_section",
        "prerequisite_section_id": "s1-uuid",
        "fields_count": 3
      },
      {
        "section_id": "s3-uuid",
        "title": "Additional Information",
        "description": null,
        "order_global": 8,
        "visibility_type": "always",
        "prerequisite_section_id": null,
        "fields_count": 0
      }
    ]
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## Section Visibility Types

**always**: Section shows immediately
- prerequisite_section_id must be NULL

**after_section**: Section shows after prerequisite completes
- prerequisite_section_id must reference another section
- Shows when all required fields in prerequisite section are answered
- Used for progressive disclosure / multi-step forms

**Future (Phase 2)**:
- `if_condition`: Show section based on field value condition

---
