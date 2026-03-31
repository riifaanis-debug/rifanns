
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

      <div className="w-full max-w-[420px]">
        <div ref={cardRef} className="relative w-full aspect-[1.78/1] rounded-[14px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          {/* Background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #2a1045 0%, #1e0a3c 40%, #2d1050 70%, #1a0830 100%)' }}></div>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 70% 50%, transparent 40%, rgba(0,0,0,0.3) 100%)' }}></div>

          {/* Large R Watermark */}
          <div className="absolute left-[5%] top-[10%] w-[50%] h-[80%] opacity-[0.08] pointer-events-none" style={{ background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Cpath d='M150 80h115c75 0 125 40 125 115 0 63-35 102-86 113l112 112-58 58-140-140h-30v140h-78V80zm78 70v118h40c35 0 56-20 56-59 0-39-21-59-56-59h-40z' fill='%23C7A969'/%3E%3C/svg%3E") center/contain no-repeat` }}></div>

          <div className="absolute inset-0 flex flex-col justify-between p-5 z-10">
            {/* Top Row: QR left, Logo right */}
            <div className="flex items-start justify-between" dir="ltr">
              <div className="bg-[#C7A969]/10 rounded-md p-1.5 border border-[#C7A969]/15">
                <QRCodeSVG
                  value={data.url || window.location.href}
                  size={44}
                  level="L"
                  bgColor="transparent"
                  fgColor="#C7A969"
                />
              </div>
              <div className="text-right">
                <div className="text-[17px] font-[900] text-[#C7A969] leading-none">ريفانس المالية</div>
                <div className="w-full h-[1px] bg-gradient-to-l from-[#C7A969]/70 via-[#C7A969]/30 to-transparent mt-1.5 mb-1"></div>
                <div className="text-[8px] font-bold text-[#C7A969]/50 tracking-[0.3em] uppercase">RIFANIS FINANCE</div>
              </div>
            </div>

            {/* Data Fields - right side */}
            <div className="flex flex-col justify-end gap-[10px] w-[55%] ml-auto mt-auto">
              <div className="text-right">
                <div className="text-[9px] text-[#C7A969]/60">الاسم / Name</div>
                <div className="text-[13px] font-[700] text-[#C7A969]">{data.name}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-[#C7A969]/60">رقم الملف / File No</div>
                <div className="text-[13px] font-[700] text-[#C7A969] font-mono tracking-wide">{data.file}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-[#C7A969]/60">رقم الهوية / ID</div>
                <div className="text-[13px] font-[700] text-[#C7A969] font-mono tracking-wide">{data.id}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-[#C7A969]/60">رقم الجوال / Mobile No</div>
                <div className="text-[13px] font-[700] text-[#C7A969] font-mono tracking-wide">{data.mobile}</div>
              </div>
            </div>
          </div>
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
