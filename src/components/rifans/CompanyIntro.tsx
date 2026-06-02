import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const CompanyIntro: React.FC = () => {
  const { direction } = useLanguage();

  return (
    <div className="max-w-[520px] mx-auto px-4 py-8">
      {/* Company Name */}
      <div className="text-right mb-3">
        <h1 className="text-xl font-black text-brand dark:text-gold tracking-tight transition-colors">
          ريفانس المالية | Revans Finance
        </h1>
        <p className="text-sm font-bold text-gold mt-1 leading-relaxed">
          شركة سعودية ذات مسؤولية محدودة
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center gap-3 my-4">
        <span className="h-[1px] w-12 bg-gold/40" />
        <span className="w-2 h-2 rounded-full bg-gold/60" />
        <span className="h-[1px] w-12 bg-gold/40" />
      </div>

      {/* Description */}
      <div className={`space-y-4 text-[13px] leading-[1.9] text-muted dark:text-gray-300 transition-colors ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
        <p>
          تعمل تحت مظلة قطاع التقنية المالية ( FinTech ) مرخصة من قِبل البنك المركزي السعودي وخاضعة لإشراف ورقابة هيئة السوق المالية ، متخصصة في تقديم الحلول والإستشارات المالية والعقارية وتقديم خدمات إنترنت الأشياء للأنشطة المالية وأنشطة التأمين والنشاطات الأخرى المساعدة لأنشطة الخدمات المالية
        </p>
        <p>
          تضع معايير جديدة في قطاع التقنية المالية ، تهتم بدراسة ومعالجة طلبات الأفراد في القطاع المصرفي ، وتلتزم بأعلى معايير الشفافية والسرعة ، وتسعى لتخفيف الأعباء المالية عن العملاء ، وفق أعلى معايير الجودة والحوكمة والإبتكار ، وعبر منظومة رقمية متكاملة
        </p>
      </div>
    </div>
  );
};

export default CompanyIntro;
