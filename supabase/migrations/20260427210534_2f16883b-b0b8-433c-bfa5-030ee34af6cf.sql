-- Create promissory_notes table for "سندات الأمر"
CREATE TABLE public.promissory_notes (
  id text NOT NULL PRIMARY KEY,
  submission_id text NOT NULL,
  user_id text NOT NULL,
  contract_id text,
  amount numeric NOT NULL DEFAULT 0,
  amount_in_words text,
  debtor_name text,
  debtor_national_id text,
  issue_city text NOT NULL DEFAULT 'جدة - المملكة العربية السعودية',
  payment_city text NOT NULL DEFAULT 'جدة - المملكة العربية السعودية',
  due_date text NOT NULL DEFAULT 'لدى الإطلاع',
  signature_data text,
  signed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promissory_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read promissory_notes"
  ON public.promissory_notes FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert promissory_notes"
  ON public.promissory_notes FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update promissory_notes"
  ON public.promissory_notes FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Deny delete on promissory_notes"
  ON public.promissory_notes FOR DELETE TO public
  USING (false);

CREATE POLICY "Service role full access on promissory_notes"
  ON public.promissory_notes FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_promissory_notes_user ON public.promissory_notes(user_id);
CREATE INDEX idx_promissory_notes_submission ON public.promissory_notes(submission_id);