-- Add options column to form_fields table
ALTER TABLE form_fields ADD COLUMN options JSONB;

-- Create index for faster querying (optional but recommended)
CREATE INDEX idx_form_fields_options ON form_fields USING GIN (options);
