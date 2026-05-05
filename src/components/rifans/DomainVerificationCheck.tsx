import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const EXPECTED = "f611e98333bbd3a199cf29cfe01bce776a08e40996bfdf6bc8816e9c717c0cdb";

type Result = {
  url: string;
  status?: number;
  found?: string | null;
  matches?: boolean;
  reason?: string;
  error?: string;
};

const DomainVerificationCheck: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('check-domain-verification', {
        body: {},
      });
      if (error) throw error;
      setResults(data?.results ?? []);
    } catch (e: any) {
      setError(e?.message || 'تعذّر تنفيذ الفحص');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-page dark:bg-[#06010a] py-10 px-4">
      <div className="max-w-[640px] mx-auto bg-white dark:bg-[#12031a] rounded-2xl border border-gold/60 shadow-xl p-5">
        <h1 className="text-lg font-black text-brand dark:text-gold mb-1">التحقق من إثبات ملكية النطاق</h1>
        <p className="text-xs text-muted dark:text-gray-400 mb-4">
          الرمز المتوقع داخل وسم <code className="bg-black/5 dark:bg-white/10 px-1 rounded">domain-verification</code>:
        </p>
        <div className="text-[10px] font-mono break-all bg-black/5 dark:bg-white/5 p-2 rounded mb-4 text-brand dark:text-gray-300">
          {EXPECTED}
        </div>

        <button
          onClick={runCheck}
          disabled={loading}
          className="w-full px-4 py-2.5 rounded-xl bg-gold text-brand font-bold text-sm hover:bg-gold/90 transition-all active:scale-95 shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'جارٍ الفحص...' : 'إعادة محاولة التحقق'}
        </button>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-300 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {results && (
          <div className="mt-5 space-y-3">
            {results.map((r) => (
              <div
                key={r.url}
                className={`p-3 rounded-xl border text-xs ${
                  r.matches
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-300 text-green-800 dark:text-green-300'
                    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 text-amber-800 dark:text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {r.matches ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  <span dir="ltr">{r.url}</span>
                  {typeof r.status === 'number' && (
                    <span className="text-[10px] opacity-70">HTTP {r.status}</span>
                  )}
                </div>
                <div className="leading-relaxed">{r.reason || r.error}</div>
                {r.found && !r.matches && (
                  <div className="mt-1 font-mono text-[10px] break-all opacity-80">
                    وُجد: {r.found}
                  </div>
                )}
              </div>
            ))}

            {results.every((r) => r.matches) ? (
              <div className="mt-3 text-xs text-center text-muted dark:text-gray-400">
                ✅ النطاق منشور بالرمز الصحيح. ارجع لمنصة الأعمال واضغط "تحقق من إثبات الملكية".
              </div>
            ) : (
              <div className="mt-3 text-xs text-muted dark:text-gray-400 leading-relaxed">
                <strong>سبب الفشل المحتمل:</strong> النسخة المنشورة على النطاق ما تزال تحتوي رمزًا قديمًا.
                اضغط زر <strong>Publish</strong> في Lovable لإعادة نشر الموقع، ثم أعِد المحاولة.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainVerificationCheck;
