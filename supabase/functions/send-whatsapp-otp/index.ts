import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { phone, userId } = await req.json();
    if (!phone) {
      return new Response(JSON.stringify({ success: false, error: 'رقم الجوال مطلوب' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const PHONE_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    const TEMPLATE = Deno.env.get('WHATSAPP_OTP_TEMPLATE') || 'otp_code';
    const LANG = Deno.env.get('WHATSAPP_OTP_LANG') || 'ar';
    if (!TOKEN || !PHONE_ID) throw new Error('WhatsApp credentials missing');

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Replace existing OTPs for this phone
    await supabase.from('otp_codes').delete().eq('phone', phone);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase.from('otp_codes').insert({
      phone, code, user_id: userId || null, expires_at: expiresAt,
    });
    if (insertError) {
      console.error('OTP insert error:', insertError);
      return new Response(JSON.stringify({ success: false, error: 'خطأ في حفظ رمز التحقق' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format phone to E.164 (Saudi default)
    let to = phone.replace(/\D/g, '');
    if (to.startsWith('00')) to = to.slice(2);
    if (to.startsWith('0')) to = '966' + to.slice(1);
    if (to.startsWith('5') && to.length === 9) to = '966' + to;

    // Send via WhatsApp Cloud API (authentication template)
    const wa = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: TEMPLATE,
          language: { code: LANG },
          components: [
            { type: 'body', parameters: [{ type: 'text', text: code }] },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [{ type: 'text', text: code }],
            },
          ],
        },
      }),
    });

    const data = await wa.json();
    if (!wa.ok) {
      console.error('WhatsApp error:', wa.status, JSON.stringify(data));
      return new Response(JSON.stringify({
        success: false,
        error: data?.error?.message || 'فشل إرسال رسالة التحقق عبر واتساب',
        details: data?.error,
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, messageId: data?.messages?.[0]?.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-whatsapp-otp error:', err);
    return new Response(JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'خطأ في الخادم' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
