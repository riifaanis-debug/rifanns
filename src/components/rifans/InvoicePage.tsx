import React, { useState, useRef, useEffect } from 'react';
import rifansStampImg from '@/assets/rifans-stamp.png';
import bankAccountImg from '@/assets/rifans-bank-account.png';
import { X, Download, Printer, FileText, Loader2 } from 'lucide-react';
import { Button } from './Shared';
import { useAuth } from '../../contexts/AuthContext';
import { safeParse } from '../../utils/safeJson';
import { getSubmission, getInvoiceBySubmission } from '../../lib/api';
import { formatAmount } from '../../lib/formatNumber';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import Logo from './Logo';

interface InvoicePageProps {
  submissionId: string;
  onClose: () => void;
}

const PayPalFormButton: React.FC = () => (
  <div className="flex justify-center">
    <form action="https://www.paypal.com/ncp/payment/7JC8Q2G4NFSP4" method="post" target="_blank" style={{ display: 'inline-grid', justifyItems: 'center', alignContent: 'start', gap: '0.5rem' }}>
      <input
        type="submit"
        value="سداد الفاتورة"
        style={{
          textAlign: 'center',
          border: 'none',
          borderRadius: '1.5rem',
          minWidth: '11.625rem',
          padding: '0 2rem',
          height: '2rem',
          fontWeight: 'bold',
          backgroundColor: '#1F052A',
          color: '#ffffff',
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: '0.875rem',
          lineHeight: '1.125rem',
          cursor: 'pointer',
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
      const opt: any = {
        margin: 5,
        filename: `invoice-${submissionId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all'] },
      };
      await html2pdf().set(opt).from(el).save();
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
      <div className="print-hidden sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
          <span className="text-sm font-bold text-brand">فاتورة رقم {invoice.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} disabled={isDownloading} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gold">
            {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          </button>
          <button onClick={() => window.print()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gold">
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-8">
        <div
          ref={invoiceRef}
          className="invoice-container w-full max-w-[800px] bg-white shadow-xl overflow-hidden flex flex-col"
          dir="rtl"
          style={{ fontFamily: 'Tajawal, sans-serif' }}
        >
          {/* Header: Logo + Title */}
          <div className="px-8 pt-8 pb-4 flex justify-between items-center">
            <Logo />
            <h1 className="text-3xl sm:text-4xl font-black text-brand">فاتورة تقديم خدمات</h1>
          </div>

          {/* Body */}
          <div className="px-8 py-4 flex-1 space-y-4">
            {/* Client Info */}
            <div>
              <h2 className="text-base font-bold text-brand mb-2">بيانات العميل</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs border-b border-gray-200 pb-3">
                <div className="flex gap-2">
                  <span className="text-muted">الاسم:</span>
                  <span className="font-bold text-brand">{submission.data?.fullName || submission.data?.firstName || '---'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted">رقم الهوية:</span>
                  <span className="font-bold text-brand font-mono">{submission.data?.nationalId || '---'}</span>
                </div>
              </div>
            </div>

            {/* Service Block */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[11px] text-muted mb-0.5">نوع الخدمة</div>
              <div className="text-sm font-bold text-brand">{getServiceName()}</div>
              {submission.data?.bank && (
                <div className="text-[11px] text-muted mt-1">الجهة: <span className="text-brand font-bold">{submission.data.bank}</span></div>
              )}
            </div>

            {/* Products Table */}
            {products.length > 0 && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#22042C] text-white">
                    <th className="p-2.5 text-right font-bold">المنتج التمويلي</th>
                    <th className="p-2.5 text-right font-bold">رقم الحساب</th>
                    <th className="p-2.5 text-right font-bold">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p: any, i: number) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="p-2.5 text-brand">{p.type}</td>
                      <td className="p-2.5 text-muted font-mono">{p.accountNumber || '---'}</td>
                      <td className="p-2.5 font-bold text-brand">{formatAmount(p.amount)} ر.س</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gold/40">
                    <td colSpan={2} className="p-2.5 font-black text-brand text-right">إجمالي المديونية</td>
                    <td className="p-2.5 font-black text-brand">{formatAmount(totalDebt)} ر.س</td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* Fee Calculation */}
            <div>
              <h2 className="text-base font-bold text-brand mb-2">احتساب الأتعاب</h2>
              <div className="bg-gold/5 border border-gold/30 rounded-lg p-3 space-y-2">
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
                <div className="flex justify-between items-center pt-2 border-t border-gold/30">
                  <span className="text-sm font-black text-brand">المبلغ المستحق</span>
                  <span className="text-lg font-black text-gold">{formatAmount(invoice.amount)} ر.س</span>
                </div>
              </div>
            </div>

            {/* Payment / Bank Card + Stamp */}
            {invoice.status === 'paid' ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-bold text-green-700">تم السداد</span>
                </div>
                {invoice.paid_at && (
                  <span className="text-xs text-green-600">{new Date(invoice.paid_at).toLocaleDateString('ar-SA')}</span>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-bold text-brand text-center">
                  يتم سداد الفاتورة عن طريق حساب شركة ريفانيس المالية لدى STC BANK كما هو موضح أدناه
                </p>
                <div className="flex justify-between items-center gap-3">
                  <img src={rifansStampImg} alt="ختم" className="h-32 object-contain" />
                  <img src={bankAccountImg} alt="بيانات الحساب البنكي" className="h-36 object-contain" />
                </div>
              </div>
            )}
          </div>

          {/* Purple Footer Bar */}
          <div className="bg-[#22042C] text-white px-6 py-2.5 flex justify-between items-center text-[11px] mt-auto" dir="ltr">
            <div className="flex items-center gap-1.5">
              <span>www.rifanss.com</span>
              <span className="text-gold">🌐</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>info@rifans.net</span>
              <span className="text-gold">✉</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span dir="ltr">800 2440 432</span>
              <span className="text-gold">📞</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Jeddah, Saudi Arabia</span>
              <span className="text-gold">📍</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
