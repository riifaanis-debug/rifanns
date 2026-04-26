import React, { useEffect, useState } from 'react';
import { PageLayout } from './StaticPages';
import { Button } from './Shared';
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { getSection } from '../../data/sectionsCatalog';

interface SectionPageProps {
  sectionId: string;
}

export const SectionPage: React.FC<SectionPageProps> = ({ sectionId }) => {
  const section = getSection(sectionId);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!section) return;
    const t = setInterval(
      () => setActiveSlide((p) => (p + 1) % section.heroImages.length),
      4500
    );
    return () => clearInterval(t);
  }, [section]);

  if (!section) {
    return (
      <PageLayout title="القسم غير موجود">
        <div className="p-6 text-center">
          <p className="text-sm text-muted">عذراً، لم نعثر على هذا القسم.</p>
          <a href="#/" className="inline-block mt-4">
            <Button>العودة للرئيسية</Button>
          </a>
        </div>
      </PageLayout>
    );
  }

  const next = () => setActiveSlide((p) => (p + 1) % section.heroImages.length);
  const prev = () =>
    setActiveSlide(
      (p) => (p - 1 + section.heroImages.length) % section.heroImages.length
    );

  return (
    <PageLayout title={section.name}>
      <div className="px-3 pb-8" dir="rtl">
        {/* Intro */}
        <div className="mb-5 px-1">
          <p className="text-[13px] leading-[26px] text-muted dark:text-gray-300 text-right">
            {section.intro}
          </p>
        </div>

        {/* Hero slider */}
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gold/40 shadow-lg mb-6 group">
          {section.heroImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={section.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === activeSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-brand/70 via-transparent to-transparent" />
          <div className="absolute bottom-3 right-3 left-3 flex items-end justify-between">
            <h2 className="text-white text-[15px] font-extrabold drop-shadow text-right">
              {section.name}
            </h2>
            <div className="flex gap-1.5">
              {section.heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeSlide ? 'w-6 bg-gold' : 'w-2 bg-white/50'
                  }`}
                  aria-label={`slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={prev}
            className="absolute top-1/2 right-2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            aria-label="السابق"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 left-2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            aria-label="التالي"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Section title for products */}
        <div className="mb-3 text-right">
          <div className="text-[10px] font-bold text-gold mb-0.5">
            منتجات هذا القسم
          </div>
          <h3 className="text-[16px] font-extrabold text-brand dark:text-gray-100">
            اختر الخدمة المناسبة لك
          </h3>
        </div>

        {/* Products grid: 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          {section.products.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-gold/40 bg-white dark:bg-[#12031a] overflow-hidden shadow-sm flex flex-col"
            >
              <div className="aspect-square overflow-hidden bg-muted/10">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2.5 flex flex-col flex-1 text-right">
                <h4 className="text-[12px] font-extrabold text-brand dark:text-gray-100 leading-snug mb-1 line-clamp-2 min-h-[34px]">
                  {p.name}
                </h4>
                <p className="text-[10.5px] text-muted dark:text-gray-400 leading-relaxed line-clamp-3 mb-2 min-h-[44px]">
                  {p.shortDesc}
                </p>
                <a
                  href={`#/product/${p.id}`}
                  className="mt-auto inline-flex items-center justify-center gap-1 rounded-full bg-gold-gradient text-brand text-[11px] font-bold py-1.5 px-3 shadow active:scale-95 transition"
                >
                  <span>الانتقال للخدمة</span>
                  <ArrowLeft size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default SectionPage;
