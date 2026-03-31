import React, { useState, useEffect } from 'react';
import { Section, SectionHeader, Card, Button } from './Shared';
import { Search, Map as MapIcon, Layers, X, MapPin, Ruler, ExternalLink, Locate, FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatAmount } from '../../lib/formatNumber';

interface PlotData {
  id: string;
  type: 'residential' | 'commercial' | 'agricultural';
  points: string; // SVG polygon points
  center: { x: number, y: number };
  data: {
    city: string;
    district: string;
    planNumber: string;
    plotNumber: string;
    area: number;
    landUse: string;
    borders: { dir: string; len: string; neighbor: string }[];
    streets: { name: string; width: string; dir: string }[];
    valuation: {
      pricePerMeter: number;
      totalValue: number;
      lastUpdate: string;
      transactionCount: number;
      trend: 'up' | 'down' | 'stable';
    };
  }
}

// Mock Data for Interactive Plots - A small neighborhood block
const INTERACTIVE_PLOTS: PlotData[] = [
  {
    id: 'plot-25',
    type: 'residential',
    points: "250 200 350 180 370 280 270 300", // Rhombus shape
    center: { x: 310, y: 240 },
    data: {
      city: "مكة المكرمة",
      district: "حي العوالي",
      planNumber: "2094",
      plotNumber: "25",
      area: 450.50,
      landUse: "سكني",
      borders: [
        { dir: "شمالاً", len: "20.00 م", neighbor: "قطعة 24" },
        { dir: "جنوباً", len: "20.00 م", neighbor: "قطعة 26" },
        { dir: "شرقاً", len: "22.50 م", neighbor: "شارع عرض 15م" },
        { dir: "غرباً", len: "22.50 م", neighbor: "قطعة 30" },
      ],
      streets: [{ name: "شارع داخلي", width: "15 متر", dir: "شرق" }],
      valuation: { pricePerMeter: 3800, totalValue: 1711900, lastUpdate: "2025-02-20", transactionCount: 12, trend: 'up' }
    }
  },
  {
    id: 'plot-26',
    type: 'commercial',
    points: "370 280 470 260 490 360 390 380",
    center: { x: 430, y: 320 },
    data: {
      city: "مكة المكرمة",
      district: "حي العوالي",
      planNumber: "2094",
      plotNumber: "26",
      area: 600.00,
      landUse: "تجاري",
      borders: [
        { dir: "شمالاً", len: "30.00 م", neighbor: "قطعة 25" },
        { dir: "جنوباً", len: "30.00 م", neighbor: "شارع تجاري" },
        { dir: "شرقاً", len: "20.00 م", neighbor: "ممر مشاة" },
        { dir: "غرباً", len: "20.00 م", neighbor: "قطعة 31" },
      ],
      streets: [{ name: "طريق الملك فهد", width: "40 متر", dir: "جنوب" }],
      valuation: { pricePerMeter: 6500, totalValue: 3900000, lastUpdate: "2025-02-18", transactionCount: 55, trend: 'up' }
    }
  },
  {
    id: 'plot-24',
    type: 'residential',
    points: "150 220 250 200 270 300 170 320",
    center: { x: 210, y: 260 },
    data: {
      city: "مكة المكرمة",
      district: "حي العوالي",
      planNumber: "2094",
      plotNumber: "24",
      area: 420.00,
      landUse: "سكني",
      borders: [
        { dir: "شمالاً", len: "21.00 م", neighbor: "قطعة 23" },
        { dir: "جنوباً", len: "21.00 م", neighbor: "قطعة 25" },
        { dir: "شرقاً", len: "20.00 م", neighbor: "شارع 15" },
        { dir: "غرباً", len: "20.00 م", neighbor: "حديقة" },
      ],
      streets: [{ name: "شارع داخلي", width: "12 متر", dir: "شرق" }],
      valuation: { pricePerMeter: 3650, totalValue: 1533000, lastUpdate: "2025-02-15", transactionCount: 8, trend: 'stable' }
    }
  },
  {
    id: 'plot-27',
    type: 'residential',
    points: "470 260 570 240 590 340 490 360",
    center: { x: 530, y: 300 },
    data: {
      city: "مكة المكرمة",
      district: "حي العوالي",
      planNumber: "2094",
      plotNumber: "27",
      area: 500.00,
      landUse: "سكني",
      borders: [
        { dir: "شمالاً", len: "25.00 م", neighbor: "قطعة 26" },
        { dir: "جنوباً", len: "25.00 م", neighbor: "شارع" },
        { dir: "شرقاً", len: "20.00 م", neighbor: "جار" },
        { dir: "غرباً", len: "20.00 م", neighbor: "جار" },
      ],
      streets: [{ name: "شارع 20", width: "20 متر", dir: "جنوب" }],
      valuation: { pricePerMeter: 3900, totalValue: 1950000, lastUpdate: "2025-02-21", transactionCount: 15, trend: 'down' }
    }
  },
  {
    id: 'plot-28',
    type: 'residential',
    points: "570 240 670 220 690 320 590 340",
    center: { x: 630, y: 280 },
    data: {
      city: "مكة المكرمة",
      district: "حي العوالي",
      planNumber: "2094",
      plotNumber: "28",
      area: 480.00,
      landUse: "سكني",
      borders: [
        { dir: "شمالاً", len: "24.00 م", neighbor: "قطعة 27" },
        { dir: "جنوباً", len: "24.00 م", neighbor: "شارع" },
        { dir: "شرقاً", len: "20.00 م", neighbor: "جار" },
        { dir: "غرباً", len: "20.00 م", neighbor: "جار" },
      ],
      streets: [{ name: "شارع 15", width: "15 متر", dir: "جنوب" }],
      valuation: { pricePerMeter: 3750, totalValue: 1800000, lastUpdate: "2025-02-22", transactionCount: 10, trend: 'stable' }
    }
  },
  {
    id: 'plot-30',
    type: 'agricultural',
    points: "100 400 300 380 320 550 120 570",
    center: { x: 210, y: 475 },
    data: {
      city: "مكة المكرمة",
      district: "حي العوالي",
      planNumber: "2094",
      plotNumber: "30",
      area: 2500.00,
      landUse: "زراعي",
      borders: [
        { dir: "شمالاً", len: "50.00 م", neighbor: "مخطط مجاور" },
        { dir: "جنوباً", len: "50.00 م", neighbor: "طريق عام" },
        { dir: "شرقاً", len: "50.00 م", neighbor: "مزرعة" },
        { dir: "غرباً", len: "50.00 م", neighbor: "مزرعة" },
      ],
      streets: [{ name: "طريق زراعي", width: "10 متر", dir: "جنوب" }],
      valuation: { pricePerMeter: 850, totalValue: 2125000, lastUpdate: "2025-02-10", transactionCount: 2, trend: 'stable' }
    }
  }
];

const RealEstateMap: React.FC = () => {
  const [searchValues, setSearchValues] = useState({ city: 'مكة', plan: '', plot: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [result, setResult] = useState<PlotData['data'] | null>(null);
  const [isGeneratingFile, setIsGeneratingFile] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Simulate map loading effect
  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValues.plan || !searchValues.plot) return;

    setIsLoading(true);
    setResult(null);
    setSelectedPlotId(null);
    setSearchError(false);

    // Simulate API Search
    setTimeout(() => {
      const foundPlot = INTERACTIVE_PLOTS.find(
        p => p.data.planNumber === searchValues.plan && p.data.plotNumber === searchValues.plot
      );

      if (foundPlot) {
        setSelectedPlotId(foundPlot.id);
        setResult(foundPlot.data);
      } else {
        setSearchError(true);
      }
      setIsLoading(false);
    }, 1500);
  };

  const handlePlotClick = (plot: PlotData) => {
    setSelectedPlotId(plot.id);
    setIsLoading(true);
    setSearchError(false);
    
    // Simulate fetching details
    setTimeout(() => {
        setResult(plot.data);
        // Auto fill search inputs to reflect clicked plot
        setSearchValues(prev => ({
            ...prev, 
            plan: plot.data.planNumber,
            plot: plot.data.plotNumber
        }));
        setIsLoading(false);
    }, 400);
  };

  const handleGenerateReport = () => {
    if (!result) return;
    setIsGeneratingFile(true);
    
    // Simulate a more complex generation process
    setTimeout(() => {
      setIsGeneratingFile(false);
      
      const reportTitle = `تقرير عقاري تفصيلي - مخطط ${result.planNumber} قطعة ${result.plotNumber}`;
      const timestamp = new Date().toLocaleString('ar-SA');
      
      const content = `
================================================
      المملكة العربية السعودية
      شركة ريفانس للخدمات المالية العقارية
================================================

${reportTitle}
تاريخ الإصدار: ${timestamp}

------------------------------------------------
[1] بيانات الموقع الجغرافي
------------------------------------------------
المدينة: ${result.city}
الحي: ${result.district}
رقم المخطط: ${result.planNumber}
رقم القطعة: ${result.plotNumber}

------------------------------------------------
[2] المواصفات الفنية للمساحة
------------------------------------------------
المساحة الإجمالية: ${result.area} متر مربع
نوع الاستخدام: ${result.landUse}

الحدود والأطوال:
${result.borders.map(b => `- ${b.dir}: ${b.neighbor} بطول ${b.len}`).join('\n')}

الشوارع المحيطة:
${result.streets.map(s => `- ${s.name} (عرض ${s.width}) جهة ${s.dir}`).join('\n')}

------------------------------------------------
[3] التقييم العقاري والمؤشرات
------------------------------------------------
سعر المتر التقديري: ${formatAmount(result.valuation.pricePerMeter)} ريال
إجمالي القيمة السوقية: ${formatAmount(result.valuation.totalValue)} ريال
حالة السوق في المنطقة: ${result.valuation.trend === 'up' ? 'نشط (ارتفاع)' : result.valuation.trend === 'down' ? 'هادئ (انخفاض)' : 'مستقر'}
عدد الصفقات المماثلة: ${result.valuation.transactionCount} صفقة

------------------------------------------------
[4] ملاحظات هامة
------------------------------------------------
* هذا التقرير تم إنشاؤه آلياً بناءً على البيانات المتاحة في منصة ريفانس.
* الأسعار المذكورة هي تقديرية وتخضع لمتغيرات السوق وقت التنفيذ.
* يوصى بالتحقق من الصك الشرعي والبيانات الرسمية قبل أي إجراء تعاقدي.

------------------------------------------------
تم استخراج هذا الملف من منصة ريفانس العقارية
www.rifans.net
------------------------------------------------
      `;
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rifans_RealEstate_Report_${result.plotNumber}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    }, 2000);
  };

  // Helper to get plot colors
  const getPlotStyles = (type: string, isSelected: boolean) => {
    const baseOpacity = isSelected ? 0.9 : 0.45;
    
    let fill = '';
    let stroke = '';

    switch (type) {
      case 'residential': 
        fill = `rgba(59, 130, 246, ${baseOpacity})`; // Blue
        stroke = isSelected ? '#1E40AF' : '#60A5FA';
        break;
      case 'commercial': 
        fill = `rgba(239, 68, 68, ${baseOpacity})`; // Red
        stroke = isSelected ? '#991B1B' : '#F87171';
        break;
      default: 
        fill = `rgba(34, 197, 94, ${baseOpacity})`; // Green
        stroke = isSelected ? '#166534' : '#4ADE80';
    }
    
    if (isSelected) {
        fill = 'rgba(199, 169, 105, 0.9)'; // Gold for selection
        stroke = '#22042C'; // Brand Dark
    }

    return { fill, stroke, strokeWidth: isSelected ? 3 : 1.5 };
  };

  return (
    <Section id="rf-realestate-map">
      <SectionHeader 
        eyebrow="خدمات عقارية" 
        title="الخريطة العقارية التفاعلية" 
        subtitle="ابحث برقم المخطط والقطعة لاستعراض البيانات، الحدود، والتقييم الفوري."
      />

      <div className="relative w-full h-[500px] rounded-[2.5rem] overflow-hidden border border-gold/30 shadow-2xl bg-[#0a0a0a] group select-none ring-8 ring-black/5">
        
        {/* Map Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000" 
            alt="Map Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity scale-110 group-hover:scale-100 transition-transform duration-[10s] ease-linear"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
        </div>

        {/* Interactive SVG Layer */}
        <svg 
          className="absolute inset-0 w-full h-full z-10" 
          viewBox="0 0 800 600" 
          preserveAspectRatio="xMidYMid slice"
        >
          {INTERACTIVE_PLOTS.map((plot) => {
            const styles = getPlotStyles(plot.type, selectedPlotId === plot.id);
            return (
              <g 
                key={plot.id} 
                className="cursor-pointer group/plot"
                onClick={() => handlePlotClick(plot)}
              >
                <motion.polygon 
                  initial={false}
                  animate={{
                    fill: styles.fill,
                    stroke: styles.stroke,
                    strokeWidth: styles.strokeWidth,
                    scale: selectedPlotId === plot.id ? 1.02 : 1
                  }}
                  points={plot.points}
                  className="transition-colors duration-300"
                />
                <text 
                  x={plot.center.x} 
                  y={plot.center.y} 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className={`text-[12px] font-black pointer-events-none transition-all duration-300 ${selectedPlotId === plot.id ? 'fill-white scale-125' : 'fill-white/80'}`}
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                >
                  {plot.data.plotNumber}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Loading Overlay */}
        {!mapLoaded && (
           <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-50">
             <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted">جاري التحميل...</span>
             </div>
           </div>
        )}

        {/* Map Controls (Floating) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
           <button className="w-9 h-9 bg-white rounded-lg shadow-lg border border-gray-100 flex items-center justify-center text-brand hover:bg-gray-50 active:scale-95 transition-all" title="طبقات الخريطة">
             <Layers size={18} />
           </button>
           <button className="w-9 h-9 bg-white rounded-lg shadow-lg border border-gray-100 flex items-center justify-center text-brand hover:bg-gray-50 active:scale-95 transition-all" title="تحديد موقعي">
             <Locate size={18} />
           </button>
        </div>

        {/* Search Panel (Floating Top-Left) */}
        <div className={`absolute top-4 left-4 right-14 md:right-auto md:w-80 z-30 transition-all duration-500 ease-in-out ${result ? 'opacity-0 pointer-events-none translate-y-[-20px]' : 'opacity-100 translate-y-0'}`}>
           <Card className="!p-0 overflow-hidden shadow-2xl backdrop-blur-xl bg-white/95 border-0 ring-1 ring-black/5">
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                <button className="flex-1 py-3 text-xs font-bold text-brand border-b-2 border-brand bg-white">بحث بالمخطط</button>
                <button className="flex-1 py-3 text-xs font-bold text-muted hover:bg-gray-50 transition-colors">بحث بالصك</button>
              </div>

              {/* Form */}
              <form onSubmit={handleSearch} className="p-4 space-y-3">
                 <div>
                   <label className="text-xs font-bold text-brand block mb-1.5">المدينة</label>
                   <select 
                     className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs outline-none focus:border-gold bg-gray-50 focus:bg-white transition-colors"
                     value={searchValues.city}
                     onChange={(e) => setSearchValues({...searchValues, city: e.target.value})}
                   >
                     <option value="">اختر المدينة...</option>
                     <option value="مكة">مكة المكرمة</option>
                     <option value="الرياض">الرياض</option>
                     <option value="جدة">جدة</option>
                   </select>
                 </div>
                 
                 <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-brand block mb-1.5">رقم المخطط</label>
                      <input 
                        type="text" 
                        placeholder="2094"
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs outline-none focus:border-gold font-mono text-center bg-gray-50 focus:bg-white transition-colors"
                        value={searchValues.plan}
                        onChange={(e) => setSearchValues({...searchValues, plan: e.target.value})}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-brand block mb-1.5">رقم القطعة</label>
                      <input 
                        type="text" 
                        placeholder="25"
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs outline-none focus:border-gold font-mono text-center bg-gray-50 focus:bg-white transition-colors"
                        value={searchValues.plot}
                        onChange={(e) => setSearchValues({...searchValues, plot: e.target.value})}
                      />
                    </div>
                 </div>

                 <Button type="submit" disabled={isLoading} className="w-full h-10 mt-2 shadow-md gap-2 text-xs">
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Search size={14} />
                        <span>بحث واستعلام</span>
                      </>
                    )}
                 </Button>

                 {searchError && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 text-red-600 rounded-lg text-xs mt-2 animate-in fade-in slide-in-from-top-1 border border-red-100">
                        <AlertCircle size={12} />
                        <span>عذراً، لم يتم العثور على نتائج. جرب (مخطط 2094 قطعة 25)</span>
                    </div>
                 )}
              </form>
           </Card>
        </div>

        {/* Result Bottom Sheet (Slide Up) */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 z-40"
            >
              <div className="bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-gold/20 overflow-hidden max-h-[85vh] flex flex-col">
                  
                  {/* Drag Handle / Close */}
                  <div className="bg-orange-50/50 p-5 flex justify-between items-center border-b border-gold/10 shrink-0 cursor-pointer" onClick={() => { setResult(null); setSelectedPlotId(null); }}>
                      <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-gold/20 flex items-center justify-center text-gold shadow-sm rotate-3 group-hover:rotate-0 transition-transform">
                             <FileText size={28} />
                          </div>
                          <div>
                              <h3 className="text-lg font-black text-brand leading-tight">ملف الأرض التفصيلي</h3>
                              <p className="text-xs text-muted flex items-center gap-1.5 mt-1 font-bold">
                                  <MapPin size={14} className="text-gold" />
                                  {result.city} • {result.district} • مخطط {result.planNumber}
                              </p>
                          </div>
                      </div>
                      <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 text-muted hover:text-red-500 transition-all active:scale-90">
                          <X size={24} />
                      </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="overflow-y-auto p-6 pb-12 custom-scrollbar bg-white">
                       {/* Key Stats Grid */}
                       <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                            <span className="text-[10px] uppercase tracking-wider text-muted block mb-1.5 font-black">رقم القطعة</span>
                            <span className="text-xl font-black text-brand">{result.plotNumber}</span>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                            <span className="text-[10px] uppercase tracking-wider text-muted block mb-1.5 font-black">رقم المخطط</span>
                            <span className="text-xl font-black text-brand">{result.planNumber}</span>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                            <span className="text-[10px] uppercase tracking-wider text-muted block mb-1.5 font-black">المساحة</span>
                            <span className="text-xl font-black text-brand dir-ltr">{result.area} <span className="text-xs font-bold">م²</span></span>
                          </div>
                       </div>

                       {/* Borders & Streets */}
                       <div className="mb-8">
                         <div className="flex items-center justify-between mb-4">
                           <h4 className="text-base font-black text-brand flex items-center gap-2">
                             <Ruler size={20} className="text-gold" />
                             الحدود والأطوال الهندسية
                           </h4>
                           <span className="text-[10px] font-black text-muted bg-gray-100 px-3 py-1 rounded-full border border-gray-200">بيانات معتمدة</span>
                         </div>
                         <div className="border border-gray-100 rounded-2xl overflow-hidden text-sm shadow-sm">
                           {result.borders.map((b, i) => (
                             <div key={i} className="flex border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                               <div className="w-24 bg-gray-50/50 p-4 font-black text-muted border-l border-gray-100 flex items-center justify-center text-xs">{b.dir}</div>
                               <div className="flex-1 p-4 text-brand font-bold flex justify-between items-center">
                                  <span>{b.neighbor}</span>
                                  <span className="bg-gold/10 px-2.5 py-1 rounded-lg text-gold border border-gold/20 font-mono text-xs font-black">{b.len}</span>
                                </div>
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* Valuation Box */}
                       <div className="relative rounded-[2rem] overflow-hidden mb-8 p-8 text-white shadow-2xl group">
                         <div className="absolute inset-0 bg-gradient-to-br from-brand via-[#3B0E49] to-brand transition-transform duration-1000 group-hover:scale-110"></div>
                         <div className="absolute -top-10 -right-10 w-48 h-48 bg-gold/10 rounded-full blur-3xl"></div>
                         <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-brand-light/20 rounded-full blur-3xl"></div>
                         
                         <div className="relative z-10">
                           <div className="flex justify-between items-start mb-6">
                             <div>
                                <div className="text-[10px] font-black opacity-70 mb-2 uppercase tracking-[0.2em]">القيمة السوقية التقديرية</div>
                                <div className="text-4xl font-black tracking-tight tabular-nums flex items-baseline gap-3">
                                  {formatAmount(result.valuation.totalValue)} 
                                  <span className="text-base font-medium opacity-80">ريال سعودي</span>
                                </div>
                             </div>
                             <div className={`px-4 py-2 rounded-full text-[11px] font-black flex items-center gap-2 backdrop-blur-md border ${
                               result.valuation.trend === 'up' ? 'bg-green-500/20 border-green-400/30 text-green-300' : 
                               result.valuation.trend === 'down' ? 'bg-red-500/20 border-red-400/30 text-red-300' : 
                               'bg-blue-500/20 border-blue-400/30 text-blue-300'
                             }`}>
                                {result.valuation.trend === 'up' ? 'اتجاه صاعد' : result.valuation.trend === 'down' ? 'اتجاه هابط' : 'سوق مستقر'}
                                <div className={`w-2 h-2 rounded-full animate-pulse ${
                                  result.valuation.trend === 'up' ? 'bg-green-400' : 
                                  result.valuation.trend === 'down' ? 'bg-red-400' : 
                                  'bg-blue-400'
                                }`}></div>
                             </div>
                           </div>
                           
                           <div className="h-px bg-white/10 my-6"></div>
                           
                           <div className="grid grid-cols-2 gap-6 text-sm">
                             <div className="flex flex-col gap-1.5">
                               <span className="opacity-60 font-bold text-[10px] uppercase tracking-wider">سعر المتر المربع</span>
                               <span className="font-black text-2xl">{formatAmount(result.valuation.pricePerMeter)} <span className="text-xs font-normal">ريال</span></span>
                             </div>
                             <div className="flex flex-col gap-1.5 text-left">
                               <span className="opacity-60 font-bold text-[10px] uppercase tracking-wider">آخر تحديث للبيانات</span>
                               <span className="font-black text-lg">{new Date(result.valuation.lastUpdate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Action Buttons */}
                       <div className="flex gap-4">
                          <Button 
                              onClick={handleGenerateReport} 
                              disabled={isGeneratingFile}
                              className={`flex-1 h-14 text-base font-black gap-3 shadow-xl transition-all active:scale-95 ${isGeneratingFile ? 'bg-gray-100 text-muted border-gray-200' : 'bg-gold-gradient text-brand'}`}
                          >
                              {isGeneratingFile ? (
                              <>
                                  <Loader2 size={20} className="animate-spin" />
                                  <span>جاري إنشاء التقرير...</span>
                              </>
                              ) : (
                              <>
                                  <Download size={20} />
                                  <span>تحميل التقرير العقاري (PDF)</span>
                              </>
                              )}
                          </Button>
                          
                          <button 
                            onClick={() => window.print()}
                            className="h-14 w-14 flex items-center justify-center rounded-2xl border border-gray-200 text-muted hover:text-brand hover:bg-gray-50 transition-all bg-white shadow-lg active:scale-90"
                            title="طباعة"
                          >
                              <FileText size={24} />
                          </button>
                       </div>
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Legend (Bottom Left) */}
        <div className={`absolute bottom-6 left-6 z-20 transition-all duration-500 ${result ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
           <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 text-[10px] font-black text-brand border border-white/50 ring-1 ring-black/5">
             <div className="flex flex-col gap-2.5">
               <div className="flex items-center gap-3">
                 <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                 <span className="uppercase tracking-wider">نطاق تجاري</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                 <span className="uppercase tracking-wider">نطاق سكني</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                 <span className="uppercase tracking-wider">نطاق زراعي</span>
               </div>
             </div>
           </div>
        </div>

      </div>
    </Section>
  );
};

export default RealEstateMap;