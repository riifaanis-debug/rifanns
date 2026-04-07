import React from 'react';
import { ArrowRight, ArrowLeft, ChevronRight, CheckCircle2, FileText, Users, ClipboardList, ShieldCheck } from 'lucide-react';
import { Button } from './Shared';

interface ServiceInfoPageProps {
  title: string;
  subtitle: string;
  description: string;
  targetAudience: string[];
  steps: { title: string; desc: string }[];
  ctaLabel: string;
  ctaHash: string;
  image: string;
}

const ServiceInfoPage: React.FC<ServiceInfoPageProps> = ({
  title, subtitle, description, targetAudience, steps, ctaLabel, ctaHash, image
}) => {
  return (
    <div className="min-h-screen bg-page dark:bg-[#06010a]" dir="rtl">
      {/* Hero */}
      <div className="relative w-full aspect-[16/9] max-h-[300px] overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/80 to-brand/30" />
        <div className="absolute bottom-0 inset-x-0 p-6">
          <h1 className="text-2xl font-black text-white drop-shadow-lg mb-1">{title}</h1>
          <p className="text-xs text-gold font-bold">{subtitle}</p>
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-6 space-y-6">
        {/* About */}
        <div className="bg-white dark:bg-[#12031a] rounded-2xl border border-gold/20 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-gold" />
            <h2 className="text-base font-black text-brand dark:text-white">نبذة عن الخدمة</h2>
          </div>
          <p className="text-sm text-muted dark:text-gray-400 leading-relaxed">{description}</p>
        </div>

        {/* Target Audience */}
        <div className="bg-white dark:bg-[#12031a] rounded-2xl border border-gold/20 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-gold" />
            <h2 className="text-base font-black text-brand dark:text-white">لمن هذه الخدمة؟</h2>
          </div>
          <div className="space-y-2">
            {targetAudience.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-muted dark:text-gray-400">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white dark:bg-[#12031a] rounded-2xl border border-gold/20 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={18} className="text-gold" />
            <h2 className="text-base font-black text-brand dark:text-white">آلية تعبئة ورفع الطلب</h2>
          </div>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-black shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand dark:text-white mb-0.5">{step.title}</h4>
                  <p className="text-xs text-muted dark:text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-2 pb-8">
          <button
            onClick={() => { window.location.hash = ctaHash; }}
            className="w-full py-3.5 rounded-xl bg-gold text-brand font-bold text-sm hover:bg-gold/90 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
          >
            <ShieldCheck size={18} />
            <span>{ctaLabel}</span>
          </button>
          <button
            onClick={() => { window.location.hash = '#/'; }}
            className="w-full py-3 rounded-xl bg-white dark:bg-[#12031a] border border-gold/30 text-brand dark:text-white font-bold text-sm hover:bg-gold/5 transition-all flex items-center justify-center gap-2"
          >
            <ArrowRight size={16} />
            <span>رجوع للصفحة الرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// === Page Components ===

export const WaiveInfoPage: React.FC = () => (
  <ServiceInfoPage
    title="حلول الإعفاء من المديونيات"
    subtitle="خدمات الإعفاء الإنسانية"
    image="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
    description="نقدم دعماً متكاملاً لطلبات الإعفاء من الالتزامات التمويلية في الحالات الإنسانية والصحية. نساعدك في ترتيب ملف طلب الإعفاء نتيجة عجز طبي من خلال جمع التقارير الطبية المعتمدة ومستندات إنهاء الخدمة، ثم رفع طلب متكامل للجهة التمويلية ومتابعته حتى صدور القرار."
    targetAudience={[
      "العملاء المتعثرون مالياً بسبب عجز طبي موثق",
      "من صدر لهم قرار طبي بإنهاء الخدمة",
      "الحالات الإنسانية المستحقة للإعفاء وفقاً لسياسات الجهات التمويلية",
      "كل من لديه التزامات تمويلية ويعاني من ظروف صحية تمنعه من السداد"
    ]}
    steps={[
      { title: "تسجيل الدخول وتعبئة البيانات", desc: "سجّل دخولك على المنصة واملأ بياناتك الشخصية والمالية بدقة." },
      { title: "إرفاق المستندات المطلوبة", desc: "أرفق التقارير الطبية المعتمدة ومستندات إنهاء الخدمة وأي وثائق داعمة." },
      { title: "مراجعة الطلب", desc: "سيقوم فريقنا بمراجعة ملفك والتأكد من اكتمال المستندات." },
      { title: "رفع الطلب والمتابعة", desc: "نتولى رفع الطلب للجهة التمويلية ومتابعته حتى صدور القرار النهائي." }
    ]}
    ctaLabel="تقديم طلب الإعفاء"
    ctaHash="#/"
  />
);

export const SchedulingInfoPage: React.FC = () => (
  <ServiceInfoPage
    title="جدولة المديونيات والالتزامات"
    subtitle="خدمات الجدولة المالية"
    image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
    description="نساعدك في إعادة تنظيم التزاماتك المالية مع البنوك والجهات التمويلية لتخفيف العبء الشهري وتحقيق الاستقرار المالي. نقوم بتحليل وضعك المالي وتحديد أفضل خيارات الجدولة المتاحة، ثم التفاوض مع الجهات التمويلية لتقليل القسط الشهري أو تمديد فترة السداد."
    targetAudience={[
      "العملاء الذين يعانون من ارتفاع الأقساط الشهرية",
      "من يرغب في تمديد فترة السداد لتخفيف العبء المالي",
      "العملاء الذين لديهم أكثر من التزام تمويلي",
      "كل من يبحث عن إعادة هيكلة ديونه بشكل منظم"
    ]}
    steps={[
      { title: "تسجيل الدخول وتعبئة البيانات", desc: "سجّل دخولك واملأ بياناتك المالية والشخصية بدقة." },
      { title: "تحديد المنتجات التمويلية", desc: "حدد المنتجات التمويلية التي ترغب في جدولتها مع تفاصيلها." },
      { title: "إرفاق المستندات", desc: "أرفق كشف حساب بنكي وتعريف الراتب وأي مستندات داعمة." },
      { title: "دراسة ائتمانية وتفاوض", desc: "نقوم بدراسة وضعك والتفاوض مع الجهات التمويلية نيابة عنك." }
    ]}
    ctaLabel="تقديم طلب جدولة المنتجات التمويلية"
    ctaHash="#/"
  />
);

export const SeizedAmountsInfoPage: React.FC = () => (
  <ServiceInfoPage
    title="إتاحة النسبة النظامية والمبالغ المستثناه من الحجز"
    subtitle="خدمات إتاحة المبالغ المستثناه"
    image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800"
    description="نقدم خدمة متكاملة لمساعدتك في إتاحة المبالغ المستثناه من الحجز وفقاً للأنظمة السعودية. نساعدك في استرداد حقوقك المالية المحجوزة بما في ذلك حساب المواطن وبدل غلاء المعيشة والنسبة النظامية من الراتب، مع متابعة شاملة حتى إتمام الإجراء."
    targetAudience={[
      "العملاء الذين تم حجز جزء من رواتبهم بشكل يتجاوز النسبة النظامية",
      "المستفيدون من برامج الدعم الحكومي (حساب المواطن، حافز) الذين تم حجز مبالغهم",
      "كل من لديه مبالغ مستثناة من الحجز وفقاً للأنظمة ولم يتم إتاحتها",
      "العملاء الراغبون في معرفة حقوقهم النظامية فيما يخص الحجز على الراتب"
    ]}
    steps={[
      { title: "تسجيل الدخول وتعبئة البيانات", desc: "سجّل دخولك واملأ بياناتك الشخصية وبيانات الحجز." },
      { title: "تحديد نوع المبالغ المحجوزة", desc: "حدد نوع المبالغ المستثناة (راتب، حساب مواطن، بدل غلاء معيشة، إلخ)." },
      { title: "إرفاق المستندات الداعمة", desc: "أرفق مستندات الحجز وكشف الراتب وأي إثباتات داعمة." },
      { title: "تقديم الطلب والمتابعة", desc: "نتولى تقديم الطلب ومتابعته مع الجهات المعنية حتى إتاحة المبالغ." }
    ]}
    ctaLabel="تقديم طلب إتاحة النسبة النظامية"
    ctaHash="#/"
  />
);

export default ServiceInfoPage;
