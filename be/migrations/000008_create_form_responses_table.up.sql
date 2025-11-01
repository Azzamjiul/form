-- Create form_responses table
CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES form_sessions(id) ON DELETE CASCADE,
  whitelist_id UUID NOT NULL REFERENCES form_whitelist(id) ON DELETE CASCADE,
  score DECIMAL(5,2),
  is_passed BOOLEAN,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  was_auto_submitted BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX idx_form_responses_session_id ON form_responses(session_id);
CREATE INDEX idx_form_responses_whitelist_id ON form_responses(whitelist_id);
CREATE INDEX idx_form_responses_submitted_at ON form_responses(submitted_at);
CREATE INDEX idx_form_responses_is_passed ON form_responses(is_passed);
CREATE INDEX idx_form_responses_created_at ON form_responses(created_at);
