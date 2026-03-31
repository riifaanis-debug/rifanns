import React, { useEffect, useState, useRef } from 'react';
import { Section, SectionHeader } from './Shared';
import { PerformanceItem, StatItem } from '../../types';

const perfItems: PerformanceItem[] = [
  { label: 'بلغت نسبة رضا العملاء خلال آخر استبيان بمنصة ريفانس المالية', value: 96, displayValue: '96%' },
  { label: 'متوسط نسب تخفيض الالتزامات في الحالات المؤهلة', value: 72, displayValue: '72%' },
  { label: 'ارتفاع معدل الاستجابة لطلبات العملاء عن العام السابق', value: 28, displayValue: '28%' },
];

const statsItems: StatItem[] = [
  { value: 420, suffix: '+', label: 'دراسة حالة مالية بشكل تفصيلي' },
  { value: 310, suffix: '+', label: 'تقديم حلول فعلية لعملاء مختلفين' },
  { value: 140, suffix: '+', label: 'حالة تعثر تمت معالجتها نظامياً' },
  { value: 95, suffix: '+', label: 'تقرير مالي أعد لدعم اتخاذ القرار الصحيح' },
];

const Performance: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef}>
      <Section id="rf-performance">
        <SectionHeader title="مؤشرات أداء ريفانس المالية" align="right" />
        <div className="bg-white dark:bg-[#12031a] rounded-[20px] border border-gold/60 dark:border-white/10 shadow-lg p-4 transition-colors">
          {perfItems.map((item, idx) => (
            <div key={idx} className="bg-[#F9F8FC] dark:bg-white/5 rounded-[14px] p-3 mb-2.5 last:mb-0 transition-colors">
              <div className="flex items-start justify-between mb-2 gap-3">
                <div className="text-[22px] font-extrabold text-brand dark:text-white min-w-[60px] text-left tabular-nums">
                  {visible ? <CountUp end={item.value} suffix="%" /> : '0%'}
                </div>
                <div className="flex-1 text-[12px] text-brand dark:text-gray-300">{item.label}</div>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E5DFC8] dark:bg-white/10 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-l from-[#C7A969] to-[#B7A0D8] transition-all duration-[2000ms] ease-out"
                  style={{ width: visible ? `${item.value}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="rf-numbers" className="mt-6 mb-2">
        <SectionHeader eyebrow="ريفانس المالية في أرقام" />
        
        {/* Infinite Marquee Container */}
        <div className="relative w-full overflow-hidden" dir="ltr">
            {/* Fade Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#F5F4FA] dark:from-[#06010a] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#F5F4FA] dark:from-[#06010a] to-transparent z-10 pointer-events-none"></div>

            <div className="flex gap-4 animate-marquee py-2 px-4">
                {/* We duplicate the array 4 times to ensure enough length for smooth looping even on large screens */}
                {[...statsItems, ...statsItems, ...statsItems, ...statsItems].map((stat, idx) => (
                    <div key={idx} className="min-w-[160px] bg-white dark:bg-[#12031a] rounded-[20px] border border-gold/70 dark:border-white/10 p-4 text-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col justify-center items-center h-[110px]" dir="rtl">
                        <div className="text-[22px] font-extrabold text-brand dark:text-white mb-1 tabular-nums">
                            {visible ? <CountUp end={stat.value} suffix={stat.suffix} /> : '0'}
                        </div>
                        <div className="text-[11px] text-muted dark:text-gray-400 leading-tight px-1">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
      </Section>
    </div>
  );
};

const CountUp: React.FC<{ end: number; suffix?: string; duration?: number }> = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(percentage * end));

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <>{count}{suffix}</>;
};

export default Performance;