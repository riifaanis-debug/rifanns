CREATE TABLE public.client_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published reviews"
ON public.client_reviews
FOR SELECT
USING (is_published = true);

CREATE POLICY "Authenticated users can insert reviews"
ON public.client_reviews
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update reviews"
ON public.client_reviews
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete reviews"
ON public.client_reviews
FOR DELETE
TO authenticated
USING (true);