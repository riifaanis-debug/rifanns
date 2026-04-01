ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  user_id text REFERENCES public.app_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on otp_codes" ON public.otp_codes
  FOR ALL USING (true) WITH CHECK (true);