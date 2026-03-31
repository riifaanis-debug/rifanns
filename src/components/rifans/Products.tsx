import React, { useState } from 'react';
import { Section, SectionHeader, Button, StripContainer } from './Shared';
import { ProductItem } from '../../types';
import { Check, Star, Zap, TrendingUp, FileText, Home, PhoneCall, FileSearch, Crown, X, ShieldCheck } from 'lucide-react';
import CheckoutModal from './CheckoutModal';

const PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    name: "استشارة هاتفية",
    price: 199,
    description: "مكالمة لمدة 20 دقيقة مع مستشار مالي متخصص للإجابة على استفساراتك وتوجيهك للخيار الصحيح.",
    features: [
      "مكالمة هاتفية لمدة 20 دقيقة",
      "تحليل مبدئي للالتزامات",
      "إجابات فورية على استفساراتك",
      "توصية بالخطوات القادمة"
    ]
  },
  {
    id: 'p4',
    name: "تحسين سمة",
    price: 299,
    description: "تحليل معمق لتقريرك الائتماني، وتحديد النقاط السلبية، مع وضع خطة عملية لرفع تقييمك الائتماني.",
    features: [
      "قراءة تفصيلية للتقرير الائتماني",
      "تحديد الالتزامات المؤثرة سلباً",
      "خطة لرفع السكور خلال 90 يوم",
      "نصائح لتفادي التعثر المستقبلي"
    ]
  },
  {
    id: 'p5',
    name: "خطاب اعتراض",
    price: 349,
    description: "صياغة قانونية محكمة لخطاب اعتراض أو شكوى موجه للبنك المركزي أو الجهات التمويلية لحفظ حقوقك.",
    features: [
      "صياغة قانونية متخصصة",
      "الاستناد للوائح البنك المركزي",
      "مراجعة المستندات الداعمة",
      "صيغة جاهزة للرفع فوراً"
    ]
  },
  {
    id: 'p2',
    name: "دراسة شاملة",
    price: 499,
    description: "تقرير تفصيلي يحلل وضعك الائتماني ويحدد فرصك للحصول على تمويل أو جدولة، مع خطة عمل واضحة.",
    features: [
      "تحليل تقرير سمة الائتماني",
      "حساب دقيق لنسب الاستقطاع",
      "بحث الحلول المتاحة لدى البنوك",
      "تقرير PDF بخطة المعالجة",
      "دعم واتساب لمدة 3 أيام"
    ],
    recommended: true
  },
  {
    id: 'p6',
    name: "استشارة عقارية",
    price: 599,
    description: "مقارنة محايدة بين عروض البنوك العقارية وحساب الدعم السكني لضمان اختيارك للعرض الأوفر.",
    features: [
      "مقارنة شاملة بين 3 جهات",
      "حساب التكلفة الفعلية والادخار",
      "شرح آلية الدعم السكني",
      "توصية بأفضل جهة تمويلية"
    ]
  },
  {
    id: 'p3',
    name: "خدمة VIP",
    price: 1499,
    description: "نتولى عنك عناء المتابعة والمخاطبات. خدمة متكاملة من الألف للياء لإنهاء إجراءاتك.",
    features: [
      "مدير حساب خاص",
      "إعداد كافة الخطابات والنماذج",
      "متابعة المعاملة نيابة عنك",
      "تحديثات يومية للحالة",
      "أولوية قصوى في المعالجة"
    ]
  }
];

const Products: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<ProductItem | null>(null);

  const getProductIcon = (id: string) => {
    switch(id) {
      case 'p1': return <PhoneCall size={24} />;
      case 'p4': return <TrendingUp size={24} />;
      case 'p5': return <FileText size={24} />;
      case 'p2': return <FileSearch size={24} />;
      case 'p6': return <Home size={24} />;
      case 'p3': return <Crown size={24} />;
      default: return <Zap size={24} />;
    }
  };

  const handleBuyNow = (product: ProductItem) => {
    setSelectedProduct(null); // Close detail modal
    setCheckoutProduct(product); // Open checkout modal
  };

  return (
    <>
      <Section id="rf-products">
        <SectionHeader 
          eyebrow="باقات الخدمات" 
          title="حلول احترافية بأسعار منافسة" 
          subtitle="اضغط على أيقونة الخدمة لمعرفة التفاصيل والاشتراك"
        />

        {/* Circular Animated Selector Strip */}
        <div className="mb-6 -mx-2">
            <StripContainer className="justify-start sm:justify-center gap-5 py-6 px-2">
                {PRODUCTS.map((product) => (
                    <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="group flex flex-col items-center gap-3 focus:outline-none min-w-[75px] transition-transform duration-300 hover:-translate-y-2"
                    >
                        <div className={`
                            w-[70px] h-[70px] rounded-full flex items-center justify-center transition-all duration-500 relative
                            bg-white text-brand border border-gold/40 shadow-md 
                            group-hover:shadow-[0_15px_35px_rgba(199,169,105,0.45)] group-hover:border-gold group-hover:scale-110 group-hover:bg-[#FFFBF2]
                            ${product.recommended ? 'ring-2 ring-gold/30 ring-offset-2' : ''}
                        `}>
                            {product.recommended && (
                                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-10">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gold border-2 border-white"></span>
                                </span>
                            )}
                            <div className="group-hover:animate-[spin_1s_ease-in-out_1] text-gold group-hover:text-brand transition-colors">
                              {getProductIcon(product.id)}
                            </div>
                        </div>
                        <span className="text-[11px] font-bold whitespace-nowrap text-brand/80 group-hover:text-brand transition-colors">
                            {product.name}
                        </span>
                    </button>
                ))}
            </StripContainer>
        </div>
      </Section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-brand/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
             onClick={() => setSelectedProduct(null)}
           />
           
           {/* Modal Content */}
           <div className="relative w-full max-w-[380px] bg-white rounded-[24px] border border-gold/50 shadow-2xl p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gold/10 text-brand flex items-center justify-center border border-gold/20">
                        {getProductIcon(selectedProduct.id)}
                    </div>
                    <div>
                        <h3 className="text-[18px] font-extrabold text-brand leading-tight">{selectedProduct.name}</h3>
                        {selectedProduct.recommended && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gold font-bold bg-gold/5 px-2 py-0.5 rounded-full mt-1 border border-gold/20">
                                <Star size={10} fill="#C7A969" strokeWidth={0} />
                                باقة موصى بها
                            </span>
                        )}
                    </div>
                 </div>
                 <button 
                    onClick={() => setSelectedProduct(null)}
                    className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 text-muted flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <X size={18} />
                 </button>
              </div>

              {/* Price */}
              <div className="bg-[#F9F6FF] rounded-xl p-4 border border-gold/10 mb-5 flex justify-between items-center">
                  <span className="text-[12px] font-bold text-muted">سعر الخدمة:</span>
                  <div className="text-left">
                      <div className="text-[24px] font-extrabold text-brand tabular-nums leading-none">{selectedProduct.price}</div>
                      <div className="text-[10px] text-muted text-left">ريال سعودي</div>
                  </div>
              </div>
              
              {/* Description */}
              <div className="mb-5">
                 <h4 className="text-[12px] font-bold text-brand mb-2">عن الخدمة:</h4>
                 <p className="text-[13px] text-muted leading-7 bg-white">{selectedProduct.description}</p>
              </div>

              {/* Features */}
              <div className="bg-gray-50 rounded-[16px] p-4 border border-gray-100 mb-6">
                <h4 className="text-[12px] font-bold text-brand mb-3">مميزات الباقة:</h4>
                <div className="space-y-2.5">
                    {selectedProduct.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-[12px] text-brand/80">
                            <Check size={14} className="text-green-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">{feat}</span>
                        </div>
                    ))}
                </div>
              </div>

              {/* Action */}
              <Button 
                onClick={() => handleBuyNow(selectedProduct)}
                className={`w-full h-12 text-[14px] shadow-lg gap-2 justify-between px-6 ${selectedProduct.recommended ? 'bg-gold-gradient text-brand' : 'bg-brand text-gold'}`}
              >
                 <span className="font-bold">شراء الباقة الآن</span>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-normal opacity-80">دفع آمن</span>
                    <ShieldCheck size={16} />
                 </div>
              </Button>
           </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutProduct && (
        <CheckoutModal 
          product={checkoutProduct} 
          onClose={() => setCheckoutProduct(null)} 
        />
      )}
    </>
  );
};

export default Products;