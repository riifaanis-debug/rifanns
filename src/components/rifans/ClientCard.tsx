
import React, { useEffect, useState, useRef } from 'react';
import { Copy, CheckCircle, Download } from 'lucide-react';
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
    } catch { alert("تعذر النسخ."); }
  };

  const handleCopyData = async () => {
    const text = `الاسم: ${data.name}\nرقم الملف: ${data.file}\nرقم الهوية: ${data.id}\nرقم الجوال: ${data.mobile}\nالرابط: ${data.url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedData(true);
      setTimeout(() => setCopiedData(false), 2000);
    } catch { alert("تعذر النسخ."); }
  };

  const handleSaveCard = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 3, backgroundColor: '#1a0830' });
      const link = document.createElement('a');
      link.download = `بطاقة-عميل-${data.file}.png`;
      link.href = dataUrl;
      link.click();
    } catch { alert("تعذر حفظ البطاقة."); }
    finally { setSaving(false); }
  };

  const logoSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23E8D5A3'/%3E%3Cstop offset='50%25' stop-color='%23C7A969'/%3E%3Cstop offset='100%25' stop-color='%23A88B4A'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M35 25h30c20 0 35 12 35 32 0 16-10 28-25 32l30 31h-20L55 90h-5v30H35V25zm15 20v30h15c12 0 18-7 18-15s-6-15-18-15H50z' fill='url(%23g)'/%3E%3Cpath d='M60 10L80 25V15L60 5z' fill='url(%23g)' opacity='0.8'/%3E%3Cpath d='M75 15l15 12V20L75 10z' fill='url(%23g)' opacity='0.6'/%3E%3C/svg%3E`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0612] via-[#12031a] to-[#1a0525] flex flex-col items-center justify-center p-6 font-['Tajawal']" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
        @keyframes card-shine {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(200%) rotate(25deg); }
        }
      `}</style>

      <div className="w-full max-w-[420px]">
        <div ref={cardRef} className="relative w-full rounded-[16px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]" style={{ aspectRatio: '85.6 / 53.98' }}>
          {/* Shine effect */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-[16px]">
            <div className="absolute top-0 -left-[50%] w-[40%] h-[200%] opacity-[0.1]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', animation: 'card-shine 3.5s ease-in-out infinite' }}></div>
          </div>

          {/* Background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #2e1555 0%, #22103d 30%, #1a0830 60%, #22103d 100%)' }}></div>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(199,169,105,0.05) 0%, transparent 50%)' }}></div>

          {/* Large R Watermark - center-left */}
          <div className="absolute left-[10%] top-[15%] w-[50%] h-[75%] opacity-[0.08] pointer-events-none" style={{ background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Cpath d='M150 80h115c75 0 125 40 125 115 0 63-35 102-86 113l112 112-58 58-140-140h-30v140h-78V80zm78 70v118h40c35 0 56-20 56-59 0-39-21-59-56-59h-40z' fill='%23C7A969'/%3E%3C/svg%3E") center/contain no-repeat` }}></div>

          <div className="absolute inset-0 flex flex-col justify-between p-[5%] z-10">
            {/* Top Row: QR left, Logo+Name right */}
            <div className="flex items-start justify-between" dir="ltr">
              {/* QR Code - top left */}
              <div className="bg-[#C7A969]/10 rounded-[6px] p-[3px] border border-[#C7A969]/20">
                <QRCodeSVG
                  value={data.url || window.location.href}
                  size={48}
                  level="L"
                  bgColor="transparent"
                  fgColor="#C7A969"
                />
              </div>

              {/* Logo + Company Name - top right */}
              <div className="flex items-center gap-2" dir="rtl">
                <div className="text-right">
                  <div className="text-[14px] font-[800] text-[#C7A969] leading-none tracking-wide">ريفانس المالية</div>
                  <div className="text-[8px] font-bold text-[#C7A969]/60 tracking-[0.3em] uppercase mt-0.5">RIFANIS FINANCE</div>
                </div>
                <div className="w-[36px] h-[36px] flex-shrink-0">
                  <img src={logoSvg} alt="logo" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            {/* Data Fields */}
            <div className="flex flex-col gap-[6%] mt-auto" dir="rtl">
              {/* Name */}
              <div className="flex items-center gap-[4%]">
                <div className="text-[9px] text-[#C7A969]/70 whitespace-nowrap text-right min-w-[28%] leading-tight">
                  <span>الاسم / </span><span className="font-mono">Name</span>
                </div>
                <div className="flex-1 border border-[#C7A969]/40 rounded-[4px] px-[6px] py-[3px]">
                  <div className="text-[11px] font-[700] text-[#C7A969] text-right leading-tight">{data.name}</div>
                </div>
              </div>

              {/* File No */}
              <div className="flex items-center gap-[4%]">
                <div className="text-[9px] text-[#C7A969]/70 whitespace-nowrap text-right min-w-[28%] leading-tight">
                  <span>رقم الملف / </span><span className="font-mono">File No</span>
                </div>
                <div className="flex-1 border border-[#C7A969]/40 rounded-[4px] px-[6px] py-[3px]">
                  <div className="text-[11px] font-[700] text-[#C7A969] font-mono tracking-wide text-right leading-tight">{data.file}</div>
                </div>
              </div>

              {/* ID */}
              <div className="flex items-center gap-[4%]">
                <div className="text-[9px] text-[#C7A969]/70 whitespace-nowrap text-right min-w-[28%] leading-tight">
                  <span>رقم الهوية / </span><span className="font-mono">ID</span>
                </div>
                <div className="flex-1 border border-[#C7A969]/40 rounded-[4px] px-[6px] py-[3px]">
                  <div className="text-[11px] font-[700] text-[#C7A969] font-mono tracking-wide text-right leading-tight">{data.id}</div>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-center gap-[4%]">
                <div className="text-[9px] text-[#C7A969]/70 whitespace-nowrap text-right min-w-[28%] leading-tight">
                  <span>رقم الجوال / </span><span className="font-mono">Mobile No</span>
                </div>
                <div className="flex-1 border border-[#C7A969]/40 rounded-[4px] px-[6px] py-[3px]">
                  <div className="text-[11px] font-[700] text-[#C7A969] font-mono tracking-wide text-right leading-tight">{data.mobile}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-5 w-full max-w-[420px]">
        <button
          className="w-full bg-gradient-to-r from-[#C7A969] to-[#E8D5A3] text-[#1a0830] py-3.5 rounded-2xl font-[800] text-[13px] transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98] shadow-[0_8px_24px_rgba(199,169,105,0.25)]"
          onClick={handleSaveCard}
          disabled={saving}
        >
          <Download size={16} />
          {saving ? 'جاري الحفظ...' : 'حفظ البطاقة كصورة'}
        </button>

        <div className="flex gap-3">
          <button className="flex-1 bg-[#C7A969]/10 hover:bg-[#C7A969]/20 border border-[#C7A969]/30 text-[#C7A969] py-3 rounded-2xl font-bold text-[12px] transition-all flex items-center justify-center gap-2" onClick={handleCopyLink}>
            {copiedLink ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copiedLink ? 'تم ✅' : 'نسخ الرابط'}
          </button>
          <button className="flex-1 bg-[#C7A969]/10 hover:bg-[#C7A969]/20 border border-[#C7A969]/30 text-[#C7A969] py-3 rounded-2xl font-bold text-[12px] transition-all flex items-center justify-center gap-2" onClick={handleCopyData}>
            {copiedData ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copiedData ? 'تم ✅' : 'نسخ البيانات'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
