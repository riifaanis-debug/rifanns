
INSERT INTO public.app_users (id, full_name, first_name, last_name, email, password_hash, role)
SELECT 
  'admin-' || extract(epoch from now())::text,
  'مدير النظام',
  'مدير',
  'النظام',
  'r.iifaanis@gmail.com',
  extensions.crypt('Rr123456', extensions.gen_salt('bf')),
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.app_users WHERE email = 'r.iifaanis@gmail.com'
);
