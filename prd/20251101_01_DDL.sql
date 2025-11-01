-- ============================================================================
-- PostgreSQL DDL - Create Tables for Google Form Clone MVP
-- Database: memotoko_forms
--
-- DESIGN PRINCIPLE:
-- - Database: Structural integrity only (UNIQUE, FK, NOT NULL, simple CHECK)
-- - Application: Complex business logic validation
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: users
-- Purpose: Store user accounts (form creators and admins)
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User credentials & info
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,

  -- Account status
  role VARCHAR(50) NOT NULL DEFAULT 'creator',
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP NULL
);

-- Indexes for common queries
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- TABLE 2: forms
-- Purpose: Store form/quiz configuration and metadata
-- ============================================================================

CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ownership
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Form information
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Form type (survey or quiz)
  form_type VARCHAR(50) NOT NULL,

  -- Quiz settings
  time_limit_minutes INTEGER NOT NULL DEFAULT 0,
  passing_score INTEGER,

  -- Display settings
  show_correct_answers BOOLEAN NOT NULL DEFAULT false,
  shuffle_questions BOOLEAN NOT NULL DEFAULT false,

  -- Publication status
  is_published BOOLEAN NOT NULL DEFAULT false,

  -- Calculated fields
  total_points INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Indexes for common queries
CREATE INDEX idx_forms_creator_id ON forms(creator_id);
CREATE INDEX idx_forms_is_published ON forms(is_published);
CREATE INDEX idx_forms_deleted_at ON forms(deleted_at);
CREATE INDEX idx_forms_created_at ON forms(created_at);

-- Business logic validation (APPLICATION LAYER):
-- - form_type: must be 'survey' or 'quiz'
-- - time_limit_minutes: must be >= 0
-- - passing_score: must be 0-100 if provided (quiz only)
-- - total_points: auto-calculated, sum of all field points

-- ============================================================================
-- TABLE 3: form_sections
-- Purpose: Store section/page breaks within forms
-- ============================================================================

CREATE TABLE form_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent form
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,

  -- Section content
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Ordering (global position in entire form)
  order_global INTEGER NOT NULL,

  -- Visibility control
  visibility_type VARCHAR(50) NOT NULL DEFAULT 'always',
  prerequisite_section_id UUID REFERENCES form_sections(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Structural constraints
  CONSTRAINT different_from_prerequisite CHECK (id != prerequisite_section_id)
);

-- Indexes for common queries
CREATE UNIQUE INDEX idx_form_sections_form_order ON form_sections(form_id, order_global);
CREATE INDEX idx_form_sections_form_id ON form_sections(form_id);
CREATE INDEX idx_form_sections_prerequisite_id ON form_sections(prerequisite_section_id);
CREATE INDEX idx_form_sections_created_at ON form_sections(created_at);

-- Business logic validation (APPLICATION LAYER):
-- - order_global: must be unique per form, >= 1
-- - visibility_type: must be 'always' or 'after_section'
-- - If visibility_type='always': prerequisite_section_id must be NULL
-- - If visibility_type='after_section': prerequisite_section_id must NOT be NULL
-- - prerequisite_section_id: must belong to same form
-- - Prevent circular dependencies

-- ============================================================================
-- TABLE 4: form_fields
-- Purpose: Store all form content items (input fields, display text, sections)
-- ============================================================================

CREATE TABLE form_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent form
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,

  -- Section assignment (nullable = standalone field)
  section_id UUID REFERENCES form_sections(id) ON DELETE SET NULL,

  -- Content type: what kind of item is this?
  -- 'input_field': question that gets answered
  -- 'section': section header/break
  -- 'display_text': static text for explanation
  content_type VARCHAR(50) NOT NULL,

  -- Field type (only populated for content_type='input_field')
  -- Options: text, multiple_choice, paragraph, checkbox, dropdown,
  --          date, time, file_upload, linear_scale, grid
  field_type VARCHAR(50),

  -- Content
  label TEXT NOT NULL,
  description TEXT,

  -- Ordering
  order_global INTEGER NOT NULL,
  order_in_section INTEGER,

  -- Field properties (for input fields)
  is_required BOOLEAN NOT NULL DEFAULT false,
  points INTEGER NOT NULL DEFAULT 0,

  -- Quiz configuration (for input fields in quiz mode)
  -- Stores answer key configuration in flexible JSON format
  answer_key JSONB,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Structural constraints
  CONSTRAINT section_id_consistency CHECK (
    (section_id IS NOT NULL AND order_in_section IS NOT NULL) OR
    (section_id IS NULL AND order_in_section IS NULL)
  )
);

-- Indexes for common queries
CREATE UNIQUE INDEX idx_form_fields_form_order ON form_fields(form_id, order_global);
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_section_id ON form_fields(section_id);
CREATE INDEX idx_form_fields_content_type ON form_fields(content_type);
CREATE INDEX idx_form_fields_created_at ON form_fields(created_at);

-- Business logic validation (APPLICATION LAYER):
-- - order_global: must be unique per form, >= 1
-- - order_in_section: if section_id NOT NULL, must be >= 1 and unique within section
-- - content_type: must be 'input_field', 'section', or 'display_text'
-- - If content_type='input_field':
--   * field_type must NOT be NULL and must be one of allowed types
--   * is_required must NOT be NULL (has value)
--   * answer_key optional (only for quiz)
-- - If content_type='section' or 'display_text':
--   * field_type must be NULL
--   * is_required must be false
--   * points must be 0
--   * answer_key must be NULL
-- - section_id: if provided, must reference section in same form

-- ============================================================================
-- TABLE 5: form_whitelist
-- Purpose: Control access to forms for respondents (CRM integration point)
-- ============================================================================

CREATE TABLE form_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent form
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,

  -- Access token (used in quiz URL)
  access_token VARCHAR(255) UNIQUE NOT NULL,

  -- CRM integration
  external_user_id VARCHAR(255) NOT NULL,

  -- Respondent information
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,

  -- Access control
  max_attempts INTEGER NOT NULL DEFAULT 1,
  attempts_used INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,

  -- Flexible CRM metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE UNIQUE INDEX idx_form_whitelist_access_token ON form_whitelist(access_token);
CREATE INDEX idx_form_whitelist_form_id ON form_whitelist(form_id);
CREATE INDEX idx_form_whitelist_external_user_id ON form_whitelist(external_user_id);
CREATE INDEX idx_form_whitelist_expires_at ON form_whitelist(expires_at);
CREATE INDEX idx_form_whitelist_email ON form_whitelist(email);
CREATE INDEX idx_form_whitelist_created_at ON form_whitelist(created_at);

-- Business logic validation (APPLICATION LAYER):
-- - access_token: must be unique across entire system
-- - max_attempts: must be >= 1
-- - attempts_used: must be >= 0 and <= max_attempts
-- - expires_at: must be in future
-- - Check attempt count before allowing quiz access
-- - Check expiry date before allowing quiz access

-- ============================================================================
-- TABLE 6: form_sessions
-- Purpose: Track active quiz sessions (for timer management and recovery)
-- ============================================================================

CREATE TABLE form_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  whitelist_id UUID NOT NULL REFERENCES form_whitelist(id) ON DELETE CASCADE,

  -- Session identification
  session_token VARCHAR(255) UNIQUE NOT NULL,

  -- Session timeline
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,

  -- Session state
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_activity_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Structural constraints
  CONSTRAINT expires_after_started CHECK (expires_at >= started_at)
);

-- Indexes for common queries
CREATE UNIQUE INDEX idx_form_sessions_session_token ON form_sessions(session_token);
CREATE INDEX idx_form_sessions_form_id ON form_sessions(form_id);
CREATE INDEX idx_form_sessions_whitelist_id ON form_sessions(whitelist_id);
CREATE INDEX idx_form_sessions_is_active ON form_sessions(is_active);
CREATE INDEX idx_form_sessions_expires_at ON form_sessions(expires_at);
CREATE INDEX idx_form_sessions_created_at ON form_sessions(created_at);

-- Business logic validation (APPLICATION LAYER):
-- - expires_at = started_at + form.time_limit_minutes
-- - Check if session is expired before allowing quiz continuation
-- - Prevent concurrent sessions for same whitelist entry
-- - Auto-end session on timeout

-- ============================================================================
-- TABLE 7: form_responses
-- Purpose: Store completed quiz/survey submissions
-- ============================================================================

CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES form_sessions(id) ON DELETE CASCADE,
  whitelist_id UUID NOT NULL REFERENCES form_whitelist(id) ON DELETE CASCADE,

  -- Scoring (for quiz mode)
  score DECIMAL(5,2),
  is_passed BOOLEAN,

  -- Submission details
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  was_auto_submitted BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX idx_form_responses_session_id ON form_responses(session_id);
CREATE INDEX idx_form_responses_whitelist_id ON form_responses(whitelist_id);
CREATE INDEX idx_form_responses_submitted_at ON form_responses(submitted_at);
CREATE INDEX idx_form_responses_is_passed ON form_responses(is_passed);
CREATE INDEX idx_form_responses_created_at ON form_responses(created_at);

-- Business logic validation (APPLICATION LAYER):
-- - time_spent_seconds: calculated from session start to submission
-- - was_auto_submitted: true if submitted by timeout, false if manual
-- - score: only populated for quiz responses
-- - is_passed: only populated for quiz responses (score >= passing_score)
-- - Increment attempts_used in form_whitelist after submission

-- ============================================================================
-- TABLE 8: field_answers
-- Purpose: Store individual answers to each question
-- ============================================================================

CREATE TABLE field_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  response_id UUID NOT NULL REFERENCES form_responses(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,

  -- The answer (flexible JSON format)
  answer_value JSONB NOT NULL,

  -- Scoring (for quiz mode)
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2),

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_field_answers_response_id ON field_answers(response_id);
CREATE INDEX idx_field_answers_field_id ON field_answers(field_id);
CREATE INDEX idx_field_answers_response_field ON field_answers(response_id, field_id);
CREATE INDEX idx_field_answers_created_at ON field_answers(created_at);

-- Business logic validation (APPLICATION LAYER):
-- - answer_value: format depends on field_type
--   * text: {"value": "text"}
--   * multiple_choice: {"selected_option_id": "uuid", "option_text": "..."}
--   * checkbox: {"selected_option_ids": ["uuid1", "uuid2"], ...}
--   * date: {"value": "2025-01-20", "formatted": "..."}
--   * etc.
-- - is_correct: calculated by comparing answer_value against answer_key (quiz only)
-- - points_earned: calculated based on answer correctness and field points (quiz only)

-- ============================================================================
-- TABLE 9: temp_answers
-- Purpose: Auto-saved draft answers during quiz taking
-- ============================================================================

CREATE TABLE temp_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  session_id UUID NOT NULL REFERENCES form_sessions(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,

  -- Temporary answer (same format as field_answers.answer_value)
  answer_value JSONB NOT NULL,

  -- Lifecycle
  last_saved_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Structural constraints
  CONSTRAINT unique_session_field UNIQUE (session_id, field_id),
  CONSTRAINT expires_after_saved CHECK (expires_at >= last_saved_at)
);

-- Indexes for common queries
CREATE UNIQUE INDEX idx_temp_answers_session_field ON temp_answers(session_id, field_id);
CREATE INDEX idx_temp_answers_session_id ON temp_answers(session_id);
CREATE INDEX idx_temp_answers_field_id ON temp_answers(field_id);
CREATE INDEX idx_temp_answers_expires_at ON temp_answers(expires_at);
CREATE INDEX idx_temp_answers_created_at ON temp_answers(created_at);

-- Business logic validation (APPLICATION LAYER):
-- - Only one temp_answer per (session_id, field_id) pair
-- - expires_at = session.expires_at (auto-delete when session expires)
-- - Move temp_answers → field_answers on final submission
-- - Clean up expired temp_answers periodically

-- ============================================================================
-- DATABASE-LEVEL INTEGRITY NOTES
-- ============================================================================

-- FOREIGN KEY CASCADE BEHAVIOR:
-- - Delete user → Delete all forms → Delete all sections, fields, whitelist, sessions, responses, answers
-- - Delete form → Delete all above
-- - Delete section → Set section_id=NULL for orphaned fields
-- - Delete session → Orphan temp_answers (expires_at will trigger cleanup)
-- - Delete whitelist → Delete all sessions for that whitelist entry

-- SOFT DELETE STRATEGY:
-- - Forms have deleted_at column for soft delete
-- - Query: WHERE deleted_at IS NULL to exclude deleted forms
-- - Allows restore capability if needed

-- TIMESTAMPS:
-- - All timestamps in UTC
-- - Use timezone-aware database client
-- - created_at: never updated
-- - updated_at: updated on any modification
-- - deleted_at: set once, never changed
-- - last_login_at: updated on login
-- - last_activity_at: updated on user activity during quiz
-- - last_saved_at: updated on auto-save
-- - submitted_at: set once, never changed

-- ============================================================================
-- BUSINESS LOGIC VALIDATION CHECKLIST (Application Layer)
-- ============================================================================

-- USERS & AUTHENTICATION:
-- [ ] Email format validation
-- [ ] Password strength validation (min 8 chars, complexity)
-- [ ] Password hashing (bcrypt, cost 10+)
-- [ ] JWT token generation and validation
-- [ ] Token expiry check

-- FORMS:
-- [ ] form_type: must be 'survey' or 'quiz'
-- [ ] time_limit_minutes: must be >= 0
-- [ ] passing_score: must be 0-100 if provided
-- [ ] total_points: auto-calculated, sum of field points
-- [ ] Only form creator can edit/delete
-- [ ] Cannot change form_type if published

-- FORM_SECTIONS:
-- [ ] order_global: must be unique per form, >= 1
-- [ ] If visibility_type='always': prerequisite_section_id IS NULL
-- [ ] If visibility_type='after_section': prerequisite_section_id IS NOT NULL
-- [ ] prerequisite_section_id: must be in same form
-- [ ] Prevent circular dependencies
-- [ ] Reordering: maintain contiguous order_global

-- FORM_FIELDS:
-- [ ] order_global: must be unique per form, >= 1
-- [ ] order_in_section: if section_id provided, must be >= 1
-- [ ] content_type: must be one of allowed types
-- [ ] If content_type='input_field':
--     [x] field_type must NOT be NULL
--     [x] field_type must be one of allowed types
--     [x] is_required must NOT be NULL
-- [ ] If content_type='section' or 'display_text':
--     [x] field_type must be NULL
--     [x] is_required must be false
--     [x] points must be 0
--     [x] answer_key must be NULL
-- [ ] points: if content_type='input_field' and form_type='quiz'

-- FORM_WHITELIST:
-- [ ] access_token: unique across entire system
-- [ ] max_attempts: >= 1
-- [ ] attempts_used: >= 0 and <= max_attempts
-- [ ] expires_at: check is not in past
-- [ ] external_user_id: not empty
-- [ ] Increment attempts_used on quiz submission

-- FORM_SESSIONS:
-- [ ] expires_at = started_at + form.time_limit_minutes
-- [ ] session_token: unique across entire system
-- [ ] Prevent concurrent sessions (same whitelist_id)
-- [ ] Check session not expired before allowing quiz continuation
-- [ ] Auto-submit if timeout reached
-- [ ] Update last_activity_at on user action

-- FORM_RESPONSES:
-- [ ] Only one response per session
-- [ ] Only create after all questions answered or timeout
-- [ ] time_spent_seconds: calculated from session timeline
-- [ ] For quiz mode:
--     [x] Calculate score from field_answers
--     [x] Set is_passed based on score >= passing_score
-- [ ] For survey mode:
--     [x] score and is_passed are NULL
-- [ ] Increment whitelist.attempts_used after submission

-- FIELD_ANSWERS:
-- [ ] answer_value: format must match field_type
-- [ ] For quiz mode:
--     [x] Calculate is_correct by comparing with answer_key
--     [x] Calculate points_earned based on correctness
-- [ ] For survey mode:
--     [x] is_correct and points_earned are NULL

-- TEMP_ANSWERS:
-- [ ] answer_value: format must match field_type
-- [ ] expires_at = session.expires_at
-- [ ] Debounce saves (max once per 30 seconds per field)
-- [ ] Move to field_answers on submission
-- [ ] Clean up expired entries (batch job)

-- ============================================================================
-- MIGRATION & DEPLOYMENT NOTES
-- ============================================================================

-- 1. Create database:
--    CREATE DATABASE memotoko_forms;
--    \c memotoko_forms

-- 2. Enable extension:
--    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Run this entire DDL script

-- 4. Verify tables created:
--    SELECT tablename FROM pg_tables WHERE schemaname='public';

-- 5. Check table structure:
--    \d users
--    \d forms
--    \d form_sections
--    \d form_fields
--    \d form_whitelist
--    \d form_sessions
--    \d form_responses
--    \d field_answers
--    \d temp_answers

-- 6. Create indexes (optional, done above):
--    \di

-- ============================================================================
-- END OF DDL SCRIPT
-- ============================================================================
