import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Download, Printer, Loader2, FileText, Phone, Mail, Globe, MapPin, FileCheck, User, Users } from 'lucide-react';
import { Button } from './Shared';
import { useAuth } from '../../contexts/AuthContext';
import { getPromissoryNoteById, signPromissoryNote } from '../../lib/api';
import { formatAmount } from '../../lib/formatNumber';
import { numberToArabicWords } from '../../lib/arabicNumberToWords';
import { toPng } from 'html-to-image';
import rifansLogo from '@/assets/rifans-logo.png';
import rifansStampImg from '@/assets/rifans-stamp.png';

interface PromissoryNotePageProps {
  noteId: string;
  onClose: () => void;
}

// Build full Arabic Hijri + Gregorian "إنشاء" date label
const buildIssueDate = (iso: string) => {
  const d = new Date(iso);
  const dayName = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(d);
  const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  const gregorian = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  const time = new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true }).format(d);
  return `${dayName} ، ${hijri} هـ ، الموافق ${gregorian} ، ${time}`;
};

const PromissoryNotePage: React.FC<PromissoryNotePageProps> = ({ noteId, onClose }) => {
  const { user } = useAuth();
  const noteRef = useRef<HTMLDivElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [note, setNote] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPromissoryNoteById(noteId);
      setNote(data);
    } catch (err) {
      console.error('Error fetching promissory note:', err);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isOwner = !!(user && note && (user.id === note.user_id));
  const isAdmin = user?.role === 'admin';
  const isSigned = !!note?.signed_at;

  // ----- Signature canvas handlers -----
  const getCanvasPos = (canvas: HTMLCanvasElement, e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = sigCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { x, y } = getCanvasPos(canvas, e);
    ctx.beginPath(); ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { x, y } = getCanvasPos(canvas, e);
    ctx.lineTo(x, y); ctx.strokeStyle = '#22042C'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
    setHasSignature(true);
  };

  const endDraw = () => setIsDrawing(false);

  const clearSig = () => {
    const canvas = sigCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const submitSignature = async () => {
    if (!hasSignature || !sigCanvasRef.current) return;
    setIsSubmitting(true);
    try {
      const sig = sigCanvasRef.current.toDataURL('image/png');
      await signPromissoryNote(noteId, sig);
      await fetchData();
    } catch (err) {
      console.error('signing failed', err);
      alert('تعذر حفظ التوقيع، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    const el = noteRef.current; if (!el) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(el, { quality: 0.95, backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `promissory-note-${noteId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { console.error('Download failed:', err); }
    finally { setIsDownloading(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={40} />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center gap-4">
        <FileText className="text-muted" size={48} />
        <p className="text-muted text-sm">لم يتم العثور على سند الأمر</p>
        <Button onClick={onClose}>العودة</Button>
      </div>
    );
  }

  const issueDateLabel = buildIssueDate(note.created_at);
  const wordsAmount = note.amount_in_words || numberToArabicWords(Number(note.amount) || 0);
  const formattedAmount = `${formatAmount(Number(note.amount) || 0)} ر.س`;

  // Section header strip (purple bar with right-aligned title and icon block)
  const SectionStrip: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex items-stretch w-full mb-5 mt-1">
      <div className="flex-1 bg-[#22042C] rounded-l-[14px] flex items-center justify-end px-4 py-2.5">
        <span className="text-white text-[15px] font-bold">{title}</span>
      </div>
      <div className="w-12 flex items-center justify-center bg-[#22042C] rounded-r-[14px] border-r-2 border-gold/30 text-gold">
        {icon}
      </div>
    </div>
  );

  // Field row used inside section bodies
  const FieldRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center gap-3 mb-2.5">
      <div className="flex-1">{children}</div>
      <div className="w-[110px] text-right text-[12px] font-bold text-brand">{label}</div>
    </div>
  );

  const Box: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`min-h-[34px] bg-white border border-gray-300 rounded-[8px] px-3 py-1.5 text-[12px] text-brand font-bold flex items-center justify-end ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col overflow-x-hidden">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
          <span className="text-sm font-bold text-brand">سند لأمر رقم {note.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} disabled={isDownloading} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gold">
            <Download size={20} />
          </button>
          <button onClick={() => window.print()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gold">
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Note Sheet */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-8">
        <div ref={noteRef} className="w-full max-w-[820px] bg-white rounded-[10px] shadow-xl overflow-hidden p-6 sm:p-10" dir="rtl">
          {/* Header: logo left, title right */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={rifansLogo} alt="ريفانس المالية" className="h-16 w-auto object-contain" />
              <div className="leading-tight">
                <div className="text-[18px] font-black text-brand">ريفانس المالية</div>
                <div className="text-[11px] tracking-wider font-bold text-brand">RIFANIS FINANCE</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[28px] font-black text-brand leading-none">سند لأمر</div>
              <div className="mt-1 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                <span className="h-[2px] w-12 bg-gold/60"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              </div>
            </div>
          </div>

          {/* رقم السند */}
          <div className="flex items-center gap-3 mb-5">
            <Box className="flex-1 max-w-[420px] mr-auto">{note.id}</Box>
            <div className="w-[110px] text-right text-[12px] font-bold text-brand">رقم السند</div>
          </div>

          {/* تفاصيل السند */}
          <SectionStrip title="تفاصيل السند" icon={<FileText size={18} />} />
          <div className="px-1">
            <FieldRow label="تاريخ الإنشاء">
              <Box className="max-w-[420px] mr-auto">{issueDateLabel}</Box>
            </FieldRow>
            <FieldRow label="مدينة الإصدار">
              <Box className="max-w-[420px] mr-auto">{note.issue_city}</Box>
            </FieldRow>
            <FieldRow label="مدينة الوفاء">
              <Box className="max-w-[420px] mr-auto">{note.payment_city}</Box>
            </FieldRow>
            <FieldRow label="قيمة السند رقماً">
              <Box className="max-w-[420px] mr-auto">{formattedAmount}</Box>
            </FieldRow>
            <FieldRow label="قيمة السند كتابة">
              <Box className="max-w-[420px] mr-auto">{wordsAmount}</Box>
            </FieldRow>
            <FieldRow label="تاريخ الإستحقاق">
              <Box className="max-w-[420px] mr-auto">{note.due_date}</Box>
            </FieldRow>
          </div>

          {/* تفاصيل المدين */}
          <div className="mt-3" />
          <SectionStrip title="تفاصيل المدين" icon={<User size={18} />} />
          <div className="px-1">
            <FieldRow label="الإسم">
              <Box className="max-w-[420px] mr-auto">{note.debtor_name}</Box>
            </FieldRow>
            <FieldRow label="رقم الهوية">
              <Box className="max-w-[420px] mr-auto font-mono">{note.debtor_national_id}</Box>
            </FieldRow>
          </div>

          {/* تفاصيل الدائن */}
          <SectionStrip title="تفاصيل الدائن" icon={<Users size={18} />} />
          <div className="px-1">
            <FieldRow label="الإسم">
              <Box className="max-w-[420px] mr-auto">شركة ريفانس المالية</Box>
            </FieldRow>
            <FieldRow label="الرقم الوطني الموحد">
              <Box className="max-w-[420px] mr-auto font-mono">7038811125</Box>
            </FieldRow>
            <FieldRow label="يمثلها قانونياً">
              <Box className="max-w-[420px] mr-auto">AZZAH Ali ALOBIDI</Box>
            </FieldRow>
          </div>

          {/* Pledge paragraph with inline amount */}
          <div className="mt-5 border border-gray-300 rounded-[14px] p-4 sm:p-5 bg-gray-50/40">
            <p className="text-[13px] leading-[28px] text-brand font-bold text-justify">
              أتعهد بأن أدفع لامر شركة ريفانس المالية دون قيد أو شرط مبلغاً وقدره
              <span className="inline-block align-middle mx-2 min-w-[140px] border border-gray-300 bg-white rounded-[6px] px-3 py-1 text-center font-black">
                {formattedAmount}
              </span>
              وفق البيانات المذكورة أعلاه. ولحامل هذا السند حقُّ الرجوع دون أي مصاريف أو احتجاج بعدم الوفاء.
            </p>

            {/* Debtor name + signature row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-3">
                <div className="text-[12px] font-bold text-brand min-w-[70px]">إسم المدين :</div>
                <Box className="flex-1">{note.debtor_name}</Box>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[12px] font-bold text-brand min-w-[70px]">التوقيع :</div>
                <div className="flex-1 min-h-[48px] bg-white border border-gray-300 rounded-[8px] flex items-center justify-center overflow-hidden">
                  {isSigned && note.signature_data ? (
                    <img src={note.signature_data} alt="توقيع المدين" className="max-h-[44px] object-contain" />
                  ) : (
                    <span className="text-[10px] text-gray-400">بانتظار توقيع المدين</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Legal preamble + electronic contract no. */}
          <div className="mt-6 text-[12px] leading-[26px] text-brand text-justify">
            <p className="flex flex-wrap items-center gap-2">
              <span>هذا السند لأمر صادر من خلال منصة ريفانس الإلكترونية وذلك بموجب العقد الإلكتروني رقم :</span>
              <span className="inline-block min-w-[140px] border border-gray-300 bg-white rounded-[6px] px-3 py-1 text-center font-black">
                {note.contract_id || note.submission_id}
              </span>
            </p>
            <p className="mt-2">وقد تم إنشاؤه والمصادقة عليه إلكترونياً.</p>
            <p className="mt-3">
              ويُقر المدين باطلاعه الكامل على العقد وفهمه لآثاره، وصحة احتساب الأتعاب، والتنازل عن أي دفع أو منازعات تتعلق بسند الأمر
              وعدم الطعن أو الاعتراض على التنفيذ أمام محكمة التنفيذ إلا في الحدود التي يجيزها النظام، وأن هذا الإقرار حجة قاطعة وملزمة
              أمام جميع الجهات القضائية والتنفيذية.
            </p>
          </div>

          {/* Stamp */}
          <div className="mt-6 flex items-end gap-4">
            <img src={rifansStampImg} alt="ختم وتوقيع شركة ريفانس المالية" className="h-32 w-auto object-contain" />
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] text-brand">
            <div className="flex items-center gap-1.5"><Phone size={12} className="text-gold" /> 9200 11 825</div>
            <div className="flex items-center gap-1.5"><Mail size={12} className="text-gold" /> info@rifans.sa</div>
            <div className="flex items-center gap-1.5"><Globe size={12} className="text-gold" /> www.rifans.sa</div>
            <div className="flex items-center gap-1.5"><MapPin size={12} className="text-gold" /> جدة - المملكة العربية السعودية</div>
          </div>
        </div>
      </div>

      {/* Signature Capture (only for owner if not signed) */}
      {isOwner && !isSigned && !isAdmin && (
        <div className="max-w-[820px] w-full mx-auto px-4 sm:px-8 pb-12">
          <div className="bg-white rounded-2xl border border-gold/30 shadow-xl p-5" dir="rtl">
            <h3 className="text-sm font-black text-brand mb-3 flex items-center gap-2">
              <FileCheck size={18} className="text-gold" /> توقيع المدين على سند الأمر
            </h3>
            <p className="text-[11px] text-muted mb-3 leading-6">
              بالتوقيع أدناه، تُقر بقبولك جميع البنود الواردة أعلاه وبصحة المبلغ المذكور، وأنه التزام نظامي قابل للتنفيذ.
            </p>
            <div className="border-2 border-dashed border-gold/40 rounded-xl bg-gray-50 overflow-hidden">
              <canvas
                ref={sigCanvasRef}
                width={780}
                height={180}
                className="w-full h-[180px] cursor-crosshair touch-none bg-white"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
              />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Button onClick={submitSignature} disabled={!hasSignature || isSubmitting} className="flex-1 bg-brand text-gold py-3 rounded-xl font-bold">
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ التوقيع وإصدار السند'}
              </Button>
              <Button onClick={clearSig} variant="outline" className="flex-1 py-3 rounded-xl font-bold border-gray-200">
                مسح التوقيع
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromissoryNotePage;
