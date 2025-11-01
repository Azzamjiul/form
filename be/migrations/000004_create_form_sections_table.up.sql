-- Create form_sections table
CREATE TABLE form_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_global INTEGER NOT NULL,
  visibility_type VARCHAR(50) NOT NULL DEFAULT 'always',
  prerequisite_section_id UUID REFERENCES form_sections(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT different_from_prerequisite CHECK (id != prerequisite_section_id)
);

-- Create indexes
CREATE UNIQUE INDEX idx_form_sections_form_order ON form_sections(form_id, order_global);
CREATE INDEX idx_form_sections_form_id ON form_sections(form_id);
CREATE INDEX idx_form_sections_prerequisite_id ON form_sections(prerequisite_section_id);
CREATE INDEX idx_form_sections_created_at ON form_sections(created_at);
