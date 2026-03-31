
import React, { useEffect, useState, useRef } from 'react';
import { Copy, CheckCircle, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import cardBgImg from '../../assets/client-card-bg.jpg';

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
          {/* Background Image */}
          <img src={cardBgImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          
          {/* QR Code overlay - top left */}
          <div className="absolute top-[8%] left-[5%] z-10 bg-transparent rounded-md p-0.5">
            <QRCodeSVG
              value={data.url || window.location.href}
              size={44}
              level="L"
              bgColor="transparent"
              fgColor="#C7A969"
            />
          </div>

          {/* Data values - each positioned individually to match label positions */}
          <div className="absolute right-[5%] top-[36%] z-10 text-right w-[50%]">
            <div className="text-[12px] font-[700] text-[#C7A969]">{data.name}</div>
          </div>
          <div className="absolute right-[5%] top-[52%] z-10 text-right w-[50%]">
            <div className="text-[12px] font-[700] text-[#C7A969] font-mono tracking-wide">{data.file}</div>
          </div>
          <div className="absolute right-[5%] top-[68%] z-10 text-right w-[50%]">
            <div className="text-[12px] font-[700] text-[#C7A969] font-mono tracking-wide">{data.id}</div>
          </div>
          <div className="absolute right-[5%] top-[84%] z-10 text-right w-[50%]">
            <div className="text-[12px] font-[700] text-[#C7A969] font-mono tracking-wide">{data.mobile}</div>
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
