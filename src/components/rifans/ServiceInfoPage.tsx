import React from 'react';
import { ArrowRight, CheckCircle2, FileText, Users, ClipboardList, ShieldCheck, AlertTriangle, Star, Info, BookOpen, Target, Briefcase } from 'lucide-react';

interface ServiceInfoPageProps {
  title: string;
  subtitle: string;
  image: string;
  sections: { icon: React.ReactNode; title: string; content: React.ReactNode }[];
  ctaLabel: string;
  requestType: string;
}

const ServiceInfoPage: React.FC<ServiceInfoPageProps> = ({
  title, subtitle, image, sections, ctaLabel, requestType
}) => {
  const handleRequestClick = () => {
    window.dispatchEvent(new CustomEvent('open-waive-form', {
      detail: { requestType }
    }));
  };

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

      <div className="max-w-[520px] mx-auto px-2 py-4 space-y-3">
        {sections.map((section, i) => (
          <div key={i} className="bg-white dark:bg-[#12031a] rounded-xl border border-gold/20 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              {section.icon}
              <h2 className="text-[15px] font-black text-brand dark:text-white">{section.title}</h2>
            </div>
            <div className="text-[13px] text-muted dark:text-gray-400 leading-relaxed">{section.content}</div>
          </div>
        ))}

        {/* CTA Buttons */}
        <div className="space-y-3 pt-2 pb-8">
          <button
            onClick={handleRequestClick}
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

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="space-y-2">
    {items.map((item, i) => (
      <div key={i} className="flex items-start gap-2.5">
        <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
        <span>{item}</span>
      </div>
    ))}
  </div>
);

const NumberedList: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="space-y-3">
    {items.map((item, i) => (
      <div key={i} className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-black shrink-0">
          {i + 1}
        </div>
        <span className="pt-1">{item}</span>
      </div>
    ))}
  </div>
);

const WarningBox: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 space-y-2">
    {items.map((item, i) => (
      <div key={i} className="flex items-start gap-2.5">
        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <span className="text-amber-800 dark:text-amber-300">{item}</span>
      </div>
    ))}
  </div>
);

// === WAIVE INFO PAGE ===
export const WaiveInfoPage: React.FC = () => (
  <ServiceInfoPage
    title="طلب الإعفاء من الالتزامات التمويلية"
    subtitle="خدمات الإعفاء بسبب عجز كلي"
    image="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
    requestType="waive_request"
    ctaLabel="تقديم طلب الإعفاء"
    sections={[
      {
        icon: <FileText size={18} className="text-gold" />,
        title: "نبذة عن الخدمة",
        content: <p>نقدّم خدمة متخصصة لمساعدة العملاء غير القادرين على سداد التزاماتهم التمويلية نتيجة عجز كلي مثبت، وذلك من خلال إعداد ملف طلب الإعفاء بشكل احترافي وفق المتطلبات المعتمدة لدى الجهات التمويلية، مع متابعة دقيقة لكافة مراحل الطلب حتى صدور القرار.</p>
      },
      {
        icon: <BookOpen size={18} className="text-gold" />,
        title: "تعريف العجز الكلي",
        content: <p>هو العارض الصحي الذي يمنع العميل من ممارسة حياته الطبيعية بشكل كامل، ويترتب عليه عدم لياقته طبياً للعمل، وذلك بموجب تقارير طبية صادرة أو معتمدة من الجهة المختصة نظامًا.</p>
      },
      {
        icon: <Info size={18} className="text-gold" />,
        title: "ما هو طلب الإعفاء؟",
        content: <p>هو إجراء رسمي يُمكن العميل من الحصول على إعفاء كامل من الالتزامات التمويلية المستحقة عليه، عند ثبوت العجز الكلي وفقًا للتقارير الطبية المعتمدة والضوابط المعمول بها لدى الجهة التمويلية.</p>
      },
      {
        icon: <Users size={18} className="text-gold" />,
        title: "الفئة المستفيدة من الخدمة",
        content: <p>تُقدّم هذه الخدمة لكل من ثبت لديه عجز كلي بموجب تقارير طبية رسمية معتمدة، ثبت عدم قدرته على العمل وممارسة حياته الطبيعية بشكل كامل، مما أدى إلى تعثره في سداد التزاماته التمويلية.</p>
      },
      {
        icon: <Target size={18} className="text-gold" />,
        title: "نطاق الخدمة (ماذا يشمل؟)",
        content: (
          <div>
            <p className="mb-3">نقدّم لك خدمة متكاملة لإدارة طلبك من البداية حتى النهاية:</p>
            <BulletList items={[
              "دراسة الحالة والتأكد من انطباق شروط العجز الكلي",
              "مراجعة وتحليل التقارير الطبية والتأكد من استيفائها للمتطلبات",
              "توجيهك لاستكمال أي نواقص في المستندات",
              "إعداد ملف طلب إعفاء احترافي ومنظم",
              "صياغة خطاب طلب الإعفاء بشكل رسمي ومؤثر",
              "متابعة مستمرة لحالة الطلب حتى صدور القرار",
              "إشعارك بأي تحديثات أولًا بأول"
            ]} />
          </div>
        )
      },
      {
        icon: <ClipboardList size={18} className="text-gold" />,
        title: "خطوات التقديم",
        content: (
          <NumberedList items={[
            "تقديم الطلب الأولي عبر الموقع",
            "تقييم الحالة والتأكد من انطباق الشروط",
            "تجهيز المستندات واستكمال النواقص",
            "إعداد وتقديم الطلب رسميًا",
            "متابعة الطلب حتى صدور القرار النهائي"
          ]} />
        )
      },
      {
        icon: <Briefcase size={18} className="text-gold" />,
        title: "المستندات المطلوبة",
        content: (
          <div>
            <p className="mb-3">لضمان معالجة الطلب بشكل صحيح، يجب توفير:</p>
            <BulletList items={[
              "تقارير طبية حديثة ومعتمدة توضح حالة العجز الكلي",
              "الهوية الوطنية",
              "مستندات الالتزامات التمويلية (عقود / كشوفات)",
              "أي مستندات إضافية تدعم الحالة عند الطلب"
            ]} />
          </div>
        )
      },
      {
        icon: <ShieldCheck size={18} className="text-gold" />,
        title: "معايير قبول الطلب",
        content: (
          <BulletList items={[
            "وضوح وثبوت حالة العجز الكلي في التقارير الطبية",
            "اعتماد التقارير من جهة مختصة نظامًا",
            "اكتمال المستندات المطلوبة",
            "توافق الحالة مع سياسات الجهة التمويلية"
          ]} />
        )
      },
      {
        icon: <Star size={18} className="text-gold" />,
        title: "مميزات الخدمة",
        content: (
          <BulletList items={[
            "خبرة في إعداد ملفات الإعفاء",
            "معرفة دقيقة بمتطلبات الجهات التمويلية",
            "تقليل نسبة رفض الطلب بسبب الأخطاء أو النواقص",
            "توفير الوقت والجهد على العميل",
            "متابعة احترافية حتى إغلاق الملف"
          ]} />
        )
      },
      {
        icon: <AlertTriangle size={18} className="text-amber-500" />,
        title: "ملاحظات مهمة",
        content: (
          <WarningBox items={[
            "الإعفاء يقتصر على الحالات التي يثبت فيها العجز الكلي فقط",
            "لا يُنظر في الطلب في حال عدم اكتمال أو اعتماد التقارير الطبية",
            "قرار الإعفاء يخضع بالكامل للجهة التمويلية المختصة",
            "لا يمكن ضمان الموافقة، لكن يتم العمل على تقديم الملف بأفضل صورة ممكنة"
          ]} />
        )
      },
      {
        icon: <Info size={18} className="text-red-500" />,
        title: "تنويه مهم",
        content: (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-4 space-y-3 text-red-800 dark:text-red-300">
            <p>نود التأكيد بأن دورنا يقتصر على تقديم الخدمات الاستشارية والإجرائية المتعلقة بطلبات الإعفاء من الالتزامات التمويلية، حيث نقوم بدراسة الحالة، ومراجعة المستندات، وتقديم المشورة المهنية، إضافة إلى إعداد ملف الطلب ورفعه ومتابعته وفق المتطلبات المعتمدة لدى الجهات التمويلية.</p>
            <p>كما نؤكد أننا لسنا جهة تمويلية أو جهة مخولة بإصدار قرارات الإعفاء، ولا نمتلك أي صلاحية في اعتماد أو رفض الطلبات.</p>
            <p className="font-bold">ويُقر العميل بأن:</p>
            <BulletList items={[
              "تقديم الخدمة لا يعني ضمان الموافقة على طلب الإعفاء",
              "قرار الإعفاء يعتمد على تقييم الجهة المختصة للحالة والتقارير الطبية المقدمة",
              "أي نقص أو عدم دقة في المستندات أو المعلومات قد يؤثر على نتيجة الطلب",
              "دورنا يقتصر على تقديم الطلب بأفضل صورة ممكنة وفق المعايير المعتمدة"
            ]} />
          </div>
        )
      }
    ]}
  />
);

// === SCHEDULING INFO PAGE ===
export const SchedulingInfoPage: React.FC = () => (
  <ServiceInfoPage
    title="طلب جدولة الالتزامات التمويلية"
    subtitle="خدمات الجدولة المالية"
    image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
    requestType="rescheduling_request"
    ctaLabel="تقديم طلب الجدولة"
    sections={[
      {
        icon: <FileText size={18} className="text-gold" />,
        title: "نبذة عن الخدمة",
        content: <p>نقدّم خدمة متخصصة لمساعدة العملاء غير القادرين على سداد التزاماتهم التمويلية بالوضع الحالي، وذلك من خلال إعداد ملف طلب الجدولة بشكل احترافي وفق المتطلبات المعتمدة لدى الجهات التمويلية، مع متابعة دقيقة لكافة مراحل الطلب حتى صدور القرار.</p>
      },
      {
        icon: <BookOpen size={18} className="text-gold" />,
        title: "تعريف جدولة الالتزامات التمويلية",
        content: <p>هي إجراء يهدف إلى إعادة تنظيم الالتزامات التمويلية للعميل بما يتناسب مع وضعه المالي الحالي، من خلال تعديل شروط السداد، مثل تمديد مدة التمويل أو إعادة توزيع الأقساط، بما يساهم في تخفيف العبء المالي وتحقيق استقرار مالي أفضل.</p>
      },
      {
        icon: <Info size={18} className="text-gold" />,
        title: "ما هو طلب الجدولة؟",
        content: <p>هو إجراء رسمي يُمكن العميل من إعادة تنظيم الالتزامات التمويلية المستحقة عليه، بما يتناسب مع قدرته المالية الحالية، وفقًا للضوابط والسياسات المعمول بها لدى الجهة التمويلية.</p>
      },
      {
        icon: <Users size={18} className="text-gold" />,
        title: "الفئة المستفيدة من الخدمة",
        content: <p>تُقدّم هذه الخدمة لكل من يواجه صعوبة في سداد التزاماته التمويلية بالوضع الحالي، ويرغب في إعادة تنظيمها بما يتناسب مع قدرته المالية، بما يساهم في معالجة التعثر أو الحد منه.</p>
      },
      {
        icon: <Target size={18} className="text-gold" />,
        title: "نطاق الخدمة (ماذا يشمل؟)",
        content: (
          <div>
            <p className="mb-3">نقدّم لك خدمة متكاملة لإدارة طلبك من البداية حتى النهاية:</p>
            <BulletList items={[
              "دراسة الحالة المالية والتأكد من الحاجة إلى الجدولة",
              "مراجعة وتحليل الالتزامات التمويلية القائمة",
              "توجيهك لاستكمال أي نواقص في المستندات",
              "إعداد ملف طلب جدولة احترافي ومنظم",
              "صياغة خطاب طلب الجدولة بشكل رسمي ومؤثّر",
              "رفع الطلب للجهة المختصة",
              "متابعة مستمرة لحالة الطلب حتى صدور القرار",
              "إشعارك بأي تحديثات أولًا بأول"
            ]} />
          </div>
        )
      },
      {
        icon: <ClipboardList size={18} className="text-gold" />,
        title: "خطوات التقديم",
        content: (
          <NumberedList items={[
            "تقديم الطلب الأولي عبر الموقع",
            "تقييم الحالة والتأكد من انطباق متطلبات الجدولة",
            "تجهيز المستندات واستكمال النواقص",
            "إعداد وتقديم الطلب رسميًا",
            "متابعة الطلب حتى صدور القرار النهائي"
          ]} />
        )
      },
      {
        icon: <Briefcase size={18} className="text-gold" />,
        title: "المستندات المطلوبة",
        content: (
          <div>
            <p className="mb-3">لضمان معالجة الطلب بشكل صحيح، يجب توفير:</p>
            <BulletList items={[
              "الهوية الوطنية",
              "تعريف بالراتب أو إثبات الدخل",
              "كشف حساب بنكي حديث",
              "مستندات الالتزامات التمويلية (عقود / كشوفات)",
              "أي مستندات إضافية تدعم الحالة عند الطلب"
            ]} />
          </div>
        )
      },
      {
        icon: <ShieldCheck size={18} className="text-gold" />,
        title: "معايير قبول الطلب",
        content: (
          <BulletList items={[
            "وضوح الحالة المالية الحالية للعميل",
            "القدرة على الالتزام بالسداد بعد إعادة الجدولة",
            "اكتمال المستندات المطلوبة",
            "توافق الحالة مع سياسات الجهة التمويلية"
          ]} />
        )
      },
      {
        icon: <Star size={18} className="text-gold" />,
        title: "مميزات الخدمة",
        content: (
          <BulletList items={[
            "خبرة في إعداد ومتابعة طلبات الجدولة",
            "معرفة دقيقة بمتطلبات الجهات التمويلية",
            "تقليل احتمالية رفض الطلب بسبب الأخطاء أو النواقص",
            "توفير الوقت والجهد على العميل",
            "متابعة احترافية حتى إغلاق الملف"
          ]} />
        )
      },
      {
        icon: <AlertTriangle size={18} className="text-amber-500" />,
        title: "ملاحظات مهمة",
        content: (
          <WarningBox items={[
            "الجدولة لا تعني إسقاط المديونية، وإنما إعادة تنظيمها",
            "تخضع جميع الطلبات لسياسات الجهة التمويلية المختصة",
            "قد تختلف شروط الجدولة من جهة إلى أخرى",
            "لا يمكن ضمان الموافقة، لكن يتم العمل على تقديم الملف بأفضل صورة ممكنة"
          ]} />
        )
      },
      {
        icon: <Info size={18} className="text-red-500" />,
        title: "تنويه مهم",
        content: (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-4 space-y-3 text-red-800 dark:text-red-300">
            <p>نود التأكيد بأن دورنا يقتصر على تقديم الخدمات الاستشارية والإجرائية المتعلقة بطلبات جدولة الالتزامات التمويلية، حيث نقوم بدراسة الحالة، ومراجعة المستندات، وتقديم المشورة المهنية، إضافة إلى إعداد ملف الطلب ورفعه ومتابعته وفق المتطلبات المعتمدة لدى الجهات التمويلية.</p>
            <p>كما نؤكد أننا لسنا جهة تمويلية أو جهة مخوّلة بإصدار قرارات الجدولة، ولا نمتلك أي صلاحية في اعتماد أو رفض الطلبات.</p>
            <p className="font-bold">ويُقر العميل بأن:</p>
            <BulletList items={[
              "تقديم الخدمة لا يعني ضمان الموافقة على طلب الجدولة",
              "قرار الجدولة يعتمد على تقييم الجهة المختصة للحالة المالية",
              "أي نقص أو عدم دقة في المستندات أو المعلومات قد يؤثر على نتيجة الطلب",
              "دورنا يقتصر على تقديم الطلب بأفضل صورة ممكنة وفق المعايير المعتمدة"
            ]} />
          </div>
        )
      }
    ]}
  />
);

// === SEIZED AMOUNTS INFO PAGE ===
export const SeizedAmountsInfoPage: React.FC = () => (
  <ServiceInfoPage
    title="طلب إتاحة النسبة النظامية من المبالغ المحجوزة"
    subtitle="خدمات إتاحة المبالغ المستثناة"
    image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800"
    requestType="seized_amounts_request"
    ctaLabel="تقديم طلب إتاحة النسبة النظامية"
    sections={[
      {
        icon: <FileText size={18} className="text-gold" />,
        title: "نبذة عن الخدمة",
        content: <p>نقدّم خدمة متخصصة لمساعدة العملاء الذين لديهم حجز على حساباتهم البنكية بقرار قضائي، وذلك عبر إعداد وتقديم طلب إتاحة النسبة النظامية من المبالغ المستثناة من الحجز، وفق الأنظمة المعمول بها، مع متابعة الطلب حتى صدور القرار.</p>
      },
      {
        icon: <BookOpen size={18} className="text-gold" />,
        title: "ما هي النسبة النظامية المستثناة من الحجز؟",
        content: <p>هي النسبة التي يحق للعميل الاستفادة منها من دخله أو حسابه البنكي رغم وجود حجز، وذلك وفقًا للأنظمة واللوائح المعتمدة، بما يضمن تلبية الاحتياجات المعيشية الأساسية.</p>
      },
      {
        icon: <Info size={18} className="text-gold" />,
        title: "ما هو طلب إتاحة النسبة النظامية؟",
        content: <p>هو إجراء رسمي يهدف إلى تمكين العميل من الاستفادة من الجزء المستثنى نظامًا من المبالغ المحجوزة في حسابه البنكي، وذلك من خلال التقديم للجهات المختصة وفق الضوابط المحددة.</p>
      },
      {
        icon: <Users size={18} className="text-gold" />,
        title: "الفئة المستفيدة من الخدمة",
        content: <p>تُقدّم هذه الخدمة لكل من لديه حجز قائم على حسابه البنكي، ويرغب في الحصول على النسبة النظامية المستثناة من الحجز، بما يضمن قدرته على تلبية احتياجاته الأساسية.</p>
      },
      {
        icon: <Target size={18} className="text-gold" />,
        title: "نطاق الخدمة (ماذا يشمل؟)",
        content: (
          <div>
            <p className="mb-3">نقدّم لك خدمة متكاملة لإدارة طلبك من البداية حتى النهاية:</p>
            <BulletList items={[
              "دراسة حالة الحجز والتأكد من إمكانية طلب الإتاحة",
              "مراجعة المستندات المتعلقة بالحجز والدخل",
              "توجيهك لاستكمال أي نواقص",
              "إعداد طلب إتاحة النسبة النظامية بشكل احترافي",
              "رفع الطلب للجهة المختصة",
              "متابعة مستمرة حتى صدور القرار",
              "إشعارك بجميع التحديثات أولًا بأول"
            ]} />
          </div>
        )
      },
      {
        icon: <ClipboardList size={18} className="text-gold" />,
        title: "خطوات التقديم",
        content: (
          <NumberedList items={[
            "تقديم الطلب الأولي عبر الموقع",
            "مراجعة الحالة والتأكد من انطباق الشروط",
            "تجهيز المستندات المطلوبة",
            "إعداد وتقديم الطلب رسميًا",
            "متابعة الطلب حتى صدور القرار"
          ]} />
        )
      },
      {
        icon: <Briefcase size={18} className="text-gold" />,
        title: "المستندات المطلوبة",
        content: (
          <div>
            <p className="mb-3">قد تشمل (حسب الحالة):</p>
            <BulletList items={[
              "الهوية الوطنية",
              "ما يثبت وجود الحجز على الحساب",
              "كشف حساب بنكي",
              "تعريف بالراتب أو إثبات الدخل",
              "أي مستندات إضافية تدعم الطلب"
            ]} />
          </div>
        )
      },
      {
        icon: <ShieldCheck size={18} className="text-gold" />,
        title: "معايير قبول الطلب",
        content: (
          <BulletList items={[
            "وجود حجز فعلي على الحساب البنكي",
            "وضوح مصدر الدخل",
            "انطباق الأنظمة المتعلقة بالنسب المستثناة",
            "اكتمال المستندات المطلوبة",
            "سياسات الجهة المختصة"
          ]} />
        )
      },
      {
        icon: <Star size={18} className="text-gold" />,
        title: "مميزات الخدمة",
        content: (
          <BulletList items={[
            "خبرة في إجراءات رفع طلبات الإتاحة",
            "معرفة دقيقة بالأنظمة المتعلقة بالحجز",
            "إعداد ملف احترافي يقلل من احتمالية الرفض",
            "توفير الوقت والجهد",
            "متابعة مستمرة حتى إغلاق الطلب"
          ]} />
        )
      },
      {
        icon: <AlertTriangle size={18} className="text-amber-500" />,
        title: "ملاحظات مهمة",
        content: (
          <WarningBox items={[
            "الإتاحة تكون وفق النسبة النظامية المعتمدة فقط",
            "لا يعني تقديم الطلب رفع الحجز بالكامل",
            "تخضع الموافقة للجهة المختصة والأنظمة المعمول بها",
            "قد تختلف الإجراءات حسب جهة التنفيذ أو البنك"
          ]} />
        )
      },
      {
        icon: <Info size={18} className="text-red-500" />,
        title: "تنويه مهم",
        content: (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-4 space-y-3 text-red-800 dark:text-red-300">
            <p>نود التأكيد بأن دورنا يقتصر على تقديم الخدمات الاستشارية والإجرائية المتعلقة بطلبات إتاحة النسبة النظامية من المبالغ المحجوزة، حيث نقوم بدراسة الحالة، ومراجعة المستندات، وتقديم المشورة المهنية، إضافة إلى إعداد الطلب ورفعه ومتابعته وفق المتطلبات المعتمدة.</p>
            <p>كما نؤكد أننا لسنا جهة قضائية أو مصرفية ولا نمتلك أي صلاحية في إصدار قرارات إتاحة المبالغ أو رفضها، حيث إن القرار النهائي يعود للجهة المختصة وفق الأنظمة واللوائح المعمول بها.</p>
            <p className="font-bold">ويُقر العميل بأن:</p>
            <BulletList items={[
              "تقديم الخدمة لا يعني ضمان الموافقة على طلب الإتاحة",
              "القرار النهائي يعتمد على تقييم الجهة المختصة",
              "أي نقص أو عدم دقة في المعلومات قد يؤثر على نتيجة الطلب",
              "دورنا يقتصر على تقديم الطلب بأفضل صورة ممكنة"
            ]} />
          </div>
        )
      }
    ]}
  />
);

export default ServiceInfoPage;
