import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from './Shared';
import { User, Phone, CreditCard, ArrowRight, Loader2, AlertCircle, Lock, Mail } from 'lucide-react';
import Logo from './Logo';
import OtpVerification from './OtpVerification';

interface AuthPageProps {
  onClose: () => void;
}

type Mode = 'login' | 'register' | 'admin';

const AuthPage: React.FC<AuthPageProps> = ({ onClose }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [formData, setFormData] = useState({
    nationalId: '',
    mobile: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<{ nationalId: string; mobile: string; email: string } | null>(null);

  const { lookupUserByNationalId, registerNewUser, loginWithEmail, loginWithGoogle, loginWithApple, login } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = await loginWithGoogle();
      window.location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
      onClose();
    } catch (err: any) {
      if (err.message !== 'جاري التحويل...') setError(err.message || 'فشل تسجيل الدخول بجوجل');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'nationalId' || name === 'mobile') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const onlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'admin') {
      if (!formData.email) return setError('يرجى إدخال البريد الإلكتروني');
      if (!formData.password) return setError('يرجى إدخال كلمة المرور');
      setIsLoading(true);
      try {
        const u = await loginWithEmail(formData.email, formData.password);
        window.location.hash = u.role === 'admin' ? '#/admin' : '#/dashboard';
        onClose();
      } catch (err: any) {
        setError(err.message || 'بيانات الدخول غير صحيحة');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === 'login') {
      if (!/^[0-9]{10}$/.test(formData.nationalId)) return setError('رقم الهوية يجب أن يتكون من 10 أرقام');
      if (!/^05[0-9]{8}$/.test(formData.mobile)) return setError('رقم الجوال يجب أن يتكون من 10 أرقام ويبدأ بـ 05');
      setIsLoading(true);
      try {
        const u = await lookupUserByNationalId(formData.nationalId);
        if (u.phone && u.phone !== formData.mobile) {
          setError('رقم الجوال غير مطابق للحساب المسجل');
          setIsLoading(false);
          return;
        }
        login({
          user: { id: u.id, email: u.email, phone: formData.mobile, national_id: formData.nationalId, role: (u.role || 'user') as 'admin' | 'user' },
          token: `session-${u.id}`,
        });
        window.location.hash = u.role === 'admin' ? '#/admin' : '#/dashboard';
        onClose();
      } catch (err: any) {
        setError(err.message || 'تعذّر تسجيل الدخول');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // register
    if (!/^[0-9]{10}$/.test(formData.nationalId)) return setError('رقم الهوية يجب أن يتكون من 10 أرقام');
    if (!/^05[0-9]{8}$/.test(formData.mobile)) return setError('رقم الجوال يجب أن يتكون من 10 أرقام ويبدأ بـ 05');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setError('يرجى إدخال بريد إلكتروني صحيح');

    // Send OTP first WITHOUT creating the account; only create after verification
    setIsLoading(true);
    try {
      // Pre-check national id is not in use
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: existing } = await supabase
        .from('app_users')
        .select('id')
        .eq('national_id', formData.nationalId)
        .limit(1);
      if (existing && existing.length > 0) {
        setError('يوجد حساب مسجل بهذه الهوية. يرجى تسجيل الدخول.');
        setIsLoading(false);
        return;
      }

      setPendingRegistration({
        nationalId: formData.nationalId,
        mobile: formData.mobile,
        email: formData.email.toLowerCase().trim(),
      });
      setPendingUser({ id: 'pending', email: formData.email.toLowerCase().trim(), role: 'user' });
      setShowOtp(true);
    } catch (err: any) {
      setError(err.message || 'تعذّر إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  if (showOtp && pendingUser) {
    return (
      <OtpVerification
        email={pendingUser.email}
        userId={pendingUser.id}
        onVerified={async () => {
          try {
            if (pendingRegistration) {
              const newUser = await registerNewUser(
                pendingRegistration.nationalId,
                pendingRegistration.mobile,
                pendingRegistration.email,
              );
              login({ user: newUser, token: `session-${newUser.id}` });
              window.location.hash = '#/dashboard';
            } else {
              login({
                user: { id: pendingUser.id, email: pendingUser.email, role: pendingUser.role as 'admin' | 'user' },
                token: `session-${pendingUser.id}`,
              });
              window.location.hash = pendingUser.role === 'admin' ? '#/admin' : '#/dashboard';
            }
            onClose();
          } catch (err: any) {
            setError(err.message || 'فشل إكمال العملية');
            setShowOtp(false);
          }
        }}
        onCancel={() => {
          setShowOtp(false);
          setPendingUser(null);
          setPendingRegistration(null);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-[300px] bg-white dark:bg-[#12031a] rounded-2xl shadow-2xl overflow-hidden border border-gold/20 animate-in zoom-in-95 duration-300">
        <div className="p-4">
          <div className="text-center mb-3">
            <Logo className="w-[100px] h-auto justify-center mb-1 mx-auto" />
            <h2 className="text-base font-bold text-brand dark:text-white">
              {mode === 'admin' ? 'دخول الإدارة' : mode === 'register' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h2>
            <p className="text-muted text-[10px] mt-0.5">
              {mode === 'admin' ? 'لوحة تحكم المسؤول' : 'مرحباً بك في ريفانس المالية'}
            </p>
          </div>

          {/* Top tabs visible only in client modes */}

          {/* Sub-tabs: login vs register (only for client mode) */}
          {mode !== 'admin' && (
            <div className="flex gap-1 mb-3 text-[10px]">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-1 rounded-md font-bold transition ${mode === 'login' ? 'bg-gold/15 text-brand dark:text-gold border border-gold/40' : 'text-muted border border-transparent'}`}
              >
                دخول
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-1 rounded-md font-bold transition ${mode === 'register' ? 'bg-gold/15 text-brand dark:text-gold border border-gold/40' : 'text-muted border border-transparent'}`}
              >
                حساب جديد
              </button>
            </div>
          )}

          {error && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-[10px]">
              <AlertCircle size={14} />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleInitialSubmit} className="space-y-2.5" noValidate>
            {mode === 'login' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand dark:text-gold/80 px-1">رقم الهوية الوطنية</label>
                <div className="relative group">
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-gold" size={16} />
                  <input
                    type="text" name="nationalId" inputMode="numeric"
                    value={formData.nationalId} onChange={handleChange} onKeyDown={onlyNumbers} maxLength={10}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg py-2 pr-9 pl-3 text-xs focus:border-gold outline-none dark:text-white"
                    placeholder="10 أرقام"
                  />
                </div>
                <p className="text-[9px] text-muted px-1 pt-1">أدخل رقم الهوية الوطنية لتسجيل الدخول مباشرة</p>
              </div>
            )}

            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand dark:text-gold/80 px-1">رقم الهوية الوطنية</label>
                  <div className="relative group">
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-gold" size={16} />
                    <input
                      type="text" name="nationalId" inputMode="numeric"
                      value={formData.nationalId} onChange={handleChange} onKeyDown={onlyNumbers} maxLength={10}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg py-2 pr-9 pl-3 text-xs focus:border-gold outline-none dark:text-white"
                      placeholder="10 أرقام"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand dark:text-gold/80 px-1">رقم الجوال</label>
                  <div className="relative group">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-gold" size={16} />
                    <input
                      type="text" name="mobile" inputMode="numeric"
                      value={formData.mobile} onChange={handleChange} onKeyDown={onlyNumbers} maxLength={10}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg py-2 pr-9 pl-3 text-xs font-bold focus:border-gold outline-none dark:text-white text-left dir-ltr"
                      placeholder="05xxxxxxxx"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand dark:text-gold/80 px-1">البريد الإلكتروني</label>
                  <div className="relative group">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-gold" size={16} />
                    <input
                      type="email" name="email" required
                      value={formData.email} onChange={handleChange}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg py-2 pr-9 pl-3 text-xs focus:border-gold outline-none dark:text-white text-left dir-ltr"
                      placeholder="example@mail.com"
                    />
                  </div>
                  <p className="text-[9px] text-muted px-1 pt-1">إلزامي - سنرسل رمز تحقق لتفعيل حسابك</p>
                </div>
              </>
            )}

            {mode === 'admin' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand dark:text-gold/80 px-1">البريد الإلكتروني</label>
                  <div className="relative group">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-gold" size={16} />
                    <input
                      type="email" name="email" required value={formData.email} onChange={handleChange}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg py-2 pr-9 pl-3 text-xs focus:border-gold outline-none dark:text-white text-left dir-ltr"
                      placeholder="admin@rifans.net"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand dark:text-gold/80 px-1">كلمة المرور</label>
                  <div className="relative group">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-gold" size={16} />
                    <input
                      type="password" name="password" required value={formData.password} onChange={handleChange}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg py-2 pr-9 pl-3 text-xs focus:border-gold outline-none dark:text-white text-left dir-ltr"
                      placeholder="••••"
                    />
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full py-1.5 mt-2 text-xs gap-2 rounded-lg" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin mx-auto" size={16} />
              ) : (
                <>
                  {mode === 'admin' ? 'دخول المسؤول' : mode === 'register' ? 'إرسال رمز التحقق' : 'تسجيل الدخول'}
                  <ArrowRight size={14} className="rotate-180" />
                </>
              )}
            </Button>

            {mode !== 'admin' && (
              <>
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100 dark:border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-[9px] uppercase">
                    <span className="bg-white dark:bg-[#12031a] px-2 text-muted">أو</span>
                  </div>
                </div>

                <button
                  type="button" onClick={handleGoogleLogin} disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-1.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[10px] font-bold text-brand dark:text-white hover:bg-gray-50 dark:hover:bg-white/10"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-3.5 h-3.5" />
                  المتابعة بحساب Google
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true); setError('');
                    try { await loginWithApple(); }
                    catch (err: any) { if (err.message !== 'جاري التحويل...') setError(err.message || 'فشل تسجيل الدخول بـ Apple'); }
                    finally { setIsLoading(false); }
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-1.5 bg-black dark:bg-white text-white dark:text-black border border-gray-100 dark:border-white/10 rounded-lg text-[10px] font-bold hover:opacity-90"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  المتابعة بحساب Apple
                </button>
              </>
            )}

            <button
              type="button" onClick={onClose}
              className="w-full mt-2 text-[10px] text-muted hover:text-brand dark:hover:text-gold underline underline-offset-2"
            >
              إلغاء والرجوع للرئيسية
            </button>

            <button
              type="button"
              onClick={() => { setMode(mode === 'admin' ? 'login' : 'admin'); setError(''); }}
              className="w-full mt-1 text-[10px] text-muted hover:text-brand dark:hover:text-gold underline underline-offset-2"
            >
              {mode === 'admin' ? 'العودة لتسجيل دخول العميل' : 'تسجيل دخول الإدارة'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
