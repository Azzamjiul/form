-- Create form_fields table
CREATE TABLE form_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  section_id UUID REFERENCES form_sections(id) ON DELETE SET NULL,
  content_type VARCHAR(50) NOT NULL,
  field_type VARCHAR(50),
  label TEXT NOT NULL,
  description TEXT,
  order_global INTEGER NOT NULL,
  order_in_section INTEGER,
  is_required BOOLEAN NOT NULL DEFAULT false,
  points INTEGER NOT NULL DEFAULT 0,
  answer_key JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT section_id_consistency CHECK (
    (section_id IS NOT NULL AND order_in_section IS NOT NULL) OR
    (section_id IS NULL AND order_in_section IS NULL)
  )
);

-- Create indexes
CREATE UNIQUE INDEX idx_form_fields_form_order ON form_fields(form_id, order_global);
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_section_id ON form_fields(section_id);
CREATE INDEX idx_form_fields_content_type ON form_fields(content_type);
CREATE INDEX idx_form_fields_created_at ON form_fields(created_at);
