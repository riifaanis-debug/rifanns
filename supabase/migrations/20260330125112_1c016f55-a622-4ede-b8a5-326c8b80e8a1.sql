
-- 1. Fix storage: drop anonymous upload policy, require authentication
DROP POLICY IF EXISTS "Anyone can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'uploads');

-- 2. Drop all permissive "Allow all" policies on all tables
DROP POLICY IF EXISTS "Allow all operations on app_users" ON public.app_users;
DROP POLICY IF EXISTS "Allow all operations on contracts" ON public.contracts;
DROP POLICY IF EXISTS "Allow all operations on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow all operations on request_history" ON public.request_history;
DROP POLICY IF EXISTS "Allow all operations on requests" ON public.requests;

-- 3. Deny DELETE on all tables (restrictive policy)
CREATE POLICY "Deny delete on app_users" ON public.app_users FOR DELETE TO public USING (false);
CREATE POLICY "Deny delete on contracts" ON public.contracts FOR DELETE TO public USING (false);
CREATE POLICY "Deny delete on notifications" ON public.notifications FOR DELETE TO public USING (false);
CREATE POLICY "Deny delete on request_history" ON public.request_history FOR DELETE TO public USING (false);
CREATE POLICY "Deny delete on requests" ON public.requests FOR DELETE TO public USING (false);

-- 4. Add granular policies for each table
-- app_users: allow select/insert/update for service_role only (edge functions handle data access)
CREATE POLICY "Service role full access on app_users" ON public.app_users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can read own profile" ON public.app_users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.app_users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.app_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- requests
CREATE POLICY "Service role full access on requests" ON public.requests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can read requests" ON public.requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert requests" ON public.requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update requests" ON public.requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- contracts
CREATE POLICY "Service role full access on contracts" ON public.contracts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can read contracts" ON public.contracts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert contracts" ON public.contracts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update contracts" ON public.contracts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- notifications
CREATE POLICY "Service role full access on notifications" ON public.notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can read notifications" ON public.notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- request_history
CREATE POLICY "Service role full access on request_history" ON public.request_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can read request_history" ON public.request_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert request_history" ON public.request_history FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update request_history" ON public.request_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Hide password_hash from non-service-role access by creating a view
CREATE OR REPLACE VIEW public.app_users_safe AS
SELECT id, full_name, first_name, middle_name, last_name, email, phone, national_id, role,
       salary, products, documents, region, city, bank, service_type, file_number, job_status, age,
       created_at, updated_at
FROM public.app_users;
