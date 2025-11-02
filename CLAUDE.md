# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack form builder and quiz management application with:
- **Backend (be/)**: Go REST API using Gin framework, PostgreSQL, GORM ORM, and Uber FX for dependency injection
- **Frontend (fe/)**: React + TypeScript with Vite, React Query, Ky HTTP client, and Tailwind CSS

The application supports creating surveys/quizzes, managing form fields/sections, whitelist-based access control, quiz sessions with timers, auto-save functionality, and scoring.

## Development Commands

### Backend (Go)

```bash
cd be

# Run the server (requires PostgreSQL running)
go run main.go

# Build the application
go build -o form-api

# Install dependencies
go mod tidy

# Generate Swagger docs (after adding/modifying API endpoints)
swag init

# Run database migrations (requires golang-migrate)
migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/form?sslmode=disable" up
migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/form?sslmode=disable" down
```

### Frontend (React)

```bash
cd fe

# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture Patterns

### Backend Architecture

**Dependency Injection (Uber FX)**
- All services, handlers, and utilities are wired via `main.go` using Uber FX
- When adding new components: add to `fx.Provide()` in main.go in dependency order
- Services depend on `*gorm.DB`, handlers depend on services, router depends on handlers

**Layered Architecture**
```
handlers/ (HTTP layer)
    ↓ calls
services/ (Business logic)
    ↓ uses
models/ (Database entities + DTOs)
```

**Key Patterns:**
- **DTOs**: Separate request/response types in `*_dto.go` files (e.g., `whitelist_dto.go`, `quiz_dto.go`)
- **Response Wrapper**: All API responses use `models.APIResponse` with `success`, `data`, `error`, `timestamp`
- **Error Handling**: Use `models.NewErrorResponse()` and `models.NewSuccessResponse()` for consistent responses
- **Authentication**: JWT tokens with automatic refresh (15min access, 7day refresh). Use `middleware.AuthMiddleware()` for protected routes

**Database Models**
- All models use UUIDs (via `github.com/google/uuid`)
- GORM tags define schema, relationships, and indexes
- Soft deletes via `DeletedAt` field (not all tables)
- JSON fields use `gorm.io/datatypes.JSON` for metadata and answer storage

**Module Structure:**
1. **Auth Module**: User registration, login, JWT management
2. **Form Management**: CRUD for forms (surveys/quizzes)
3. **Form Sections**: Organize fields into sections with conditional visibility
4. **Form Fields**: Individual questions/inputs with various field types
5. **Whitelist & Access Control**: Token-based access with CRM integration
6. **Quiz Taking**: Session management, auto-save, scoring, time limits

### Frontend Architecture

**API Client Pattern**
- Uses `ky` HTTP client with automatic JWT refresh in `utils/api.ts`
- All API modules in `features/forms/api/` export functions that return typed data
- Token storage in localStorage: `access_token`, `refresh_token`, `user`

**State Management**
- React Query (`@tanstack/react-query`) for server state
- Local component state with `useState` for UI state
- No global state management library

**Component Organization**
```
features/forms/
├── api/           # API client functions
├── components/    # React components
└── types/         # TypeScript types matching backend DTOs
```

**Key Component Patterns:**
- **Dialog Components**: Modal dialogs follow pattern in `CreateFormDialog.tsx` - controlled open/close, form state management
- **Management Components**: Table/list views with pagination (e.g., `WhitelistManagement.tsx`)
- **Multi-stage Flows**: Quiz flow uses state machine pattern: `QuizStartPage` → `QuizTakingInterface` → `QuizResultDisplay`

## Critical Implementation Details

### Authentication Flow

Backend uses dual-token JWT:
- Access token: 15 minutes (in Authorization header)
- Refresh token: 7 days (used to get new access token)

Frontend `api.ts` automatically:
1. Adds access token to all requests
2. Intercepts 401 responses
3. Attempts refresh with refresh token
4. Retries original request or redirects to login

### Quiz Session Security

Quiz endpoints use **session tokens** (not user JWT):
- Start quiz returns `session_token` (separate from user auth)
- Session token passed in Authorization header for quiz operations
- Session tokens expire based on quiz time limit
- Prevents quiz access without valid whitelist entry

### Whitelist Access Tokens

- Generated via `crypto/rand` (32 bytes, base64 encoded)
- Stored in `form_whitelist.access_token` with unique index
- Public validation endpoint (no auth): `/api/v1/whitelist/validate/{access_token}`
- Validation checks: token exists, not expired, attempts remaining, form published

### Auto-Save Mechanism

Frontend debounces auto-save (2 seconds) in `QuizTakingInterface`:
- Tracks answers in local state
- useEffect with timeout sends to `/quiz/{session_id}/autosave`
- Backend stores in `temp_answers` table with session+field composite key
- On submit, temp answers deleted and moved to `field_answers`

### Scoring Logic (Quiz Mode)

Backend `quiz_service.go` `calculateScore()`:
1. Loads all fields for form with `content_type = 'input_field'`
2. Compares user answers against `answer_key` JSON field
3. Awards points based on `field.Points` if correct
4. Calculates percentage: `(totalScore / maxScore) * 100`
5. Compares to `form.passing_score` to determine pass/fail

## Environment Configuration

### Backend (.env)

```bash
SERVER_PORT=8080
DATABASE_URL=postgres://postgres:postgres@localhost:5432/form?sslmode=disable
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=168h
```

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Database Migrations

Migrations are in `be/migrations/` numbered sequentially. Run all migrations before starting:

```bash
migrate -path be/migrations -database "$DATABASE_URL" up
```

**Migration order:**
1. Enable UUID extension
2. Users table
3. Forms table
4. Form sections table
5. Form fields table
6. Form whitelist table
7. Form sessions table
8. Form responses table
9. Field answers table
10. Temp answers table

## API Documentation

Swagger docs available at:
- Swagger UI: `http://localhost:8080/swagger/index.html`
- Scalar UI: `http://localhost:8080/docs`

After modifying API endpoints, regenerate docs:
```bash
cd be
swag init
```

## Adding New Features

### Backend: New API Endpoint

1. Create DTOs in `models/*_dto.go`
2. Implement service logic in `services/*_service.go`
3. Create handler in `handlers/*_handler.go` with Swagger annotations
4. Add route in `handlers/router.go`
5. Wire dependencies in `main.go` `fx.Provide()`
6. Run `swag init` to update docs

### Frontend: New API Integration

1. Add TypeScript types to `features/forms/types/index.ts`
2. Create API client functions in `features/forms/api/*.ts`
3. Build React components in `features/forms/components/`
4. Export from `components/index.ts`

## Common Gotchas

- **CORS**: Backend has permissive CORS (`*`) in `router.go` - restrict in production
- **Time Formats**: Backend uses RFC3339 strings. Frontend must parse/convert datetimes
- **UUID Parsing**: Always validate UUID format before database queries (use `uuid.Parse()`)
- **GORM Soft Deletes**: Query with `WHERE deleted_at IS NULL` to exclude soft-deleted records
- **Session Expiry**: Quiz sessions auto-submit when time expires (handled client-side by `QuizTimer`)
- **Metadata Fields**: Use `datatypes.JSON` type for flexible JSON storage (whitelist metadata, answer values)
- kalo mau test cukup build aja, buat testing aku test lgsg sneidiri jadi ga perlu jalanin fe dan be server buat testing
- always use makefiel for backend build or wag init or something