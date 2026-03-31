
import React, { useEffect, useState, useRef } from 'react';
import { Copy, User, CreditCard, Phone, FileText, CheckCircle, Download, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

const ClientCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState({
    name: 'اسم العميل',
    file: 'RF-00000000-0000',
    id: '10XXXXXXXXX',
    mobile: '9665XXXXXXXX',
    url: ''
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
    const name = params.get("name") || "اسم العميل";
    const file = params.get("file") || "RF-00000000-0000";
    const id = params.get("id") || "10XXXXXXXXX";
    const mobile = params.get("mobile") || "9665XXXXXXXX";
    const url = params.get("url") || (window.location.origin + "/#/client-card?file=" + file + "&name=" + encodeURIComponent(name));

    setData({ name, file, id, mobile, url });
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      alert("تعذر النسخ. انسخ الرابط يدوياً من شريط العنوان.");
    }
  };

  const handleCopyData = async () => {
    const text = `الاسم: ${data.name}\nرقم الملف: ${data.file}\nرقم الهوية: ${data.id}\nرقم الجوال: ${data.mobile}\nالرابط: ${data.url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedData(true);
      setTimeout(() => setCopiedData(false), 2000);
    } catch (e) {
      alert("تعذر النسخ.");
    }
  };

  const handleSaveCard = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#0a0612',
      });
      const link = document.createElement('a');
      link.download = `بطاقة-عميل-${data.file}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert("تعذر حفظ البطاقة.");
    } finally {
      setSaving(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0612] via-[#12031a] to-[#1a0525] flex flex-col items-center justify-center p-4 font-['Tajawal']" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
      `}</style>

      {/* Card */}
      <div className="w-full max-w-[420px] relative" ref={cardRef}>
        {/* Outer glow */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#C7A969]/25 via-[#E8D5A3]/15 to-[#C7A969]/25 rounded-[30px] blur-2xl animate-pulse"></div>
        
        <div className="relative rounded-[24px] overflow-hidden border border-[#C7A969]/40 shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_40px_rgba(199,169,105,0.1)]">
          {/* Card Background */}
          <div className="bg-gradient-to-br from-[#1a0830] via-[#250940] to-[#1a0428] relative">
            
            {/* Top gold accent line */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C7A969] to-transparent"></div>

            {/* Watermark */}
            <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-[50%] h-[60%] opacity-[0.03] pointer-events-none" 
              style={{ background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Cpath d='M150 80h115c75 0 125 40 125 115 0 63-35 102-86 113l112 112-58 58-140-140h-30v140h-78V80zm78 70v118h40c35 0 56-20 56-59 0-39-21-59-56-59h-40z' fill='%23f4d48a'/%3E%3C/svg%3E") center/contain no-repeat` }}
            ></div>
            
            {/* Grain texture */}
            <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none" 
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.15'/%3E%3C/svg%3E")` }}
            ></div>

            <div className="p-6 pb-5">
              {/* Header */}
              <div className="relative z-10 flex items-center justify-between mb-5">
                <div className="text-right">
                  <h2 className="text-[20px] font-[800] text-[#C7A969] leading-none tracking-tight">ريفانس المالية</h2>
                  <div className="text-[8px] font-bold text-[#C7A969]/50 tracking-[0.3em] mt-1 uppercase">RIFANS FINANCE</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#C7A969]/10 border border-[#C7A969]/20 rounded-full px-2.5 py-1">
                    <Shield size={10} className="text-[#4ade80]" />
                    <span className="text-[8px] font-bold text-[#4ade80] tracking-wider">موثّق</span>
                  </div>
                </div>
              </div>

              {/* Client avatar + name section */}
              <div className="relative z-10 flex items-center gap-4 mb-5 bg-[#C7A969]/[0.06] rounded-2xl p-3.5 border border-[#C7A969]/10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C7A969]/30 to-[#C7A969]/10 border border-[#C7A969]/30 flex items-center justify-center shrink-0">
                  <User size={24} className="text-[#C7A969]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] font-bold text-[#C7A969]/40 uppercase tracking-widest mb-1">اسم العميل</div>
                  <div className="text-[16px] font-[800] text-white leading-tight truncate">{data.name}</div>
                </div>
              </div>

              {/* Data Fields */}
              <div className="relative z-10 space-y-3 mb-5">
                <DataField icon={<FileText size={13} />} label="رقم الملف / File No." value={data.file} mono />
                <DataField icon={<CreditCard size={13} />} label="رقم الهوية / ID No." value={data.id} mono />
                <DataField icon={<Phone size={13} />} label="رقم الجوال / Mobile" value={data.mobile} mono />
              </div>

              {/* Bottom section: QR + info */}
              <div className="relative z-10 flex items-end justify-between">
                {/* QR Code */}
                <div className="bg-white rounded-xl p-2 shadow-lg">
                  <QRCodeSVG
                    value={data.url || window.location.href}
                    size={72}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#1a0830"
                  />
                </div>

                {/* Card info */}
                <div className="text-left space-y-1">
                  <div className="text-[8px] text-[#C7A969]/40 tracking-wider">تاريخ الإصدار</div>
                  <div className="text-[10px] text-[#C7A969]/70 font-bold">{currentDate}</div>
                  <div className="text-[7px] text-[#C7A969]/25 tracking-widest uppercase mt-1">Digital Client Card</div>
                </div>
              </div>
            </div>

            {/* Bottom gold accent line */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C7A969]/60 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-6 w-full max-w-[420px]">
        {/* Save button */}
        <button
          className="w-full bg-gradient-to-r from-[#C7A969] to-[#E8D5A3] text-[#1a0830] py-3.5 rounded-2xl font-[800] text-[13px] transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98] shadow-[0_8px_24px_rgba(199,169,105,0.25)]"
          onClick={handleSaveCard}
          disabled={saving}
        >
          <Download size={16} />
          {saving ? 'جاري الحفظ...' : 'حفظ البطاقة كصورة'}
        </button>

        <div className="flex gap-3">
          <button 
            className="flex-1 bg-[#C7A969]/10 hover:bg-[#C7A969]/20 border border-[#C7A969]/30 text-[#C7A969] py-3 rounded-2xl font-bold text-[12px] transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98]" 
            onClick={handleCopyLink}
          >
            {copiedLink ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copiedLink ? 'تم ✅' : 'نسخ الرابط'}
          </button>
          <button 
            className="flex-1 bg-[#C7A969]/10 hover:bg-[#C7A969]/20 border border-[#C7A969]/30 text-[#C7A969] py-3 rounded-2xl font-bold text-[12px] transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98]" 
            onClick={handleCopyData}
          >
            {copiedData ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copiedData ? 'تم ✅' : 'نسخ البيانات'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DataField: React.FC<{ icon: React.ReactNode; label: string; value: string; mono?: boolean }> = ({ icon, label, value, mono }) => (
  <div className="flex items-center gap-3 bg-[#C7A969]/[0.04] rounded-xl px-3 py-2.5 border border-[#C7A969]/[0.08]">
    <div className="w-7 h-7 rounded-lg bg-[#C7A969]/10 flex items-center justify-center shrink-0">
      <span className="text-[#C7A969]">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[8px] font-bold text-[#C7A969]/40 uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`text-[13px] font-[800] text-white ${mono ? 'font-mono tracking-wider' : ''} truncate`} dir="ltr">{value}</div>
    </div>
  </div>
);

export default ClientCard;
