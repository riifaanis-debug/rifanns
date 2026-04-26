import React, { useEffect, useRef, useState } from 'react';
import { PageLayout } from './StaticPages';
import { Button } from './Shared';
import {
  Send, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight,
  Hash, User as UserIcon, Phone, Mail, MapPin, Building2, FileText, CreditCard, PenLine,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitRequest, uploadDocument, getProfile } from '../../lib/api';
import { supabase } from '@/integrations/supabase/client';
import { getProduct, INITIAL_FEE_SAR } from '../../data/sectionsCatalog';
import { formatAmount } from '../../lib/formatNumber';

interface Props {
  productId: string;
}

const REGION_CITIES: Record<string, string[]> = {
  'الرياض': ['الرياض', 'الدرعية', 'الخرج', 'المجمعة', 'الزلفي'],
  'مكة المكرمة': ['مكة المكرمة', 'جدة', 'الطائف', 'رابغ', 'الليث'],
  'المدينة': ['المدينة المنورة', 'ينبع', 'العلا', 'بدر'],
  'القصيم': ['بريدة', 'عنيزة', 'الرس', 'البكيرية'],
  'الشرقية': ['الدمام', 'الخبر', 'الظهران', 'القطيف', 'الأحساء', 'الجبيل'],
  'عسير': ['أبها', 'خميس مشيط', 'بيشة'],
  'تبوك': ['تبوك', 'الوجه', 'ضباء', 'تيماء'],
  'حائل': ['حائل', 'بقعاء'],
  'الحدود الشمالية': ['عرعر', 'رفحاء', 'طريف'],
  'جازان': ['جيزان', 'صبيا', 'أبو عريش'],
  'نجران': ['نجران', 'شرورة'],
  'الباحة': ['الباحة', 'بلجرشي', 'المندق'],
  'الجوف': ['سكاكا', 'القريات', 'دومة الجندل'],
};

type Step = 'form' | 'terms' | 'payment' | 'signature' | 'success';

export const ProductRequestForm: React.FC<Props> = ({ productId }) => {
  const { user, token } = useAuth();
  const found = getProduct(productId);

  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultId, setResultId] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    mobile: '',
    email: '',
    region: '',
    city: '',
    notes: '',
  });
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [paid, setPaid] = useState(false); // marks user pressed "I paid"
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'transfer'>('paypal');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [drawing, setDrawing] = useState(false);

  // Prefill from profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const p: any = await getProfile();
        if (p) {
          setFormData((prev) => ({
            ...prev,
            fullName:
              p.full_name ||
              [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' '),
            nationalId: p.national_id || user.national_id || '',
            mobile: p.phone || user.phone || '',
            email: p.email || '',
            region: p.region || '',
            city: p.city || '',
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            nationalId: user.national_id || '',
            mobile: user.phone || '',
          }));
        }
      } catch {/* noop */}
    })();
  }, [user]);

  // Setup signature canvas when entering signature step
  useEffect(() => {
    if (step !== 'signature') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setup = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.strokeStyle = '#003399';
        }
      }
    };
    setup();
    window.addEventListener('resize', setup);
    return () => window.removeEventListener('resize', setup);
  }, [step]);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(cx - rect.left, cy - rect.top);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(cx - rect.left, cy - rect.top);
    ctx.stroke();
  };
  const stopDraw = () => setDrawing(false);
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  if (!found) {
    return (
      <PageLayout title="الخدمة غير موجودة">
        <div className="p-6 text-center">
          <p className="text-sm text-muted">عذراً، لم نعثر على هذه الخدمة.</p>
          <a href="#/" className="inline-block mt-4">
            <Button>العودة للرئيسية</Button>
          </a>
        </div>
      </PageLayout>
    );
  }

  const { product, section } = found;

  if (!user || !token) {
    return (
      <PageLayout title={`طلب: ${product.name}`}>
        <div className="p-6 text-center" dir="rtl">
          <div className="w-14 h-14 rounded-full bg-gold/15 mx-auto mb-3 flex items-center justify-center">
            <LogIn className="text-gold" size={22} />
          </div>
          <p className="text-sm text-muted mb-4">
            يجب تسجيل الدخول للتقدم بطلب الخدمة.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
            className="px-5 py-2 rounded-full bg-gold-gradient text-brand text-sm font-bold shadow"
          >
            تسجيل الدخول
          </button>
        </div>
      </PageLayout>
    );
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'يرجى إدخال الاسم الكامل';
    if (!/^[0-9]{10}$/.test(formData.nationalId))
      return 'رقم هوية غير صحيح (10 أرقام)';
    if (!/^05[0-9]{8}$/.test(formData.mobile))
      return 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return 'بريد إلكتروني غير صحيح';
    if (!formData.region) return 'يرجى اختيار المنطقة';
    if (!formData.city) return 'يرجى اختيار المدينة';
    return '';
  };

  const goToTerms = () => {
    const err = validateForm();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg('');
    setStep('terms');
  };

  const submitFinal = async () => {
    if (!hasSignature) {
      setErrorMsg('يرجى التوقيع قبل الإرسال');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const signatureData = canvasRef.current?.toDataURL() || '';
      const payload = {
        type: 'product_request',
        details: `طلب خدمة: ${product.name} — ${section.name}`,
        data: {
          productId: product.id,
          productName: product.name,
          sectionId: section.id,
          sectionName: section.name,
          fee: INITIAL_FEE_SAR,
          paymentMethod,
          paymentConfirmedByClient: paid,
          ...formData,
          signature: signatureData,
        },
        files: [],
      };
      const result: any = await submitRequest(payload);
      const id = result?.id || '';
      setResultId(id);

      // Notify admin
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            requestData: {
              id,
              type: payload.type,
              details: payload.details,
              status: 'pending',
              data: payload.data,
              files: [],
            },
            userData: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.mobile,
              national_id: formData.nationalId,
            },
          },
        });
      } catch {/* ignore email errors */}

      setStep('success');
    } catch (e: any) {
      setErrorMsg(e?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-gold/30 bg-white dark:bg-[#12031a] px-3 py-2.5 text-[14px] text-right text-brand dark:text-gray-100 placeholder:text-muted/60 focus:outline-none focus:border-gold transition';

  return (
    <PageLayout
      title={`طلب: ${product.name}`}
      backLink={`#/product/${product.id}`}
      backText="العودة لصفحة الخدمة"
    >
      <div className="px-3 pb-10" dir="rtl">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {(['form', 'terms', 'payment', 'signature'] as Step[]).map((s, i) => {
            const order = ['form', 'terms', 'payment', 'signature'];
            const currIdx = order.indexOf(step);
            const isDone = order.indexOf(s) < currIdx || step === 'success';
            const isCurrent = s === step;
            return (
              <React.Fragment key={s}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border ${
                    isCurrent
                      ? 'bg-gold-gradient text-brand border-gold shadow'
                      : isDone
                      ? 'bg-gold/20 text-brand border-gold/40'
                      : 'bg-white dark:bg-[#12031a] text-muted border-gold/20'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={13} /> : i + 1}
                </div>
                {i < 3 && (
                  <div
                    className={`h-[2px] w-5 ${
                      isDone || (currIdx > i) ? 'bg-gold/60' : 'bg-gold/20'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-[12px] text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle size={14} /> {errorMsg}
          </div>
        )}

        {/* STEP 1 - FORM */}
        {step === 'form' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-gold/30 bg-white dark:bg-[#12031a] p-3 text-right">
              <div className="text-[10px] font-bold text-gold mb-0.5">
                {section.name}
              </div>
              <div className="text-[13px] font-extrabold text-brand dark:text-gray-100">
                {product.name}
              </div>
            </div>

            <FieldLabel icon={<UserIcon size={12} />} label="الاسم الكامل" />
            <input
              className={inputCls}
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="الاسم الرباعي"
            />

            <FieldLabel icon={<Hash size={12} />} label="رقم الهوية الوطنية" />
            <input
              className={inputCls}
              inputMode="numeric"
              maxLength={10}
              value={formData.nationalId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nationalId: e.target.value.replace(/\D/g, ''),
                })
              }
              placeholder="10 أرقام"
            />

            <FieldLabel icon={<Phone size={12} />} label="رقم الجوال" />
            <input
              className={inputCls}
              inputMode="tel"
              maxLength={10}
              value={formData.mobile}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mobile: e.target.value.replace(/\D/g, ''),
                })
              }
              placeholder="05xxxxxxxx"
            />

            <FieldLabel
              icon={<Mail size={12} />}
              label="البريد الإلكتروني (اختياري)"
            />
            <input
              className={inputCls}
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="example@email.com"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel icon={<MapPin size={12} />} label="المنطقة" />
                <select
                  className={inputCls}
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value, city: '' })
                  }
                >
                  <option value="">اختر</option>
                  {Object.keys(REGION_CITIES).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel icon={<Building2 size={12} />} label="المدينة" />
                <select
                  className={inputCls}
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  disabled={!formData.region}
                >
                  <option value="">اختر</option>
                  {(REGION_CITIES[formData.region] || []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <FieldLabel
              icon={<FileText size={12} />}
              label="ملاحظات إضافية (اختياري)"
            />
            <textarea
              className={`${inputCls} min-h-[80px] resize-none`}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="أي تفاصيل تساعدنا في خدمتك..."
            />

            <button
              onClick={goToTerms}
              className="w-full mt-2 rounded-full bg-gold-gradient text-brand text-[13px] font-extrabold py-3 shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span>التالي: الشروط والأحكام</span>
              <ArrowLeft size={14} />
            </button>
          </div>
        )}

        {/* STEP 2 - TERMS */}
        {step === 'terms' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-gold/30 bg-white dark:bg-[#12031a] p-4 text-right text-[12px] leading-[24px] text-muted dark:text-gray-300 max-h-[50vh] overflow-y-auto">
              <h3 className="text-[13px] font-extrabold text-brand dark:text-gold mb-2">
                الشروط والأحكام لطلب الخدمة
              </h3>
              <p className="mb-2">
                <b>1.</b> أُقرّ بأن جميع البيانات المُدخلة صحيحة وكاملة، وأتحمّل
                المسؤولية النظامية عن أي بيانات غير صحيحة.
              </p>
              <p className="mb-2">
                <b>2.</b> أُفوّض شركة <b>ريفانس المالية</b> بمتابعة طلبي ضمن نطاق
                الخدمة المحددة (<b>{product.name}</b>) وفق الأنظمة والتعليمات
                المعمول بها في المملكة العربية السعودية.
              </p>
              <p className="mb-2">
                <b>3.</b> أوافق على دفع <b>رسوم فتح الملف</b> وقدرها{' '}
                <b className="text-brand dark:text-gold">
                  {formatAmount(INITIAL_FEE_SAR)} ريال سعودي
                </b>
                ، وأُقرّ بأن هذه الرسوم غير مسترجعة بمجرد البدء بالعمل على الطلب.
              </p>
              <p className="mb-2">
                <b>4.</b> أتفهم أن أي رسوم أو أتعاب إضافية مرتبطة بإتمام الخدمة
                يتم الاتفاق عليها لاحقاً ويتم إصدار فاتورة مستقلة لها.
              </p>
              <p className="mb-2">
                <b>5.</b> أوافق على تواصل ريفانس المالية معي عبر الجوال أو
                الواتساب أو البريد الإلكتروني فيما يخص هذا الطلب.
              </p>
              <p>
                <b>6.</b> أعلم أن مدد إنجاز الخدمات قد تختلف بحسب الجهات الخارجية
                (البنوك، المحاكم، الهيئات) ولا تتحمل ريفانس المالية مسؤولية أي
                تأخير ناتج عن جهات خارجية.
              </p>
            </div>

            <label className="flex items-start gap-2 px-1 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#C7A969]"
              />
              <span className="text-[12px] text-brand dark:text-gray-200 leading-relaxed">
                أوافق على جميع الشروط والأحكام أعلاه وأُقرّ بصحة بياناتي.
              </span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('form')}
                className="flex-1 rounded-full border border-gold/40 text-brand dark:text-gold text-[12px] font-bold py-2.5 flex items-center justify-center gap-1"
              >
                <ArrowRight size={13} /> رجوع
              </button>
              <button
                disabled={!agreedTerms}
                onClick={() => setStep('payment')}
                className="flex-1 rounded-full bg-gold-gradient text-brand text-[12px] font-extrabold py-2.5 shadow disabled:opacity-50 flex items-center justify-center gap-1"
              >
                التالي: الدفع <ArrowLeft size={13} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 - PAYMENT */}
        {step === 'payment' && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-gradient-to-br from-[#FFFDF5] to-[#F6ECD4] dark:from-[#1a0b25] dark:to-[#0f0216] border border-gold/60 p-4 flex items-center justify-between">
              <div className="text-right">
                <div className="text-[10px] text-muted dark:text-gray-400">
                  المبلغ المستحق
                </div>
                <div className="text-[12px] font-bold text-brand dark:text-gray-200">
                  رسوم فتح الملف — {product.name}
                </div>
              </div>
              <div className="text-left">
                <div className="text-[22px] font-extrabold text-brand dark:text-gold tabular-nums leading-none">
                  {formatAmount(INITIAL_FEE_SAR)}
                </div>
                <div className="text-[10px] text-muted dark:text-gray-400">
                  ريال سعودي
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gold/30 bg-white dark:bg-[#12031a] p-3">
              <div className="text-[12px] font-extrabold text-brand dark:text-gold mb-2 text-right">
                اختر طريقة الدفع
              </div>
              <div className="space-y-2">
                <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer ${paymentMethod === 'paypal' ? 'border-gold bg-gold/10' : 'border-gold/20'}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="accent-[#C7A969]"
                    />
                    <span className="text-[12px] font-bold text-brand dark:text-gray-200">
                      الدفع عبر PayPal
                    </span>
                  </div>
                  <CreditCard size={15} className="text-gold" />
                </label>
                <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer ${paymentMethod === 'transfer' ? 'border-gold bg-gold/10' : 'border-gold/20'}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === 'transfer'}
                      onChange={() => setPaymentMethod('transfer')}
                      className="accent-[#C7A969]"
                    />
                    <span className="text-[12px] font-bold text-brand dark:text-gray-200">
                      تحويل بنكي مباشر
                    </span>
                  </div>
                  <Building2 size={15} className="text-gold" />
                </label>
              </div>
            </div>

            {paymentMethod === 'paypal' ? (
              <form
                action="https://www.paypal.com/cgi-bin/webscr"
                method="post"
                target="_blank"
                className="rounded-xl border border-gold/30 bg-white dark:bg-[#12031a] p-3 text-right"
              >
                <input type="hidden" name="cmd" value="_xclick" />
                <input type="hidden" name="hosted_button_id" value="7JC8Q2G4NFSP4" />
                <input type="hidden" name="item_name" value={`رسوم خدمة: ${product.name}`} />
                <input type="hidden" name="amount" value={(INITIAL_FEE_SAR / 3.75).toFixed(2)} />
                <input type="hidden" name="currency_code" value="USD" />
                <p className="text-[11px] text-muted dark:text-gray-400 mb-2">
                  اضغط للدفع الآمن عبر PayPal — سيتم فتح نافذة جديدة.
                </p>
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#003087] text-white text-[13px] font-extrabold py-2.5 active:scale-95 flex items-center justify-center gap-2"
                >
                  <CreditCard size={14} /> سداد الرسوم — {formatAmount(INITIAL_FEE_SAR)} ر.س
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-gold/30 bg-white dark:bg-[#12031a] p-3 text-right text-[12px] text-muted dark:text-gray-300 leading-[24px]">
                <div className="font-extrabold text-brand dark:text-gold mb-1">
                  بيانات التحويل البنكي
                </div>
                <div>اسم المستفيد: <b>ريفانس المالية</b></div>
                <div>الآيبان: <b dir="ltr">SA00 0000 0000 0000 0000 0000</b></div>
                <div className="text-[11px] mt-2 text-muted">
                  بعد التحويل، يرجى إرسال صورة الإيصال على واتساب{' '}
                  <a className="text-gold underline" href="https://wa.me/9668002440432" target="_blank" rel="noopener noreferrer">
                    8002440432
                  </a>
                </div>
              </div>
            )}

            <label className="flex items-start gap-2 px-1 cursor-pointer">
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#C7A969]"
              />
              <span className="text-[12px] text-brand dark:text-gray-200 leading-relaxed">
                أُقرّ بأنني قمت بسداد رسوم فتح الملف ({formatAmount(INITIAL_FEE_SAR)} ر.س).
              </span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('terms')}
                className="flex-1 rounded-full border border-gold/40 text-brand dark:text-gold text-[12px] font-bold py-2.5 flex items-center justify-center gap-1"
              >
                <ArrowRight size={13} /> رجوع
              </button>
              <button
                disabled={!paid}
                onClick={() => setStep('signature')}
                className="flex-1 rounded-full bg-gold-gradient text-brand text-[12px] font-extrabold py-2.5 shadow disabled:opacity-50 flex items-center justify-center gap-1"
              >
                التالي: التوقيع <ArrowLeft size={13} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 - SIGNATURE */}
        {step === 'signature' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-gold/30 bg-white dark:bg-[#12031a] p-3 text-right">
              <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-brand dark:text-gold mb-1.5">
                <PenLine size={14} /> التوقيع الإلكتروني
              </div>
              <p className="text-[11px] text-muted dark:text-gray-400 mb-2">
                وقّع داخل المربع باستخدام إصبعك أو الفأرة.
              </p>
              <div className="rounded-xl bg-white border-2 border-dashed border-gold/40 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                  className="block w-full h-[140px] touch-none cursor-crosshair"
                />
              </div>
              <button
                onClick={clearSignature}
                className="mt-2 text-[11px] text-gold underline"
              >
                مسح التوقيع
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('payment')}
                className="flex-1 rounded-full border border-gold/40 text-brand dark:text-gold text-[12px] font-bold py-2.5 flex items-center justify-center gap-1"
              >
                <ArrowRight size={13} /> رجوع
              </button>
              <button
                disabled={!hasSignature || submitting}
                onClick={submitFinal}
                className="flex-1 rounded-full bg-gold-gradient text-brand text-[12px] font-extrabold py-2.5 shadow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  'جاري الإرسال...'
                ) : (
                  <>
                    <Send size={13} /> إرسال الطلب
                  </>
                )}
              </button>
            </div>
            <div className="text-[10px] text-center text-muted flex items-center justify-center gap-1">
              <ShieldCheck size={11} className="text-gold" /> اتصال آمن — بياناتك
              محمية
            </div>
          </div>
        )}

        {/* STEP 5 - SUCCESS */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <CheckCircle2 className="text-green-600" size={30} />
            </div>
            <h3 className="text-[15px] font-extrabold text-brand dark:text-gray-100 mb-1">
              تم إرسال طلبك بنجاح
            </h3>
            <p className="text-[12px] text-muted dark:text-gray-400 mb-2">
              سنقوم بالتواصل معك خلال 24 ساعة عمل.
            </p>
            {resultId && (
              <div className="text-[11px] text-muted mb-4">
                رقم الطلب: <b className="text-brand dark:text-gold">{resultId}</b>
              </div>
            )}
            <div className="flex flex-col gap-2 max-w-[280px] mx-auto">
              <a
                href="#/dashboard"
                className="rounded-full bg-gold-gradient text-brand text-[12px] font-extrabold py-2.5 shadow"
              >
                طلباتي
              </a>
              <a
                href="#/"
                className="rounded-full border border-gold/40 text-brand dark:text-gold text-[12px] font-bold py-2.5"
              >
                العودة للرئيسية
              </a>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

const FieldLabel: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <div className="flex items-center gap-1 text-[11px] font-bold text-brand dark:text-gray-300 mb-1 mt-1 text-right">
    <span className="text-gold">{icon}</span>
    {label}
  </div>
);

export default ProductRequestForm;
