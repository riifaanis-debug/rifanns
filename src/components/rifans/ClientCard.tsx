
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
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 3, backgroundColor: '#0a0612' });
      const link = document.createElement('a');
      link.download = `بطاقة-عميل-${data.file}.png`;
      link.href = dataUrl;
      link.click();
    } catch { alert("تعذر حفظ البطاقة."); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0612] via-[#12031a] to-[#1a0525] flex flex-col items-center justify-center p-6 font-['Tajawal']" dir="rtl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');`}</style>

      {/* Bank-style Card */}
      <div className="w-full max-w-[420px]">
        <div ref={cardRef} className="relative w-full aspect-[1.586/1] rounded-[16px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]" style={{ background: 'linear-gradient(135deg, #1a0830 0%, #2d0845 40%, #3a0a55 60%, #1a0830 100%)' }}>
          
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(199,169,105,0.1) 35px, rgba(199,169,105,0.1) 36px)' }}></div>
          
          {/* Holographic glow */}
          <div className="absolute top-0 right-0 w-[40%] h-full opacity-[0.06] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(199,169,105,0.4), transparent 70%)' }}></div>

          <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
            
            {/* Top: Logo + Contactless */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[20px] font-black text-[#C7A969] leading-none">ريفانس المالية</div>
                <div className="text-[8px] font-bold text-[#C7A969]/50 tracking-[0.25em] mt-0.5 uppercase">RIFANS FINANCE</div>
              </div>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#C7A969]/60">
                <path d="M8.5 8.5c2-2 5-2 7 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M9.5 11c1.2-1.2 3-1.2 4.2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="11.6" cy="13" r="0.8" fill="currentColor"/>
              </svg>
            </div>

            {/* Chip + QR */}
            <div className="flex items-center gap-4">
              <div className="w-[50px] h-[38px] rounded-[7px] overflow-hidden" style={{ background: 'linear-gradient(135deg, #C7A969 0%, #E8D5A3 30%, #B8953F 50%, #E8D5A3 70%, #C7A969 100%)' }}>
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-[1px] p-[4px]">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-[#B8953F]/30 rounded-[1px]"></div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-md p-[3px] shadow-sm">
                <QRCodeSVG
                  value={data.url || window.location.href}
                  size={32}
                  level="L"
                  bgColor="#ffffff"
                  fgColor="#1a0830"
                />
              </div>
            </div>

            {/* File Number as Card Number */}
            <div>
              <div className="text-[20px] font-bold text-white font-mono tracking-[0.2em] drop-shadow-sm" dir="ltr">
                {data.file}
              </div>
            </div>

            {/* Bottom: Name + ID */}
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <div className="text-[7px] text-[#C7A969]/50 uppercase tracking-wider mb-0.5">CARD HOLDER</div>
                <div className="text-[14px] font-bold text-white truncate max-w-[200px]">{data.name}</div>
              </div>
              <div className="text-left">
                <div className="text-[7px] text-[#C7A969]/50 uppercase tracking-wider mb-0.5">ID</div>
                <div className="text-[12px] font-bold text-white/90 font-mono" dir="ltr">{data.id}</div>
              </div>
            </div>
          </div>

          {/* Bottom gold edge */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C7A969]/60 via-[#E8D5A3] to-[#C7A969]/60"></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-6 w-full max-w-[420px]">
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
