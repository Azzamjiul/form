# API Endpoints - Module 6: Quiz Taking
## Base URL: `http://localhost:8080/api/v1`

---

## Overview

These endpoints handle the quiz-taking experience:
- Session management
- Answer auto-save
- Timer management
- Quiz submission
- Result retrieval

**Status**: Phase 2 (Future) - Not in MVP Phase 1

---

## 6.1 Start Quiz Session

**Endpoint**: `POST /quiz/start`

**Description**: Initiate quiz session with whitelist token

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/quiz/start \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "TjK9mL2pQ5wXyZ8vB3nM6kP"
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "session_id": "sess-uuid",
    "session_token": "SESSION_TOKEN_XYZ",
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "whitelist_id": "w1-uuid",
    "started_at": "2025-01-20T10:00:00Z",
    "expires_at": "2025-01-20T10:30:00Z",
    "time_limit_minutes": 30,
    "form": {
      "title": "Customer Feedback Survey",
      "description": "Quick survey about your experience",
      "form_type": "survey",
      "shuffle_questions": false,
      "total_questions": 5
    }
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 6.2 Get Quiz Content

**Endpoint**: `GET /quiz/{session_id}/content`

**Description**: Get quiz questions for display

**Request**:
```bash
curl -X GET http://localhost:8080/api/v1/quiz/sess-uuid/content \
  -H "Authorization: Bearer {session_token}"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "session_id": "sess-uuid",
    "form": {
      "form_id": "660f9511-f4bc-42d5-a826-557766551111",
      "title": "Customer Feedback Survey",
      "form_type": "survey"
    },
    "sections": [
      {
        "section_id": "s1-uuid",
        "title": "Personal Information",
        "order_global": 1,
        "visibility_type": "always",
        "fields": [
          {
            "field_id": "f1-uuid",
            "content_type": "input_field",
            "field_type": "text",
            "label": "Full Name",
            "is_required": true,
            "order_in_section": 1
          }
        ]
      }
    ]
  },
  "error": null,
  "timestamp": "2025-01-20T10:00:00Z"
}
```

---

## 6.3 Auto-Save Answer

**Endpoint**: `POST /quiz/{session_id}/autosave`

**Description**: Save in-progress answer (debounced)

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/quiz/sess-uuid/autosave \
  -H "Authorization: Bearer {session_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "field_id": "f1-uuid",
    "answer_value": {
      "value": "John Doe"
    }
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "field_id": "f1-uuid",
    "last_saved_at": "2025-01-20T10:05:00Z",
    "message": "Answer saved"
  },
  "error": null,
  "timestamp": "2025-01-20T10:05:00Z"
}
```

---

## 6.4 Get Session Status

**Endpoint**: `GET /quiz/{session_id}/status`

**Description**: Check session status (time remaining, saved answers)

**Request**:
```bash
curl -X GET http://localhost:8080/api/v1/quiz/sess-uuid/status \
  -H "Authorization: Bearer {session_token}"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "session_id": "sess-uuid",
    "is_active": true,
    "started_at": "2025-01-20T10:00:00Z",
    "expires_at": "2025-01-20T10:30:00Z",
    "time_remaining_seconds": 1200,
    "answers_saved": 3,
    "total_fields": 5
  },
  "error": null,
  "timestamp": "2025-01-20T10:05:00Z"
}
```

---

## 6.5 Submit Quiz

**Endpoint**: `POST /quiz/{session_id}/submit`

**Description**: Submit completed quiz/survey

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/quiz/sess-uuid/submit \
  -H "Authorization: Bearer {session_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "field_id": "f1-uuid",
        "answer_value": {"value": "John Doe"}
      },
      {
        "field_id": "f2-uuid",
        "answer_value": {"value": "john@example.com"}
      }
    ]
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "response_id": "resp-uuid",
    "form_id": "660f9511-f4bc-42d5-a826-557766551111",
    "session_id": "sess-uuid",
    "submitted_at": "2025-01-20T10:10:00Z",
    "time_spent_seconds": 600,
    "was_auto_submitted": false,
    "score": null,
    "is_passed": null,
    "message": "Survey submitted successfully"
  },
  "error": null,
  "timestamp": "2025-01-20T10:10:00Z"
}
```

---

## 6.6 Get Quiz Result

**Endpoint**: `GET /quiz/result/{response_id}`

**Description**: Get quiz result and score (if quiz mode)

**Request**:
```bash
curl -X GET http://localhost:8080/api/v1/quiz/result/resp-uuid \
  -H "Authorization: Bearer {session_token}"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "response_id": "resp-uuid",
    "form": {
      "form_id": "660f9511-f4bc-42d5-a826-557766551111",
      "title": "General Knowledge Quiz",
      "form_type": "quiz",
      "passing_score": 70,
      "total_points": 100,
      "show_correct_answers": true
    },
    "result": {
      "score": 85,
      "is_passed": true,
      "time_spent_seconds": 600,
      "submitted_at": "2025-01-20T10:10:00Z",
      "answers": [
        {
          "field_id": "f1-uuid",
          "label": "What is 2+2?",
          "user_answer": "4",
          "is_correct": true,
          "points_earned": 10,
          "max_points": 10
        },
        {
          "field_id": "f2-uuid",
          "label": "What is the capital of France?",
          "user_answer": "Paris",
          "is_correct": true,
          "points_earned": 8,
          "max_points": 10
        }
      ]
    }
  },
  "error": null,
  "timestamp": "2025-01-20T10:10:00Z"
}
```

---

## 6.7 Resume Quiz Session

**Endpoint**: `POST /quiz/resume`

**Description**: Resume incomplete quiz (after disconnect)

**Request**:
```bash
curl -X POST http://localhost:8080/api/v1/quiz/resume \
  -H "Content-Type: application/json" \
  -d '{
    "session_token": "SESSION_TOKEN_XYZ"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "session_id": "sess-uuid",
    "is_resumed": true,
    "time_remaining_seconds": 1050,
    "saved_answers": {
      "f1-uuid": {"value": "John Doe"},
      "f2-uuid": {"value": "john@example.com"}
    },
    "message": "Quiz session resumed"
  },
  "error": null,
  "timestamp": "2025-01-20T10:06:00Z"
}
```

---

## Note: Phase 2 Only

These endpoints will be implemented in Phase 2 after:
- ✅ Form management (Module 1-5) complete
- ✅ Database working
- ✅ Authentication verified
- ✅ Whitelist system validated

**MVP Phase 1 Focus**: Modules 1-5 only (form creation & management)

---
