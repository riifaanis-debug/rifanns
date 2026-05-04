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
    const { phone, email, code, userId } = await req.json();
    const key = (email || phone || '').toString().toLowerCase();

    if (!key || !code) {
      return new Response(JSON.stringify({ success: false, error: 'البريد الإلكتروني ورمز التحقق مطلوبان' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up OTP
    const { data: otpRecords, error: lookupError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', key)
      .eq('code', code)
      .eq('verified', false)
      .limit(1);

    if (lookupError || !otpRecords || otpRecords.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'رمز التحقق غير صحيح' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const otp = otpRecords[0];

    if (new Date(otp.expires_at) < new Date()) {
      return new Response(JSON.stringify({ success: false, error: 'رمز التحقق منتهي الصلاحية' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await supabase.from('otp_codes').update({ verified: true }).eq('id', otp.id);

    if (userId) {
      await supabase.from('app_users').update({ phone_verified: true }).eq('id', userId);
    }

    await supabase.from('otp_codes').delete().eq('phone', key);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    return new Response(JSON.stringify({ success: false, error: 'خطأ في الخادم' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
