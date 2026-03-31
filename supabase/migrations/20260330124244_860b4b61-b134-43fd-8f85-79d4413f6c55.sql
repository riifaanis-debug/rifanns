
-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hash the existing plaintext password in app_users
UPDATE app_users 
SET password_hash = crypt(password_hash, gen_salt('bf'))
WHERE password_hash IS NOT NULL 
  AND password_hash NOT LIKE '$2a$%' 
  AND password_hash NOT LIKE '$2b$%';
