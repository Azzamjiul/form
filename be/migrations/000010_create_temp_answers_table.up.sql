-- Create temp_answers table
CREATE TABLE temp_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES form_sessions(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
  answer_value JSONB NOT NULL,
  last_saved_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_session_field UNIQUE (session_id, field_id),
  CONSTRAINT expires_after_saved CHECK (expires_at >= last_saved_at)
);

-- Create indexes
CREATE UNIQUE INDEX idx_temp_answers_session_field ON temp_answers(session_id, field_id);
CREATE INDEX idx_temp_answers_session_id ON temp_answers(session_id);
CREATE INDEX idx_temp_answers_field_id ON temp_answers(field_id);
CREATE INDEX idx_temp_answers_expires_at ON temp_answers(expires_at);
CREATE INDEX idx_temp_answers_created_at ON temp_answers(created_at);
