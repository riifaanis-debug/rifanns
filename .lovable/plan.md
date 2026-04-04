

# حذف نظام reCAPTCHA نهائياً

## الخطوات

1. **حذف سكريبت reCAPTCHA من `index.html`** — إزالة سطر `<script src="https://www.google.com/recaptcha/api.js?render=explicit">`.

2. **تنظيف `src/components/rifans/AuthPage.tsx`** — إزالة كل كود reCAPTCHA: الـ ref، الـ callback، استدعاء `grecaptcha.execute()`، واستدعاء `verify-recaptcha` edge function. إبقاء تدفق تسجيل الدخول يعمل مباشرة بدون تحقق.

3. **حذف Edge Function `verify-recaptcha`** — حذف ملف `supabase/functions/verify-recaptcha/index.ts` وإزالة الدالة المنشورة.

4. **حذف السر `RECAPTCHA_SECRET_KEY`** — لم يعد مطلوباً.

