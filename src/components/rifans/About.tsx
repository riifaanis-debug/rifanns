import React, { useState } from 'react';
import { Section, SectionHeader, Button } from './Shared';
import { X } from 'lucide-react';

const aboutData: Record<string, { title: string; text: string }> = {
  who: {
    title: 'من نحن',
    text: 'ريفانس المالية منصة إلكترونية رائدة تقدّم خدمات مالية رقمية واستشارية، تهدف إلى تمكين الأفراد من تحقيق الاستقرار المالي والرفاهية المستدامة. تأسست من قلب تجربة واقعية لمعالجة تحديات الأفراد المالية، لتكون منصة مختلفة لا تكتفي بتقديم المنتجات بل تقدّم حلولاً واعية واستشارات متخصصة تُحدث فرقًا حقيقيًا في حياة الناس.'
  },
  goal: {
    title: 'هدفنا',
    text: 'هدفنا إحداث فرق ملموس في حياة عملائنا من خلال تقديم حلول مالية واقعية ومبتكرة تعزّز قدرتهم على الوفاء بالتزاماتهم وتحقيق تطلعاتهم، مع تحويل التحديات المالية إلى فرص للنمو وبناء مستقبل مالي مستدام.'
  },
  vision: {
    title: 'رؤيتنا',
    text: 'أن نصبح العلامة التجارية الأبرز في مجال الحلول التمويلية والاستشارات المالية في المملكة العربية السعودية، وأن نكون الخيار الأول لكل من يبحث عن حلول مالية متكاملة تعكس الاحترافية والابتكار والموثوقية، ونسهم في بناء مجتمع مالي أكثر وعيًا وكفاءة.'
  },
  message: {
    title: 'رسالتنا',
    text: 'رسالتنا تمكين الأفراد من مواجهة تحدياتهم المالية بثقة، من خلال خدمات متخصصة قائمة على الخبرة والمعرفة العميقة بالأنظمة واللوائح المصرفية، مع تمثيل صوت العميل أمام الجهات التمويلية والرقابية بما يضمن حقوقه ويزيد فرص حصوله على الحلول المناسبة.'
  },
  mission: {
    title: 'مهمتنا',
    text: 'تكمن مهمتنا في توفير حلول تمويلية مبتكرة لكل عميل بشكل فردي، وتقديم خدمات قانونية ومالية احترافية في مجالات الإعفاء، وإعادة الجدولة، ومعالجة الديون المتعثرة، مع ضمان أعلى معايير الشفافية وبناء جسور ثقة عبر المتابعة المستمرة والتواصل الفعّال.'
  }
};

const About: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const closeModal = () => setActiveKey(null);

  return (
    <>
      <Section id="about">
        <h2 className="text-[18px] font-extrabold text-brand mb-2.5">عن ريفانس</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(aboutData).map((key) => (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              className={`text-[12px] px-3 py-1.5 rounded-full border transition-all duration-200 ${
                activeKey === key 
                  ? 'border-gold bg-[#FFFBF2] shadow-[0_0_0_1px_rgba(199,169,105,0.4)]' 
                  : 'border-gold/60 bg-white hover:bg-gray-50'
              }`}
            >
              {aboutData[key].title}
            </button>
          ))}
        </div>
      </Section>

      {/* Modal */}
      {activeKey && (
        <div 
          className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            className="w-full max-w-[420px] bg-card-gradient rounded-[20px] border border-gold/70 p-4 relative shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal}
              className="absolute top-3 left-3 w-[26px] h-[26px] rounded-full border border-gold/70 bg-white flex items-center justify-center text-brand hover:bg-gray-100"
            >
              <X size={14} />
            </button>
            <h2 className="text-[18px] font-extrabold text-brand mb-2">{aboutData[activeKey].title}</h2>
            <p className="text-[13px] leading-7 text-muted">{aboutData[activeKey].text}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default About;
