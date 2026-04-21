import React, { useEffect, useState } from 'react';
import { FileText, Send, Loader2, Paperclip, CheckCircle2, Clock } from 'lucide-react';
import { getMyOpenRequests, submitOpenRequestAnswers, OpenRequestRecord, OpenRequestField } from '../../lib/openRequestsApi';
import { uploadDocument } from '../../lib/api';
import { supabase } from '@/integrations/supabase/client';

const arabicDigits = (s: string) => s.replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

const FieldInput: React.FC<{
  field: OpenRequestField;
  value: any;
  onChange: (v: any) => void;
  disabled?: boolean;
}> = ({ field, value, onChange, disabled }) => {
  const base = 'w-full p-2.5 rounded-[12px] border border-gold/30 text-[13px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none bg-white dark:bg-[#06010a] dark:text-white';

  if (field.type === 'text') {
    return <textarea rows={2} disabled={disabled} value={value || ''} onChange={(e) => onChange(e.target.value)} className={`${base} resize-none`} />;
  }
  if (field.type === 'dropdown') {
    return (
      <select disabled={disabled} value={value || ''} onChange={(e) => onChange(e.target.value)} className={base}>
        <option value="">-- اختر --</option>
        {(field.options || []).map(op => <option key={op} value={op}>{op}</option>)}
      </select>
    );
  }
  if (field.type === 'choice') {
    return (
      <div className="flex flex-wrap gap-2">
        {(field.options || []).map(op => (
          <button
            type="button"
            key={op}
            disabled={disabled}
            onClick={() => onChange(op)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all ${value === op ? 'bg-brand text-gold border-brand' : 'bg-white dark:bg-[#06010a] text-brand dark:text-white border-gold/30'}`}
          >{op}</button>
        ))}
      </div>
    );
  }
  if (field.type === 'number' || field.type === 'amount') {
    const locale = field.numberLocale || 'en';
    return (
      <input
        type="text"
        inputMode="decimal"
        disabled={disabled}
        value={value || ''}
        onChange={(e) => {
          let v = e.target.value;
          if (locale === 'ar') {
            // Allow typing digits; normalize to arabic display
            v = v.replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
            v = v.replace(/[^0-9.,]/g, '');
            v = arabicDigits(v);
          } else {
            v = v.replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
            v = v.replace(/[^0-9.,]/g, '');
          }
          onChange(v);
        }}
        className={base}
        dir="ltr"
      />
    );
  }
  if (field.type === 'date') {
    const cal = field.dateCalendar || 'gregorian';
    return (
      <div>
        <input
          type={cal === 'gregorian' ? 'date' : 'text'}
          disabled={disabled}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={cal === 'hijri' ? 'مثال: 1446/10/15' : ''}
          className={base}
        />
        <p className="text-[10px] text-muted mt-1">{cal === 'hijri' ? 'تاريخ هجري' : 'تاريخ ميلادي'}</p>
      </div>
    );
  }
  if (field.type === 'attachment') {
    return (
      <AttachmentInput value={value} onChange={onChange} disabled={disabled} />
    );
  }
  return null;
};

const AttachmentInput: React.FC<{ value: any; onChange: (v: any) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadDocument(file);
      onChange({ fileName: file.name, filePath: url });
    } catch (e: any) {
      alert('فشل رفع الملف: ' + (e?.message || ''));
    } finally { setUploading(false); }
  };
  return (
    <div>
      <label className="flex items-center justify-center gap-2 p-2.5 rounded-[12px] border border-dashed border-gold/40 text-[12px] text-brand dark:text-gold font-bold bg-white dark:bg-[#06010a] cursor-pointer hover:bg-gold/5">
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
        {value?.fileName ? value.fileName : uploading ? 'جاري الرفع...' : 'اختر ملف للإرفاق'}
        <input type="file" hidden disabled={disabled || uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </label>
    </div>
  );
};

const CustomerOpenRequests: React.FC<{ userData: any }> = ({ userData }) => {
  const [items, setItems] = useState<OpenRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<OpenRequestRecord | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await getMyOpenRequests();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openReq = (r: OpenRequestRecord) => {
    setActive(r);
    setAnswers(r.answers || {});
  };

  const handleSubmit = async () => {
    if (!active) return;
    // Validate required
    for (const f of active.fields) {
      if (f.required) {
        const v = answers[f.id];
        const empty = v === undefined || v === null || v === '' || (typeof v === 'object' && !v.fileName);
        if (empty) return alert(`الرجاء تعبئة حقل: ${f.label}`);
      }
    }
    setSending(true);
    try {
      // Collect attachments
      const attachments = active.fields
        .filter(f => f.type === 'attachment')
        .map(f => answers[f.id])
        .filter(Boolean);

      await submitOpenRequestAnswers(active.id, answers, attachments);

      // Email admin with the payload
      try {
        const payload = {
          id: active.id,
          type: 'open_request',
          details: active.title + (active.description ? ` - ${active.description}` : ''),
          data: active.fields.reduce((acc: any, f) => {
            const v = answers[f.id];
            acc[f.label] = typeof v === 'object' && v?.fileName ? v.fileName : v;
            return acc;
          }, {}),
          files: attachments,
        };
        await supabase.functions.invoke('send-exemption-request', {
          body: { requestData: payload, userData },
        });
      } catch (e) {
        console.error('notify-admin failed', e);
      }

      // Sync to HubSpot: upsert contact + create deal
      try {
        await supabase.functions.invoke('hubspot-sync', {
          body: {
            action: 'both',
            contact: {
              email: userData?.email,
              phone: userData?.phone || userData?.mobile,
              firstname: userData?.fullName || userData?.name,
              national_id: userData?.national_id || userData?.nationalId,
            },
            deal: {
              dealname: `${active.title} - ${userData?.fullName || userData?.name || 'عميل'}`,
              description: active.description || active.title,
            },
          },
        });
      } catch (e) {
        console.error('hubspot-sync (deal) failed', e);
      }

      alert('تم إرسال الطلب بنجاح ✅');
      setActive(null);
      setAnswers({});
      await load();
    } catch (e: any) {
      alert('فشل الإرسال: ' + (e?.message || ''));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gold" size={32} /></div>;
  }

  if (active) {
    const readonly = active.status !== 'pending';
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setActive(null)} className="text-[12px] text-brand dark:text-gold font-bold">← رجوع</button>
          <span className={`text-[11px] font-bold px-2 py-1 rounded ${active.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {active.status === 'pending' ? 'بانتظار التعبئة' : 'تم الإرسال'}
          </span>
        </div>

        <div className="bg-white dark:bg-[#12031a] p-4 rounded-[16px] border border-gold/20 space-y-3">
          <h3 className="text-[14px] font-bold text-brand dark:text-white">{active.title}</h3>
          {active.description && <p className="text-[12px] text-muted">{active.description}</p>}
        </div>

        <div className="space-y-3">
          {active.fields.map(f => (
            <div key={f.id} className="bg-white dark:bg-[#12031a] p-3 rounded-[14px] border border-gold/20 space-y-2">
              <label className="block text-[12px] font-bold text-brand dark:text-white">
                {f.label}{f.required && <span className="text-rose-600"> *</span>}
              </label>
              <FieldInput
                field={f}
                value={answers[f.id]}
                onChange={(v) => setAnswers(prev => ({ ...prev, [f.id]: v }))}
                disabled={readonly}
              />
            </div>
          ))}
        </div>

        {!readonly && (
          <button
            onClick={handleSubmit}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-brand text-gold font-bold text-[13px] hover:bg-brand/90 transition-all disabled:opacity-50"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
            {sending ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-muted">
        <FileText size={32} className="mx-auto mb-2 text-gold/50" />
        لا توجد طلبات مفتوحة حالياً
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(r => (
        <button
          key={r.id}
          onClick={() => openReq(r)}
          className="w-full text-right bg-white dark:bg-[#12031a] p-4 rounded-[16px] border border-gold/20 hover:border-gold/50 transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[13px] font-bold text-brand dark:text-white">{r.title}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {r.status === 'pending' ? <><Clock size={10} className="inline" /> للتعبئة</> : <><CheckCircle2 size={10} className="inline" /> مرسل</>}
            </span>
          </div>
          {r.description && <p className="text-[11px] text-muted line-clamp-2">{r.description}</p>}
          <p className="text-[10px] text-muted mt-2">{new Date(r.created_at).toLocaleDateString('ar-SA')} • {r.fields.length} حقل</p>
        </button>
      ))}
    </div>
  );
};

export default CustomerOpenRequests;
