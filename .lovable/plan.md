## خطة التنفيذ النهائية: إعادة هيكلة الخدمات والمنتجات (40 منتج)

### 🎯 الهدف
استبدال كامل لمحتوى الخدمات الحالي بالأقسام الـ 6 الجديدة والـ 40 منتج، مع نموذج طلب موحّد + حقول ديناميكية، وحذف قسم "التمويلية".

---

### 📁 الملف 1: `src/components/rifans/ServiceDetailPage.tsx`

**التغييرات:**

1. **استبدال `SERVICES_CONTENT` كاملاً** بـ 6 أقسام:
   - `judicial` (القضائية والعدلية) — 8 منتجات
   - `banking` (المصرفية) — 13 منتج
   - `real-estate` (العقارية) — 6 منتجات
   - `tax` (الزكوية والضريبية) — 6 منتجات
   - `credit` (الائتمانية) — 4 منتجات
   - `advisory` (الاستشارية) — 3 منتجات

2. **بنية كل منتج:**
```ts
{
  id: string,
  name: string,           // الاسم الكامل
  description: string,    // وصف موجز محسّن (3-4 أسطر)
  features: string[],     // 3 مميزات قصيرة
  extraFields?: string[]  // حقول ديناميكية اختيارية
}
```

3. **نظام الحقول الديناميكية:**
   - تعريف map: `bankName`, `complaintNumber`, `caseNumber`, `deedNumber`, `propertyType`, `companyName`, `taxNumber`, `totalDebt`, `simahScore`...
   - كل حقل له label عربي + نوع (text/number)
   - تعرض تلقائياً حسب `extraFields` للمنتج المختار
   - تُرسل ضمن `data.extra` JSON object إلى جدول `requests` (لا يحتاج migration)

4. **تحسين عرض الكروت:**
   - كل كرت: أيقونة + اسم + وصف موجز + 3 مميزات (✓) + زر ذهبي بارز "تقدم بطلب الخدمة"
   - عند الضغط: scroll سلس للنموذج + اسم المنتج المختار يظهر في رأس النموذج
   - تصميم مدمج للجوال (428px)

5. **حماية النموذج:** الحفاظ على فحص تسجيل الدخول الحالي.

6. **بعد الإرسال:** شاشة نجاح + إشعار الأدمن عبر `notify-admin` (موجود).

---

### 📁 الملف 2: `src/contexts/LanguageContext.tsx`

1. **تحديث نصوص الأقسام الستة** — `srv_judicial_desc`, `srv_banking_desc`, `srv_real_estate_desc`, `srv_tax_desc`, `srv_credit_desc`, `srv_advisory_desc` لتطابق النبذات الجديدة المنقحة.

2. **حذف قسم التمويلية:** إزالة `srv_finance_*` keys.

3. **الحفاظ على دعم الإنجليزية** للمفاتيح المحدّثة.

---

### 📁 الملف 3: `src/components/rifans/Services.tsx`

- حذف قسم `finance` من array الأقسام إن كان موجوداً.
- التحقق من توافق الـ IDs مع `ServiceDetailPage`.

---

### ✅ ضمانات الجودة

- **لا تغييرات على قاعدة البيانات** — `data.extra` يُحفظ في `data` JSONB الموجود.
- **لا تغييرات على المسارات** — `#/service/{id}` تبقى تعمل.
- **لا breaking changes** على كود النموذج (إضافة فقط).
- **حقول 16px** على الجوال لمنع zoom على iOS.
- **ألوان ريفانس** (#22042C / #C7A969).
- **لغة مهنية متخصصة** مالية/قانونية في كل النصوص.

### 📋 الملفات المتأثرة
- `src/components/rifans/ServiceDetailPage.tsx` — استبدال جوهري
- `src/contexts/LanguageContext.tsx` — تحديث نصوص + حذف finance
- `src/components/rifans/Services.tsx` — حذف finance إن وُجد