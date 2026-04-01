import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio';
const TWILIO_FROM = '+966553550496';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, userId } = await req.json();

    if (!phone) {
      return new Response(JSON.stringify({ success: false, error: 'رقم الجوال مطلوب' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const TWILIO_API_KEY = Deno.env.get('TWILIO_API_KEY');
    if (!TWILIO_API_KEY) throw new Error('TWILIO_API_KEY is not configured');

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete old OTPs for this phone
    await supabase.from('otp_codes').delete().eq('phone', phone);

    // Insert new OTP (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase.from('otp_codes').insert({
      phone,
      code,
      user_id: userId || null,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error('OTP insert error:', insertError);
      return new Response(JSON.stringify({ success: false, error: 'خطأ في حفظ رمز التحقق' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format phone to E.164
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '966' + formattedPhone.slice(1);
    }
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    // Send SMS via Twilio gateway
    const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TWILIO_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: TWILIO_FROM,
        Body: `مرحبًا،\n\nرمز التحقق الخاص بك في ريفانس المالية هو: ${code}\n\nهذا الرمز صالح لمدة 5 دقائق. يرجى عدم مشاركته مع أي شخص حفاظًا على أمان حسابك.\n\nRifans Finance`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', response.status, JSON.stringify(data));
      return new Response(JSON.stringify({ success: false, error: 'فشل إرسال رسالة التحقق' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, messageSid: data.sid }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-otp error:', err);
    return new Response(JSON.stringify({ success: false, error: 'خطأ في الخادم' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
