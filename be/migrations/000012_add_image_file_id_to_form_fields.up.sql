ALTER TABLE form_fields
ADD COLUMN image_file_id VARCHAR(255) NULL;

CREATE INDEX idx_form_fields_image_file_id ON form_fields(image_file_id);