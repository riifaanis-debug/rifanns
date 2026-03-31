import React from 'react';
import { Section, SectionHeader, StripContainer } from './Shared';

const payments = [
  { name: "مدفوع", logo: "https://cdn.salla.sa/app-icons/madfu.png", scale: 0.9 },
  { name: "إمكان", logo: "https://cdn.salla.sa/app-icons/emkan.png", scale: 0.9 },
  { name: "MisPay", logo: "https://cdn.salla.sa/app-icons/mispay.png", scale: 0.9 },
  { name: "تمارا", logo: "https://cdn.salla.sa/app-icons/tamara.png", scale: 0.9 },
  { name: "تابي", logo: "https://cdn.salla.sa/app-icons/tabby.png", scale: 0.9 },
  { name: "Apple Pay", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg", scale: 1.1 },
  { name: "STC Pay", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Stc_pay_logo.svg", scale: 1.2 },
  { name: "Visa", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg", scale: 1.0 },
  { name: "Mastercard", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg", scale: 0.9 },
  { name: "Mada", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mada_Logo.svg/320px-Mada_Logo.svg.png", scale: 1.1 },
];

const PaymentPartners: React.FC = () => {
  return (
    <Section id="payment-partners" className="mb-8">
      <SectionHeader 
        eyebrow="خيارات دفع مرنة"
        title="وسائل الدفع وشركاء التقسيط" 
        subtitle="نوفر لك خيارات دفع متعددة تشمل التقسيط المرن عبر شركائنا المعتمدين."
        align="center"
      />
      
      <div className="relative">
          <StripContainer className="gap-6 py-4 items-center">
          {payments.map((p, idx) => (
              <div 
              key={idx} 
              className="min-w-[70px] h-[45px] flex items-center justify-center snap-center transition-all duration-300 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 hover:scale-110"
              >
                  <img 
                      src={p.logo} 
                      alt={p.name} 
                      className="w-full h-full object-contain"
                      style={{ transform: `scale(${p.scale})` }}
                      loading="lazy"
                  />
              </div>
          ))}
          </StripContainer>
          
          <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-[#F5F4FA] dark:from-[#06010a] to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-[#F5F4FA] dark:from-[#06010a] to-transparent pointer-events-none"></div>
      </div>
    </Section>
  );
};

export default PaymentPartners;