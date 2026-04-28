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
    ctx.lineTo(x, y); ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
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

  // Auto-fit print: measure the sheet and scale so it fits ONE A4 page exactly.
  // A4 printable area at our @page margins (6mm top/bot, 4mm sides) ≈ 202mm x 285mm.
  // Convert to px @ 96dpi (1mm = 3.7795px): ~763px x ~1077px.
  const A4_PRINT_W_PX = 202 * 3.7795;
  const A4_PRINT_H_PX = 285 * 3.7795;

  const handlePrint = useCallback(() => {
    const el = noteRef.current;
    if (!el) { window.print(); return; }
    // Reset any previous scale before measuring at natural size.
    el.style.setProperty('--print-scale', '1');
    // Force layout flush, then measure.
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const naturalW = rect.width || el.scrollWidth;
      const naturalH = el.scrollHeight;
      const scaleW = A4_PRINT_W_PX / naturalW;
      const scaleH = A4_PRINT_H_PX / naturalH;
      // Use the smaller ratio; never upscale beyond 1.
      const scale = Math.min(1, scaleW, scaleH);
      el.style.setProperty('--print-scale', String(scale));
      // Give the browser a tick to apply the variable, then print.
      setTimeout(() => window.print(), 50);
    });
  }, []);

  // Re-fit if window resizes while open (so the scale stored is accurate for current layout).
  useEffect(() => {
    const onAfterPrint = () => {
      const el = noteRef.current;
      if (el) el.style.removeProperty('--print-scale');
    };
    window.addEventListener('afterprint', onAfterPrint);
    return () => window.removeEventListener('afterprint', onAfterPrint);
  }, []);


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
  // In RTL, the title is on the right with icon, body extends to the left
  const SectionStrip: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex items-stretch w-full mb-3 mt-2" dir="rtl">
      <div className="flex-1 bg-[#22042C] rounded-r-[10px] flex items-center justify-start px-4 py-2">
        <span className="text-white text-[13px] font-bold">{title}</span>
      </div>
      <div className="w-10 flex items-center justify-center bg-white border-2 border-[#22042C] rounded-[10px] -mr-2 text-[#22042C] z-10">
        {icon}
      </div>
    </div>
  );

  // Field row: label on the right, input box on the left (RTL)
  const FieldRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center gap-3 mb-1.5" dir="rtl">
      <div className="w-[130px] text-right text-[11px] font-bold text-[#22042C]">{label}</div>
      <div className="flex-1 max-w-[380px]">{children}</div>
    </div>
  );

  const Box: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`min-h-[28px] bg-white border border-gray-300 rounded-[6px] px-3 py-1 text-[11px] text-[#22042C] font-bold flex items-center justify-start ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col overflow-x-hidden">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center print:hidden">
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
          <button onClick={handlePrint} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gold">
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Note Sheet — single A4 page, RTL, right-aligned */}
      <div className="flex-1 flex items-start justify-center p-3 sm:p-6 promissory-print-wrap">
        <div
          ref={noteRef}
          className="w-full max-w-[794px] bg-white shadow-xl px-5 py-5 promissory-sheet"
          dir="rtl"
          style={{ minHeight: '1123px', textAlign: 'right' }}
        >
          {/* Header: logo on RIGHT (start in RTL), title on LEFT (end in RTL) */}
          <div className="flex items-center justify-between mb-4" dir="rtl">
            <div className="flex items-center gap-3">
              <img src={rifansLogo} alt="ريفانس المالية" className="h-20 w-auto object-contain" />
              <div className="leading-tight text-right">
                <div className="text-[18px] font-black text-[#22042C]">ريفانس المالية</div>
                <div className="text-[11px] tracking-wider font-bold text-[#22042C]">RIFANIS FINANCE</div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-[28px] font-black text-[#22042C] leading-none">سند لأمر</div>
              <div className="mt-1 flex items-center justify-start gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C7A969]"></span>
                <span className="h-[2px] w-10 bg-[#C7A969]/60"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C7A969]"></span>
              </div>
            </div>
          </div>

          {/* رقم السند */}
          <div className="flex items-center gap-3 mb-3" dir="rtl">
            <div className="w-[130px] text-right text-[11px] font-bold text-[#22042C]">رقم السند</div>
            <div className="flex-1 max-w-[260px]">
              <Box>{note.id}</Box>
            </div>
          </div>

          {/* تفاصيل السند */}
          <SectionStrip title="تفاصيل السند" icon={<FileText size={16} />} />
          <div className="px-1">
            <FieldRow label="تاريخ الإنشاء"><Box>{issueDateLabel}</Box></FieldRow>
            <FieldRow label="مدينة الإصدار"><Box>{note.issue_city}</Box></FieldRow>
            <FieldRow label="مدينة الوفاء"><Box>{note.payment_city}</Box></FieldRow>
            <FieldRow label="قيمة السند رقماً"><Box>{formattedAmount}</Box></FieldRow>
            <FieldRow label="قيمة السند كتابة"><Box>{wordsAmount}</Box></FieldRow>
            <FieldRow label="تاريخ الإستحقاق"><Box>{note.due_date}</Box></FieldRow>
          </div>

          {/* تفاصيل المدين */}
          <SectionStrip title="تفاصيل المدين" icon={<User size={16} />} />
          <div className="px-1">
            <FieldRow label="الإسم"><Box>{note.debtor_name}</Box></FieldRow>
            <FieldRow label="رقم الهوية"><Box className="font-mono">{note.debtor_national_id}</Box></FieldRow>
          </div>

          {/* تفاصيل الدائن */}
          <SectionStrip title="تفاصيل الدائن" icon={<Users size={16} />} />
          <div className="px-1">
            <FieldRow label="الإسم"><Box>شركة ريفانس المالية</Box></FieldRow>
            <FieldRow label="الرقم الوطني الموحد"><Box className="font-mono">7038811125</Box></FieldRow>
            <FieldRow label="يمثلها قانونياً"><Box>AZZAH Ali ALOBIDI</Box></FieldRow>
          </div>

          {/* Pledge paragraph */}
          <div className="mt-4 border border-gray-300 rounded-[10px] p-3 bg-gray-50/40" dir="rtl">
            <p className="text-[11px] leading-[22px] text-[#22042C] font-bold text-right">
              أتعهد بأن أدفع لامر شركة ريفانس المالية دون قيد أو شرط مبلغاً وقدره
              <span className="inline-block align-middle mx-1.5 min-w-[110px] border border-gray-300 bg-white rounded-[4px] px-2 py-0.5 text-center font-black">
                {formattedAmount}
              </span>
              وفق البيانات المذكورة أعلاه. ولحامل هذا السند حقُّ الرجوع دون أي مصاريف أو احتجاج بعدم الوفاء.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-3" dir="rtl">
              <div className="flex items-center gap-2">
                <div className="text-[11px] font-bold text-[#22042C] min-w-[70px]">إسم المدين :</div>
                <Box className="flex-1">{note.debtor_name}</Box>
              </div>
              <div className="flex items-center gap-2">
              <div className="text-[11px] font-bold text-[#22042C] min-w-[60px]">التوقيع :</div>
                <div className="flex-1 min-h-[88px] bg-white border border-gray-300 rounded-[6px] flex items-center justify-center overflow-hidden p-1">
                  {isSigned && note.signature_data ? (
                    <img src={note.signature_data} alt="توقيع المدين" className="w-full h-auto max-h-[84px] object-contain" />
                  ) : (
                    <span className="text-[9px] text-gray-400">بانتظار التوقيع</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Legal preamble */}
          <div className="mt-3 text-[10.5px] leading-[20px] text-[#22042C] text-right" dir="rtl">
            <p>
              هذا السند لأمر صادر من خلال منصة ريفانس الإلكترونية وذلك بموجب العقد الإلكتروني رقم :
              <span className="inline-block mx-1.5 min-w-[110px] border border-gray-300 bg-white rounded-[4px] px-2 py-0.5 text-center font-black">
                {note.contract_id || note.submission_id}
              </span>
              وقد تم إنشاؤه والمصادقة عليه إلكترونياً.
            </p>
            <p className="mt-1.5">
              ويُقر المدين باطلاعه الكامل على العقد وفهمه لآثاره، وصحة احتساب الأتعاب، والتنازل عن أي دفع أو منازعات تتعلق بسند الأمر
              وعدم الطعن أو الاعتراض على التنفيذ أمام محكمة التنفيذ إلا في الحدود التي يجيزها النظام، وأن هذا الإقرار حجة قاطعة وملزمة
              أمام جميع الجهات القضائية والتنفيذية.
            </p>
          </div>

          {/* Stamp - bottom-left in RTL = "start" side */}
          <div className="mt-3 flex items-end justify-start" dir="rtl">
            <img src={rifansStampImg} alt="ختم وتوقيع شركة ريفانس المالية" className="h-28 w-auto object-contain" />
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex flex-row-reverse justify-between items-center gap-2 text-[9.5px] text-[#22042C]" dir="rtl">
            <div className="flex items-center gap-1"><Phone size={11} className="text-[#C7A969]" /> 9200 11 825</div>
            <div className="flex items-center gap-1"><Mail size={11} className="text-[#C7A969]" /> info@rifans.sa</div>
            <div className="flex items-center gap-1"><Globe size={11} className="text-[#C7A969]" /> www.rifans.sa</div>
            <div className="flex items-center gap-1"><MapPin size={11} className="text-[#C7A969]" /> جدة - المملكة العربية السعودية</div>
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
