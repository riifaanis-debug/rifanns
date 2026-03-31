import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestData, userData } = await req.json();

    // Format number with commas: 5002969 → 5,002,969.00
    function formatAmount(val: any): string {
      const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : Number(val);
      if (isNaN(num)) return String(val);
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
    const ADMIN_EMAIL_PASSWORD = Deno.env.get('ADMIN_EMAIL_PASSWORD');

    if (!ADMIN_EMAIL || !ADMIN_EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured');
    }

    const fullName = userData?.fullName || 'غير محدد';
    const phone = userData?.phone || 'غير محدد';
    const nationalId = userData?.national_id || 'غير محدد';
    const email = userData?.email || 'غير محدد';
    const typeMap: Record<string, string> = {
      'waive_request': 'طلب إعفاء',
      'rescheduling_request': 'طلب جدولة',
      'scheduling_request': 'طلب جدولة',
      'service_request': 'طلب خدمة',
      'financial_consultation': 'استشارة مالية',
      'contact': 'تواصل',
      'general': 'طلب عام',
    };
    const requestType = typeMap[requestData?.type] || requestData?.type || 'عام';
    const requestId = requestData?.id || 'غير محدد';
    const details = requestData?.details || '';
    const data = requestData?.data || {};
    const files = requestData?.files || [];

    const productsHtml = data.products
      ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">المنتجات</td><td style="padding:8px;border:1px solid #ddd;">${
          Array.isArray(data.products)
            ? data.products.map((p: any) => `${p.type}: ${formatAmount(p.amount)} ريال`).join('<br/>')
            : String(data.products)
        }</td></tr>`
      : '';

    // Build attachments section in HTML
    let filesHtml = '';
    if (files.length > 0) {
      const fileLinks = files.map((f: any) => {
        const name = f.fileName || f.name || 'مرفق';
        const url = f.filePath || f.publicUrl || f.url || '#';
        const type = f.type || '';
        return `<li style="margin:4px 0;"><a href="${url}" style="color:#C7A969;text-decoration:underline;">${type ? type + ' - ' : ''}${name}</a></li>`;
      }).join('');
      filesHtml = `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">المرفقات (${files.length})</td><td style="padding:8px;border:1px solid #ddd;"><ul style="margin:0;padding-right:16px;">${fileLinks}</ul></td></tr>`;
    }

    const htmlBody = `
      <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#22042C,#3a1a4a);padding:20px;text-align:center;">
          <h1 style="color:#C7A969;margin:0;font-size:22px;">ريفانس المالية - طلب جديد</h1>
        </div>
        <div style="padding:20px;">
          <h2 style="color:#22042C;border-bottom:2px solid #C7A969;padding-bottom:8px;">تفاصيل الطلب #${requestId}</h2>
          <table style="width:100%;border-collapse:collapse;margin:15px 0;">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">نوع الطلب</td><td style="padding:8px;border:1px solid #ddd;">${requestType}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">اسم العميل</td><td style="padding:8px;border:1px solid #ddd;">${fullName}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">رقم الهوية</td><td style="padding:8px;border:1px solid #ddd;">${nationalId}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">رقم الجوال</td><td style="padding:8px;border:1px solid #ddd;">${phone}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">البريد الإلكتروني</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
            ${data.region ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">المنطقة</td><td style="padding:8px;border:1px solid #ddd;">${data.region}</td></tr>` : ''}
            ${data.city ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">المدينة</td><td style="padding:8px;border:1px solid #ddd;">${data.city}</td></tr>` : ''}
            ${data.bank ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">الجهة المالية</td><td style="padding:8px;border:1px solid #ddd;">${data.bank}</td></tr>` : ''}
            ${data.jobStatus ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">الحالة الوظيفية</td><td style="padding:8px;border:1px solid #ddd;">${data.jobStatus}</td></tr>` : ''}
            ${data.totalAmount ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">إجمالي المبلغ</td><td style="padding:8px;border:1px solid #ddd;">${formatAmount(data.totalAmount)} ريال</td></tr>` : ''}
            ${productsHtml}
            ${details ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">التفاصيل</td><td style="padding:8px;border:1px solid #ddd;">${details}</td></tr>` : ''}
            ${filesHtml}
          </table>
          <p style="color:#666;font-size:12px;text-align:center;margin-top:20px;">تم الإرسال تلقائياً من نظام ريفانس المالية</p>
        </div>
      </div>
    `;

    const subject = `طلب جديد #${requestId} - ${requestType}`;

    // Fetch file attachments
    const attachments: { filename: string; contentType: string; base64: string }[] = [];
    for (const file of files) {
      const url = file.filePath || file.publicUrl || file.url;
      if (!url) continue;
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          const contentType = resp.headers.get('content-type') || 'application/octet-stream';
          const buffer = await resp.arrayBuffer();
          const base64 = arrayBufferToBase64(buffer);
          const filename = file.fileName || file.name || 'attachment';
          attachments.push({ filename, contentType, base64 });
        }
      } catch (e) {
        console.error('Failed to fetch attachment:', url, e);
      }
    }

    // Build RFC 2822 email with proper UTF-8 encoding
    const boundary = `boundary_${crypto.randomUUID().replace(/-/g, '')}`;
    
    // Encode subject per RFC 2047 using UTF-8 Base64
    const subjectBytes = new TextEncoder().encode(subject);
    const subjectB64 = arrayBufferToBase64(subjectBytes.buffer);
    const encodedSubject = `=?UTF-8?B?${subjectB64}?=`;

    // Encode filenames per RFC 2047
    function encodeFilename(name: string): string {
      const bytes = new TextEncoder().encode(name);
      const b64 = arrayBufferToBase64(bytes.buffer);
      return `=?UTF-8?B?${b64}?=`;
    }

    const emailParts: string[] = [
      `From: ${ADMIN_EMAIL}`,
      `To: ${ADMIN_EMAIL}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      arrayBufferToBase64(new TextEncoder().encode(htmlBody).buffer),
    ];

    // Add file attachments
    for (const att of attachments) {
      emailParts.push('');
      emailParts.push(`--${boundary}`);
      emailParts.push(`Content-Type: ${att.contentType}; name="${encodeFilename(att.filename)}"`);
      emailParts.push(`Content-Disposition: attachment; filename="${encodeFilename(att.filename)}"`);
      emailParts.push('Content-Transfer-Encoding: base64');
      emailParts.push('');
      // Split base64 into 76-char lines per RFC 2045
      const b64 = att.base64;
      for (let i = 0; i < b64.length; i += 76) {
        emailParts.push(b64.substring(i, i + 76));
      }
    }

    emailParts.push('');
    emailParts.push(`--${boundary}--`);

    const rawEmailStr = emailParts.join('\r\n');

    // Send via Gmail SMTP using raw SMTP commands over TLS
    const conn = await Deno.connectTls({ hostname: "smtp.gmail.com", port: 465 });

    async function readResponse(): Promise<string> {
      const buf = new Uint8Array(4096);
      const n = await conn.read(buf);
      return new TextDecoder().decode(buf.subarray(0, n || 0));
    }

    async function sendCommand(cmd: string): Promise<string> {
      await conn.write(new TextEncoder().encode(cmd + '\r\n'));
      return await readResponse();
    }

    // Read greeting
    await readResponse();

    // EHLO
    await sendCommand('EHLO localhost');

    // AUTH LOGIN
    await sendCommand('AUTH LOGIN');
    await sendCommand(btoa(ADMIN_EMAIL));
    const authResult = await sendCommand(btoa(ADMIN_EMAIL_PASSWORD));
    
    if (!authResult.startsWith('235')) {
      throw new Error('SMTP Authentication failed: ' + authResult);
    }

    // MAIL FROM
    await sendCommand(`MAIL FROM:<${ADMIN_EMAIL}>`);

    // RCPT TO
    await sendCommand(`RCPT TO:<${ADMIN_EMAIL}>`);

    // DATA
    await sendCommand('DATA');

    // Send email content
    await conn.write(new TextEncoder().encode(rawEmailStr + '\r\n.\r\n'));
    const dataResult = await readResponse();

    // QUIT
    await sendCommand('QUIT');

    try { conn.close(); } catch (_) {}

    if (!dataResult.startsWith('250')) {
      throw new Error('Failed to send email: ' + dataResult);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
