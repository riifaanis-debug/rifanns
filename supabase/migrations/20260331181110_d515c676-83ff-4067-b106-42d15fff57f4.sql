CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

INSERT INTO app_users (id, email, password_hash, role, full_name)
VALUES (
  'admin-001',
  'r.iifaanis@gmail.com',
  crypt('Rr123456', gen_salt('bf')),
  'admin',
  'مسؤول النظام'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash;