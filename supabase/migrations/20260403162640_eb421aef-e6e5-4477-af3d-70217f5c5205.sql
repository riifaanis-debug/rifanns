
CREATE TABLE public.invoices (
  id text NOT NULL PRIMARY KEY,
  submission_id text NOT NULL,
  user_id text NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  type text DEFAULT 'general',
  amount numeric DEFAULT 0,
  percentage numeric DEFAULT 0,
  total_debt numeric DEFAULT 0,
  notes text,
  status text DEFAULT 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny delete on invoices" ON public.invoices FOR DELETE USING (false);
CREATE POLICY "Service role full access on invoices" ON public.invoices FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can insert invoices" ON public.invoices FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can read invoices" ON public.invoices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can update invoices" ON public.invoices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
