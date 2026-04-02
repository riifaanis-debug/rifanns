import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

const ProfileCompletionModal: React.FC = () => {
  const { user, login, token } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState(user?.national_id || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if profile is incomplete
  const isIncomplete = user && (!user.fullName || user.fullName?.startsWith('عميل ') || !hasBasicFields());

  function hasBasicFields() {
    // We check from the user object — if any key field is missing, show modal
    return false; // We'll check from DB on mount
  }

  const [needsCompletion, setNeedsCompletion] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    const checkProfile = async () => {
      const { data } = await supabase
        .from('app_users')
        .select('first_name, middle_name, last_name, national_id, phone, age')
        .eq('id', user.id)
        .single();

      if (data) {
        const missing = !data.first_name || !data.middle_name || !data.last_name || !data.age;
        setNeedsCompletion(missing);
        if (data.national_id) setNationalId(data.national_id);
        if (data.phone) setPhone(data.phone);
        if (data.first_name) setFirstName(data.first_name);
        if (data.middle_name) setMiddleName(data.middle_name);
        if (data.last_name) setLastName(data.last_name);
        if (data.age) setAge(data.age);
      }
    };
    checkProfile();
  }, [user]);

  if (!user || !needsCompletion) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !middleName.trim() || !lastName.trim()) {
      setError('يرجى إدخال الاسم الثلاثي كاملاً');
      return;
    }
    if (!nationalId.trim() || nationalId.trim().length < 10) {
      setError('يرجى إدخال رقم الهوية بشكل صحيح');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      setError('يرجى إدخال رقم الجوال بشكل صحيح');
      return;
    }
    if (!age.trim()) {
      setError('يرجى إدخال العمر');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${middleName.trim()} ${lastName.trim()}`;
      const { error: updateError } = await supabase
        .from('app_users')
        .update({
          first_name: firstName.trim(),
          middle_name: middleName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
          national_id: nationalId.trim(),
          phone: phone.trim(),
          age: age.trim(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local user state
      login({
        user: {
          ...user,
          fullName: fullName,
          name: fullName,
          phone: phone.trim(),
          national_id: nationalId.trim(),
        },
        token: token || undefined,
      });

      // Send admin notification for new client
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            requestData: {
              id: user.id,
              type: 'new_client',
              details: 'عميل جديد أكمل تسجيل بياناته الأساسية',
            },
            userData: {
              fullName: fullName,
              phone: phone.trim(),
              national_id: nationalId.trim(),
              email: user.email || '',
            },
          },
        });
      } catch (notifyErr) {
        console.error('Failed to notify admin:', notifyErr);
      }

      setNeedsCompletion(false);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl border border-gold/30 bg-white dark:bg-[#1a0520] text-sm text-brand dark:text-gray-100 placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/40 transition-colors';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-[400px] bg-white dark:bg-[#12031a] rounded-2xl border border-gold/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-gold/20 to-transparent px-5 py-4 border-b border-gold/20">
          <h2 className="text-base font-bold text-brand dark:text-gold text-right">
            إكمال البيانات الأساسية
          </h2>
          <p className="text-xs text-muted dark:text-gray-400 text-right mt-1">
            يرجى إكمال بياناتك للمتابعة
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-muted dark:text-gray-400 mb-1 text-right">الاسم الأول</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder=""
                className={inputClass}
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted dark:text-gray-400 mb-1 text-right">اسم الأب</label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder=""
                className={inputClass}
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted dark:text-gray-400 mb-1 text-right">اسم العائلة</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="الأحمد"
                className={inputClass}
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-muted dark:text-gray-400 mb-1 text-right">رقم الهوية الوطنية</label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="1XXXXXXXXX"
              className={inputClass}
              dir="ltr"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-[11px] text-muted dark:text-gray-400 mb-1 text-right">رقم الجوال</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="05XXXXXXXX"
              className={inputClass}
              dir="ltr"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-[11px] text-muted dark:text-gray-400 mb-1 text-right">العمر</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="30"
              className={inputClass}
              dir="ltr"
              min={18}
              max={100}
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 text-right">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gold text-brand font-bold text-sm hover:bg-gold/90 transition-all active:scale-[0.98] shadow-md disabled:opacity-50"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ ومتابعة'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
