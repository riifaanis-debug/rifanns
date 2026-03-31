
import React, { useEffect, useState } from 'react';
import { Copy, User, CreditCard, Phone, FileText, CheckCircle } from 'lucide-react';

const ClientCard: React.FC = () => {
  const [data, setData] = useState({
    name: 'اسم العميل',
    file: 'RF-00000000-0000',
    id: '10XXXXXXXXX',
    mobile: '9665XXXXXXXX',
    url: ''
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedData, setCopiedData] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0612] via-[#12031a] to-[#1a0525] flex flex-col items-center justify-center p-6 font-['Tajawal']" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
      `}</style>

      {/* Card */}
      <div className="w-full max-w-[420px] relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#C7A969]/20 via-[#C7A969]/10 to-[#C7A969]/20 rounded-[28px] blur-xl"></div>
        
        <div className="relative rounded-[24px] overflow-hidden border border-[#C7A969]/30 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          {/* Card Background */}
          <div className="bg-gradient-to-br from-[#1e0630] via-[#2d053a] to-[#1a0428] p-7">
            
            {/* Watermark */}
            <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-[50%] h-[60%] opacity-[0.04] pointer-events-none" 
              style={{ background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Cpath d='M150 80h115c75 0 125 40 125 115 0 63-35 102-86 113l112 112-58 58-140-140h-30v140h-78V80zm78 70v118h40c35 0 56-20 56-59 0-39-21-59-56-59h-40z' fill='%23f4d48a'/%3E%3C/svg%3E") center/contain no-repeat` }}
            ></div>
            
            {/* Grain texture */}
            <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" 
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.15'/%3E%3C/svg%3E")` }}
            ></div>

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between mb-8">
              <div className="text-right">
                <h2 className="text-[22px] font-[800] text-[#C7A969] leading-none tracking-tight">ريفانس المالية</h2>
                <div className="text-[9px] font-bold text-[#C7A969]/60 tracking-[0.25em] mt-1.5 uppercase">RIFANIS FINANCE</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#C7A969]/10 border border-[#C7A969]/20 flex items-center justify-center">
                <User size={18} className="text-[#C7A969]" />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#C7A969]/30 to-transparent mb-6"></div>

            {/* Data Fields */}
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#C7A969]/10 flex items-center justify-center shrink-0">
                  <User size={14} className="text-[#C7A969]" />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] font-bold text-[#C7A969]/50 uppercase tracking-wider mb-0.5">الاسم / Name</div>
                  <div className="text-[14px] font-[800] text-white">{data.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#C7A969]/10 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-[#C7A969]" />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] font-bold text-[#C7A969]/50 uppercase tracking-wider mb-0.5">رقم الملف / File No.</div>
                  <div className="text-[13px] font-[800] text-white font-mono tracking-wider" dir="ltr">{data.file}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#C7A969]/10 flex items-center justify-center shrink-0">
                  <CreditCard size={14} className="text-[#C7A969]" />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] font-bold text-[#C7A969]/50 uppercase tracking-wider mb-0.5">رقم الهوية / ID No.</div>
                  <div className="text-[13px] font-[800] text-white font-mono tracking-wider" dir="ltr">{data.id}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#C7A969]/10 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-[#C7A969]" />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] font-bold text-[#C7A969]/50 uppercase tracking-wider mb-0.5">رقم الجوال / Mobile</div>
                  <div className="text-[13px] font-[800] text-white font-mono tracking-wider" dir="ltr">{data.mobile}</div>
                </div>
              </div>
            </div>

            {/* Bottom Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#C7A969]/20 to-transparent mt-6 mb-2"></div>

            {/* Footer branding */}
            <div className="relative z-10 text-center">
              <div className="text-[8px] text-[#C7A969]/30 tracking-widest uppercase">Digital Client Card • بطاقة عميل رقمية</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8 w-full max-w-[420px]">
        <button 
          className="flex-1 bg-[#C7A969]/10 hover:bg-[#C7A969]/20 border border-[#C7A969]/30 text-[#C7A969] py-3.5 rounded-2xl font-bold text-[13px] transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98]" 
          onClick={handleCopyLink}
        >
          {copiedLink ? <CheckCircle size={16} /> : <Copy size={16} />}
          {copiedLink ? 'تم النسخ ✅' : 'نسخ رابط البطاقة'}
        </button>
        <button 
          className="flex-1 bg-[#C7A969]/10 hover:bg-[#C7A969]/20 border border-[#C7A969]/30 text-[#C7A969] py-3.5 rounded-2xl font-bold text-[13px] transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98]" 
          onClick={handleCopyData}
        >
          {copiedData ? <CheckCircle size={16} /> : <Copy size={16} />}
          {copiedData ? 'تم النسخ ✅' : 'نسخ البيانات'}
        </button>
      </div>
    </div>
  );
};

export default ClientCard;
