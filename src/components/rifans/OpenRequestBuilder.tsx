import React, { useState } from 'react';
import { Plus, Trash2, Send, Type, List, ChevronDown, DollarSign, Hash, Calendar, Paperclip, Loader2 } from 'lucide-react';
import { Card } from './Shared';
import { createOpenRequest, OpenRequestField, OpenFieldType } from '../../lib/openRequestsApi';

interface Props {
  clients: any[];
  adminId?: string;
  onCreated?: () => void;
}

const fieldTypeLabels: Record<OpenFieldType, string> = {
  text: 'نص',
  choice: 'اختيارات (متعدد)',
  dropdown: 'قائمة منسدلة',
  amount: 'مبلغ',
  number: 'رقم',
  date: 'تاريخ',
  attachment: 'مرفق',
};

const fieldIcons: Record<OpenFieldType, React.ReactNode> = {
  text: <Type size={12} />,
  choice: <List size={12} />,
  dropdown: <ChevronDown size={12} />,
  amount: <DollarSign size={12} />,
  number: <Hash size={12} />,
  date: <Calendar size={12} />,
  attachment: <Paperclip size={12} />,
};

const makeField = (): OpenRequestField => ({
  id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  label: '',
  type: 'text',
  required: true,
});

const OpenRequestBuilder: React.FC<Props> = ({ clients, adminId, onCreated }) => {
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<OpenRequestField[]>([makeField()]);
  const [isSending, setIsSending] = useState(false);
  const [okMsg, setOkMsg] = useState('');

  const updateField = (idx: number, patch: Partial<OpenRequestField>) => {
    setFields(prev => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  const removeField = (idx: number) => {
    setFields(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    setOkMsg('');
    if (!clientId) return alert('الرجاء اختيار العميل');
    if (!title.trim()) return alert('الرجاء إدخال عنوان الطلب');
    if (fields.length === 0) return alert('الرجاء إضافة حقل واحد على الأقل');
    for (const f of fields) {
      if (!f.label.trim()) return alert('الرجاء إدخال سؤال/عنوان لكل حقل');
      if ((f.type === 'choice' || f.type === 'dropdown') && (!f.options || f.options.length === 0)) {
        return alert(`الرجاء إضافة خيارات للحقل: ${f.label}`);
      }
    }
    setIsSending(true);
    try {
      await createOpenRequest({
        userId: clientId,
        title: title.trim(),
        description: description.trim() || undefined,
        fields,
        createdBy: adminId,
      });
      setOkMsg('تم إرسال الطلب للعميل بنجاح ✅');
      setTitle('');
      setDescription('');
      setFields([makeField()]);
      setClientId('');
      onCreated?.();
    } catch (err: any) {
      alert('فشل إرسال الطلب: ' + (err?.message || ''));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="p-3 sm:p-4 md:p-6 space-y-4">
      <h3 className="text-sm font-bold text-brand dark:text-gold flex items-center gap-2">
        <Plus size={16} className="text-purple-600" />
        إنشاء طلب مفتوح
      </h3>

      {/* Client */}
      <div>
        <label className="block text-[12px] font-bold text-brand dark:text-white mb-2">العميل</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full p-2.5 rounded-[12px] border border-gold/30 text-[13px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none bg-white dark:bg-[#06010a] dark:text-white"
        >
          <option value="">-- اختر العميل --</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.name || c.full_name || 'عميل'} - {c.national_id || c.phone || ''}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-[12px] font-bold text-brand dark:text-white mb-2">عنوان الطلب</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: تحديث بيانات الحساب البنكي"
          className="w-full p-2.5 rounded-[12px] border border-gold/30 text-[13px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none bg-white dark:bg-[#06010a] dark:text-white"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[12px] font-bold text-brand dark:text-white mb-2">وصف/ملاحظة (اختياري)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="اشرح للعميل سبب الطلب أو أي تعليمات..."
          className="w-full p-2.5 rounded-[12px] border border-gold/30 text-[13px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none bg-white dark:bg-[#06010a] dark:text-white resize-none"
        />
      </div>

      {/* Fields builder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-[12px] font-bold text-brand dark:text-white">الحقول المطلوبة</label>
          <button
            type="button"
            onClick={() => setFields(prev => [...prev, makeField()])}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gold/10 text-brand dark:text-gold text-[11px] font-bold border border-gold/30 hover:bg-gold/20 transition-all"
          >
            <Plus size={12} /> إضافة حقل
          </button>
        </div>

        {fields.map((f, idx) => (
          <div key={f.id} className="p-3 rounded-xl border border-gold/20 bg-gold/5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-brand dark:text-gold">حقل #{idx + 1}</span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField(idx)}
                  className="p-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Label */}
            <input
              type="text"
              value={f.label}
              onChange={(e) => updateField(idx, { label: e.target.value })}
              placeholder="السؤال / اسم الحقل"
              className="w-full p-2 rounded-lg border border-gold/30 text-[12px] focus:border-gold outline-none bg-white dark:bg-[#06010a] dark:text-white"
            />

            {/* Type */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={f.type}
                onChange={(e) => updateField(idx, { type: e.target.value as OpenFieldType, options: undefined })}
                className="p-2 rounded-lg border border-gold/30 text-[12px] focus:border-gold outline-none bg-white dark:bg-[#06010a] dark:text-white"
              >
                {Object.entries(fieldTypeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-[11px] text-brand dark:text-white bg-white dark:bg-[#06010a] rounded-lg border border-gold/30 px-2">
                <input
                  type="checkbox"
                  checked={!!f.required}
                  onChange={(e) => updateField(idx, { required: e.target.checked })}
                />
                حقل إلزامي
              </label>
            </div>

            {/* Options for choice/dropdown */}
            {(f.type === 'choice' || f.type === 'dropdown') && (
              <div>
                <label className="block text-[11px] font-bold text-brand dark:text-white mb-1">الخيارات (افصل بفاصلة)</label>
                <input
                  type="text"
                  value={(f.options || []).join(', ')}
                  onChange={(e) =>
                    updateField(idx, {
                      options: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="خيار 1, خيار 2, خيار 3"
                  className="w-full p-2 rounded-lg border border-gold/30 text-[12px] focus:border-gold outline-none bg-white dark:bg-[#06010a] dark:text-white"
                />
              </div>
            )}

            {/* Number/Amount locale */}
            {(f.type === 'number' || f.type === 'amount') && (
              <div>
                <label className="block text-[11px] font-bold text-brand dark:text-white mb-1">نوع الأرقام</label>
                <div className="flex gap-2">
                  {(['ar', 'en'] as const).map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => updateField(idx, { numberLocale: loc })}
                      className={`flex-1 p-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                        (f.numberLocale || 'en') === loc
                          ? 'bg-brand text-gold border-brand'
                          : 'bg-white dark:bg-[#06010a] text-brand dark:text-white border-gold/30'
                      }`}
                    >
                      {loc === 'ar' ? 'رقم عربي (٠١٢)' : 'رقم إنجليزي (012)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date calendar */}
            {f.type === 'date' && (
              <div>
                <label className="block text-[11px] font-bold text-brand dark:text-white mb-1">نوع التاريخ</label>
                <div className="flex gap-2">
                  {(['gregorian', 'hijri'] as const).map(cal => (
                    <button
                      key={cal}
                      type="button"
                      onClick={() => updateField(idx, { dateCalendar: cal })}
                      className={`flex-1 p-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                        (f.dateCalendar || 'gregorian') === cal
                          ? 'bg-brand text-gold border-brand'
                          : 'bg-white dark:bg-[#06010a] text-brand dark:text-white border-gold/30'
                      }`}
                    >
                      {cal === 'gregorian' ? 'ميلادي' : 'هجري'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[10px] text-muted flex items-center gap-1">
              {fieldIcons[f.type]} النوع: {fieldTypeLabels[f.type]}
            </div>
          </div>
        ))}
      </div>

      {/* Send */}
      <button
        type="button"
        onClick={handleSend}
        disabled={isSending}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-brand text-gold font-bold text-[13px] hover:bg-brand/90 transition-all disabled:opacity-50"
      >
        {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
        {isSending ? 'جاري الإرسال...' : 'إرسال الطلب للعميل'}
      </button>

      {okMsg && <p className="text-center text-[12px] text-emerald-600 font-bold">{okMsg}</p>}
    </Card>
  );
};

export default OpenRequestBuilder;
