-- Create field_answers table
CREATE TABLE field_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES form_responses(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
  answer_value JSONB NOT NULL,
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_field_answers_response_id ON field_answers(response_id);
CREATE INDEX idx_field_answers_field_id ON field_answers(field_id);
CREATE INDEX idx_field_answers_response_field ON field_answers(response_id, field_id);
CREATE INDEX idx_field_answers_created_at ON field_answers(created_at);
