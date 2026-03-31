
-- Fix: set search_path to include extensions schema where pgcrypto lives
CREATE OR REPLACE FUNCTION public.verify_password(input_password text, stored_hash text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT stored_hash = crypt(input_password, stored_hash);
$$;
