import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_NAME = 'ريفانس المالية';
const SENDER_DOMAIN = 'notify.rifans.net';
const FROM_ADDRESS = `${SITE_NAME} <noreply@rifans.net>`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, userId, phone } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ success: false, error: 'يرجى إدخال بريد إلكتروني صحيح' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Server configuration missing');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use email as the lookup key (stored in `phone` column for backward compatibility)
    const key = email.toLowerCase();
    await supabase.from('otp_codes').delete().eq('phone', key);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase.from('otp_codes').insert({
      phone: key,
      code,
      user_id: userId && userId !== 'pending' ? userId : null,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error('OTP insert error:', insertError);
      return new Response(JSON.stringify({ success: false, error: 'خطأ في حفظ رمز التحقق' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background:#ffffff; padding:24px; max-width:520px; margin:auto; color:#22042C;">
        <div style="text-align:center; padding:16px 0; border-bottom:2px solid #C7A969;">
          <h1 style="margin:0; color:#22042C; font-size:22px;">ريفانس المالية</h1>
        </div>
        <div style="padding:24px 8px;">
          <h2 style="color:#22042C; font-size:18px; margin:0 0 12px;">رمز التحقق الخاص بك</h2>
          <p style="font-size:14px; color:#444; line-height:1.7; margin:0 0 20px;">
            مرحبًا، استخدم الرمز التالي لإكمال تسجيل الدخول إلى حسابك:
          </p>
          <div style="text-align:center; background:#22042C; color:#C7A969; font-size:32px; font-weight:bold; letter-spacing:8px; padding:18px; border-radius:12px; margin:16px 0;">
            ${code}
          </div>
          <p style="font-size:13px; color:#666; line-height:1.7; margin:20px 0 0;">
            هذا الرمز صالح لمدة <b>5 دقائق</b>. لا تشارك هذا الرمز مع أي شخص حفاظًا على أمان حسابك.
          </p>
          <p style="font-size:12px; color:#999; margin:16px 0 0;">
            إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.
          </p>
        </div>
        <div style="text-align:center; padding:16px; border-top:1px solid #eee; font-size:11px; color:#999;">
          © ${new Date().getFullYear()} Rifans Finance · جميع الحقوق محفوظة
        </div>
      </div>
    `;

    const messageId = crypto.randomUUID();

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'otp_email',
      recipient_email: email,
      status: 'pending',
    });

    const { error: enqueueError } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: email,
        from: FROM_ADDRESS,
        sender_domain: SENDER_DOMAIN,
        subject: `رمز التحقق: ${code} - ريفانس المالية`,
        html,
        purpose: 'transactional',
        label: 'otp_email',
        idempotency_key: `otp-${key}-${messageId}`,
        queued_at: new Date().toISOString(),
      },
    });

    if (enqueueError) {
      console.error('OTP email enqueue error:', enqueueError);
      await supabase.from('email_send_log').insert({
        message_id: messageId,
        template_name: 'otp_email',
        recipient_email: email,
        status: 'failed',
        error_message: 'Failed to enqueue OTP email',
      });
      return new Response(JSON.stringify({ success: false, error: 'فشل إرسال رمز التحقق إلى البريد الإلكتروني' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, messageId }), {
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
