import React from 'react';
import { Section, SectionHeader, Card } from './Shared';
import { Plus } from 'lucide-react';
import { FAQItem } from '../../types';

const faqData: FAQItem[] = [
  {
    question: "ما هي المرجعية النظامية التي تستند إليها حلول ريفانس المالية؟",
    answer: "تعتمد كافة حلولنا واستشاراتنا على اللوائح التنفيذية للبنك المركزي السعودي (SAMA) وضوابط حماية العملاء، لضمان أن كل إجراء مالي أو قانوني نتخذه نيابة عن العميل هو إجراء نظامي 100% ومحمي بموجب الأنظمة السعودية."
  },
  {
    question: "كيف تضمنون أمن البيانات وخصوصية المعلومات المالية؟",
    answer: "نطبق بروتوكولات تشفير متقدمة (SSL) ونلتزم باتفاقيات سرية صارمة تمنع تداول أي بيانات ائتمانية أو شخصية مع أي طرف ثالث. تُحفظ الملفات في أنظمة مؤمنة ولا يطلع عليها إلا الفريق الاستشاري المختص بمعالجة الحالة."
  },
  {
    question: "ما القيمة المضافة التي تقدمها ريفانس مقارنة بالتوجه المباشر للبنك؟",
    answer: "نحن نمتلك الخبرة القانونية والمالية لصياغة طلبك بطريقة تبرز أحقيتك النظامية، ونتحدث نيابة عنك بلغة المصرفيين، مما يرفع احتمالية قبول الطلب وسرعة التجاوب مقارنة بالتقديم الفردي التقليدي الذي قد يفتقر للأسانيد الصحيحة."
  },
  {
    question: "كيف يتم التعامل مع الحالات التي تم رفضها سابقاً من الجهات التمويلية؟",
    answer: "الرفض المبدئي غالباً ما يكون نتيجة لعدم وضوح المبررات أو نقص المستندات الداعمة. دورنا يكمن في تحليل سبب الرفض، وإعادة هيكلة الطلب وتدعيمه بالتقارير المالية والنظامية اللازمة، ثم إعادة رفعه للجهات المعنية بمستوى مهني يفرض إعادة النظر."
  }
];

const FAQ: React.FC = () => {
  return (
    <Section id="faq">
      <Card>
        <SectionHeader 
          eyebrow="الأسئلة الشائعة" 
          title="معلومات تهمك حول خدماتنا" 
        />
        <div className="flex flex-col gap-2 mt-2">
          {faqData.map((item, idx) => (
            <details key={idx} className="group rounded-[16px] border border-gold/30 bg-white overflow-hidden transition-all duration-300 hover:border-gold/60 hover:shadow-sm">
              <summary className="list-none cursor-pointer p-3.5 flex items-center justify-between text-sm font-bold text-brand select-none">
                <span className="flex-1 ml-3 leading-relaxed">{item.question}</span>
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-gold transition-colors group-hover:bg-gold group-hover:text-white shrink-0">
                   <Plus size={14} className="transition-transform duration-300 group-open:rotate-45" />
                </div>
              </summary>
              <div className="px-4 pb-4 text-xs text-muted leading-relaxed border-t border-dashed border-gold/20 pt-3 mt-1 animate-in fade-in slide-in-from-top-1">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </Card>
    </Section>
  );
};

export default FAQ;