-- Remove options column from form_fields table
DROP INDEX IF EXISTS idx_form_fields_options;
ALTER TABLE form_fields DROP COLUMN options;
