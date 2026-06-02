import React, { useEffect, useState, useRef } from 'react';
import { Copy, CheckCircle, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import cardBgAsset from '../../assets/client-card-bg.png.asset.json';

const ClientCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState({
    name: 'ماجد عامر السفياني',
    file: 'RF-20260331-7247',
    id: '1072355157',
    mobile: '0563042475',
    url: ''
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
    const name = params.get("name") || data.name;
    const file = params.get("file") || data.file;
    const id = params.get("id") || data.id;
    const mobile = params.get("mobile") || data.mobile;
    const url = params.get("url") || (window.location.origin + "/#/client-card?file=" + file + "&name=" + encodeURIComponent(name));
    setData({ name, file, id, mobile, url });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Each value sits over the baked-in value in the reference image.
  // Coordinates are normalized (% of card width/height) measured from the reference (1536x1024).
  // We use a solid purple cover layer to hide the original baked text, then render the dynamic value.
  const fields = [
    { value: data.name,   top: 26.5, mono: false },
    { value: data.file,   top: 45.0, mono: true  },
    { value: data.id,     top: 63.0, mono: true  },
    { value: data.mobile, top: 80.5, mono: true  },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0612] via-[#12031a] to-[#1a0525] flex flex-col items-center justify-center p-6 font-['Tajawal']" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
      `}</style>

      <div className="w-full max-w-[520px]">
        <div
          ref={cardRef}
          className="relative w-full rounded-[18px] overflow-hidden"
          style={{
            aspectRatio: '1536 / 1024',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 80px rgba(199,169,105,0.08)',
          }}
        >
          {/* Background image (1:1 reference) */}
          <img
            src={cardBgAsset.url}
            alt="بطاقة العميل"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
            crossOrigin="anonymous"
          />

          {/* Dynamic values overlay (right column) — covers baked-in sample text */}
          <div className="absolute inset-0" dir="rtl">
            {fields.map((f, i) => (
              <div
                key={i}
                className="absolute flex items-center justify-end"
                style={{
                  top: `${f.top}%`,
                  right: '6.5%',
                  width: '46%',
                  height: '10%',
                }}
              >
                {/* Cover strip to mask baked text */}
                <div
                  className="absolute inset-0 rounded-[4px]"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(20,4,32,0) 0%, rgba(20,4,32,0.96) 12%, rgba(20,4,32,1) 100%)',
                  }}
                />
                <span
                  className={`relative text-right leading-none font-[800] ${f.mono ? 'font-mono tracking-wide' : ''}`}
                  style={{
                    color: '#E0C57A',
                    fontSize: 'clamp(13px, 3.2cqw, 26px)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    containerType: 'inline-size' as any,
                  }}
                >
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          {/* Dynamic QR overlay — covers baked QR */}
          <div
            className="absolute"
            style={{
              left: '18.5%',
              top: '70%',
              width: '17%',
              aspectRatio: '1 / 1',
            }}
          >
            <div className="w-full h-full rounded-[6px] p-[6%] bg-[#1a0530] border border-[#C7A969]/30">
              <QRCodeSVG
                value={data.url || window.location.href}
                size={256}
                level="M"
                bgColor="transparent"
                fgColor="#C7A969"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-6 w-full max-w-[520px]">
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
