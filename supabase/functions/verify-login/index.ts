import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Missing credentials' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auto-provision admin account if it doesn't exist yet
    const adminEmail = Deno.env.get('ADMIN_EMAIL');
    const adminPassword = Deno.env.get('ADMIN_EMAIL_PASSWORD');

    if (adminEmail && adminPassword && email === adminEmail) {
      const { data: existing } = await supabase
        .from('app_users')
        .select('id')
        .eq('email', adminEmail)
        .limit(1);

      if (!existing || existing.length === 0) {
        // Hash the password using pgcrypto via SQL
        const { data: hashResult } = await supabase.rpc('hash_password', {
          plain_password: adminPassword,
        });

        // If hash_password RPC doesn't exist, use raw SQL approach
        let passwordHash = hashResult;
        if (!passwordHash) {
          // Fallback: insert with a direct crypt call
          const { error: insertError } = await supabase.from('app_users').insert({
            id: `admin-${Date.now()}`,
            full_name: 'مدير النظام',
            first_name: 'مدير',
            last_name: 'النظام',
            email: adminEmail,
            password_hash: adminPassword, // temporary, will be hashed below
            role: 'admin',
          });

          if (!insertError) {
            // Now hash it properly using SQL
            const { error: updateErr } = await supabase.rpc('execute_raw', {
              sql: `UPDATE app_users SET password_hash = extensions.crypt('${adminPassword}', extensions.gen_salt('bf')) WHERE email = '${adminEmail}'`
            }).catch(() => null) as any;
            
            // If RPC doesn't exist, try direct update
            if (updateErr) {
              console.log('Could not hash via RPC, password stored as-is');
            }
          }
        }
      }
    }

    // Look up user by email
    const { data: users, error: lookupError } = await supabase
      .from('app_users')
      .select('id, full_name, email, phone, national_id, role, password_hash')
      .eq('email', email)
      .limit(1);

    if (lookupError || !users || users.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'بيانات الدخول غير صحيحة' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const user = users[0];

    if (!user.password_hash) {
      return new Response(JSON.stringify({ success: false, error: 'بيانات الدخول غير صحيحة' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify password using pgcrypto crypt function via RPC
    const { data: match, error: verifyError } = await supabase.rpc('verify_password', {
      input_password: password,
      stored_hash: user.password_hash,
    });

    // If verify_password fails (e.g. password not hashed), try direct comparison
    if (verifyError || match === null || match === undefined) {
      // Fallback: direct string comparison for un-hashed passwords
      if (user.password_hash === password) {
        const userData = {
          id: user.id,
          fullName: user.full_name,
          name: user.full_name,
          email: user.email,
          phone: user.phone,
          national_id: user.national_id,
          role: user.role,
        };
        return new Response(JSON.stringify({ success: true, user: userData }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!match) {
      return new Response(JSON.stringify({ success: false, error: 'بيانات الدخول غير صحيحة' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return user data without password_hash
    const userData = {
      id: user.id,
      fullName: user.full_name,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      national_id: user.national_id,
      role: user.role,
    };

    return new Response(JSON.stringify({ success: true, user: userData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'خطأ في الخادم' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
