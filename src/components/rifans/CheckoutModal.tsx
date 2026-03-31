import React, { useState } from 'react';
import { X, Lock, CreditCard, CheckCircle, ShieldCheck, Calendar, Hash } from 'lucide-react';
import { ProductItem } from '../../types';
import { Button } from './Shared';

interface CheckoutModalProps {
  product: ProductItem;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ product, onClose }) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [holder, setHolder] = useState('');

  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiry = (val: string) => {
    return val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
  };

  const processPayment = () => {
    setStep('processing');
    // Simulate payment processing delay
    setTimeout(() => {
      setStep('success');
    }, 2500);
  };

  const handleCardPay = (e: React.FormEvent) => {
    e.preventDefault();
    processPayment();
  };

  const handleApplePay = () => {
    processPayment();
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-[24px] border border-green-100 shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          
          <div className="w-20 h-20 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5 animate-in zoom-in duration-500">
            <CheckCircle className="text-green-600 w-10 h-10" />
          </div>
          
          <h2 className="text-[20px] font-extrabold text-brand mb-2">تم الدفع بنجاح!</h2>
          <p className="text-[13px] text-muted mb-6 leading-relaxed">
            تم استلام مبلغ <span className="font-bold text-brand">{product.price} ر.س</span> بنجاح.
            <br/>سيتم التواصل معك فوراً لتقديم الخدمة.
          </p>
          
          <div className="bg-[#F9F9F9] rounded-xl p-3 mb-6 border border-gray-100">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-muted">رقم العملية</span>
              <span className="font-mono font-bold text-brand">#PAY-{Math.floor(Math.random()*100000)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted">طريقة الدفع</span>
              <span className="font-bold text-brand">Apple Pay / Card</span>
            </div>
            <div className="flex justify-between text-[11px] mt-1">
              <span className="text-muted">التاريخ</span>
              <span className="font-bold text-brand">{new Date().toLocaleDateString('en-GB')}</span>
            </div>
          </div>

          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg border-none">
            إغلاق
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[450px] bg-[#F5F4FA] sm:rounded-[24px] rounded-t-[24px] border-t sm:border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white p-4 flex justify-between items-center border-b border-gray-100 shadow-sm sticky top-0 z-10">
           <div className="flex items-center gap-2">
             <Lock size={16} className="text-green-600" />
             <span className="text-[13px] font-bold text-brand">دفع آمن ومشفّر</span>
           </div>
           <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-muted hover:bg-gray-100">
             <X size={18} />
           </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 pb-8">
           {/* Order Summary */}
           <div className="bg-white rounded-[16px] p-4 border border-gold/20 shadow-sm mb-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-2 h-full bg-gold"></div>
             <div className="flex justify-between items-start mb-2">
               <div>
                 <div className="text-[10px] text-muted mb-1">الخدمة المطلوبة</div>
                 <div className="text-[15px] font-extrabold text-brand">{product.name}</div>
               </div>
               <div className="text-[18px] font-extrabold text-brand tabular-nums">{product.price} <span className="text-[11px] font-medium">ر.س</span></div>
             </div>
             <div className="text-[11px] text-muted flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
               <ShieldCheck size={12} className="text-gold" />
               ضمان استرجاع المبلغ في حال عدم تقديم الخدمة
             </div>
           </div>

           {/* Processing State */}
           {step === 'processing' ? (
             <div className="py-12 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 border-4 border-gray-200 border-t-gold rounded-full animate-spin mb-6"></div>
               <h3 className="text-[16px] font-bold text-brand mb-1">جاري معالجة الدفع...</h3>
               <p className="text-[12px] text-muted">يرجى عدم إغلاق الصفحة</p>
             </div>
           ) : (
             <div className="flex flex-col gap-4">
               
               {/* Apple Pay Button */}
               <div>
                 <button 
                   onClick={handleApplePay}
                   className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-[12px] flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95"
                 >
                    {/* Apple Logo SVG */}
                    <svg viewBox="0 0 384 512" fill="currentColor" className="w-5 h-5 mb-1">
                      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 79.9c14.2 40.2 40.8 81.7 70.4 83.4 30.9 1.7 41-19.7 78.6-19.7 37.5 0 49.4 19.7 83 19.7 30.7 0 57.5-38.7 76.3-79.9 6.6-14.4 14.5-34.9 14.5-34.9-33.5-17.1-53.7-42.3-52.5-83.3zM255 129c17-19.7 29.5-47.2 26.5-77.1-24.4 2.8-55.5 19.7-72.3 40.2-16.4 19.1-28.5 45.8-26.4 76.4 29 2.1 55.4-19.7 72.2-39.5z"/>
                    </svg>
                    <span className="text-[17px] font-medium tracking-wide font-sans">Pay</span>
                 </button>
               </div>

               {/* Divider */}
               <div className="flex items-center gap-3">
                 <div className="h-px flex-1 bg-gray-200"></div>
                 <span className="text-[11px] text-muted font-bold">أو الدفع بالبطاقة</span>
                 <div className="h-px flex-1 bg-gray-200"></div>
               </div>

               {/* Card Payment Form */}
               <form onSubmit={handleCardPay} className="flex flex-col gap-4">
                 
                 <div className="flex gap-2 justify-center mb-1 opacity-70 grayscale hover:grayscale-0 transition-all">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5" alt="Mastercard" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-5" alt="Visa" />
                    <div className="h-5 border border-gray-300 rounded px-1 flex items-center text-[8px] font-bold text-brand bg-white">Mada</div>
                 </div>

                 {/* Card Number */}
                 <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-brand flex justify-between">
                     <span>رقم البطاقة</span>
                   </label>
                   <div className="relative">
                      <input 
                        type="text" 
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        className="w-full p-3 pl-10 rounded-[12px] border border-gray-300 text-[14px] font-mono font-medium focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none transition-all text-left dir-ltr placeholder:text-gray-300"
                        maxLength={19}
                      />
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   </div>
                 </div>

                 {/* Holder Name */}
                 <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-brand">اسم حامل البطاقة</label>
                   <input 
                     type="text" 
                     required
                     value={holder}
                     onChange={(e) => setHolder(e.target.value.toUpperCase())}
                     placeholder="الاسم كما يظهر على البطاقة"
                     className="w-full p-3 rounded-[12px] border border-gray-300 text-[13px] font-medium focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none transition-all placeholder:text-gray-300 uppercase"
                   />
                 </div>

                 <div className="flex gap-3">
                   {/* Expiry */}
                   <div className="flex-1 space-y-1.5">
                     <label className="text-[11px] font-bold text-brand">تاريخ الانتهاء</label>
                     <div className="relative">
                        <input 
                          type="text" 
                          required
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          className="w-full p-3 pl-9 rounded-[12px] border border-gray-300 text-[14px] font-mono font-medium focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none transition-all text-left dir-ltr placeholder:text-gray-300"
                          maxLength={5}
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     </div>
                   </div>

                   {/* CVV */}
                   <div className="flex-1 space-y-1.5">
                     <label className="text-[11px] font-bold text-brand">رمز الأمان (CVV)</label>
                     <div className="relative">
                        <input 
                          type="password" 
                          required
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="123"
                          className="w-full p-3 pl-9 rounded-[12px] border border-gray-300 text-[14px] font-mono font-medium focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none transition-all text-left dir-ltr placeholder:text-gray-300"
                          maxLength={3}
                        />
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     </div>
                   </div>
                 </div>

                 <Button type="submit" className="w-full h-12 mt-2 text-[14px] shadow-lg">
                   إتمام الدفع الآمن ({product.price} ر.س)
                 </Button>
                 
                 <div className="flex items-center justify-center gap-1 opacity-60 mt-1">
                   <Lock size={10} className="text-muted" />
                   <span className="text-[10px] text-muted">جميع البيانات مشفرة باستخدام SSL 256-bit</span>
                 </div>
               </form>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;