CREATE TABLE public.payment_requests (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  client_name text,
  amount_sar numeric NOT NULL DEFAULT 0,
  amount_usd numeric NOT NULL DEFAULT 0,
  exchange_rate numeric NOT NULL DEFAULT 3.75,
  description text,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read payment_requests"
  ON public.payment_requests FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert payment_requests"
  ON public.payment_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update payment_requests"
  ON public.payment_requests FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Deny delete on payment_requests"
  ON public.payment_requests FOR DELETE
  TO public
  USING (false);

CREATE POLICY "Service role full access on payment_requests"
  ON public.payment_requests FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_payment_requests_user_id ON public.payment_requests(user_id);
CREATE INDEX idx_payment_requests_created_at ON public.payment_requests(created_at DESC);