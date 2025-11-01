-- Create form_whitelist table
CREATE TABLE form_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  access_token VARCHAR(255) UNIQUE NOT NULL,
  external_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  attempts_used INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE UNIQUE INDEX idx_form_whitelist_access_token ON form_whitelist(access_token);
CREATE INDEX idx_form_whitelist_form_id ON form_whitelist(form_id);
CREATE INDEX idx_form_whitelist_external_user_id ON form_whitelist(external_user_id);
CREATE INDEX idx_form_whitelist_expires_at ON form_whitelist(expires_at);
CREATE INDEX idx_form_whitelist_email ON form_whitelist(email);
CREATE INDEX idx_form_whitelist_created_at ON form_whitelist(created_at);
