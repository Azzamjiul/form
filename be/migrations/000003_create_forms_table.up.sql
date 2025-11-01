-- Create forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  form_type VARCHAR(50) NOT NULL,
  time_limit_minutes INTEGER NOT NULL DEFAULT 0,
  passing_score INTEGER,
  show_correct_answers BOOLEAN NOT NULL DEFAULT false,
  shuffle_questions BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Create indexes
CREATE INDEX idx_forms_creator_id ON forms(creator_id);
CREATE INDEX idx_forms_is_published ON forms(is_published);
CREATE INDEX idx_forms_deleted_at ON forms(deleted_at);
CREATE INDEX idx_forms_created_at ON forms(created_at);
