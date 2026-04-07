import React, { useState, useEffect, useCallback } from 'react';
import { Section, Button } from './Shared';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, HeartPulse, Accessibility, AlertCircle, Calendar, PenTool, Share2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import WaiveRequestForm from './WaiveRequestForm';
import seizedAmountsImage from '@/assets/seized-amounts-service.jpeg';

const WaiveServices: React.FC = () => {
  const { t, direction } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);

  const waiveItems = [
    {
      id: 'medical_disability',
      title: "إعفاء بسبب عجز طبي",
      label: "من دراسة التقارير الطبية حتى استلام قرار الإعفاء",
      body: "نساعدك في ترتيب ملف طلب الإعفاء نتيجة عجز طبي، من خلال جمع التقارير الطبية المعتمدة، ومستندات إنهاء الخدمة، ثم رفع طلب متكامل للجهة التمويلية.",
      icon: <Accessibility className="text-gold" size={24} />,
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
      list: [
        "مراجعة التقارير الطبية المعتمدة.",
        "جمع مستندات إنهاء الخدمة.",
        "صياغة خطاب طلب الإعفاء مهنياً.",
        "متابعة الطلب مع الجهة التمويلية."
      ]
    }
  ];

  const schedulingItem = {
    id: 'debt_scheduling',
    title: "جدولة المديونيات",
    label: "إعادة تنظيم الالتزامات المالية بما يتناسب مع دخلك",
    body: "نقدم حلولاً احترافية لإعادة جدولة مديونياتك مع الجهات التمويلية، لتقليل القسط الشهري أو تمديد فترة السداد، مما يمنحك استقراراً مالياً أكبر.",
    icon: <Calendar className="text-gold" size={24} />,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800",
    list: [
      "تحليل الوضع المالي الحالي.",
      "التفاوض مع الجهات التمويلية.",
      "تخفيض قيمة القسط الشهري.",
      "تحسين السجل الائتماني."
    ]
  };

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % waiveItems.length);
  }, [waiveItems.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + waiveItems.length) % waiveItems.length);
  }, [waiveItems.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  const handleOpenForm = (item: any) => {
    setPrefillData({
      serviceType: item.title,
      description: item.body,
      requestType: item.requestType || undefined
    });
    setShowForm(true);
  };

  return (
    <>
      <Section id="waive-services" className="relative !px-0 !max-w-none mb-12">
        <div className="px-4 md:px-8 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck size={12} />
              <span>خدمات الإعفاء الإنسانية</span>
            </div>
            <button
              onClick={() => {
                const url = window.location.origin + '/#/waive-landing';
                if (navigator.share) {
                  navigator.share({ title: 'خدمات الإعفاء - ريفانز', url });
                } else {
                  navigator.clipboard.writeText(url);
                  alert('تم نسخ رابط الخدمة');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/20 text-brand text-[11px] font-bold hover:bg-gold/20 transition-colors"
            >
              <Share2 size={14} className="text-gold" />
              <span>مشاركة</span>
            </button>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-brand dark:text-white mb-2">حلول الإعفاء من المديونيات</h2>
          <p className="text-sm text-muted dark:text-gray-400 max-w-2xl">نقدم دعماً متكاملاً لطلبات الإعفاء من الالتزامات التمويلية في الحالات الإنسانية والصحية، مع تنظيم ملف الطلب ومتابعته حتى صدور القرار.</p>
        </div>

        <div className="max-w-[520px] mx-auto overflow-hidden">
          <div 
            className="relative w-full aspect-square overflow-hidden shadow-2xl group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Slides Container */}
            <div 
              className="flex h-full w-full transition-transform duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
              style={{ transform: `translateX(${direction === 'rtl' ? activeIndex * 100 : -activeIndex * 100}%)` }}
            >
              {waiveItems.map((item, i) => (
                <div key={item.id} className="min-w-full h-full relative">
                  {/* Background Image */}
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[6000ms] ease-linear"
                    style={{ transform: activeIndex === i ? 'scale(1.1)' : 'scale(1)' }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/70 to-transparent opacity-90"></div>
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end text-white">
                    <div className={`transform transition-all duration-700 ${activeIndex === i ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gold/20 backdrop-blur-md border border-gold/30 flex items-center justify-center text-gold">
                          {item.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gold/80 block mb-0.5 uppercase tracking-tighter">{item.label}</span>
                          <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-sm">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-xs md:text-sm text-gray-200 leading-relaxed opacity-90 max-w-[600px] mb-6 line-clamp-2 md:line-clamp-none">
                        {item.body}
                      </p>
  
                      <div className="hidden md:grid grid-cols-2 gap-3 mb-8 max-w-[600px]">
                        {item.list.map((point, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                            {point}
                          </div>
                        ))}
                      </div>
  
                      <Button 
                        onClick={() => handleOpenForm(item)}
                        className="group/btn w-full md:w-auto"
                      >
                        <span>تقدّم بطلب إعفاء</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            {/* Navigation Arrows */}
            {waiveItems.length > 1 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-gold hover:text-brand z-20"
                >
                  {direction === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-gold hover:text-brand z-20"
                >
                  {direction === 'rtl' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                </button>
              </>
            )}
  
            {/* Progress Bar Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {waiveItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="group relative h-1.5 transition-all duration-500 rounded-full overflow-hidden bg-white/20"
                  style={{ width: activeIndex === i ? '40px' : '12px' }}
                >
                  <div 
                    className={`h-full bg-gold transition-all duration-[6000ms] ease-linear ${activeIndex === i && !isPaused ? 'w-full' : 'w-0'}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 mt-8">
          <div className="p-4 rounded-[20px] bg-white/50 dark:bg-white/5 border border-gold/20 shadow-sm backdrop-blur-sm">
            <h4 className="text-sm font-bold text-brand dark:text-gold mb-2">لمن صُممت خدمات الإعفاء؟</h4>
            <p className="text-xs text-muted dark:text-gray-400 leading-relaxed mb-4">
              لكل عميل متعثر ماليًا بسبب عجز طبي موثق، وذلك وفقاً للأنظمة والسياسات المعمول بها لدى البنوك وشركات التمويل.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-brand/5 dark:bg-white/5 border border-brand/10 text-[10px] text-brand dark:text-gray-300">عملاء منتهي خدمتهم لعجز طبي</span>
            </div>
          </div>
        </div>
      </Section>

      <Section id="scheduling-services" className="relative !px-0 !max-w-none mb-12">
        <div className="px-4 md:px-8 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider">
              <Calendar size={12} />
              <span>خدمات الجدولة المالية</span>
            </div>
            <button
              onClick={() => {
                const url = window.location.origin + '/#/waive-landing';
                if (navigator.share) {
                  navigator.share({ title: 'خدمات الجدولة - ريفانز', url });
                } else {
                  navigator.clipboard.writeText(url);
                  alert('تم نسخ رابط الخدمة');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/20 text-brand text-[11px] font-bold hover:bg-gold/20 transition-colors"
            >
              <Share2 size={14} className="text-gold" />
              <span>مشاركة</span>
            </button>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-brand dark:text-white mb-2">جدولة المديونيات والالتزامات</h2>
          <p className="text-sm text-muted dark:text-gray-400 max-w-2xl">نساعدك في إعادة تنظيم التزاماتك المالية مع البنوك والجهات التمويلية لتخفيف العبء الشهري وتحقيق الاستقرار المالي.</p>
        </div>

        {/* Scheduling Section Full Width Banner */}
        <div className="max-w-[520px] mx-auto overflow-hidden">
          <div className="relative w-full aspect-square overflow-hidden shadow-2xl mb-8">
             <img 
               src={schedulingItem.image} 
               alt={schedulingItem.title}
               className="absolute inset-0 w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/70 to-transparent opacity-90"></div>
             <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end text-white">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-12 h-12 rounded-2xl bg-gold/20 backdrop-blur-md border border-gold/30 flex items-center justify-center text-gold">
                      <Calendar size={24} />
                   </div>
                   <div>
                      <span className="text-[10px] font-bold text-gold/80 block mb-0.5 uppercase tracking-tighter">{schedulingItem.label}</span>
                      <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-sm">
                        {schedulingItem.title}
                      </h3>
                   </div>
                </div>
                <p className="text-xs md:text-sm text-gray-200 leading-relaxed opacity-90 max-w-[600px] mb-6">
                   {schedulingItem.body}
                </p>
                <Button 
                   onClick={() => handleOpenForm(schedulingItem)}
                   className="group/btn w-full md:w-auto"
                >
                   <span>تقدّم بطلب الجدولة</span>
                </Button>
             </div>
          </div>
        </div>

        <div className="px-4 md:px-8">
          <div className="bg-white dark:bg-[#12031a] rounded-[24px] border border-gold/30 shadow-xl overflow-hidden">
             <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                      <div className="flex items-start gap-4">
                         <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0 mt-1">
                            <ShieldCheck size={18} />
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-brand dark:text-white mb-1">دراسة ائتمانية دقيقة</h4>
                            <p className="text-xs text-muted dark:text-gray-400">نقوم بتحليل وضعك المالي الحالي وتحديد أفضل خيارات الجدولة المتاحة لك.</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-4">
                         <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0 mt-1">
                            <AlertCircle size={18} />
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-brand dark:text-white mb-1">تخفيض القسط الشهري</h4>
                            <p className="text-xs text-muted dark:text-gray-400">نهدف إلى تقليل العبء المالي الشهري لضمان حياة كريمة ومستقرة.</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-4">
                         <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0 mt-1">
                            <ShieldCheck size={18} />
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-brand dark:text-white mb-1">متابعة شاملة</h4>
                            <p className="text-xs text-muted dark:text-gray-400">نتولى عملية التفاوض والمتابعة مع الجهات التمويلية حتى اعتماد الجدولة.</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
      </Section>

      <Section id="seized-amounts-services" className="relative !px-0 !max-w-none mb-12">
        <div className="px-4 md:px-8 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck size={12} />
              <span>خدمات إتاحة المبالغ المستثناه</span>
            </div>
            <button
              onClick={() => {
                const url = window.location.origin + '/#/waive-landing';
                if (navigator.share) {
                  navigator.share({ title: 'إتاحة النسبة النظامية - ريفانز', url });
                } else {
                  navigator.clipboard.writeText(url);
                  alert('تم نسخ رابط الخدمة');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/20 text-brand text-[11px] font-bold hover:bg-gold/20 transition-colors"
            >
              <Share2 size={14} className="text-gold" />
              <span>مشاركة</span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-black text-brand dark:text-white mb-2">إتاحة النسبة النظامية والمبالغ المستثناه من الحجز</h2>
            <a href="#/seized-amounts-info" className="text-xs font-bold text-gold hover:underline whitespace-nowrap">المزيد ←</a>
          </div>
          <p className="text-sm text-muted dark:text-gray-400 max-w-2xl">نساعدك في استرداد المبالغ المستثناه من الحجز وفقاً للأنظمة السعودية، وتقديم طلبات إتاحة النسبة النظامية من الراتب والمستحقات المالية.</p>
        </div>

        <div className="max-w-[520px] mx-auto overflow-hidden">
          <div className="relative w-full aspect-square overflow-hidden shadow-2xl mb-8">
            <img 
              src={seizedAmountsImage} 
              alt="إتاحة النسبة النظامية والمبالغ المستثناه من الحجز"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/70 to-transparent opacity-90"></div>
            <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/20 backdrop-blur-md border border-gold/30 flex items-center justify-center text-gold">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gold/80 block mb-0.5 uppercase tracking-tighter">استرداد حقوقك المالية المحجوزة</span>
                  <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-sm">
                    إتاحة النسبة النظامية والمبالغ المستثناه من الحجز
                  </h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-gray-200 leading-relaxed opacity-90 max-w-[600px] mb-6">
                نقدم خدمة متكاملة لمساعدتك في إتاحة المبالغ المستثناه من الحجز وفقاً للأنظمة، بما في ذلك حساب المواطن وبدل غلاء المعيشة والنسبة النظامية من الراتب.
              </p>
              <Button 
                onClick={() => handleOpenForm({
                  id: 'seized_amounts',
                  title: 'إتاحة النسبة النظامية والمبالغ المستثناه من الحجز',
                  body: 'طلب إتاحة المبالغ المستثناه من الحجز',
                  requestType: 'seized_amounts_request'
                })}
                className="group/btn w-full md:w-auto"
              >
                <span>تقدّم بطلب إتاحة</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8">
          <div className="bg-white dark:bg-[#12031a] rounded-[24px] border border-gold/30 shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0 mt-1">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand dark:text-white mb-1">النسبة المستثناة من الراتب</h4>
                    <p className="text-xs text-muted dark:text-gray-400">نساعدك في إتاحة النسبة النظامية المستثناة من الحجز على راتبك.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0 mt-1">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand dark:text-white mb-1">برامج الدعم الحكومي</h4>
                    <p className="text-xs text-muted dark:text-gray-400">إتاحة مبالغ حساب المواطن وحافز وبدل غلاء المعيشة المستثناة من الحجز.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0 mt-1">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand dark:text-white mb-1">متابعة شاملة</h4>
                    <p className="text-xs text-muted dark:text-gray-400">نتولى تقديم الطلب ومتابعته مع الجهات المعنية حتى إتاحة المبالغ.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {showForm && (
        <WaiveRequestForm 
          prefill={prefillData}
          onClose={() => {
            setShowForm(false);
            setPrefillData(null);
          }} 
        />
      )}
    </>
  );
};

export default WaiveServices;