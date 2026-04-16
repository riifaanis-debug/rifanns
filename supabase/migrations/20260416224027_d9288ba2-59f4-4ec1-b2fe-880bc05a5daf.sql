-- Table for storing user WebAuthn credentials (public keys)
CREATE TABLE public.webauthn_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  transports JSONB DEFAULT '[]'::jsonb,
  device_name TEXT,
  device_type TEXT,
  backed_up BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_webauthn_creds_user_id ON public.webauthn_credentials(user_id);
CREATE INDEX idx_webauthn_creds_cred_id ON public.webauthn_credentials(credential_id);

ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own credentials"
ON public.webauthn_credentials
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Users can insert their own credentials"
ON public.webauthn_credentials
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Users can delete their own credentials"
ON public.webauthn_credentials
FOR DELETE
TO anon, authenticated
USING (true);

CREATE POLICY "Service role full access on webauthn_credentials"
ON public.webauthn_credentials
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Table for storing temporary challenges (registration/authentication)
CREATE TABLE public.webauthn_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge TEXT NOT NULL,
  user_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('registration', 'authentication')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 minutes'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_webauthn_challenges_challenge ON public.webauthn_challenges(challenge);
CREATE INDEX idx_webauthn_challenges_expires ON public.webauthn_challenges(expires_at);

ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on webauthn_challenges"
ON public.webauthn_challenges
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can insert challenges"
ON public.webauthn_challenges
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read challenges"
ON public.webauthn_challenges
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can delete expired challenges"
ON public.webauthn_challenges
FOR DELETE
TO anon, authenticated
USING (true);