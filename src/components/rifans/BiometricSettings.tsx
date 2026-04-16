import React, { useEffect, useState } from 'react';
import { Fingerprint, Trash2, Plus, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from './Shared';
import {
  isBiometricSupported,
  registerBiometric,
  getUserCredentials,
  deleteCredential,
} from '@/lib/webauthn';

interface BiometricSettingsProps {
  userId: string;
  userName: string;
  open: boolean;
  onClose: () => void;
}

const BiometricSettings: React.FC<BiometricSettingsProps> = ({ userId, userName, open, onClose }) => {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [creds, setCreds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refresh = async () => {
    setLoading(true);
    const list = await getUserCredentials(userId);
    setCreds(list);
    setLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    isBiometricSupported().then(setSupported);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const handleRegister = async () => {
    setRegistering(true);
    setMessage(null);
    const deviceName = `${navigator.platform} - ${new Date().toLocaleDateString('ar-SA')}`;
    const res = await registerBiometric(userId, userName, deviceName);
    if (res.success) {
      setMessage({ type: 'success', text: 'تم تفعيل البصمة بنجاح على هذا الجهاز' });
      await refresh();
    } else {
      setMessage({ type: 'error', text: res.error || 'فشل التفعيل' });
    }
    setRegistering(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه البصمة؟')) return;
    const ok = await deleteCredential(id, userId);
    if (ok) {
      setMessage({ type: 'success', text: 'تم الحذف' });
      await refresh();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#12031a] rounded-2xl shadow-2xl overflow-hidden border border-gold/20">
        <div className="flex items-center justify-between p-4 border-b border-gold/10">
          <div className="flex items-center gap-2">
            <Fingerprint className="text-gold" size={20} />
            <h3 className="font-bold text-brand dark:text-white text-sm">البصمة والتعرف على الوجه</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-brand dark:hover:text-gold">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {supported === false && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>جهازك أو متصفحك لا يدعم البصمة. الميزة متاحة على معظم أجهزة iPhone و Android والحواسيب الحديثة.</div>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-lg flex items-start gap-2 text-xs ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <div>{message.text}</div>
            </div>
          )}

          <div className="text-xs text-muted leading-relaxed">
            بعد التفعيل، تستطيع تسجيل الدخول مباشرة باستخدام بصمة الإصبع أو التعرف على الوجه عبر هذا الجهاز دون الحاجة لإدخال بياناتك في كل مرة.
          </div>

          {supported && (
            <Button
              onClick={handleRegister}
              disabled={registering}
              className="w-full text-xs gap-2 py-2"
            >
              {registering ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Plus size={14} />
                  تفعيل البصمة على هذا الجهاز
                </>
              )}
            </Button>
          )}

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-brand dark:text-gold/80">الأجهزة المسجلة</div>
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gold" size={18} /></div>
            ) : creds.length === 0 ? (
              <div className="text-center text-xs text-muted py-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                لا توجد أجهزة مسجلة بعد
              </div>
            ) : (
              creds.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Fingerprint className="text-gold flex-shrink-0" size={16} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-brand dark:text-white truncate">{c.device_name}</div>
                      <div className="text-[10px] text-muted">
                        {c.last_used_at
                          ? `آخر استخدام: ${new Date(c.last_used_at).toLocaleDateString('ar-SA')}`
                          : `أُضيف في ${new Date(c.created_at).toLocaleDateString('ar-SA')}`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    aria-label="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricSettings;
