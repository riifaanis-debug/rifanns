import React from 'react';
import { Section, Card } from './Shared';
import { ShieldCheck, Lock, FileCheck } from 'lucide-react';

const PaymentMethods: React.FC = () => {
  return (
    <Section id="payment-methods" className="mb-2">
      <Card className="bg-gradient-to-br from-[#FFFFFF] to-[#FDFBF7] border-gold/30 !py-6 shadow-[0_4px_20px_rgba(199,169,105,0.08)]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Important Links Column */}
          <div className="w-full md:w-auto flex-1">
             <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold shadow-sm">
                   <FileCheck size={16} />
                </div>
                <h3 className="text-[14px] font-extrabold text-brand">روابط مهمة</h3>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 justify-items-center md:justify-items-start">
                <a href="#" className="text-[11px] font-medium text-muted hover:text-brand transition-colors flex items-center gap-1.5 group p-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-gold transition-colors"></span>
                   التحقق من الشهادة
                </a>
                <a href="#" className="text-[11px] font-medium text-muted hover:text-brand transition-colors flex items-center gap-1.5 group p-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-gold transition-colors"></span>
                   حقوق العميل
                </a>
                <a href="#" className="text-[11px] font-medium text-muted hover:text-brand transition-colors flex items-center gap-1.5 group p-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-gold transition-colors"></span>
                   سياسة الاسترجاع
                </a>
                <a href="#" className="text-[11px] font-medium text-muted hover:text-brand transition-colors flex items-center gap-1.5 group p-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-gold transition-colors"></span>
                   الدعم الفني
                </a>
             </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent md:w-px md:h-20 md:bg-gradient-to-b"></div>

          {/* Payment Methods Column */}
          <div className="w-full md:w-auto flex flex-col items-center md:items-end flex-1">
             <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={16} className="text-gold" />
                <h3 className="text-[14px] font-extrabold text-brand">وسائل الدفع الرقمية</h3>
             </div>
             
             <div className="flex items-center gap-2.5 flex-wrap justify-center">
                <div className="h-10 w-16 bg-white border border-gray-100 rounded-[8px] flex items-center justify-center shadow-sm hover:border-gold/30 hover:shadow-md transition-all group">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mada_Logo.svg/320px-Mada_Logo.svg.png" alt="Mada" className="h-4 object-contain group-hover:scale-110 transition-transform" /> 
                </div>
                <div className="h-10 w-16 bg-white border border-gray-100 rounded-[8px] flex items-center justify-center shadow-sm hover:border-gold/30 hover:shadow-md transition-all group">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 object-contain group-hover:scale-110 transition-transform" />
                </div>
                <div className="h-10 w-16 bg-white border border-gray-100 rounded-[8px] flex items-center justify-center shadow-sm hover:border-gold/30 hover:shadow-md transition-all group">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 object-contain group-hover:scale-110 transition-transform" />
                </div>
                 <div className="h-10 w-16 bg-white border border-gray-100 rounded-[8px] flex items-center justify-center shadow-sm hover:border-gold/30 hover:shadow-md transition-all group">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" className="h-4 object-contain group-hover:scale-110 transition-transform" />
                </div>
             </div>

             <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <Lock size={10} />
                <span>عمليات دفع آمنة ومشفرة 100%</span>
             </div>
          </div>

        </div>
      </Card>
    </Section>
  );
};

export default PaymentMethods;