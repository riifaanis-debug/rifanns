import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, ArrowRight, CheckCircle, AlertCircle, Lock, Calendar, Hash, ShieldCheck } from 'lucide-react';
import { Button } from './Shared';
import Footer from './Footer';
import { useAuth } from '../../contexts/AuthContext';
import { safeStringify, safeParse } from '../../utils/safeJson';

interface WaiveRequestFormProps {
  onClose: () => void;
  prefill?: any;
}

const REGION_CITIES: Record<string, string[]> = {
  "الرياض": ["الرياض","الدرعية","الخرج","الدوادمي","المجمعة","القويعية","وادي الدواسر","الزلفي","شقراء","حوطة بني تميم","الأفلاج","السليل","ضرما","المزاحمية"],
  "مكة المكرمة": ["مكة المكرمة","جدة","الطائف","رابغ","خليص","الليث","القنفذة","العرضيات","الكامل"],
  "المدينة": ["المدينة المنورة","ينبع","العلا","بدر","الحناكية","خيبر"],
  "القصيم": ["بريدة","عنيزة","الرس","البكيرية","البدائع","المذنب","عيون الجواء","رياض الخبراء"],
  "الشرقية": ["الدمام","الخبر","الظهران","القطيف","الأحساء","الجبيل","الخفجي","حفر الباطن","بقيق","رأس تنورة"],
  "عسير": ["أبها","خميس مشيط","بيشة","محايل عسير","النماص","رجال ألمع"],
  "تبوك": ["تبوك","الوجه","ضباء","تيماء","أملج","حقل"],
  "حائل": ["حائل","بقعاء","الغزالة","الشنان"],
  "الحدود الشمالية": ["عرعر","رفحاء","طريف","العويقلية"],
  "جازان": ["جيزان","صبيا","أبو عريش","صامطة","بيش","الدرب"],
  "نجران": ["نجران","شرورة","حبونا","بدر الجنوب"],
  "الباحة": ["الباحة","بلجرشي","المندق","المخواة"],
  "الجوف": ["سكاكا","القريات","دومة الجندل","طبرجل"]
};

const BANKS = [
  "البنك الأهلي السعودي (SNB)", "مصرف الراجحي", "بنك الرياض", 
  "البنك السعودي البريطاني (ساب)", "البنك السعودي الفرنسي", "بنك البلاد", 
  "بنك الجزيرة", "بنك الإنماء", "بنك الخليج الدولي - السعودية", "جهة تمويلية أخرى"
];

const WaiveRequestForm: React.FC<WaiveRequestFormProps> = ({ onClose, prefill }) => {
  const { user, token } = useAuth();
  const [requestId, setRequestId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [region, setRegion] = useState(prefill?.region || '');
  const [products, setProducts] = useState([{ id: 1, type: '', amount: '', accountNumber: '' }]);
  const [documents, setDocuments] = useState<any[]>(prefill?.documents?.length > 0 
    ? prefill.documents.map((d: any) => ({ 
        ...d, 
        id: d.id || Date.now() + Math.random(),
        file: null 
      })) 
    : [{ id: 1, type: '', file: null, fileName: '', date: new Date().toLocaleDateString('ar-SA') }]
  );
  const [totalAmount, setTotalAmount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedToAuth, setAgreedToAuth] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    firstName: prefill?.fullName?.split(' ')[0] || '',
    middleName: prefill?.fullName?.split(' ')[1] || '',
    lastName: prefill?.fullName?.split(' ').slice(2).join(' ') || '',
    age: prefill?.age || '',
    nationalId: prefill?.national_id || prefill?.nationalId || '',
    mobile: prefill?.phone || prefill?.mobile || '',
    jobStatus: prefill?.jobStatus || '',
    city: prefill?.city || '',
    bank: prefill?.bank || '',
    summary: prefill?.summary || '',
  });

  useEffect(() => {
    if (!prefill && user?.id) {
      const savedProfile = localStorage.getItem(`profile_${user.id}`);
      if (savedProfile && savedProfile !== 'undefined') {
        const data = safeParse(savedProfile, null as any);
        if (data) {
          setRegion(data.region || '');
          setFormData({
            firstName: data.firstName || data.fullName?.split(' ')[0] || '',
            middleName: data.middleName || data.fullName?.split(' ')[1] || '',
            lastName: data.lastName || data.fullName?.split(' ').slice(2).join(' ') || '',
            age: data.age || '',
            nationalId: data.nationalId || data.national_id || user.national_id || '',
            mobile: data.mobile || data.phone || user.phone || '',
            jobStatus: data.jobStatus || '',
            city: data.city || '',
            bank: data.bank || '',
            summary: data.summary || '',
          });
        }
      } else {
        setFormData(prev => ({
          ...prev,
          nationalId: user.national_id || '',
          mobile: user.phone || ''
        }));
      }
    } else if (prefill) {
      setRegion(prefill.region || '');
      setFormData({
        firstName: prefill.firstName || prefill.fullName?.split(' ')[0] || '',
        middleName: prefill.middleName || prefill.fullName?.split(' ')[1] || '',
        lastName: prefill.lastName || prefill.fullName?.split(' ').slice(2).join(' ') || '',
        age: prefill.age || '',
        nationalId: prefill.nationalId || prefill.national_id || '',
        mobile: prefill.mobile || prefill.phone || '',
        jobStatus: prefill.jobStatus || '',
        city: prefill.city || '',
        bank: prefill.bank || '',
        summary: prefill.summary || '',
      });
    }
  }, [prefill, user]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (!prefill && user?.id) {
      const savedProfile = localStorage.getItem(`profile_${user.id}`);
      if (savedProfile && savedProfile !== 'undefined') {
        const data = safeParse(savedProfile, null as any);
        if (data && data.fileNumber) {
          setRequestId(data.fileNumber);
          return;
        }
      }
    }
    
    const now = new Date();
    const dd = String(now.getDate()).padStart(2,'0');
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const yy = String(now.getFullYear()).slice(-2);
    const rand = Math.floor(100 + Math.random()*900);
    setRequestId(`RF-${dd}${mm}${yy}-${rand}`);
  }, [prefill, user]);

  useEffect(() => {
    const total = products.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    setTotalAmount(total);
  }, [products]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#003399';
    }

    const resizeCanvas = () => {
       const parent = canvas.parentElement;
       if(parent) {
         canvas.width = parent.clientWidth;
         canvas.height = 130;
         if (ctx) {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#003399';
         }
       }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.firstName || !formData.middleName || !formData.lastName) {
      alert('يرجى إدخال الاسم الثلاثي كاملاً.');
      return;
    }
    if (!formData.nationalId || !/^[0-9]{10}$/.test(formData.nationalId)) {
      alert('يرجى إدخال رقم هوية صحيح مكون من 10 أرقام.');
      return;
    }
    if (!formData.mobile || !/^05[0-9]{8}$/.test(formData.mobile)) {
      alert('يرجى إدخال رقم جوال صحيح مكون من 10 أرقام ويبدأ بـ 05.');
      return;
    }
    if (!region || !formData.city || !formData.bank) {
      alert('يرجى إكمال بيانات المنطقة والمدينة والجهة المالية.');
      return;
    }
    
    const invalidProduct = products.find(p => !p.type || !p.amount);
    if (invalidProduct) {
      alert('يرجى إكمال بيانات المنتجات التمويلية.');
      return;
    }
    if (!agreedToAuth || !agreedToTerms) {
      alert('يجب الموافقة على التفويض والشروط والأحكام.');
      return;
    }
    if (!hasSignature) {
      alert('يرجى التوقيع قبل الإرسال.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('جاري إرسال الطلب...');
    
    try {
      const formDataToSend = new FormData();
      const type = prefill?.requestType === 'rescheduling_request' ? 'rescheduling_request' : (prefill?.serviceType === 'جدولة المديونيات' ? 'scheduling_request' : 'waive_request');
      
      formDataToSend.append("access_key", "0932dd66-854a-41aa-8b0e-c372589bd60a");
      formDataToSend.append("subject", `طلب جديد: ${requestId}`);
      formDataToSend.append("from_name", `${formData.firstName} ${formData.lastName}`);
      formDataToSend.append('type', type);
      formDataToSend.append('requestId', requestId);
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('middleName', formData.middleName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('nationalId', formData.nationalId);
      formDataToSend.append('mobile', formData.mobile);
      formDataToSend.append('jobStatus', formData.jobStatus);
      formDataToSend.append('region', region);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('bank', formData.bank);
      formDataToSend.append('totalAmount', totalAmount.toString());
      formDataToSend.append('summary', formData.summary);
      
      const signatureData = canvasRef.current?.toDataURL();
      if (signatureData) formDataToSend.append('signature', signatureData);
      formDataToSend.append('products', safeStringify(products));

      documents.forEach((doc) => {
        if (doc.file) {
          formDataToSend.append('attachment', doc.file);
          formDataToSend.append('files', doc.file);
        }
      });

      const response = await fetch("/api/requests", {
        method: "POST",
        body: formDataToSend
      });

      if (response.ok) {
        setIsSuccess(true);
        window.dispatchEvent(new CustomEvent('request-submitted'));
      } else {
        throw new Error("فشل إرسال الطلب.");
      }
    } catch (error: any) {
      alert(error.message || "حدث خطأ أثناء الإرسال.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addProduct = () => setProducts([...products, { id: Date.now(), type: '', amount: '', accountNumber: '' }]);
  const removeProduct = (id: number) => setProducts(products.filter(p => p.id !== id));
  const updateProduct = (id: number, field: 'type' | 'amount' | 'accountNumber', value: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addDocument = () => setDocuments([...documents, { 
    id: Date.now(), 
    type: '', 
    file: null,
    fileName: '', 
    date: new Date().toLocaleDateString('ar-SA') 
  }]);
  const removeDocument = (id: number) => setDocuments(documents.filter(d => d.id !== id));
  const updateDocumentFile = (id: number, file: File | null) => {
    setDocuments(documents.map(d => d.id === id ? { 
      ...d, 
      file, 
      fileName: file ? file.name : '',
      date: new Date().toLocaleDateString('ar-SA')
    } : d));
  };
  const updateDocumentType = (id: number, type: string) => {
    setDocuments(documents.map(d => d.id === id ? { ...d, type } : d));
  };

  const onlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete') {
      e.preventDefault();
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#F5F4FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] border border-gold shadow-2xl p-8 max-w-md w-full text-center">
           <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={40} />
           </div>
           <h2 className="text-[22px] font-extrabold text-brand mb-2">تم استلام طلبك بنجاح</h2>
           <p className="text-[13px] text-muted mb-6 leading-relaxed">
             شكراً لك. تم تسجيل طلبك برقم 
             <span className="font-bold text-brand block mt-1 text-[16px]">{requestId}</span>
           </p>
           <Button onClick={onClose} className="w-full">العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2147483647] overflow-y-auto overflow-x-hidden" style={{ 
      fontFamily: "'Tajawal', sans-serif",
      background: "linear-gradient(180deg,#F9F8FC 0%, #F2F0F8 100%)"
    }}>
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gold/30 h-[60px] flex items-center justify-between px-4 z-[50]">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-brand">
          <ArrowRight size={20} />
        </button>
        <span className="text-[18px] font-extrabold text-brand">نموذج الطلب</span>
        <div className="w-10"></div>
      </div>

      <div className="max-w-[720px] mx-auto px-2 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-[16px] border border-gold/40 shadow-xl p-4">
          <div className="mb-4 border-b pb-3">
             <div className="flex justify-between items-center">
               <h1 className="text-[18px] font-extrabold text-brand">بيانات الطلب</h1>
               <span className="bg-[#FFFBF2] text-gold px-3 py-1 rounded-full text-[12px] font-bold border border-gold/30">{requestId}</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
             <div className="col-span-2">
               <label className="block text-[12px] font-bold text-brand mb-1">الاسم الثلاثي</label>
               <div className="grid grid-cols-3 gap-2">
                 <input type="text" placeholder="الأول" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right placeholder:text-right" />
                 <input type="text" placeholder="الأوسط" value={formData.middleName} onChange={(e) => setFormData({...formData, middleName: e.target.value})} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right placeholder:text-right" />
                 <input type="text" placeholder="العائلة" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right placeholder:text-right" />
               </div>
             </div>

             <div>
                <label className="block text-[12px] font-bold text-brand mb-1">العمر</label>
                <input type="text" inputMode="numeric" onKeyDown={onlyNumbers} value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right" />
             </div>
             <div>
                <label className="block text-[12px] font-bold text-brand mb-1">رقم الهوية</label>
                <input type="text" maxLength={10} onKeyDown={onlyNumbers} value={formData.nationalId} onChange={(e) => setFormData({...formData, nationalId: e.target.value})} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right" />
             </div>

             <div>
                <label className="block text-[12px] font-bold text-brand mb-1">رقم الجوال</label>
                <input type="text" maxLength={10} onKeyDown={onlyNumbers} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right placeholder:text-right" placeholder="05xxxxxxxx" />
             </div>
             <div>
                <label className="block text-[12px] font-bold text-brand mb-1">الحالة الوظيفية</label>
                <select value={formData.jobStatus} onChange={(e) => setFormData({...formData, jobStatus: e.target.value})} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right">
                  <option value="">اختر الحالة</option>
                  <option value="موظف حكومي">موظف حكومي</option>
                  <option value="موظف قطاع خاص">موظف قطاع خاص</option>
                  <option value="متقاعد">متقاعد</option>
                  <option value="لا يوجد عمل">لا يوجد عمل</option>
                </select>
             </div>

             <div>
                <label className="block text-[12px] font-bold text-brand mb-1">المنطقة</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right">
                  <option value="">اختر المنطقة</option>
                  {Object.keys(REGION_CITIES).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-[12px] font-bold text-brand mb-1">المدينة</label>
                <select value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} disabled={!region} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right">
                  <option value="">اختر المدينة</option>
                  {region && REGION_CITIES[region]?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>

             <div className="col-span-2">
                <label className="block text-[12px] font-bold text-brand mb-1">الجهة المالية</label>
                <select value={formData.bank} onChange={(e) => setFormData({...formData, bank: e.target.value})} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right">
                  <option value="">اختر البنك</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
             </div>
          </div>

          <div className="mt-6 mb-4 bg-[#F8F9FA] p-4 rounded-[16px] border border-gold/20">
             <h3 className="text-[14px] font-bold text-brand mb-3">المنتجات التمويلية</h3>
             <div className="space-y-3">
               {products.map((product, idx) => (
                 <div key={product.id} className="grid grid-cols-2 gap-2 items-end border-b pb-3 last:border-0">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold text-muted mb-1">نوع المنتج</label>
                      <select value={product.type} onChange={(e) => updateProduct(product.id, 'type', e.target.value)} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right">
                         <option value="">اختر النوع</option>
                         <option value="تمويل شخصي">تمويل شخصي</option>
                         <option value="تمويل عقاري">تمويل عقاري</option>
                         <option value="التمويل التأجيري">التمويل التأجيري</option>
                         <option value="بطاقة ائتمانية">بطاقة ائتمانية</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted mb-1">رقم الحساب</label>
                      <input type="text" onKeyDown={onlyNumbers} value={product.accountNumber} onChange={(e) => updateProduct(product.id, 'accountNumber', e.target.value)} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right" />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-muted mb-1">المبلغ المتبقي</label>
                        <input type="text" onKeyDown={onlyNumbers} value={product.amount} onChange={(e) => updateProduct(product.id, 'amount', e.target.value)} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right placeholder:text-right" placeholder="0.00" />
                      </div>
                      {products.length > 1 && (
                        <button type="button" onClick={() => removeProduct(product.id)} className="p-2 text-red-500"><Trash2 size={16} /></button>
                      )}
                    </div>
                 </div>
               ))}
             </div>
             <AnimatePresence>
                {products[products.length - 1].amount !== '' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex justify-center">
                    <button type="button" onClick={addProduct} className="text-[12px] text-brand bg-white border border-gold/40 px-4 py-2 rounded-full flex items-center gap-2">
                      <Plus size={14} /> هل تريد إضافة منتج آخر؟
                    </button>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="mb-4">
            <label className="block text-[12px] font-bold text-brand mb-1">ملخص الحالة</label>
            <textarea value={formData.summary} onChange={(e) => setFormData({...formData, summary: e.target.value})} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right min-h-[80px]" placeholder="اكتب نبذة مختصرة..."></textarea>
          </div>

          <div className="mb-4">
             <label className="text-[12px] font-bold text-brand mb-2 block">المرفقات</label>
             <div className="space-y-2">
                {documents.map((doc) => (
                   <div key={doc.id} className="grid grid-cols-2 gap-2 items-center">
                       <select value={doc.type} onChange={(e) => updateDocumentType(doc.id, e.target.value)} className="w-full p-2 rounded-[10px] border border-gold/70 text-[12px] text-right">
                          <option value="">نوع المرفق</option>
                          <option value="تقرير طبي">تقرير طبي</option>
                          <option value="كشف حساب">كشف حساب</option>
                          <option value="تعريف بالراتب">تعريف بالراتب</option>
                          <option value="أخرى">أخرى</option>
                       </select>
                       <div className="flex gap-2 items-center">
                         <div className="flex-1 relative border border-gold/70 rounded-[10px] p-2 bg-[#F8F9FA] text-[12px] text-right overflow-hidden">
                           <input type="file" onChange={(e) => updateDocumentFile(doc.id, e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                           <span className="truncate block">{doc.fileName || 'اختر ملفاً...'}</span>
                         </div>
                         {documents.length > 1 && (
                           <button type="button" onClick={() => removeDocument(doc.id)} className="text-red-500"><Trash2 size={14} /></button>
                         )}
                       </div>
                   </div>
                ))}
             </div>
             <AnimatePresence>
                {documents[documents.length - 1].type !== '' && documents[documents.length - 1].file !== null && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex justify-center">
                    <button type="button" onClick={addDocument} className="text-[12px] text-gold bg-white border border-gold/40 px-4 py-2 rounded-full flex items-center gap-2">
                      <Plus size={14} /> هل تريد إضافة مرفق آخر؟
                    </button>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="mb-4 bg-[#F9F9F9] p-3 rounded-[12px] space-y-2">
             <label className="flex gap-2 items-start cursor-pointer">
                <input type="checkbox" checked={agreedToAuth} onChange={(e) => setAgreedToAuth(e.target.checked)} className="mt-1 accent-gold" />
                <span className="text-[11px] text-brand">أوافق على تفويض ريفانس المالية بالاطلاع على المستندات.</span>
             </label>
             <label className="flex gap-2 items-start cursor-pointer">
                <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 accent-gold" />
                <span className="text-[11px] text-brand">أوافق على الشروط والأحكام وأتعهد بصحة البيانات.</span>
             </label>
          </div>

          <div className="mb-6">
             <div className="flex justify-between items-end mb-1">
                <label className="text-[12px] font-bold text-brand">التوقيع الإلكتروني</label>
                <button type="button" onClick={clearSignature} className="text-[10px] text-red-500">مسح</button>
             </div>
             <div className="border border-gold/70 rounded-[8px] bg-white h-[130px] touch-none">
                <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-full cursor-crosshair" />
             </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
             <button type="button" onClick={onClose} className="px-4 py-2 rounded-full border text-brand text-[12px]">إلغاء</button>
             <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-full bg-brand text-white text-[12px] font-bold disabled:opacity-50">
               {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
             </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default WaiveRequestForm;
