
-- Table for open (custom) requests sent by admin to a specific client
CREATE TABLE public.open_requests (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  title text NOT NULL,
  description text,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  answers jsonb DEFAULT '{}'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.open_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read open_requests"
  ON public.open_requests FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can insert open_requests"
  ON public.open_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Users can update open_requests"
  ON public.open_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Deny delete on open_requests"
  ON public.open_requests FOR DELETE TO public USING (false);

CREATE POLICY "Service role full access on open_requests"
  ON public.open_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_open_requests_user ON public.open_requests(user_id);
CREATE INDEX idx_open_requests_status ON public.open_requests(status);
