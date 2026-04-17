import React, { useEffect, useState } from 'react';
import { CreditCard, Loader2, Send, CheckCircle, Clock, Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatAmount } from '../../lib/formatNumber';
import { getAdminUsers } from '../../lib/api';

const FALLBACK_RATE = 3.75; // SAR per 1 USD

const fetchExchangeRate = async (): Promise<number> => {
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=SAR&symbols=USD');
    const data = await res.json();
    const rate = data?.rates?.USD;
    // rate is USD per 1 SAR. We want SAR per 1 USD
    if (rate && rate > 0) return 1 / rate;
  } catch (e) {
    console.warn('Exchange rate API failed, using fallback', e);
  }
  return FALLBACK_RATE;
};

const generateId = () => `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

// PayPal payment button (same one used for invoices)
const PayPalButton: React.FC = () => (
  <div className="flex justify-center">
    <form action="https://www.paypal.com/ncp/payment/7JC8Q2G4NFSP4" method="post" target="_blank" style={{ display: 'inline-grid', justifyItems: 'center', alignContent: 'start', gap: '0.5rem' }}>
      <input
        type="submit"
        value="سداد الفاتورة"
        style={{
          textAlign: 'center', border: 'none', borderRadius: '1.5rem',
          minWidth: '11.625rem', padding: '0 2rem', height: '2rem',
          fontWeight: 'bold', backgroundColor: '#1F052A', color: '#ffffff',
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: '0.875rem', lineHeight: '1.125rem', cursor: 'pointer',
        }}
      />
      <img src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" alt="cards" />
      <section style={{ fontSize: '0.75rem' }}>
        مدعوم من{' '}
        <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" style={{ height: '0.875rem', verticalAlign: 'middle', display: 'inline' }} />
      </section>
    </form>
  </div>
);

// ===================== ADMIN VIEW =====================
export const AdminPaymentRequests: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amountSar, setAmountSar] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [rate, setRate] = useState<number>(FALLBACK_RATE);
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [usersData, reqRes] = await Promise.all([
          getAdminUsers(),
          supabase.from('payment_requests').select('*').order('created_at', { ascending: false }),
        ]);
        setUsers(usersData);
        setRequests(reqRes.data || []);
        const r = await fetchExchangeRate();
        setRate(r);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Auto-convert SAR -> USD when amount changes
  useEffect(() => {
    const num = parseFloat(amountSar);
    if (!isNaN(num) && num > 0 && rate > 0) {
      setAmountUsd((num / rate).toFixed(2));
    } else {
      setAmountUsd('');
    }
  }, [amountSar, rate]);

  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleSend = async () => {
    const sar = parseFloat(amountSar);
    if (!selectedUserId || !sar || sar <= 0) return;
    setSending(true);
    setSuccess(false);
    try {
      const id = generateId();
      const { error } = await supabase.from('payment_requests').insert({
        id,
        user_id: selectedUserId,
        client_name: selectedUser?.fullName || selectedUser?.full_name || '',
        amount_sar: sar,
        amount_usd: parseFloat(amountUsd) || 0,
        exchange_rate: rate,
        description: description || null,
        status: 'pending',
      });
      if (error) throw error;
      // Notification for client
      await supabase.from('notifications').insert({
        id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
        user_id: selectedUserId,
        title: 'طلب سداد جديد',
        message: `تم إصدار طلب سداد بمبلغ ${formatAmount(sar)} ر.س${description ? ` مقابل: ${description}` : ''}`,
        type: 'payment',
      });
      // Refresh list
      const { data } = await supabase.from('payment_requests').select('*').order('created_at', { ascending: false });
      setRequests(data || []);
      // Reset
      setAmountSar(''); setAmountUsd(''); setDescription(''); setSelectedUserId('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to send payment request', e);
      alert('حدث خطأ أثناء إرسال طلب السداد');
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.trim();
    if (!q) return true;
    return [u.fullName, u.full_name, u.nationalId, u.national_id, u.mobile, u.phone, u.id]
      .some(v => v && String(v).includes(q));
  });

  return (
    <div className="space-y-5 max-w-3xl mx-auto" dir="rtl">
      {/* Form Card */}
      <div className="bg-white dark:bg-[#12031a] rounded-2xl border-2 border-dashed border-gold/40 p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="text-gold" size={20} />
          <h3 className="text-sm font-black text-brand dark:text-white">إنشاء طلب سداد جديد</h3>
        </div>

        {/* Client Selector */}
        <div>
          <label className="block text-[11px] font-bold text-brand dark:text-gold mb-1.5">اسم العميل</label>
          <div className="relative mb-2">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم / الهوية / الجوال"
              className="w-full pr-9 pl-3 py-2.5 text-[13px] rounded-xl border border-gold/30 bg-white dark:bg-[#1a0830] text-brand dark:text-white focus:outline-none focus:border-gold"
              style={{ fontSize: '16px' }}
            />
          </div>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-gold/30 bg-white dark:bg-[#1a0830] text-brand dark:text-white focus:outline-none focus:border-gold"
            style={{ fontSize: '16px' }}
          >
            <option value="">— اختر العميل —</option>
            {filteredUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.fullName || u.full_name || 'بدون اسم'} — {u.nationalId || u.national_id || u.id}
              </option>
            ))}
          </select>
        </div>

        {/* Amount SAR */}
        <div>
          <label className="block text-[11px] font-bold text-brand dark:text-gold mb-1.5">المبلغ بالريال السعودي (SAR)</label>
          <input
            type="number"
            inputMode="decimal"
            value={amountSar}
            onChange={(e) => setAmountSar(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 text-[14px] font-bold rounded-xl border border-gold/30 bg-white dark:bg-[#1a0830] text-brand dark:text-white focus:outline-none focus:border-gold"
            style={{ fontSize: '16px' }}
          />
        </div>

        {/* Amount USD (auto) */}
        <div>
          <label className="block text-[11px] font-bold text-brand dark:text-gold mb-1.5">
            المبلغ بالدولار الأمريكي (USD)
            <span className="text-[10px] text-muted font-normal mr-2">سعر الصرف: 1 USD = {rate.toFixed(4)} SAR</span>
          </label>
          <input
            type="text"
            value={amountUsd}
            readOnly
            placeholder="0.00"
            className="w-full px-3 py-2.5 text-[14px] font-bold rounded-xl border border-gold/30 bg-gray-50 dark:bg-[#0a0114] text-brand dark:text-white"
            style={{ fontSize: '16px' }}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-bold text-brand dark:text-gold mb-1.5">وذلك مقابل</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="مثال: أتعاب خدمة إعادة جدولة"
            className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-gold/30 bg-white dark:bg-[#1a0830] text-brand dark:text-white focus:outline-none focus:border-gold resize-none"
            style={{ fontSize: '16px' }}
          />
        </div>

        {success && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-[12px] font-bold">
            <CheckCircle size={16} /> تم إرسال طلب السداد للعميل بنجاح
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending || !selectedUserId || !amountSar}
          className="w-full py-3 rounded-xl bg-brand text-gold font-black text-[13px] flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-brand/90 transition-all"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {sending ? 'جاري الإرسال...' : 'إرسال طلب السداد للعميل'}
        </button>
      </div>

      {/* Existing Requests */}
      <div className="bg-white dark:bg-[#12031a] rounded-2xl border border-gold/20 p-4 sm:p-6">
        <h3 className="text-sm font-black text-brand dark:text-white mb-3">طلبات السداد المُرسلة</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gold" size={28} /></div>
        ) : requests.length === 0 ? (
          <p className="text-center text-muted text-[12px] py-6">لا توجد طلبات سداد بعد</p>
        ) : (
          <div className="space-y-2">
            {requests.map(r => (
              <div key={r.id} className="p-3 rounded-xl border border-gold/15 bg-gray-50 dark:bg-[#1a0830] flex flex-col gap-1.5">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <User size={14} className="text-gold shrink-0" />
                    <span className="text-[12px] font-bold text-brand dark:text-white truncate">{r.client_name || r.user_id}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${r.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.status === 'paid' ? 'مسدد' : 'في الانتظار'}
                  </span>
                </div>
                {r.description && <p className="text-[11px] text-muted">{r.description}</p>}
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted flex items-center gap-1"><Clock size={10} /> {new Date(r.created_at).toLocaleDateString('ar-SA')}</span>
                  <div className="flex gap-2">
                    <span className="font-bold text-brand dark:text-gold">{formatAmount(r.amount_sar)} ر.س</span>
                    <span className="text-muted">/ ${formatAmount(r.amount_usd)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ===================== CUSTOMER VIEW =====================
interface CustomerPaymentRequestsProps {
  userId: string;
}

export const CustomerPaymentRequests: React.FC<CustomerPaymentRequestsProps> = ({ userId }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setRequests(data || []);
      setLoading(false);
    })();

    const channel = supabase
      .channel(`payment-requests-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_requests', filter: `user_id=eq.${userId}` },
        async () => {
          const { data } = await supabase
            .from('payment_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          setRequests(data || []);
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gold" size={28} /></div>;
  }

  if (requests.length === 0) {
    return (
      <div className="text-right py-10 text-muted flex flex-col items-start gap-3">
        <CreditCard size={40} className="opacity-20" />
        <p className="text-[12px]">لا توجد طلبات سداد حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" dir="rtl">
      {requests.map(r => (
        <div key={r.id} className="bg-white dark:bg-[#12031a] p-4 rounded-2xl border border-gold/20 shadow-sm">
          {/* Client Name */}
          <div className="mb-3 pb-3 border-b border-dashed border-gold/30">
            <div className="text-[10px] text-muted mb-0.5">اسم العميل</div>
            <div className="text-[13px] font-bold text-brand dark:text-white">{r.client_name || '---'}</div>
          </div>

          {/* Body matching uploaded design */}
          <div className="space-y-2 text-right text-[12px] text-brand dark:text-white leading-relaxed">
            <p>
              تم إصدار فاتورة بمبلغ : <span className="font-black text-gold">{formatAmount(r.amount_sar)} ر.س</span>
            </p>
            {r.description && (
              <p>
                وذلك مقابل : <span className="font-bold">{r.description}</span>
              </p>
            )}
            <p className="pt-2">نأمل الدخول على الرابط أدناه لسداد الفاتورة</p>
            <p className="text-[11px] text-muted">
              يرجى العلم أن العملة المستخدمة للدفع هي : <span className="font-bold text-brand dark:text-gold" dir="ltr">USD $</span>
            </p>
            <p className="text-[11px] text-muted">وعليه فإن المبلغ الذي يتم كتابته في رابط الدفع هو :</p>
          </div>

          {/* USD/SAR boxes */}
          <div className="grid grid-cols-2 gap-2 my-3">
            <div className="border border-gold/30 rounded-xl p-2 text-center bg-gray-50 dark:bg-[#1a0830]">
              <div className="text-[9px] text-muted mb-0.5">USD</div>
              <div className="text-[13px] font-black text-brand dark:text-gold">${formatAmount(r.amount_usd)}</div>
            </div>
            <div className="border border-gold/30 rounded-xl p-2 text-center bg-gray-50 dark:bg-[#1a0830]">
              <div className="text-[9px] text-muted mb-0.5">SAR</div>
              <div className="text-[13px] font-black text-brand dark:text-gold">{formatAmount(r.amount_sar)} ر.س</div>
            </div>
          </div>

          {/* Status / Pay */}
          {r.status === 'paid' ? (
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-[12px] font-bold">
              <CheckCircle size={16} /> تم السداد
            </div>
          ) : (
            <PayPalButton />
          )}

          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex justify-between text-[10px] text-muted">
            <span className="font-mono">{r.id}</span>
            <span className="flex items-center gap-1"><Clock size={10} /> {new Date(r.created_at).toLocaleDateString('ar-SA')}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
