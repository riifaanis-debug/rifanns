import React, { useState, useRef, useEffect } from 'react';
import rifansStampImg from '@/assets/rifans-stamp.png';
import { X, Download, Printer, FileText, Loader2 } from 'lucide-react';
import { Button } from './Shared';
import { useAuth } from '../../contexts/AuthContext';
import { safeParse } from '../../utils/safeJson';
import { getSubmission, getInvoiceBySubmission } from '../../lib/api';
import { formatAmount } from '../../lib/formatNumber';
import { toPng } from 'html-to-image';
import Logo from './Logo';

interface InvoicePageProps {
  submissionId: string;
  onClose: () => void;
}

const InvoicePage: React.FC<InvoicePageProps> = ({ submissionId, onClose }) => {
  const { token } = useAuth();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [submission, setSubmission] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    if (token && submissionId) {
      fetchData();
    }
  }, [token, submissionId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subData, invData] = await Promise.all([
        getSubmission(submissionId),
        getInvoiceBySubmission(submissionId),
      ]);
      setSubmission(subData);
      setInvoice(invData);
    } catch (err) {
      console.error('Error fetching invoice data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const products = Array.isArray(submission?.data?.products)
    ? submission.data.products
    : (typeof submission?.data?.products === 'string' ? safeParse(submission.data.products, []) : []);
  const totalDebt = products.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0) || 0;

  const isRescheduling = submission?.type === 'rescheduling_request' || submission?.type === 'scheduling_request';
  const isSeizedAmounts = submission?.type === 'seized_amounts_request';

  const getServiceName = () => {
    if (isRescheduling) return 'إعادة جدولة المنتجات التمويلية';
    if (isSeizedAmounts) return 'إتاحة النسبة النظامية والمبالغ المستثناه من الحجز';
    return 'إعفاء من الالتزامات المالية';
  };

  const getFeeDescription = () => {
    if (isRescheduling) return '2,000 ريال سعودي (مبلغ مقطوع)';
    if (isSeizedAmounts) return `1% من إجمالي المبالغ المستردة`;
    return `4% من إجمالي المبالغ المعفية`;
  };

  const handleDownload = async () => {
    const el = invoiceRef.current;
    if (!el) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(el, { quality: 0.95, backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `invoice-${submissionId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={40} />
      </div>
    );
  }

  if (!submission || !invoice) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center gap-4">
        <FileText className="text-muted" size={48} />
        <p className="text-muted text-sm">لم يتم العثور على الفاتورة</p>
        <Button onClick={onClose}>العودة</Button>
      </div>
    );
  }

  const invoiceDate = new Date(invoice.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col overflow-x-hidden">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
          <span className="text-sm font-bold text-brand">فاتورة رقم {invoice.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} disabled={isDownloading} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gold">
            <Download size={20} />
          </button>
          <button onClick={() => window.print()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gold">
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-8">
        <div ref={invoiceRef} className="w-full max-w-[700px] bg-white rounded-2xl shadow-xl overflow-hidden" dir="rtl">
          {/* Header */}
          <div className="bg-[#22042C] text-white p-6 sm:p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black mb-1">فاتورة</h1>
                <p className="text-gold text-sm font-bold">INVOICE</p>
              </div>
              <div className="text-left">
                <Logo />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gold/70">رقم الفاتورة:</span>
                <span className="block font-mono text-white mt-0.5">{invoice.id}</span>
              </div>
              <div className="text-left">
                <span className="text-gold/70">التاريخ:</span>
                <span className="block text-white mt-0.5">{invoiceDate}</span>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <h2 className="text-sm font-bold text-brand mb-3">بيانات العميل</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted">الاسم:</span>
                <span className="block font-bold text-brand mt-0.5">{submission.data?.fullName || submission.data?.firstName || '---'}</span>
              </div>
              <div>
                <span className="text-muted">رقم الهوية:</span>
                <span className="block font-bold text-brand mt-0.5 font-mono">{submission.data?.nationalId || '---'}</span>
              </div>
              <div>
                <span className="text-muted">الجوال:</span>
                <span className="block font-bold text-brand mt-0.5 font-mono text-right" dir="ltr">{submission.data?.mobile || '---'}</span>
              </div>
              <div>
                <span className="text-muted">رقم الملف:</span>
                <span className="block font-bold text-brand mt-0.5 font-mono">{submissionId}</span>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <h2 className="text-sm font-bold text-brand mb-3">تفاصيل الخدمة</h2>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="text-xs text-muted mb-1">نوع الخدمة</div>
              <div className="text-sm font-bold text-brand">{getServiceName()}</div>
              {submission.data?.bank && (
                <div className="text-xs text-muted mt-2">الجهة: <span className="text-brand font-bold">{submission.data.bank}</span></div>
              )}
            </div>

            {/* Products Table */}
            {products.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#22042C] text-white">
                      <th className="p-3 text-right font-bold">المنتج التمويلي</th>
                      <th className="p-3 text-right font-bold">رقم الحساب</th>
                      <th className="p-3 text-right font-bold">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="p-3 text-brand">{p.type}</td>
                        <td className="p-3 text-muted font-mono">{p.accountNumber || '---'}</td>
                        <td className="p-3 font-bold text-brand">{formatAmount(p.amount)} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-brand/5 border-t-2 border-gold/20">
                      <td colSpan={2} className="p-3 font-black text-brand text-right">إجمالي المديونية</td>
                      <td className="p-3 font-black text-brand">{formatAmount(totalDebt)} ر.س</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Fee Calculation */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <h2 className="text-sm font-bold text-brand mb-3">احتساب الأتعاب</h2>
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">طريقة الاحتساب:</span>
                <span className="font-bold text-brand">{getFeeDescription()}</span>
              </div>
              {!isRescheduling && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">إجمالي المبلغ الأساسي:</span>
                  <span className="font-bold text-brand">{formatAmount(totalDebt)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-gold/20">
                <span className="text-sm font-black text-brand">المبلغ المستحق</span>
                <span className="text-lg font-black text-gold">{formatAmount(invoice.amount)} ر.س</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className={`flex items-center justify-between p-4 rounded-xl ${invoice.status === 'paid' ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${invoice.status === 'paid' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                <span className={`text-sm font-bold ${invoice.status === 'paid' ? 'text-green-700' : 'text-amber-700'}`}>
                  {invoice.status === 'paid' ? 'تم السداد' : 'في انتظار السداد'}
                </span>
              </div>
              {invoice.paid_at && (
                <span className="text-xs text-green-600">{new Date(invoice.paid_at).toLocaleDateString('ar-SA')}</span>
              )}
            </div>
          </div>

          {/* Footer with stamp */}
          <div className="p-6 sm:p-8 flex justify-between items-end">
            <div className="text-[9px] text-muted space-y-0.5">
              <p>ريفانز للحلول المالية والاستشارية</p>
              <p>سجل تجاري: 4030XXXXXX</p>
              <p>www.rifans.sa</p>
            </div>
            <img src={rifansStampImg} alt="ختم" className="w-20 h-20 opacity-70" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
