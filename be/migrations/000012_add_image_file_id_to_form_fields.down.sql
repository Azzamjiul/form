DROP INDEX IF EXISTS idx_form_fields_image_file_id;
ALTER TABLE form_fields DROP COLUMN IF EXISTS image_file_id;