import React from 'react';
import { PageLayout } from './StaticPages';
import { Button } from './Shared';
import { ArrowRight, Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { getProduct, INITIAL_FEE_SAR } from '../../data/sectionsCatalog';

interface ProductPageProps {
  productId: string;
}

export const ProductPage: React.FC<ProductPageProps> = ({ productId }) => {
  const found = getProduct(productId);

  if (!found) {
    return (
      <PageLayout title="الخدمة غير موجودة">
        <div className="p-6 text-center">
          <p className="text-sm text-muted">عذراً، لم نعثر على هذه الخدمة.</p>
          <a href="#/" className="inline-block mt-4">
            <Button>العودة للرئيسية</Button>
          </a>
        </div>
      </PageLayout>
    );
  }

  const { product, section } = found;
  const whatsappLink = `https://wa.me/9668002440432?text=${encodeURIComponent(
    `استفسار عن خدمة: ${product.name}`
  )}`;

  return (
    <PageLayout title={product.name} backLink={`#/section/${section.id}`} backText={`العودة لـ ${section.name}`}>
      <div className="pb-8" dir="rtl">
        {/* Hero image */}
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand/85 via-brand/30 to-transparent" />
          <div className="absolute bottom-4 right-4 left-4 text-right">
            <div className="text-[10px] font-bold text-gold mb-1">
              {section.name}
            </div>
            <h1 className="text-white text-[18px] font-extrabold leading-snug drop-shadow">
              {product.name}
            </h1>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 mt-5">
          <div className="rounded-2xl border border-gold/30 bg-white dark:bg-[#12031a] p-4 mb-4">
            <h2 className="text-[13px] font-extrabold text-brand dark:text-gold mb-2 text-right">
              تفاصيل الخدمة
            </h2>
            <p className="text-[12.5px] leading-[26px] text-muted dark:text-gray-300 text-right">
              {product.description}
            </p>
          </div>

          {/* Fee box */}
          <div className="rounded-2xl bg-gradient-to-br from-[#FFFDF5] to-[#F6ECD4] dark:from-[#1a0b25] dark:to-[#0f0216] border border-gold/60 p-4 mb-5 flex items-center justify-between">
            <div className="text-right">
              <div className="text-[10px] text-muted dark:text-gray-400 mb-0.5">
                رسوم فتح الملف
              </div>
              <div className="text-[11px] font-bold text-brand dark:text-gray-200">
                دفعة مبدئية واحدة
              </div>
            </div>
            <div className="text-left">
              <div className="text-[20px] font-extrabold text-brand dark:text-gold tabular-nums leading-none">
                {INITIAL_FEE_SAR}
              </div>
              <div className="text-[10px] text-muted dark:text-gray-400">
                ريال سعودي
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-2.5">
            <a
              href={`#/product/${product.id}/apply`}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-gold-gradient text-brand text-[13px] font-extrabold py-3 shadow-lg active:scale-95 transition"
            >
              <Send size={15} />
              <span>تقدم بطلب الخدمة</span>
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-full bg-white dark:bg-transparent border border-gold/70 text-brand dark:text-gold text-[13px] font-bold py-3 active:scale-95 transition"
            >
              <MessageCircle size={15} />
              <span>طلب استفسار عن الخدمة</span>
            </a>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-transparent border border-gold/30 text-muted dark:text-gray-400 text-[12px] font-bold py-2.5 active:scale-95 transition"
            >
              <ArrowRight size={14} />
              <span>الرجوع للصفحة السابقة</span>
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductPage;
