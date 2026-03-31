
import React, { useEffect, useState } from 'react';
import { PageLayout } from './StaticPages';
import { SectionHeader, Button, Card } from './Shared';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Send, ShieldCheck, Sparkles, 
  Banknote, Scale, Building2, Home, Receipt, BarChart3, MessageSquare,
  Zap, Clock, Wallet, FileText, BadgeCheck, RefreshCw, Layers, AlertCircle,
  Share2, LogIn
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { safeStringify } from '../../utils/safeJson';
import { submitRequest } from '../../lib/api';
import { supabase } from '@/integrations/supabase/client';

interface SubService {
  id: string;
  name: string;
  description: string;
  features: string[];
}

interface ServiceData {
  title: string;
  icon: React.ReactNode;
  intro: string;
  subServices: SubService[];
}

const SERVICES_CONTENT: Record<string, ServiceData> = {
  finance: {
    title: "الخدمات التمويلية",
    icon: <Banknote className="text-gold" size={32} />,
    intro: "نقدم منظومة متكاملة من الحلول التمويلية المبتكرة التي تلبي تطلعاتك المالية، مع التركيز على الملاءمة والالتزام بالضوابط الشرعية والنظامية للبنك المركزي السعودي.",
    subServices: [
      {
        id: "personal",
        name: "التمويل الشخصي",
        description: "سيولة نقدية فورية لتغطية احتياجاتك الاستهلاكية بمرونة عالية وفترات سداد ميسرة.",
        features: ["بدون تحويل راتب", "هامش ربح منافس", "موافقة سريعة"]
      },
      {
        id: "realestate",
        name: "التمويل العقاري",
        description: "تملك عقارك الآن عبر حلول تمويلية مدعومة وغير مدعومة تناسب دخلك والتزاماتك.",
        features: ["شراء وحدات جاهزة", "رهن عقاري", "بناء ذاتي"]
      },
      {
        id: "auto",
        name: "التمويل التأجيري",
        description: "امتلك سيارتك بنظام التأجير المنتهي بالتمليك بأقساط شهرية تتناسب مع ميزانيتك.",
        features: ["بدون دفعة أولى", "تأمين شامل", "موافقة فورية"]
      },
      {
        id: "sme",
        name: "تمويل المنشآت",
        description: "دعم مالي مخصص لنمو وتوسع الشركات الصغيرة والمتوسطة والناشئة.",
        features: ["تمويل رأس مال عامل", "تمويل رواتب", "فترات سماح"]
      }
    ]
  },
  legal: {
    title: "الخدمات القضائية والعدلية",
    icon: <Scale className="text-gold" size={32} />,
    intro: "فريق قانوني متخصص لحماية حقوقك ومعالجة ملفاتك القضائية أمام الجهات المختصة، مع خبرة واسعة في أنظمة التنفيذ واللوائح المالية.",
    subServices: [
      {
        id: "litigation",
        name: "رفع الدعاوى المالية",
        description: "تمثيل قانوني محترف للمطالبة بالحقوق والتعويضات المالية.",
        features: ["صياغة لوائح الادعاء", "الترافع والتمثيل", "متابعة الأحكام"]
      },
      {
        id: "execution",
        name: "معالجة ملفات التنفيذ",
        description: "حلول نظامية لطلبات التنفيذ وإيقاف الخدمات المتعلقة بالديون.",
        features: ["طلب مهلة سداد", "رفع إيقاف الخدمات", "تسوية الديون"]
      },
      {
        id: "objection",
        name: "الاعتراضات القانونية",
        description: "إعداد الاعتراضات القانونية على القرارات والأحكام المالية.",
        features: ["تحليل الأسانيد", "صياغة قانونية محكمة", "رفع الاعتراض فوراً"]
      }
    ]
  },
  banking: {
    title: "الخدمات المصرفية",
    icon: <Building2 className="text-gold" size={32} />,
    intro: "نسهل لك التعامل مع القطاع المصرفي عبر تنظيم الحسابات والحلول الرقمية وتحديث البيانات لضمان استمرارية عملياتك المالية.",
    subServices: [
      {
        id: "pos",
        name: "نقاط البيع والمحافظ",
        description: "توفير حلول دفع رقمية متطورة تزيد من كفاءة مبيعاتك.",
        features: ["تركيب فوري", "عمولات منافسة", "دعم فني 24/7"]
      },
      {
        id: "account-org",
        name: "تنظيم الحسابات البنكية",
        description: "تحديث البيانات ومعالجة الحسابات المجمدة وضمان الامتثال.",
        features: ["تحديث KYC", "معالجة الحجوزات", "فتح حسابات متخصصة"]
      },
      {
        id: "cards",
        name: "إدارة البطاقات الائتمانية",
        description: "حلول لتسوية مديونيات البطاقات أو استبدالها بمنتجات أقل تكلفة.",
        features: ["تخفيض الفوائد", "جدولة المستحقات", "إغلاق البطاقات"]
      }
    ]
  },
  realestate: {
    title: "الخدمات العقارية",
    icon: <Home className="text-gold" size={32} />,
    intro: "حلول عقارية متكاملة تشمل التوثيق، التقييم، والوساطة لضمان استثمارك العقاري الأمثل وتوثيق ملكيتك نظامياً.",
    subServices: [
      {
        id: "valuation",
        name: "التقييم العقاري",
        description: "تقارير تقييم معتمدة للأغراض التمويلية أو البيع والشراء.",
        features: ["مقيمون معتمدون", "دقة عالية", "سرعة الإنجاز"]
      },
      {
        id: "notary",
        name: "التوثيق والإفراغ",
        description: "إجراءات صكوك الملكية والإفراغ العقاري عبر منصة ناجز.",
        features: ["فرز الوحدات", "دمج الصكوك", "تحديث الصكوك القديمة"]
      },
      {
        id: "contracts",
        name: "عقود الإيجار الموحدة",
        description: "توثيق عقود الإيجار السكنية والتجارية لضمان حقوق الأطراف.",
        features: ["منصة إيجار", "حفظ حقوق المستأجر", "سندات تنفيذية"]
      }
    ]
  },
  zakat: {
    title: "الخدمات الزكوية والضريبية",
    icon: <Receipt className="text-gold" size={32} />,
    intro: "نساعد أصحاب المنشآت في الالتزام بالمتطلبات الزكوية والضريبية وتقديم الاعتراضات الفنية لتجنب التكاليف الإضافية.",
    subServices: [
      {
        id: "vat-returns",
        name: "الإقرارات الضريبية",
        description: "إعداد وتقديم إقرارات ضريبة القيمة المضافة بدقة واحترافية.",
        features: ["مراجعة الفواتير", "الالتزام بالمواعيد", "تجنب الغرامات"]
      },
      {
        id: "zakat-objection",
        name: "الاعتراض على الغرامات",
        description: "دراسة مبررات الغرامات وتقديم طلبات إلغائها أو تخفيضها.",
        features: ["تحليل الحالة", "مخاطبة الزكاة والدخل", "تمثيل فني"]
      },
      {
        id: "registration",
        name: "التسجيل الضريبي",
        description: "تسجيل المنشآت الجديدة في ضريبة القيمة المضافة والزكاة.",
        features: ["الحصول على الشهادة", "تأسيس الملف", "استشارات ضريبية"]
      }
    ]
  },
  credit: {
    title: "الخدمات الائتمانية",
    icon: <BarChart3 className="text-gold" size={32} />,
    intro: "حسن سجلك الائتماني وارفع درجة تقييمك في 'سمة' من خلال خدماتنا التحليلية والخطط التصحيحية المتخصصة.",
    subServices: [
      {
        id: "simah-correction",
        name: "تصحيح سجل سمة",
        description: "خطة عمل متكاملة لتحديث الحالة الائتمانية ومعالجة التعثرات.",
        features: ["تحديث البيانات", "معالجة التعثرات القديمة", "تقرير دوري"]
      },
      {
        id: "score-boost",
        name: "تحسين التقييم الائتماني",
        description: "استشارات لرفع 'السكور' الائتماني لزيادة فرص القبول التمويلي.",
        features: ["توزيع الالتزامات", "نصائح سلوك مالي", "خطة 90 يوم"]
      }
    ]
  },
  consulting: {
    title: "الخدمات الاستشارية",
    icon: <MessageSquare className="text-gold" size={32} />,
    intro: "استشارات مالية وائتمانية مهنية تساعدك في اتخاذ قراراتك الاستثمارية والتمويلية بناءً على تحليل دقيق.",
    subServices: [
      {
        id: "financial-planning",
        name: "التخطيط المالي الشخصي",
        description: "إدارة الدخل والمصروفات لبناء مدخرات مستدامة ومستقبل آمن.",
        features: ["هيكلة الديون", "ميزانية العائلة", "أهداف مالية"]
      },
      {
        id: "investment-adv",
        name: "الاستشارات الاستثمارية",
        description: "توجيهك نحو الفرص الاستثمارية التي تناسب ملاءتك المالية.",
        features: ["تحليل مخاطر", "تنوع المحفظة", "عقود استشارية"]
      }
    ]
  }
};

const ServiceRequestForm: React.FC<{ serviceType: string, subServiceName: string }> = ({ serviceType, subServiceName }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { direction } = useLanguage();
  const { token, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const nationalId = formData.get("nationalId") as string;
    const message = formData.get("message") as string;

    try {
      const requestDataObj = {
        type: 'service_request',
        details: message || `طلب خدمة: ${subServiceName}`,
        data: {
          firstName: name?.split(' ')[0] || '',
          lastName: name?.split(' ').slice(1).join(' ') || '',
          mobile: phone,
          nationalId,
          summary: message,
          serviceCategory: serviceType,
          subService: subServiceName,
        },
      };

      const result = await submitRequest(requestDataObj);

      // Send email notification to admin
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            requestData: {
              id: result?.id || Date.now().toString(),
              type: 'service_request',
              details: message,
              data: requestDataObj.data,
            },
            userData: {
              fullName: name,
              phone,
              national_id: nationalId,
            },
          },
        });
      } catch (emailErr) {
        console.error("Email notification error:", emailErr);
      }

      setSubmitted(true);
      window.dispatchEvent(new CustomEvent('request-submitted'));
    } catch (err: any) {
      setError(err.message || "عذراً، حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-[24px] p-8 text-center animate-in zoom-in duration-300 w-full">
        <CheckCircle2 className="text-green-600 mx-auto mb-4" size={48} />
        <h3 className="text-[18px] font-extrabold text-brand mb-2">تم استلام طلبك لـ {subServiceName}</h3>
        <p className="text-[13px] text-brand font-bold leading-relaxed">سيقوم مستشارنا في قطاع ({serviceType}) بالتواصل معك قريباً.</p>
        <Button className="mt-6 w-full" onClick={() => setSubmitted(false)}>طلب خدمة أخرى</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] border border-gold/30 p-5 shadow-sm w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
          <Send size={24} />
        </div>
        <div>
          <h3 className="text-[16px] font-extrabold text-brand">طلب {subServiceName}</h3>
          <p className="text-[11px] text-muted">بياناتك محمية ومشفرة SSL</p>
        </div>
      </div>

      {!token && (
        <div className="flex flex-col items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-[16px]">
          <div className="flex items-center gap-2 text-amber-700 text-[13px] font-bold">
            <AlertCircle size={16} />
            <span>غير مسجل الدخول</span>
          </div>
          <button
            type="button"
            onClick={() => { window.location.hash = '#/auth'; }}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-[13px] font-bold hover:bg-brand/90 transition-colors"
          >
            <LogIn size={16} />
            <span>تسجيل الدخول</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* حقول مخفية للخدمة لكي تظهر في الإيميل */}
        <input type="hidden" name="Service_Category" value={serviceType} />
        <input type="hidden" name="Sub_Service" value={subServiceName} />

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-brand block pr-1">الاسم الكامل</label>
            <input 
              name="name"
              required 
              type="text" 
              defaultValue={user?.fullName || user?.name || ''}
              readOnly={!!(user?.fullName || user?.name)}
              className={`w-full p-3 rounded-[14px] border border-gray-100 bg-gray-50 text-[13px] outline-none focus:border-gold focus:bg-white transition-all ${(user?.fullName || user?.name) ? 'bg-gray-100 text-muted cursor-not-allowed' : ''}`}
              placeholder="أدخل اسمك كما في الهوية" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-brand block pr-1">رقم الهوية</label>
            <input 
              name="nationalId"
              required 
              type="text" 
              defaultValue={user?.national_id || user?.nationalId || ''}
              readOnly={!!(user?.national_id || user?.nationalId)}
              className={`w-full p-3 rounded-[14px] border border-gray-100 bg-gray-50 text-[13px] outline-none focus:border-gold focus:bg-white transition-all ${(user?.national_id || user?.nationalId) ? 'bg-gray-100 text-muted cursor-not-allowed' : ''}`}
              placeholder="أدخل رقم الهوية الوطنية" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-brand block pr-1">رقم الجوال</label>
            <input 
              name="phone"
              required 
              type="tel" 
              defaultValue={user?.phone || user?.mobile || ''}
              readOnly={!!(user?.phone || user?.mobile)}
              className={`w-full p-3 rounded-[14px] border border-gray-100 bg-gray-50 text-[13px] font-bold tracking-wider outline-none focus:border-gold focus:bg-white transition-all ${(user?.phone || user?.mobile) ? 'bg-gray-100 text-muted cursor-not-allowed' : ''}`}
              placeholder="05xxxxxxxx" 
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-brand block pr-1">تفاصيل إضافية</label>
          <textarea 
            name="message"
            className="w-full p-3 rounded-[14px] border border-gray-100 bg-gray-50 text-[13px] outline-none focus:border-gold focus:bg-white transition-all h-24 resize-none" 
            placeholder="يرجى كتابة لمحة سريعة..."
          ></textarea>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-100">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <Button disabled={loading} type="submit" className="w-full h-12 gap-2 text-[14px] shadow-lg group">
          {loading ? "جاري الإرسال..." : "إرسال طلب الخدمة"}
          {!loading && <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />}
        </Button>
      </form>
    </div>
  );
};

export const ServiceDetailPage: React.FC<{ type: string; subType?: string }> = ({ type, subType }) => {
  const content = SERVICES_CONTENT[type];
  const [selectedSubService, setSelectedSubService] = useState<SubService | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (content) {
      if (subType) {
        const found = content.subServices.find(s => s.id === subType);
        setSelectedSubService(found || content.subServices[0]);
      } else {
        setSelectedSubService(content.subServices[0]);
      }
    }
  }, [type, subType, content]);

  const handleBackToServices = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = '#/services';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!content) return (
    <PageLayout title="خطأ">
      <div className="text-center py-10 w-full">
        <h2 className="text-brand font-bold">الخدمة المطلوبة غير موجودة</h2>
        <a href="#/services" className="text-gold underline mt-4 block">العودة لدليل الخدمات</a>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout title={content.title} backLink="#/services" backText="العودة لدليل الخدمات">
      <div className="space-y-8 w-full max-w-full">
        {/* Share Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({ title: content.title, url });
              } else {
                navigator.clipboard.writeText(url);
                alert('تم نسخ رابط الخدمة');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-brand text-[12px] font-bold hover:bg-gold/20 transition-colors"
          >
            <Share2 size={16} className="text-gold" />
            <span>مشاركة الخدمة</span>
          </button>
        </div>

        {/* Main Category Intro */}
        <div className="flex flex-col gap-4 bg-gradient-to-br from-brand/5 to-gold/5 p-5 rounded-[24px] border border-gold/10 w-full overflow-hidden">
           <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0">
             {content.icon}
           </div>
           <p className="text-[13px] leading-7 text-brand font-bold text-justify">
             {content.intro}
           </p>
        </div>

        {/* Sub-services Selector Grid */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-4">
             <div className="h-1 w-6 bg-gold rounded-full"></div>
             <h3 className="text-[15px] font-extrabold text-brand">اختر الخدمة المطلوبة:</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-2.5 w-full">
            {content.subServices.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubService(sub)}
                className={`p-4 rounded-[20px] text-right border-2 transition-all duration-300 relative overflow-hidden group w-full
                  ${selectedSubService?.id === sub.id 
                    ? 'border-gold bg-[#FFFBF2] shadow-md ring-4 ring-gold/5' 
                    : 'border-gray-50 bg-white hover:border-gold/30 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className={`text-[14px] font-extrabold transition-colors ${selectedSubService?.id === sub.id ? 'text-brand' : 'text-brand/80'}`}>
                    {sub.name}
                  </h4>
                  {selectedSubService?.id === sub.id && (
                    <BadgeCheck size={18} className="text-gold" />
                  )}
                </div>
                <p className="text-[11px] text-brand/80 font-bold line-clamp-2 leading-5">{sub.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Sub-service Content & Form */}
        {selectedSubService && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-6 w-full max-w-full overflow-hidden">
            <Card className="bg-[#F9F6FF] dark:bg-[#1a0b25] border-gold/30 shadow-xl !p-6 relative overflow-hidden w-full">
               <div className="absolute -top-4 -left-4 opacity-5 text-brand">
                  {content.icon}
               </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[17px] font-extrabold text-brand dark:text-gold">{selectedSubService.name}</h3>
                <span className="bg-brand/10 dark:bg-white/10 px-3 py-1 rounded-full text-[10px] font-black text-brand dark:text-gold border border-brand/20 uppercase tracking-widest">نبذة</span>
              </div>
              
              <p className="text-[13px] text-brand dark:text-gray-100 font-black leading-7 mb-6 opacity-100">
                {selectedSubService.description}
              </p>
              
              <div className="grid grid-cols-1 gap-2.5 w-full">
                {selectedSubService.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[12px] text-brand dark:text-white font-black bg-white dark:bg-white/5 p-2.5 rounded-xl border border-brand/10 dark:border-white/5">
                    <Zap size={14} className="text-gold shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div id="request-form" className="w-full">
               <ServiceRequestForm serviceType={content.title} subServiceName={selectedSubService.name} />
            </div>

            <div className="flex flex-col gap-4 mt-8">
               <div className="h-px bg-gold/10 w-full" />
               <Button onClick={handleBackToServices} variant="ghost" className="w-full h-12 gap-3 border-gold/30 hover:border-gold">
                  <ArrowRight size={18} />
                  <span>العودة لدليل الخدمات</span>
               </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
