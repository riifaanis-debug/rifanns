import React, { useState, useEffect, useCallback } from 'react';
import { Section, SectionHeader, Card, Button } from './Shared';
import { 
  Scale, Building2, Home, Receipt, BarChart3, MessageSquare, 
  RefreshCw, ShieldCheck, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight 
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Services: React.FC = () => {
  const { t, direction } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const services = [
    { 
      id: 'judicial', 
      name: t('srv_legal'), 
      desc: t('srv_legal_desc'), 
      icon: <Scale className="text-gold" size={24} />,
      link: '#/section/judicial',
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
    },
    { 
      id: 'banking', 
      name: t('srv_banking'), 
      desc: t('srv_banking_desc'), 
      icon: <Building2 className="text-gold" size={24} />,
      link: '#/section/banking',
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
    },
    { 
      id: 'realestate', 
      name: t('srv_realestate'), 
      desc: t('srv_realestate_desc'), 
      icon: <Home className="text-gold" size={24} />,
      link: '#/section/realestate',
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
    },
    { 
      id: 'tax', 
      name: t('srv_zakat'), 
      desc: t('srv_zakat_desc'), 
      icon: <Receipt className="text-gold" size={24} />,
      link: '#/section/tax',
      image: "https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?auto=format&fit=crop&q=80&w=800"
    },
    { 
      id: 'credit', 
      name: t('srv_credit'), 
      desc: t('srv_credit_desc'), 
      icon: <BarChart3 className="text-gold" size={24} />,
      link: '#/section/credit',
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800"
    },
    { 
      id: 'consulting', 
      name: t('srv_consult'), 
      desc: t('srv_consult_desc'), 
      icon: <MessageSquare className="text-gold" size={24} />,
      link: '#/section/consulting',
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800"
    },
  ];

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % services.length);
  }, [services.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + services.length) % services.length);
  }, [services.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  return (
    <Section id="services" className="relative !px-0 !max-w-none mb-12">
      <div className="px-4 md:px-8">
        <SectionHeader 
          eyebrow={t('services_title')} 
          title={t('why_title')} 
          subtitle={t('why_subtitle')}
        />
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
            {services.map((service, i) => (
              <a
                key={service.id}
                href={service.link}
                className="min-w-full h-full relative block cursor-pointer"
                aria-label={service.name}
              >
                {/* Background Image */}
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[5000ms] ease-linear"
                  style={{ transform: activeIndex === i ? 'scale(1.1)' : 'scale(1)' }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/70 to-transparent opacity-90 transition-opacity duration-500"></div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className={`transform transition-all duration-700 ${activeIndex === i ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gold/20 backdrop-blur-md border border-gold/30 flex items-center justify-center text-gold">
                        {service.icon}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-sm tracking-tight">
                        {service.name}
                      </h3>
                    </div>
                    <p className="text-sm md:text-base text-gray-200 leading-relaxed opacity-90 max-w-[500px] mb-6">
                      {service.desc}
                    </p>
                    <Button className="gap-2 group/btn pointer-events-none">
                      <span>{t('know_more')}</span>
                      {direction === 'rtl' ? <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" /> : <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />}
                    </Button>
                  </div>
                </div>
              </a>
            ))}
          </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-gold hover:text-brand z-20"
        >
          {direction === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
        <button 
          onClick={nextSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-gold hover:text-brand z-20"
        >
          {direction === 'rtl' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>

        {/* Progress Bar Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {services.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="group relative h-1.5 transition-all duration-500 rounded-full overflow-hidden bg-white/20"
              style={{ width: activeIndex === i ? '40px' : '12px' }}
            >
              <div 
                className={`h-full bg-gold transition-all duration-[5000ms] ease-linear ${activeIndex === i && !isPaused ? 'w-full' : 'w-0'}`}
              />
            </button>
          ))}
        </div>
        </div>
      </div>
    </Section>
  );
};

export default Services;

