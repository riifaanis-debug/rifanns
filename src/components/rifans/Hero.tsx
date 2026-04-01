import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import heroSlide4 from '../../assets/hero-slide-4.jpg';
import heroSlide5 from '../../assets/hero-slide-5.jpg';
import heroSlide6 from '../../assets/hero-slide-6.jpg';

const Hero: React.FC = () => {
  const { direction } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920",
      title: "ريفانس المالية",
      subtitle: "نبتكر الحلول المالية الذكية لمستقبل مالي مستدام",
      tag: "حلول تمويلية"
    },
    {
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1920",
      title: "تمكين مالي رقمي",
      subtitle: "نحول طموحاتك المالية إلى واقع ملموس عبر تقنياتنا المتقدمة",
      tag: "تقنية مالية"
    },
    {
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1920",
      title: "استشارات احترافية",
      subtitle: "فريق من الخبراء يقودك نحو أفضل القرارات الاستثمارية والتمويلية",
      tag: "خبرة مصرفية"
    },
    {
      image: heroSlide4,
      title: "استثمار المستقبل",
      subtitle: "نصنع فرصاً استثمارية متميزة في أبرز المدن والمشاريع الرائدة",
      tag: "فرص استثمارية"
    },
    {
      image: heroSlide5,
      title: "شراكات استراتيجية",
      subtitle: "نبني علاقات مهنية متينة قائمة على الثقة والشفافية والنتائج",
      tag: "شراكة موثوقة"
    },
    {
      image: heroSlide6,
      title: "تمويل عقاري متكامل",
      subtitle: "حلول تمويلية مرنة تحقق حلمك في امتلاك العقار المثالي",
      tag: "تمويل عقاري"
    }
  ];

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full bg-brand/5 dark:bg-brand/20 overflow-hidden">
      <div className="max-w-[520px] mx-auto">
        <div className="relative aspect-square w-full overflow-hidden group">
          {/* Slides Container */}
          <div 
            className="flex h-full w-full transition-transform duration-1000 ease-[cubic-bezier(0.4, 0, 0.2, 1)]"
            style={{ transform: `translateX(${direction === 'rtl' ? activeIndex * 100 : -activeIndex * 100}%)` }}
          >
            {slides.map((slide, i) => (
              <div key={i} className="min-w-full h-full relative overflow-hidden">
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] ease-out ${activeIndex === i ? 'scale-110' : 'scale-100'}`}
                  referrerPolicy="no-referrer"
                />
                {/* Overlay gradient - more dramatic */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/40 to-transparent opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-brand/60 to-transparent opacity-40" />
                
                {/* Content */}
                <div className={`absolute inset-0 z-10 flex flex-col justify-end p-8 md:p-12 ${direction === 'rtl' ? 'items-start text-right' : 'items-start text-left'}`}>
                  <div className={`transition-all duration-1000 transform max-w-4xl ${activeIndex === i ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 backdrop-blur-md border border-gold/30 text-gold text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                      {slide.tag}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter leading-[0.9] drop-shadow-2xl">
                      {slide.title}
                    </h1>
                    <p className="text-sm md:text-lg text-gold-light font-medium leading-relaxed drop-shadow-lg max-w-2xl opacity-90">
                      {slide.subtitle}
                    </p>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center justify-center text-white/70 hover:text-gold transition-all z-20"
          >
            {direction === 'rtl' ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
          </button>
          <button 
            onClick={nextSlide}
            className="absolute top-1/2 left-4 -translate-y-1/2 flex items-center justify-center text-white/70 hover:text-gold transition-all z-20"
          >
            {direction === 'rtl' ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
          </button>

          {/* Dots Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {slides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveIndex(i)}
                className={`transition-all duration-500 rounded-full ${activeIndex === i ? 'w-8 h-1.5 bg-gold' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
