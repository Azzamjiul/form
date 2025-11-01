-- Create form_sessions table
CREATE TABLE form_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  whitelist_id UUID NOT NULL REFERENCES form_whitelist(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_activity_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT expires_after_started CHECK (expires_at >= started_at)
);

-- Create indexes
CREATE UNIQUE INDEX idx_form_sessions_session_token ON form_sessions(session_token);
CREATE INDEX idx_form_sessions_form_id ON form_sessions(form_id);
CREATE INDEX idx_form_sessions_whitelist_id ON form_sessions(whitelist_id);
CREATE INDEX idx_form_sessions_is_active ON form_sessions(is_active);
CREATE INDEX idx_form_sessions_expires_at ON form_sessions(expires_at);
CREATE INDEX idx_form_sessions_created_at ON form_sessions(created_at);
