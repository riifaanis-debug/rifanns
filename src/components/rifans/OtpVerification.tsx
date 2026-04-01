import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Shared';
import { Loader2, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Logo from './Logo';

interface OtpVerificationProps {
  phone: string;
  userId: string;
  onVerified: () => void;
  onCancel: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ phone, userId, onVerified, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sent, setSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    sendOtp();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOtp = async () => {
    setIsSending(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-otp', {
        body: { phone, userId },
      });

      if (fnError || !data?.success) {
        setError(data?.error || 'فشل إرسال رمز التحقق');
        return;
      }

      setSent(true);
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError('فشل إرسال رمز التحقق');
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    if (pasted.length > 0) {
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('يرجى إدخال رمز التحقق كاملاً');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-otp', {
        body: { phone, code, userId },
      });

      if (fnError || !data?.success) {
        setError(data?.error || 'رمز التحقق غير صحيح');
        return;
      }

      onVerified();
    } catch {
      setError('خطأ في التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  const maskedPhone = phone ? `${phone.slice(0, 4)}****${phone.slice(-2)}` : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onCancel} />
      
      <div className="relative w-full max-w-[300px] bg-white dark:bg-[#12031a] rounded-2xl shadow-2xl overflow-hidden border border-gold/20 animate-in zoom-in-95 duration-300">
        <div className="p-4 text-center">
          <Logo className="w-[80px] h-auto justify-center mb-2 mx-auto" />
          
          <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="text-gold" size={24} />
          </div>
          
          <h2 className="text-sm font-bold text-brand dark:text-white mb-1">التحقق من رقم الجوال</h2>
          <p className="text-[10px] text-muted mb-3">
            {sent ? (
              <>تم إرسال رمز التحقق إلى <span className="font-bold text-brand dark:text-gold dir-ltr inline-block">{maskedPhone}</span></>
            ) : (
              'جاري إرسال رمز التحقق...'
            )}
          </p>

          {error && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-[10px]">
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div className="flex gap-1.5 justify-center mb-3 dir-ltr" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-9 h-10 text-center text-base font-bold bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none transition-all dark:text-white"
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            className="w-full py-1.5 text-xs gap-2 rounded-lg mb-2"
            disabled={isLoading || otp.join('').length !== 6}
          >
            {isLoading ? (
              <Loader2 className="animate-spin mx-auto" size={16} />
            ) : (
              <>
                تأكيد الرمز
                <ArrowRight size={14} className="rotate-180" />
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={sendOtp}
            disabled={countdown > 0 || isSending}
            className="text-[10px] text-gold hover:text-gold/80 disabled:text-muted transition-colors flex items-center gap-1 mx-auto"
          >
            <RefreshCw size={10} className={isSending ? 'animate-spin' : ''} />
            {countdown > 0 ? `إعادة الإرسال بعد ${countdown} ثانية` : 'إعادة إرسال الرمز'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full mt-2 text-[10px] text-muted hover:text-brand dark:hover:text-gold transition-colors underline underline-offset-2"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
