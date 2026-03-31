
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
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 4, backgroundColor: '#1a0830' });
      const link = document.createElement('a');
      link.download = `بطاقة-عميل-${data.file}.png`;
      link.href = dataUrl;
      link.click();
    } catch { alert("تعذر حفظ البطاقة."); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0612] via-[#12031a] to-[#1a0525] flex flex-col items-center justify-center p-6 font-['Tajawal']" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
        @keyframes card-shine {
          0% { transform: translateX(-150%) rotate(25deg); }
          100% { transform: translateX(250%) rotate(25deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.08; }
        }
      `}</style>

      <div className="w-full max-w-[420px]">
        <div ref={cardRef} className="relative w-full rounded-[18px] overflow-hidden" style={{ aspectRatio: '85.6 / 53.98', boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 80px rgba(199,169,105,0.08), inset 0 1px 0 rgba(199,169,105,0.15)' }}>
          
          {/* Animated shine */}
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-[18px]">
            <div className="absolute top-0 -left-[60%] w-[30%] h-[250%] opacity-[0.07]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)', animation: 'card-shine 4s ease-in-out infinite' }} />
          </div>

          {/* Top border accent */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[1px] z-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(199,169,105,0.4), transparent)' }} />

          {/* Background layers */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(155deg, #3a1d6e 0%, #2a1350 20%, #1e0d3d 45%, #170a30 70%, #1e0d3d 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 85% 15%, rgba(199,169,105,0.06) 0%, transparent 45%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 15% 85%, rgba(120,80,200,0.06) 0%, transparent 45%)' }} />
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(199,169,105,0.3) 10px, rgba(199,169,105,0.3) 11px)' }} />

          {/* Large R watermark */}
          <div className="absolute left-[5%] top-[8%] w-[55%] h-[85%] pointer-events-none" style={{ opacity: 0.04, animation: 'pulse-glow 6s ease-in-out infinite' }}>
            <svg viewBox="0 0 500 500" className="w-full h-full">
              <path d="M150 80h115c75 0 125 40 125 115 0 63-35 102-86 113l112 112-58 58-140-140h-30v140h-78V80zm78 70v118h40c35 0 56-20 56-59 0-39-21-59-56-59h-40z" fill="#C7A969" />
            </svg>
          </div>

          {/* Card content */}
          <div className="absolute inset-0 flex flex-col justify-between p-[6%] z-10">

            {/* Top: QR left, Logo right */}
            <div className="flex items-start justify-between" dir="ltr">
              {/* QR */}
              <div className="rounded-[8px] p-[4px] border border-[#C7A969]/25" style={{ background: 'linear-gradient(135deg, rgba(199,169,105,0.08), rgba(199,169,105,0.02))' }}>
                <QRCodeSVG value={data.url || window.location.href} size={52} level="L" bgColor="transparent" fgColor="#C7A969" />
              </div>

              {/* Logo + Company */}
              <div className="flex items-center gap-2.5" dir="rtl">
                <div className="text-right">
                  <div className="text-[10px] font-[900] leading-none tracking-wide" style={{ color: '#C7A969' }}>ريفانس المالية</div>
                  <div className="text-[5.5px] font-bold tracking-[0.35em] uppercase mt-[3px]" style={{ color: 'rgba(199,169,105,0.5)' }}>RIFANIS FINANCE</div>
                </div>
                {/* Chip icon */}
                <div className="w-[28px] h-[22px] rounded-[4px] flex-shrink-0" style={{ background: 'linear-gradient(145deg, #E8D5A3 0%, #C7A969 40%, #A88B4A 100%)', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.3)' }}>
                  <svg viewBox="0 0 28 22" className="w-full h-full">
                    <rect x="4" y="4" width="20" height="14" rx="2" fill="none" stroke="rgba(120,80,40,0.4)" strokeWidth="0.8" />
                    <line x1="14" y1="4" x2="14" y2="18" stroke="rgba(120,80,40,0.3)" strokeWidth="0.5" />
                    <line x1="4" y1="11" x2="24" y2="11" stroke="rgba(120,80,40,0.3)" strokeWidth="0.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Data fields */}
            <div className="flex flex-col gap-[5px]" dir="rtl">
              {[
                { label: 'الاسم', en: 'Name', value: data.name, mono: false },
                { label: 'رقم الملف', en: 'File No', value: data.file, mono: true },
                { label: 'رقم الهوية', en: 'ID', value: data.id, mono: true },
                { label: 'رقم الجوال', en: 'Mobile', value: data.mobile, mono: true },
              ].map((field, i) => (
                <div key={i} className="flex items-center gap-[3%]">
                  <div className="whitespace-nowrap text-right min-w-[26%] leading-none">
                    <span className="text-[6.5px] font-[500]" style={{ color: 'rgba(199,169,105,0.6)' }}>{field.label}</span>
                    <span className="text-[5px] font-mono mx-[2px]" style={{ color: 'rgba(199,169,105,0.35)' }}>/</span>
                    <span className="text-[5px] font-mono" style={{ color: 'rgba(199,169,105,0.35)' }}>{field.en}</span>
                  </div>
                  <div className="flex-1 rounded-[5px] px-[6px] py-[3px]" style={{ background: 'linear-gradient(90deg, rgba(199,169,105,0.06), rgba(199,169,105,0.02))', border: '0.5px solid rgba(199,169,105,0.2)' }}>
                    <div className={`text-[8px] font-[600] text-right leading-tight ${field.mono ? 'font-mono tracking-wider' : ''}`} style={{ color: '#D4BC82' }}>
                      {field.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom border accent */}
          <div className="absolute bottom-0 left-[15%] right-[15%] h-[1px] z-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(199,169,105,0.2), transparent)' }} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-6 w-full max-w-[420px]">
        <button
          className="w-full py-3.5 rounded-2xl font-[800] text-[13px] transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #C7A969, #E8D5A3, #C7A969)', color: '#1a0830', boxShadow: '0 8px 30px rgba(199,169,105,0.3)' }}
          onClick={handleSaveCard}
          disabled={saving}
        >
          <Download size={16} />
          {saving ? 'جاري الحفظ...' : 'حفظ البطاقة كصورة'}
        </button>

        <div className="flex gap-3">
          <button className="flex-1 py-3 rounded-2xl font-bold text-[12px] transition-all flex items-center justify-center gap-2 border" style={{ background: 'rgba(199,169,105,0.08)', borderColor: 'rgba(199,169,105,0.25)', color: '#C7A969' }} onClick={handleCopyLink}>
            {copiedLink ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copiedLink ? 'تم ✅' : 'نسخ الرابط'}
          </button>
          <button className="flex-1 py-3 rounded-2xl font-bold text-[12px] transition-all flex items-center justify-center gap-2 border" style={{ background: 'rgba(199,169,105,0.08)', borderColor: 'rgba(199,169,105,0.25)', color: '#C7A969' }} onClick={handleCopyData}>
            {copiedData ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copiedData ? 'تم ✅' : 'نسخ البيانات'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
