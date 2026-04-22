import React, { useState, useRef, useEffect } from 'react';
import rifansStampImg from '@/assets/rifans-stamp.png';
import rifansLogo from '@/assets/rifans-logo.png';
import { X, CheckCircle, Download, Printer, ShieldCheck, PenTool, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from './Shared';
import { useAuth } from '../../contexts/AuthContext';
import { safeStringify, safeParse } from '../../utils/safeJson';
import { getSubmission, submitSignature, notifyAdminContractSigned, uploadDocument } from '../../lib/api';
import { formatAmount } from '../../lib/formatNumber';
import { toPng } from 'html-to-image';
import { downloadContractPdf, printContractPdf } from '../../lib/generateContractPdf';

interface ContractPageProps {
  submissionId: string;
  onClose: () => void;
}

/* ══════════ Typography Standard (Final Spec) ══════════
 * Font: Tajawal (single font family)
 * Main title: 18pt Bold | Article headings: 14pt Bold
 * Body: 13pt Regular | line-height 1.7
 * Lists: 12.5pt | Party labels: 11pt | Party values: 12.5pt
 * Important amounts: 14pt Bold | Signatures: 12pt
 * ══════════════════════════════════════════════════════ */
const sectionStyle: React.CSSProperties = { pageBreakInside: 'avoid', marginBottom: '20px', marginTop: '18px' };
const headingStyle: React.CSSProperties = {
  fontSize: '18pt',
  fontWeight: 700,
  color: '#22042C',
  marginBottom: '12px',
  fontFamily: 'Tajawal, sans-serif',
  lineHeight: 1.5,
};
const paragraphStyle: React.CSSProperties = {
  fontSize: '16pt',
  lineHeight: 1.9,
  color: '#222222',
  textAlign: 'justify',
  direction: 'rtl',
  fontWeight: 400,
  marginBottom: '14px',
};
const listStyle: React.CSSProperties = {
  direction: 'rtl',
  textAlign: 'right',
  paddingRight: '26px',
  listStylePosition: 'outside',
  fontSize: '15.5pt',
  lineHeight: 1.9,
  color: '#222222',
  fontWeight: 400,
};
const tableHeaderCellStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontWeight: 700,
  fontSize: '15.5pt',
  color: '#22042C',
  backgroundColor: '#f3eff5',
  textAlign: 'right',
  borderBottom: '2px solid #d4c8d9',
  fontFamily: 'Tajawal, sans-serif',
};
const tableCellStyle: React.CSSProperties = {
  padding: '11px 16px',
  fontSize: '15.5pt',
  textAlign: 'right',
  borderBottom: '1px solid #e8e0ed',
  color: '#222222',
  lineHeight: 1.7,
  minHeight: '36px',
  fontWeight: 500,
};
const tableLabelCellStyle: React.CSSProperties = {
  ...tableCellStyle,
  fontWeight: 700,
  backgroundColor: '#faf8fc',
  width: '180px',
  fontSize: '14pt',
  color: '#666',
};

const ContractPage: React.FC<ContractPageProps> = ({ submissionId, onClose }) => {
  const { token, user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contractRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadySigned, setIsAlreadySigned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [submission, setSubmission] = useState<any>(null);

  const products = Array.isArray(submission?.data?.products)
    ? submission.data.products
    : (typeof submission?.data?.products === 'string' ? safeParse(submission.data.products, []) : []);
  const totalDebt = products.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0) || 0;

  const fetchSubmission = async () => {
    setIsLoading(true);
    try {
      const data = await getSubmission(submissionId);
      if (data) {
        setSubmission(data);
        if (data.signature_data) setIsAlreadySigned(true);
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (token && submissionId) fetchSubmission(); }, [token, submissionId]);

  useEffect(() => {
    if (!isLoading && submission) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#0000FF'; }
      const resizeCanvas = () => {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = 150;
          if (ctx) { ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#0000FF'; }
        }
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [isLoading, submission]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true); setHasSignature(true);
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath(); ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top); ctx.stroke();
  };
  const stopDrawing = () => setIsDrawing(false);
  const clearSignature = () => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (canvas && ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); setHasSignature(false); }
  };

  const handleSignSubmit = async () => {
    if (!hasSignature) { alert('يرجى التوقيع أولاً'); return; }
    setIsSubmitting(true);
    const signatureData = canvasRef.current?.toDataURL();
    if (signatureData) {
      try {
        await submitSignature(submissionId, signatureData);
        setIsSuccess(true);
        try {
          const contractEl = contractRef.current;
          if (contractEl) {
            const dataUrl = await toPng(contractEl, { quality: 0.95, backgroundColor: '#ffffff' });
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], `contract-${submissionId}.png`, { type: 'image/png' });
            const uploaded = await uploadDocument(file);
            await notifyAdminContractSigned(submissionId, uploaded);
          } else {
            await notifyAdminContractSigned(submissionId);
          }
        } catch (emailErr) {
          console.error('Failed to send contract email to admin:', emailErr);
        }
      } catch (error) {
        console.error('Error submitting signature:', error);
        alert('فشل حفظ التوقيع');
      }
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex flex-col items-center justify-center p-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-brand animate-spin mb-4" />
          <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold" size={24} />
        </div>
        <p className="text-brand font-black font-['Tajawal'] text-lg">جاري تجهيز وثيقة التعاقد...</p>
        <p className="text-muted text-sm mt-2">يرجى الانتظار، يتم جلب البيانات الموثقة</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="text-red-500" size={40} />
        </div>
        <h3 className="text-xl font-bold text-brand mb-2">فشل تحميل العقد</h3>
        <p className="text-muted mb-6 max-w-xs">حدث خطأ أثناء محاولة جلب بيانات العقد.</p>
        <div className="flex gap-3">
          <Button onClick={fetchSubmission} className="bg-brand text-white px-8">إعادة المحاولة</Button>
          <Button onClick={onClose} variant="outline">إلغاء</Button>
        </div>
      </div>
    );
  }

  const isRescheduling = submission?.type === 'rescheduling_request' || submission?.type === 'scheduling_request';
  const isSeizedAmounts = submission?.type === 'seized_amounts_request';
  const contractTitle = isRescheduling
    ? 'عقد تفويض ومتابعة طلب جدولة منتجات تمويلية'
    : isSeizedAmounts
    ? 'عقد تفويض ومتابعة طلب إتاحة النسبة النظامية'
    : 'عقد تفويض ومتابعة طلب إعفاء تمويلي';

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col overflow-x-hidden print-container">
      {/* ── Top Navigation Bar ── */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 shadow-sm print:hidden">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#22042C] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
            <ShieldCheck className="text-[#C5A059]" size={18} />
          </div>
          <div>
            <h2 className="text-[13px] sm:text-[15px] font-bold text-[#22042C] font-['Tajawal']">بوابة توقيع العقود الإلكترونية</h2>
            <p className="text-[9px] sm:text-[10px] text-muted font-medium">عقد رقم: {submissionId}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {isAlreadySigned && (
            <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-[11px] font-bold border border-green-100 ml-4">
              <CheckCircle size={14} />
              تم التوقيع مسبقاً
            </div>
          )}
          <button onClick={() => window.location.hash = '#/dashboard'} className="p-2 text-muted hover:text-brand hover:bg-gray-50 rounded-lg transition-all print:hidden flex items-center gap-2 text-[12px] font-bold" title="العودة للوحة التحكم">
            <ArrowRight size={18} className="rotate-180" /><span className="hidden sm:inline">العودة</span>
          </button>
          <div className="w-px h-6 bg-gray-100 mx-1 hidden sm:block" />
          <button onClick={async () => { if (!contractRef.current || isPdfLoading) return; setIsPdfLoading(true); try { await printContractPdf(contractRef.current); } catch (e) { console.error(e); } setIsPdfLoading(false); }} disabled={isPdfLoading} className="p-2 text-muted hover:text-brand hover:bg-gray-50 rounded-lg transition-all print:hidden disabled:opacity-50" title="طباعة">
            {isPdfLoading ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
          </button>
          <div className="w-px h-6 bg-gray-100 mx-1 hidden sm:block" />
          <button onClick={async () => { if (!contractRef.current || isPdfLoading) return; setIsPdfLoading(true); try { await downloadContractPdf(contractRef.current, `عقد-${submissionId}.pdf`); } catch (e) { console.error(e); } setIsPdfLoading(false); }} disabled={isPdfLoading} className="p-2 text-muted hover:text-brand hover:bg-gray-50 rounded-lg transition-all print:hidden disabled:opacity-50" title="تحميل بصيغة PDF">
            {isPdfLoading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </button>
          <div className="w-px h-6 bg-gray-100 mx-1 hidden sm:block" />
          <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-50 text-muted hover:bg-red-50 hover:text-red-500 rounded-lg sm:rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 p-1.5 sm:p-6 scrollbar-hide print:p-0 bg-[#F0F2F5] print:bg-white overflow-y-auto">
        <div
          ref={contractRef}
          data-pdf-root="true"
          className="max-w-[210mm] mx-auto bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-200 relative overflow-hidden print:shadow-none print:border-none print:w-full"
          style={{
            fontFamily: 'Tajawal, sans-serif',
            direction: 'rtl',
            padding: '40px 48px',
            color: '#222222',
            fontSize: '13pt',
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          {/* ══════════ HEADER (captured for PDF repeat) ══════════ */}
          <div className="contract-header" style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '3px solid #22042C' }}>
            {/* Row 1: Logo + Company name */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              {/* Right: Company info */}
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '13pt', fontWeight: 700, color: '#22042C', margin: 0, fontFamily: 'Tajawal, sans-serif', lineHeight: 1.4 }}>
                  شركة ريفانس المالية
                </h1>
                <p style={{ fontSize: '18pt', fontWeight: 700, color: '#22042C', margin: '6px 0 0 0', textAlign: 'center', lineHeight: 1.4 }}>
                  {contractTitle}
                </p>
              </div>
              {/* Left: Logo */}
              <div style={{ flexShrink: 0, marginRight: '16px' }}>
                <img src={rifansLogo} alt="Rifans Logo" style={{ height: '90px', width: 'auto', objectFit: 'contain' }} />
              </div>
            </div>
            {/* Row 2: Contract meta grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 28px', fontSize: '11pt', color: '#666', marginTop: '8px', fontWeight: 500 }}>
              <span>رقم ملف العميل: <strong style={{ fontFamily: 'monospace', color: '#22042C', fontSize: '12.5pt' }}>{submissionId}</strong></span>
              <span>رقم العقد: <strong style={{ fontFamily: 'monospace', color: '#22042C', fontSize: '12.5pt' }}>{submissionId}</strong></span>
              <span>تاريخ العقد: <strong style={{ color: '#22042C', fontSize: '12.5pt' }}>{new Date(submission.timestamp).toLocaleDateString('ar-SA')}</strong></span>
            </div>
          </div>

          {/* ══════════ CONTRACT BODY ══════════ */}
          <div style={{ direction: 'rtl', textAlign: 'right' }}>

            {/* ── Parties Table ── */}
            <div style={{ ...sectionStyle, overflow: 'hidden', borderRadius: '6px', border: '1px solid #d4c8d9' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...tableHeaderCellStyle, borderLeft: '1px solid #d4c8d9', width: '50%' }}>الطرف الأول</th>
                    <th style={{ ...tableHeaderCellStyle, width: '50%' }}>الطرف الثاني</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ ...tableCellStyle, verticalAlign: 'top', borderLeft: '1px solid #e8e0ed', borderBottom: 'none', lineHeight: 2 }}>
                      <div><strong>الاسم:</strong> شركة ريفانس المالية</div>
                      <div><strong>الرقم الوطني الموحد:</strong> 7038821125</div>
                      <div><strong>ويمثلها:</strong> AZZAH ALOBIDI بصفة المدير العام</div>
                      <div><strong>وبموجب تفويض رقم:</strong> DLG398908</div>
                    </td>
                    <td style={{ ...tableCellStyle, verticalAlign: 'top', borderBottom: 'none', lineHeight: 2 }}>
                      <div><strong>اسم العميل:</strong> {submission.data.firstName} {submission.data.middleName} {submission.data.lastName}</div>
                      <div><strong>رقم الهوية الوطنية:</strong> {submission.data.nationalId || submission.data.userNationalId || '---'}</div>
                      <div><strong>رقم الجوال:</strong> {submission.data.mobile}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── التمهيد ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>التمهيد:</h3>
              <p style={paragraphStyle}>
                {isRescheduling ? (
                  <>
                    حيث إن الطرف الثاني لديه التزامات مالية قائمة لدى البنوك والجهات التمويلية، وحيث إن الطرف الأول يعد من الجهات المتخصصة ذات الخبرة والكفاءة المهنية العالية في مجال المنازعات المصرفية والتمويلية، ويضم نخبة من اللجان القانونية المؤهلة القادرة على دراسة الطلبات وتدقيق المستندات ومتابعة الإجراءات بشكل رسمي ونظامي مع البنوك والمصارف والجهات التمويلية وكافة الجهات التنظيمية ذات العلاقة.
                    وحيث إن الطرف الثاني قد أبدى رغبته الصريحة في التقدم بطلب إعادة جدولة المنتجات التمويلية القائمة لديه لدى البنوك والمصارف، وحيث إن الطرف الأول قد أثبت جدارته المهنية من خلال ما يملكه من لجان متخصصة وخبرات عملية في إدارة طلبات العملاء المقدمة إلى الجهات التمويلية.
                    وحيث إن هذا التمهيد يعد جزءاً لا يتجزأ من هذا العقد ومكملاً ومفسراً لبنوده، فقد اتفق الطرفان وهما بكامل الأهلية المعتبرة شرعاً ونظاماً على إبرام هذا العقد وفقاً لما يلي:
                  </>
                ) : isSeizedAmounts ? (
                  <>
                    حيث إن الطرف الثاني لديه مبالغ مالية محجوزة أو مستقطعة بما يتجاوز النسبة النظامية المقررة وفقاً للأنظمة السعودية، وحيث إن الطرف الأول يعد من الجهات المتخصصة ذات الخبرة والكفاءة المهنية العالية في مجال المنازعات المصرفية والتمويلية، ويضم نخبة من اللجان القانونية المؤهلة القادرة على دراسة الطلبات وتدقيق المستندات ومتابعة الإجراءات بشكل رسمي ونظامي مع البنوك والمصارف والجهات التمويلية وكافة الجهات التنظيمية ذات العلاقة.
                    وحيث إن الطرف الثاني قد أبدى رغبته الصريحة في التقدم بطلب إتاحة النسبة النظامية واسترداد المبالغ المستثناه من الحجز، وحيث إن هذا التمهيد يعد جزءاً لا يتجزأ من هذا العقد ومكملاً ومفسراً لبنوده، فقد اتفق الطرفان وهما بكامل الأهلية المعتبرة شرعاً ونظاماً على إبرام هذا العقد وفقاً لما يلي:
                  </>
                ) : (
                  <>
                    حيث إن الطرف الثاني قد تقدم وأفاد بأن لديه عجزاً طبياً مثبتاً بموجب تقارير رسمية صادرة من الجهات الطبية المختصة؛ وحيث إن الطرف الأول يُعد من الجهات المتخصصة ذات الخبرة والكفاءة المهنية العالية في مجال المنازعات المصرفية والتمويلية، ويضم نخبة من اللجان القانونية المؤهلة القادرة على دراسة الطلبات، وتدقيق المستندات والتقارير الطبية، ومتابعة الإجراءات بشكل رسمي ونظامي مع البنوك والمصارف والجهات التمويلية والهيئات الطبية وكافة الجهات التنظيمية ذات العلاقة؛ وحيث إن الطرف الثاني قد أبدى رغبته الصريحة في التقدم بطلب إعفاء من جميع التزاماته التمويلية القائمة لدى البنوك والمصارف؛ وحيث إن الطرف الأول قد أثبت جدارته المهنية من خلال ما يملكه من لجان متخصصة وخبرات عملية في إدارة طلبات العملاء المقدمة إلى الجهات التمويلية، وما حققه من نتائج إيجابية تسهم في حفظ حقوق العملاء وتحقيق مصالحهم؛ وحيث إن هذا التمهيد يُعد جزءاً لا يتجزأ من هذا العقد ومكملاً ومفسراً لبنوده؛ فقد اتفق الطرفان، وهما بكامل الأهلية المعتبرة شرعاً ونظاماً، على إبرام هذا العقد وفقاً لما يلي:
                  </>
                )}
              </p>
            </section>

            {/* ── المادة 1 ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>المادة (1): حجية التعامل الإلكتروني</h3>
              <p style={paragraphStyle}>يقر الطرفان بموافقتهما على إبرام هذا العقد واستخدام الوسائل الإلكترونية (البريد الإلكتروني والرسائل النصية) لتوثيقه، وتعد هذه الوسائل حجة ملزمة وقائمة بذاتها وفقاً لنظام التعاملات الإلكترونية السعودي، ولها ذات الحجية القانونية للتوقيع اليدوي أمام كافة الجهات الرسمية والقضائية.</p>
            </section>

            {/* ── المادة 2 ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>المادة (2): موضوع العقد والتفويض</h3>
              <p style={{ ...paragraphStyle, marginBottom: '12px' }}>
                {isRescheduling
                  ? `يفوض الطرف الثاني بموجب هذا العقد تفويضاً صريحاً ومباشراً وقابلاً للتنفيذ للطرف الأول في استلام وتقديم ومتابعة طلب إعادة جدولة المنتجات التمويلية الخاصة به لدى ${submission.data.bank || 'الجهات التمويلية والبنوك'}، وذلك فيما يتعلق بمنتجات التمويل الموضحة أدناه:`
                  : isSeizedAmounts
                  ? `يفوض الطرف الثاني بموجب هذا العقد تفويضاً صريحاً ومباشراً وقابلاً للتنفيذ للطرف الأول في استلام وتقديم ومتابعة طلب إتاحة النسبة النظامية واسترداد المبالغ المستثناه من الحجز لدى ${submission.data.bank || 'الجهات التمويلية والبنوك'}، وذلك فيما يتعلق بالمبالغ والمنتجات الموضحة أدناه:`
                  : `يفوض الطرف الثاني بموجب هذا العقد تفويضاً صريحاً ومباشراً وقابلاً للتنفيذ للطرف الأول في استلام وتقديم ومتابعة طلب الإعفاء المقدم من الطرف الثاني لدى ${submission.data.bank || 'الجهة المالية'}، وذلك فيما يتعلق بمنتجات التمويل الموضحة أدناه:`
                }
              </p>

              {/* ── Financial Products Table (Bank-grade) ── */}
              <div style={{ overflow: 'hidden', borderRadius: '6px', border: '1px solid #d4c8d9', pageBreakInside: 'avoid' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ ...tableHeaderCellStyle, borderLeft: '1px solid #d4c8d9' }}>الجهة التمويلية</th>
                      <th style={{ ...tableHeaderCellStyle, borderLeft: '1px solid #d4c8d9' }}>نوع المنتج</th>
                      <th style={{ ...tableHeaderCellStyle, borderLeft: '1px solid #d4c8d9' }}>رقم الحساب</th>
                      <th style={tableHeaderCellStyle}>المبلغ (ريال سعودي)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: any, idx: number) => (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#faf8fc' : '#ffffff' }}>
                        <td style={{ ...tableCellStyle, borderLeft: '1px solid #e8e0ed' }}>{idx === 0 ? (submission.data.bank || 'الجهة المالية') : ''}</td>
                        <td style={{ ...tableCellStyle, borderLeft: '1px solid #e8e0ed' }}>{product.type}</td>
                        <td style={{ ...tableCellStyle, borderLeft: '1px solid #e8e0ed', fontFamily: 'monospace', fontSize: '14px' }}>{product.accountNumber || product.account_number || '---'}</td>
                        <td style={{ ...tableCellStyle, fontWeight: 700, color: '#b91c1c', fontSize: '13.5pt' }}>{formatAmount(product.amount)}</td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr style={{ backgroundColor: '#f3eff5' }}>
                      <td colSpan={3} style={{ ...tableCellStyle, fontWeight: 700, fontSize: '14pt', borderTop: '2px solid #d4c8d9', borderLeft: '1px solid #d4c8d9', borderBottom: 'none' }}>
                        إجمالي المديونية
                      </td>
                      <td style={{ ...tableCellStyle, fontWeight: 700, fontSize: '14pt', color: '#22042C', borderTop: '2px solid #d4c8d9', borderBottom: 'none' }}>
                        {formatAmount(totalDebt)} ريال سعودي
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── المادة 3 ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>المادة (3): نطاق التفويض</h3>
              <p style={{ ...paragraphStyle, marginBottom: '8px' }}>يشمل التفويض الممنوح للطرف الأول الصلاحيات التالية:</p>
              {isRescheduling ? (
                <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
                  <li style={{ marginBottom: '4px' }}>الاطلاع على المستندات والبيانات المالية.</li>
                  <li style={{ marginBottom: '4px' }}>التواصل مع البنوك والجهات التمويلية.</li>
                  <li style={{ marginBottom: '4px' }}>رفع الطلبات ومتابعتها، وإعداد المذكرات النظامية والحضور النظامي عند الحاجة.</li>
                </ol>
              ) : (
                <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
                  <li style={{ marginBottom: '4px' }}>الاطلاع على التقارير الطبية والمستندات الرسمية.</li>
                  <li style={{ marginBottom: '4px' }}>التواصل مع البنوك والجهات التمويلية.</li>
                  <li style={{ marginBottom: '4px' }}>رفع الطلبات ومتابعتها، وإعداد المذكرات القانونية والحضور النظامي عند الحاجة.</li>
                </ol>
              )}
            </section>

            {/* ── المادة 4 ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>المادة (4): التزامات الطرف الأول</h3>
              <p style={paragraphStyle}>يلتزم الطرف الأول بالمحافظة على سرية بيانات الطرف الثاني، وبذل أقصى درجات العناية المهنية، ورفع الطلبات بصيغة رسمية تعزز فرص القبول، وإبلاغ الطرف الثاني بالمستجدات دورياً.</p>
            </section>

            {/* ── المادة 5 ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>المادة (5): التزامات الطرف الثاني</h3>
              <p style={paragraphStyle}>يلتزم الطرف الثاني بتقديم كافة المستندات والبيانات الصحيحة، التعاون مع الطرف الأول لاستكمال النواقص، والالتزام بسداد الأتعاب المستحقة وفقاً لأحكام العقد.</p>
            </section>

            {/* ── المادة 6 ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>المادة (6): المستحقات المالية والأتعاب</h3>
              <p style={paragraphStyle}>
                {isRescheduling
                  ? 'لا تستحق أتعاب الطرف الأول إلا بعد صدور قرار الموافقة على إعادة جدولة المنتجات التمويلية وإتمام الإجراءات ذات العلاقة. وفي حال صدور القرار يستحق الطرف الأول أتعاباً مقطوعة قدرها: 2,000 ريال سعودي فقط.'
                  : isSeizedAmounts
                  ? 'لا تستحق أتعاب الطرف الأول إلا بعد صدور قرار إتاحة النسبة النظامية واسترداد المبالغ المستثناه من الحجز. وفي حال صدور القرار، يستحق الطرف الأول أتعاباً مقطوعة قدرها (1%) من إجمالي المبالغ المستردة فعلياً.'
                  : 'لا تستحق أتعاب الطرف الأول إلا بعد صدور قبول طلب الإعفاء وإصدار خطاب المخالصة المالية، وفي حال قبول طلب الإعفاء، يستحق الطرف الأول أتعاباً مقطوعة قدرها (4%) من إجمالي المبالغ المعفاة فعلياً.'
                }
              </p>
              <p style={{ marginTop: '8px', fontWeight: 700, color: '#b91c1c', fontSize: '13pt' }}>
                "وفي حال عدم قبول الطلب، لا يحق للطرف الأول المطالبة بأي أتعاب"
              </p>
            </section>

            {/* ── المادة 7 ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>المادة (7): مدة العقد</h3>
              <p style={paragraphStyle}>
                {isRescheduling
                  ? 'يبدأ العمل بهذا العقد من تاريخ توقيعه، ويستمر سارياً حتى صدور قرار الجهة التمويلية بشأن طلب إعادة الجدولة، ما لم يتم إنهاؤه باتفاق مكتوب بين الطرفين أو وفقاً للأنظمة.'
                  : isSeizedAmounts
                  ? 'يبدأ العمل بهذا العقد من تاريخ توقيعه، ويستمر سارياً حتى صدور قرار إتاحة النسبة النظامية واسترداد المبالغ المستثناه من الحجز، ما لم يتم إنهاؤه باتفاق مكتوب بين الطرفين أو وفقاً للأنظمة.'
                  : 'يبدأ العمل بهذا العقد من تاريخ توقيعه، ويستمر سارياً حتى قبول طلب الإعفاء، ما لم يتم إنهاؤه باتفاق مكتوب بين الطرفين أو وفقاً للأنظمة.'
                }
              </p>
            </section>

            {/* ── المادة 8 ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>المادة (8): سند لأمر وإقرار دين واجب النفاذ</h3>
              <p style={{ ...paragraphStyle, marginBottom: '12px' }}>
                {isRescheduling
                  ? 'اتفق الطرفان على أن يعد هذا العقد بمثابة سند لأمر واجب النفاذ وفقاً لأحكام نظام الأوراق التجارية ونظام التنفيذ السعودي. ويقر الطرف الثاني إقراراً صريحاً ونهائياً بالتزامه بسداد أتعاب الطرف الأول وقدرها 2,000 ريال سعودي عند صدور قرار الموافقة على طلب إعادة الجدولة.'
                  : isSeizedAmounts
                  ? 'اتفق الطرفان على أن يُعد هذا العقد بمثابة سندٍ لأمرٍ واجب النفاذ وفقًا لأحكام نظام الأوراق التجارية ونظام التنفيذ السعودي، ويقر الطرف الثاني إقرارًا صريحًا ونهائيًا بالتزامه بسداد أتعاب الطرف الأول بنسبة (1%) من إجمالي المبالغ المستردة فعلياً، وذلك فور صدور قرار إتاحة النسبة النظامية واسترداد المبالغ المستثناه من الحجز.'
                  : 'اتفق الطرفان على أن يُعد هذا العقد بمثابة سندٍ لأمرٍ واجب النفاذ وفقًا لأحكام نظام الأوراق التجارية ونظام التنفيذ السعودي، ويقر الطرف الثاني إقرارًا صريحًا ونهائيًا بالتزامه بسداد أتعاب الطرف الأول بنسبة (4%) من إجمالي مبالغ المنتجات التمويلية التي يتم إعفاؤه منها، وذلك فور قبول طلب الإعفاء واستلام خطاب المخالصة المالية.'
                }
              </p>

              <div style={{ overflow: 'hidden', borderRadius: '6px', border: '1px solid #d4c8d9', pageBreakInside: 'avoid' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['رقم ملف العميل', submissionId],
                      ['رقم السند', submissionId],
                      ['قيمة السند', isRescheduling ? '2,000 ريال سعودي' : isSeizedAmounts ? 'تمثل نسبة (1%) من إجمالي المبالغ المستردة فعلياً' : 'تمثل نسبة (4%) من إجمالي مبالغ المنتجات التمويلية المعفاة فعليًا'],
                      ['تاريخ الاستحقاق', isRescheduling ? 'فور صدور الموافقة على طلب إعادة الجدولة' : isSeizedAmounts ? 'فور صدور قرار إتاحة النسبة النظامية واسترداد المبالغ' : 'فور قبول طلب الإعفاء واستلام خطاب المخالصة المالية'],
                      ['مكان الوفاء', 'مدينة جدة – المملكة العربية السعودية'],
                    ].map(([label, value], i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#faf8fc' }}>
                        <td style={tableLabelCellStyle}>{label}</td>
                        <td style={tableCellStyle}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: '8px', fontSize: '10px', color: '#6b7280' }}>
                ويُعد هذا السند مستوفيًا لكافة البيانات والشروط النظامية المقررة، ويُعد دينًا ثابتًا في ذمة الطرف الثاني، ويحق للطرف الأول التقدم به مباشرة إلى محكمة التنفيذ المختصة لتنفيذه وفقًا للأنظمة المعمول بها في المملكة العربية السعودية.
              </p>
            </section>

            {/* ── المادة 9 ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>المادة (9): أحكام عامة</h3>
              <p style={paragraphStyle}>يخضع العقد لأنظمة المملكة العربية السعودية. لا يُعد أي تعديل نافذاً إلا إذا كان مكتوباً وموقعاً من الطرفين.</p>
            </section>

            {/* ── المادة 10 ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>المادة (10): الإقرار والتنازل عن الدفوع</h3>
              <p style={{ ...paragraphStyle, marginBottom: '8px' }}>يُقر الطرف الثاني إقراراً صريحاً ونهائياً بما يلي:</p>
              <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
                <li style={{ marginBottom: '4px' }}>صحة جميع البيانات والمستندات المقدمة منه.</li>
                <li style={{ marginBottom: '4px' }}>صحة احتساب الأتعاب وفق ما ورد في هذا العقد.</li>
                <li style={{ marginBottom: '4px' }}>التنازل عن أي دفوع أو منازعات تتعلق بسند الأمر متى ما تم إصداره عبر منصة نافذ وفق أحكام هذا العقد.</li>
                <li style={{ marginBottom: '4px' }}>عدم الطعن أو الاعتراض على التنفيذ أمام محكمة التنفيذ إلا في الحدود التي يجيزها النظام.</li>
              </ol>
            </section>

            {/* ── المادة 11 ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>المادة (11): الإقرار والقبول النهائي</h3>
              <p style={paragraphStyle}>يُقر الطرف الثاني بما يلي: اطلاعه الكامل على العقد وفهمه لآثاره، صحة التفويض الممنوح، صحة احتساب الأتعاب، وأن هذا الإقرار حجة قاطعة وملزمة أمام جميع الجهات القضائية والتنفيذية.</p>
            </section>

            {/* ── المادة 12 ── */}
            <section style={sectionStyle}>
              <h3 style={headingStyle}>المادة (12): التفويض</h3>
              <p style={paragraphStyle}>
                {isRescheduling ? (
                  <>
                    أقر أنا الموقع أدناه وبكامل أهليتي المعتبرة شرعاً ونظاماً بأنني قد فوضت شركة ريفانس المالية، سجل تجاري رقم 7038821125، تفويضاً كاملاً غير مشروط بمراجعة كافة الجهات الحكومية والخاصة والجهات التمويلية والبنوك والمصارف وشركات التمويل وشركة المعلومات الائتمانية (سمة)، وذلك للاطلاع على كافة بياناتي الائتمانية والتمويلية.
                    كما يشمل هذا التفويض حق تقديم طلبات إعادة جدولة المنتجات التمويلية أو تسوية الالتزامات واستلام خطابات المخالصة ومتابعة كافة الإجراءات المتعلقة بملفي لدى البنك المركزي السعودي وكافة اللجان القضائية والرقابية.
                    ويعد هذا التفويض سارياً من تاريخ توقيعه وحتى انتهاء الغرض الذي أعد من أجله أو قيامي بإلغائه رسمياً عبر القنوات المعتمدة لدى الشركة مع التزامي بكافة النتائج والآثار القانونية المترتبة على هذا التفويض.
                  </>
                ) : (
                  <>
                    أقر أنا الموقع أدناه وبكامل أهليتي المعتبرة شرعاً ونظاماً بأنني قد فوضت شركة ريفانس المالية، سجل تجاري رقم 7038821125 تفويضاً كاملاً غير مشروط بمراجعة كافة الجهات الحكومية والخاصة والجهات التمويلية (البنوك والمصارف وشركات التمويل) وشركة المعلومات الائتمانية (سمة)، وذلك للاطلاع على كافة بياناتي الائتمانية والتمويلية والطبية.
                    كما يشمل هذا التفويض حق تقديم طلبات الإعفاء من المديونيات، أو طلبات إعادة الجدولة، أو تسوية الالتزامات واستلام خطابات المخالصة أو قرارات الإعفاء، ومتابعة كافة الإجراءات المتعلقة بملفي لدى البنك المركزي السعودي وكافة اللجان القضائية والرقابية.
                    ويعد هذا التفويض سارياً من تاريخ توقيعه وحتى انتهاء الغرض الذي أعد من أجله أو قيامي بإلغائه رسمياً عبر القنوات المعتمدة لدى الشركة، مع التزامي بكافة النتائج والآثار القانونية المترتبة على هذا التفويض.
                  </>
                )}
              </p>
            </section>

            {/* ══════════ SIGNATURES ══════════ */}
            <div style={{ marginTop: '36px', paddingTop: '16px', borderTop: '2px solid #22042C', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', pageBreakInside: 'avoid' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: '12pt', color: '#22042C', marginBottom: '8px' }}>توقيع الطرف الأول</p>
                <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={rifansStampImg} alt="First Party Stamp" style={{ height: '100%', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                </div>
                <p style={{ fontSize: '11pt', color: '#666', marginTop: '4px', fontWeight: 500 }}>شركة ريفانس المالية</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: '12pt', color: '#22042C', marginBottom: '8px' }}>توقيع الطرف الثاني (العميل)</p>
                <div style={{ height: '120px', backgroundColor: '#faf8fc', borderRadius: '6px', border: '1px solid #e8e0ed', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {isSuccess || isAlreadySigned ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      {(isAlreadySigned && submission.signature_data) ? (
                        <img src={submission.signature_data} alt="توقيع العميل" style={{ height: '60px', objectFit: 'contain' }} />
                      ) : (
                        <img src={canvasRef.current?.toDataURL() || ''} alt="توقيع العميل" style={{ height: '60px', objectFit: 'contain' }} />
                      )}
                      <span style={{ fontSize: '11pt', color: '#22042C', fontWeight: 500 }}>
                        {submission.data.firstName} {submission.data.middleName} {submission.data.lastName}
                      </span>
                      <span style={{ fontSize: '11pt', color: '#666' }}>
                        {new Date(submission.signed_at || submission.timestamp).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#d1d5db' }}>
                      <PenTool size={20} />
                      <span style={{ fontSize: '11pt', fontWeight: 500, fontStyle: 'italic' }}>بانتظار التوقيع...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ══════════ FOOTER (inside contract) ══════════ */}
            <div style={{ marginTop: '28px', borderTop: '1px solid #e5e7eb', paddingTop: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '10pt', color: '#666', fontWeight: 500 }}>
                هذه الوثيقة صادرة عن النظام الإلكتروني لشركة ريفانس المالية وهي ملزمة قانوناً بمجرد التوقيع عليها.
              </p>
              <p style={{ fontSize: '10pt', color: '#999', marginTop: '4px' }}>
                جميع الحقوق محفوظة © ريفانس المالية {new Date().getFullYear()}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom Signature Action Bar ── */}
      {(!isSuccess && !isAlreadySigned) && (
        <div className="bg-white border-t border-gray-100 p-4 sm:p-8 sticky bottom-0 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] print-hidden">
          <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
            <div className="flex-1 w-full">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[12px] sm:text-[13px] font-bold text-[#22042C] flex items-center gap-2 font-['Tajawal']">
                  <PenTool size={16} className="text-[#C5A059]" />
                  يرجى التوقيع في المربع أدناه:
                </label>
                <button onClick={clearSignature} className="text-[10px] sm:text-[11px] font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-all">مسح التوقيع</button>
              </div>
              <div className="bg-[#fcfaf7] border-2 border-dashed border-gray-200 rounded-2xl h-[120px] sm:h-[140px] relative shadow-inner group transition-all focus-within:border-[#C5A059]/50">
                <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-full cursor-crosshair" />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                    <p className="text-[11px] sm:text-[12px] text-muted font-['Tajawal']">ارسم توقيعك هنا</p>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full lg:w-[300px] flex flex-col gap-3">
              <Button onClick={handleSignSubmit} disabled={!hasSignature || isSubmitting} className="w-full py-4 bg-[#22042C] text-white rounded-2xl font-bold shadow-xl shadow-brand/20 hover:bg-brand/90 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 font-['Tajawal']">
                {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" />جاري الحفظ...</>) : (<>اعتماد التوقيع والإرسال<ArrowRight size={18} className="rotate-180" /></>)}
              </Button>
              <button onClick={onClose} className="w-full py-2 text-[12px] sm:text-[13px] font-bold text-muted hover:text-brand transition-all font-['Tajawal']">إلغاء ومراجعة لاحقاً</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-500 print-hidden">
          <div className="text-center p-6 sm:p-10 max-w-sm">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h3 className="text-[20px] sm:text-[24px] font-black text-[#22042C] mb-3 font-['Tajawal']">تم ارسال العقد بنجاح</h3>
            <p className="text-[13px] sm:text-[14px] text-muted leading-relaxed font-['Tajawal'] mb-6">
              شكراً لك {submission?.user_name?.split(' ')[0] || 'عميلنا العزيز'}، تم اعتماد توقيعك الإلكتروني بنجاح وإرسال النسخة الموقعة إلى النظام.
            </p>
            <Button onClick={onClose} className="w-full py-3 bg-brand text-white rounded-xl font-bold shadow-lg hover:bg-brand/90 transition-all flex items-center justify-center gap-2 font-['Tajawal']">
              الرجوع<ArrowRight size={18} className="rotate-180" />
            </Button>
            <div className="mt-8 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-[progress_3s_linear]" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractPage;
