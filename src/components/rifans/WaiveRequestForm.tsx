import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, ArrowRight, CheckCircle, AlertCircle, Lock, Calendar, Hash, ShieldCheck, LogIn } from 'lucide-react';
import { Button } from './Shared';
import Footer from './Footer';
import { useAuth } from '../../contexts/AuthContext';
import { safeStringify, safeParse } from '../../utils/safeJson';
import { submitRequest, uploadDocument } from '../../lib/api';
import { supabase } from '@/integrations/supabase/client';
import { formatAmount } from '../../lib/formatNumber';

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
  console.log("WaiveRequestForm Rendered");
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
        file: null // Files are not persisted in prefill
      })) 
    : [{ id: 1, type: '', file: null, fileName: '', date: new Date().toLocaleDateString('ar-SA') }]
  );
  const [totalAmount, setTotalAmount] = useState(0);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedToAuth, setAgreedToAuth] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Form values for pre-filling
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
    email: prefill?.email || '',
  });

  // Auto-prefill from localStorage if logged in and no prefill prop
  useEffect(() => {
    if (!prefill && user?.id) {
      const savedProfile = localStorage.getItem(`profile_${user.id}`);
      if (savedProfile && savedProfile !== 'undefined') {
        const data = safeParse(savedProfile, null as any);
        if (data) {
          setRegion(data.region || '');
          // Do NOT load products from profile - always start with empty products
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
            email: data.email || "",
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
      // If prefill is provided (e.g. from dashboard), use it all
      setRegion(prefill.region || '');
      if (prefill.products?.length > 0) setProducts(prefill.products);
      setFormData({
        firstName: prefill.firstName || prefill.fullName?.split(' ')[0] || '',
        middleName: prefill.middleName || prefill.fullName?.split(' ')[1] || '',
        lastName: prefill.lastName || prefill.fullName?.split(' ').slice(2).join(' ') || '',
        age: prefill.age || '',
        nationalId: prefill.nationalId || prefill.national_id || '',
        mobile: prefill.mobile || prefill.phone || '',
        email: prefill.email || '',
        jobStatus: prefill.jobStatus || '',
        city: prefill.city || '',
        bank: prefill.bank || '',
        summary: prefill.summary || '',
      });
    }
  }, [prefill, user]);

  // Signature logic
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    // Generate Request ID
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
    // Calculate total
    const total = products.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    setTotalAmount(total);
  }, [products]);

  // Signature Canvas Handling
  useEffect(() => {
    const handleWindowClick = (e: MouseEvent) => {
      // Removed problematic console.log(e.target) which causes circular structure errors
    };
    window.addEventListener('click', handleWindowClick);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#003399'; // Changed to blue
    }

    const resizeCanvas = () => {
       const parent = canvas.parentElement;
       if(parent) {
         canvas.width = parent.clientWidth;
         canvas.height = 130;
         if (ctx) {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#003399'; // Changed to blue
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
    
    e.preventDefault(); // Prevent scrolling on touch
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

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
    
    // Check login
    if (!token || !user) {
      setStatusMessage('يجب تسجيل الدخول أولاً');
      return;
    }
    
    // Immediate feedback
    console.log("Submit function triggered");
    setStatusMessage('جاري التحقق من البيانات...');
    
    // Manual Validation with clear alerts
    if (!formData.firstName || !formData.middleName || !formData.lastName) {
      const msg = 'يرجى إدخال الاسم الثلاثي كاملاً (الأول، الأب، العائلة).';
      setStatusMessage(msg);
      alert(msg);
      return;
    }
    if (!formData.age) {
      const msg = 'يرجى إدخال العمر.';
      setStatusMessage(msg);
      alert(msg);
      return;
    }
    if (!formData.nationalId || !/^[0-9]{10}$/.test(formData.nationalId)) {
      const msg = 'يرجى إدخال رقم هوية صحيح مكون من 10 أرقام.';
      setStatusMessage(msg);
      alert(msg);
      return;
    }
    if (!formData.mobile || !/^05[0-9]{8}$/.test(formData.mobile)) {
      const msg = 'يرجى إدخال رقم جوال صحيح مكون من 10 أرقام ويبدأ بـ 05 (مثال: 05xxxxxxxx).';
      setStatusMessage(msg);
      alert(msg);
      return;
    }
    if (!formData.jobStatus) {
      const msg = 'يرجى اختيار الحالة الوظيفية.';
      setStatusMessage(msg);
      alert(msg);
      return;
    }
    if (!region) {
      const msg = 'يرجى اختيار المنطقة.';
      setStatusMessage(msg);
      alert(msg);
      return;
    }
    if (!formData.city) {
      const msg = 'يرجى اختيار المدينة.';
      setStatusMessage(msg);
      alert(msg);
      return;
    }
    if (!formData.bank) {
      const msg = 'يرجى اختيار الجهة المالية.';
      setStatusMessage(msg);
      alert(msg);
      return;
    }
    
    // Validate products/seized amounts
    const isSeizedAmountsValidation = prefill?.requestType === 'seized_amounts_request';
    const invalidProduct = isSeizedAmountsValidation 
      ? products.find(p => !p.accountNumber || !p.amount || !p.type)
      : products.find(p => !p.type || !p.amount);
    if (invalidProduct) {
      const msg = isSeizedAmountsValidation 
        ? 'يرجى إكمال بيانات الحساب المحجوز (رقم الحساب، المبلغ، ومصدر المبلغ).'
        : 'يرجى إكمال بيانات المنتجات التمويلية (تحديد النوع وإدخال المبلغ).';
      setStatusMessage(msg);
      alert(msg);
      return;
    }

    if (!agreedToAuth || !agreedToTerms) {
      const msg = 'يجب الموافقة على تفويض ريفانس المالية وعلى الشروط والأحكام للمتابعة (المربعات في أسفل النموذج).';
      setStatusMessage(msg);
      alert(msg);
      return;
    }

    if (!hasSignature) {
      const msg = 'يرجى التوقيع في المربع المخصص في أسفل النموذج قبل الإرسال.';
      setStatusMessage(msg);
      alert(msg);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('جاري إرسال الطلب...');
    
    try {
      const isSeizedAmounts = prefill?.requestType === 'seized_amounts_request';
      const type = isSeizedAmounts ? 'seized_amounts_request' : (prefill?.requestType === 'rescheduling_request' ? 'rescheduling_request' : (prefill?.serviceType === 'جدولة المديونيات' ? 'scheduling_request' : 'waive_request'));
      
      const signatureData = canvasRef.current?.toDataURL() || '';

      // Upload documents to storage
      const uploadedFiles: any[] = [];
      for (const doc of documents) {
        if (doc.file) {
          try {
            const result = await uploadDocument(doc.file);
            uploadedFiles.push({ ...result, type: doc.type });
          } catch (e) {
            console.error("File upload error:", e);
          }
        }
      }

      const requestDataObj = {
        type,
        details: formData.summary || `طلب ${type === 'waive_request' ? 'إعفاء' : type === 'seized_amounts_request' ? 'إتاحة مبالغ مستثناه' : 'جدولة'} من ${formData.firstName} ${formData.lastName}`,
        data: {
          requestId,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          fullName: `${formData.firstName} ${formData.middleName} ${formData.lastName}`,
          age: formData.age,
          nationalId: formData.nationalId,
          mobile: formData.mobile,
          email: formData.email,
          jobStatus: formData.jobStatus,
          region,
          city: formData.city,
          bank: formData.bank,
          totalAmount,
          products,
          signature: signatureData,
        },
        files: uploadedFiles,
      };

      const result = await submitRequest(requestDataObj);

      // Send email notification to admin via edge function
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            requestData: {
              id: result?.id || requestId,
              type: requestDataObj.type,
              details: requestDataObj.details,
              status: 'pending',
              data: requestDataObj.data,
              files: uploadedFiles,
            },
            userData: {
              fullName: `${formData.firstName} ${formData.middleName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.mobile,
              national_id: formData.nationalId,
            },
          },
        });
      } catch (emailErr) {
        console.error("Email notification error:", emailErr);
      }

      // Auto-sync documents and products to user profile
      try {
        const profileData = await import('../../lib/api').then(m => m.getProfile());
        if (profileData) {
          const existingDocs = (profileData.documents as any[]) || [];
          const existingProducts = (profileData.products as any[]) || [];
          
          // Add uploaded files as documents to profile
          const newDocs = uploadedFiles.map((f: any) => ({
            id: Date.now() + Math.random(),
            type: f.type || 'مستندات الطلب',
            fileName: f.fileName,
            filePath: f.filePath,
            date: new Date().toLocaleDateString('ar-SA'),
          }));
          
          // Replace products with current request's products (clear previous)
          const newProducts = products.filter((p: any) => p.type && p.amount).map((p: any) => ({
            id: Date.now() + Math.random(),
            type: p.type,
            amount: p.amount,
            accountNumber: p.accountNumber || '',
          }));
          
          // Merge docs without duplicates
          const mergedDocs = [...existingDocs];
          for (const nd of newDocs) {
            if (!mergedDocs.some(d => d.fileName === nd.fileName)) {
              mergedDocs.push(nd);
            }
          }
          
          const { updateProfile } = await import('../../lib/api');
          await updateProfile({
            ...profileData,
            fullName: profileData.full_name,
            firstName: profileData.first_name,
            middleName: profileData.middle_name,
            lastName: profileData.last_name,
            phone: profileData.phone,
            nationalId: profileData.national_id,
            fileNumber: profileData.file_number,
            jobStatus: profileData.job_status,
            salary: profileData.salary,
            age: profileData.age,
            region: profileData.region,
            city: profileData.city,
            bank: profileData.bank,
            documents: mergedDocs,
            products: newProducts,
          });
        }
      } catch (syncErr) {
        console.error("Auto-sync to profile error:", syncErr);
      }

      setIsSuccess(true);
      window.dispatchEvent(new CustomEvent('request-submitted'));
    } catch (error: any) {
      console.error("Submission error:", error);
      const errorMessage = error.message || "حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً.";
      setStatusMessage(errorMessage);
      alert(errorMessage);
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
        <div className="bg-white rounded-[24px] border border-gold shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in duration-300">
           <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={40} />
           </div>
           <h2 className="text-[22px] font-extrabold text-brand mb-2">تم استلام طلبك بنجاح</h2>
           <p className="text-[13px] text-muted mb-6 leading-relaxed">
             شكراً لك. تم تسجيل طلب الإعفاء الخاص بك برقم 
             <span className="font-bold text-brand block mt-1 text-[16px]">{requestId}</span>
             سيقوم فريقنا بالتواصل معك قريباً لاستكمال الإجراءات.
           </p>
           <Button onClick={onClose} className="w-full">العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2147483647] bg-[#F5F4FA] overflow-y-auto overflow-x-hidden pointer-events-auto">
      {/* Top Bar */}
      <div className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gold/30 h-[60px] flex items-center justify-between px-4 z-[2147483647] shadow-sm pointer-events-auto">
        <button 
          onClick={() => {
            onClose();
          }} 
          className="p-2 rounded-full hover:bg-gray-100 text-brand"
        >
          <ArrowRight size={20} />
        </button>
        <span className="text-[14px] font-extrabold text-brand">
          {prefill?.requestType === 'seized_amounts_request' ? 'نموذج طلب إتاحة النسبة النظامية والمبالغ المستثناه' : (prefill?.requestType === 'rescheduling_request' ? 'نموذج طلب إعادة جدولة المنتجات التمويلية' : (prefill?.serviceType === 'جدولة المديونيات' ? 'نموذج طلب جدولة المديونيات' : 'نموذج طلب الإعفاء'))}
        </span>
        <div className="w-10"></div> {/* Spacer to keep title centered */}
      </div>

      <div className="max-w-[980px] mx-auto px-1.5 py-3 pb-8">
        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-[12px] border border-gold/45 shadow-[0_18px_45px_rgba(0,0,0,0.06)] p-3 sm:p-6">
          
          <div className="mb-6 border-b border-gray-100 pb-4">
             <div className="flex justify-between items-center mb-2">
               <h1 className="text-[20px] font-extrabold text-brand">بيانات الطلب الأساسية</h1>
               <span className="bg-[#FFFBF2] text-gold px-3 py-1 rounded-full text-[12px] font-bold border border-gold/30 tracking-wider font-mono">{requestId}</span>
             </div>
             <p className="text-[12px] text-muted">يرجى تعبئة جميع البيانات المطلوبة بدقة لضمان سرعة معالجة الطلب.</p>
             {statusMessage && (
               <div className="mt-3 p-3 bg-gold/10 border border-gold/30 rounded-[12px] text-brand text-[12px] font-bold animate-pulse">
                 {statusMessage}
               </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 mb-4">
             {/* Row 1: Names */}
             <div className="col-span-2">
               <label className="block text-[11px] font-bold text-brand mb-1">الاسم الثلاثي <span className="text-red-500">*</span></label>
               <div className="flex gap-1.5">
                 <input type="text" name="firstName" placeholder="الأول" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full p-1.5 rounded-lg border border-gold/30 text-[12px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none" />
                 <input type="text" name="middleName" placeholder="الأوسط" required value={formData.middleName} onChange={(e) => setFormData({...formData, middleName: e.target.value})} className="w-full p-1.5 rounded-lg border border-gold/30 text-[12px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none" />
                 <input type="text" name="lastName" placeholder="العائلة" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full p-1.5 rounded-lg border border-gold/30 text-[12px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none" />
               </div>
             </div>

             {/* Row 2: National ID & Mobile */}
             <div>
                <label className="block text-[11px] font-bold text-brand mb-1">رقم الهوية <span className="text-red-500">*</span></label>
                <input type="text" name="nationalId" inputMode="numeric" onKeyDown={onlyNumbers} maxLength={10} required value={formData.nationalId} onChange={(e) => setFormData({...formData, nationalId: e.target.value})} className="w-full p-1.5 rounded-lg border border-gold/30 text-[12px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none" placeholder="10 أرقام" />
             </div>
             <div>
                <label className="block text-[11px] font-bold text-brand mb-1">رقم الجوال <span className="text-red-500">*</span></label>
                <input type="text" name="mobile" inputMode="numeric" required value={formData.mobile} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setFormData({...formData, mobile: val}); }} onKeyDown={onlyNumbers} maxLength={10} className="w-full p-1.5 rounded-lg border border-gold/30 text-[12px] font-bold tracking-wider focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none text-left dir-ltr" placeholder="05xxxxxxxx" />
                <p className="text-[9px] text-muted mt-0.5 pr-1">يبدأ بـ 05 - 10 أرقام</p>
             </div>

             {/* Row 3: Region & City */}
             <div>
                <label className="block text-[11px] font-bold text-brand mb-1">المنطقة <span className="text-red-500">*</span></label>
                <select name="region" value={region} onChange={(e) => setRegion(e.target.value)} required className="w-full p-1.5 rounded-lg border border-gold/30 text-[12px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none bg-white">
                  <option value="">اختر المنطقة</option>
                  {Object.keys(REGION_CITIES).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-[11px] font-bold text-brand mb-1">المدينة <span className="text-red-500">*</span></label>
                <select name="city" required disabled={!region} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full p-1.5 rounded-lg border border-gold/30 text-[12px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none bg-white">
                  <option value="">اختر المدينة</option>
                  {region && REGION_CITIES[region]?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>

             {/* Row 4: Age & Job Status */}
             <div>
                <label className="block text-[11px] font-bold text-brand mb-1">العمر <span className="text-red-500">*</span></label>
                <input type="text" name="age" inputMode="numeric" onKeyDown={onlyNumbers} required value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full p-1.5 rounded-lg border border-gold/30 text-[12px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none" placeholder="بالسنوات" />
             </div>
             <div>
                <label className="block text-[11px] font-bold text-brand mb-1">الحالة الوظيفية <span className="text-red-500">*</span></label>
                <select name="jobStatus" required value={formData.jobStatus} onChange={(e) => setFormData({...formData, jobStatus: e.target.value})} className="w-full p-1.5 rounded-lg border border-gold/30 text-[12px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none bg-white">
                  <option value="">اختر الحالة</option>
                  <option value="موظف حكومي">موظف حكومي</option>
                  <option value="موظف قطاع خاص">موظف قطاع خاص</option>
                  <option value="متقاعد">متقاعد</option>
                  <option value="لا يوجد عمل">لا يوجد عمل</option>
                </select>
             </div>

             {/* Bank */}
             <div className="col-span-2">
                <label className="block text-[11px] font-bold text-brand mb-1">الجهة المالية <span className="text-red-500">*</span></label>
                <select name="bank" required value={formData.bank} onChange={(e) => setFormData({...formData, bank: e.target.value})} className="w-full p-1.5 rounded-lg border border-gold/30 text-[12px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none bg-white">
                  <option value="">اختر البنك أو الجهة التمويلية</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
             </div>
          </div>

          {/* Products / Seized Amounts Section */}
          {prefill?.requestType === 'seized_amounts_request' ? (
            <div className="mt-8 mb-6 bg-gradient-to-b from-white to-[#FCFAF4] rounded-[16px] border border-gold/30 p-4 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[14px] font-bold text-brand">بيانات الحساب والمبالغ المحجوزة</h3>
                <button type="button" onClick={addProduct} className="flex items-center gap-1 text-[11px] text-brand bg-white border border-gold/40 px-3 py-1.5 rounded-full hover:bg-gold/10 transition-colors">
                  <Plus size={12} />
                  إضافة حساب
                </button>
              </div>
              
              <div className="space-y-3">
                {products.map((product, idx) => (
                  <div key={product.id} className="bg-white rounded-[12px] border border-gold/15 p-3 space-y-3 animate-in fade-in slide-in-from-right-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-muted mb-1">رقم الحساب الجاري <span className="text-red-500">*</span></label>
                        <input 
                          type="text"
                          name={`productAccount_${idx}`}
                          inputMode="numeric"
                          onKeyDown={onlyNumbers}
                          required
                          value={product.accountNumber || ''}
                          onChange={(e) => updateProduct(product.id, 'accountNumber', e.target.value.replace(/\D/g, ''))}
                          className="w-full p-2 rounded-[10px] border border-gold/20 text-[12px]" 
                          placeholder="رقم الحساب الجاري"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted mb-1">المبلغ المحجوز في الحساب <span className="text-red-500">*</span></label>
                        <input 
                          type="text"
                          name={`productAmount_${idx}`}
                          inputMode="numeric"
                          onKeyDown={onlyNumbers}
                          required
                          value={product.amount}
                          onChange={(e) => updateProduct(product.id, 'amount', e.target.value.replace(/\D/g, ''))}
                          className="w-full p-2 rounded-[10px] border border-gold/20 text-[12px]" 
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-muted mb-1">مصدر المبلغ المحجوز <span className="text-red-500">*</span></label>
                        <select 
                          name={`productType_${idx}`}
                          required
                          value={product.type}
                          onChange={(e) => updateProduct(product.id, 'type', e.target.value)}
                          className="w-full p-2 rounded-[10px] border border-gold/20 text-[12px] bg-white"
                        >
                          <option value="">اختر المصدر</option>
                          <option value="راتب">راتب</option>
                          <option value="حساب المواطن">حساب المواطن</option>
                          <option value="حافز">حافز</option>
                          <option value="بدل غلاء المعيشة">بدل غلاء المعيشة</option>
                          <option value="الإعانات الزراعية">الإعانات الزراعية</option>
                          <option value="برنامج سند">برنامج سند</option>
                          <option value="تحويل بنكي">تحويل بنكي</option>
                          <option value="أخرى">أخرى</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted mb-1">تاريخ إيداع المبلغ في الحساب</label>
                        <input 
                          type="date"
                          name={`productDate_${idx}`}
                          value={product.depositDate || ''}
                          onChange={(e) => updateProduct(product.id, 'depositDate' as any, e.target.value)}
                          className="w-full p-2 rounded-[10px] border border-gold/20 text-[12px]" 
                        />
                      </div>
                    </div>
                    {products.length > 1 && (
                      <div className="flex justify-end">
                        <button type="button" onClick={() => removeProduct(product.id)} className="text-red-400 p-1 hover:bg-red-50 rounded-full transition-colors flex items-center gap-1 text-[10px]">
                          <Trash2 size={14} />
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gold/10 flex justify-between items-center">
                <span className="text-[12px] text-muted font-bold">إجمالي المبالغ المحجوزة:</span>
                <span className="text-[14px] font-extrabold text-brand tabular-nums">{formatAmount(totalAmount)} ر.س</span>
              </div>
            </div>
          ) : (
            <div className="mt-8 mb-6 bg-gradient-to-b from-white to-[#FCFAF4] rounded-[16px] border border-gold/30 p-4 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[14px] font-bold text-brand">المنتجات التمويلية</h3>
                <button type="button" onClick={addProduct} className="flex items-center gap-1 text-[11px] text-brand bg-white border border-gold/40 px-3 py-1.5 rounded-full hover:bg-gold/10 transition-colors">
                  <Plus size={12} />
                  إضافة منتج
                </button>
              </div>
              
              <div className="space-y-3">
                {products.map((product, idx) => (
                  <div key={product.id} className="flex flex-wrap gap-2 items-end animate-in fade-in slide-in-from-right-2">
                     <div className="flex-1 min-w-[140px]">
                       <label className="block text-[10px] font-bold text-muted mb-1">نوع المنتج</label>
                       <select 
                         name={`productType_${idx}`}
                         required
                         value={product.type}
                         onChange={(e) => updateProduct(product.id, 'type', e.target.value)}
                         className="w-full p-2 rounded-[10px] border border-gold/20 text-[12px] bg-white"
                       >
                          <option value="">اختر النوع</option>
                          <option value="تمويل شخصي">تمويل شخصي</option>
                          <option value="تمويل عقاري">تمويل عقاري</option>
                          <option value="التمويل التأجيري">التمويل التأجيري</option>
                          <option value="بطاقة ائتمانية">بطاقة ائتمانية</option>
                       </select>
                     </div>
                     <div className="flex-1 min-w-[120px]">
                       <label className="block text-[10px] font-bold text-muted mb-1">رقم حساب التمويل (اختياري)</label>
                       <input 
                         type="text"
                         name={`productAccount_${idx}`}
                         inputMode="numeric"
                         onKeyDown={onlyNumbers}
                         value={product.accountNumber || ''}
                         onChange={(e) => updateProduct(product.id, 'accountNumber', e.target.value.replace(/\D/g, ''))}
                         className="w-full p-2 rounded-[10px] border border-gold/20 text-[12px]" 
                         placeholder="رقم الحساب"
                       />
                     </div>
                     <div className="flex-1 min-w-[120px]">
                       <label className="block text-[10px] font-bold text-muted mb-1">المبلغ المتبقي</label>
                       <input 
                         type="text"
                         name={`productAmount_${idx}`}
                         inputMode="numeric"
                         onKeyDown={onlyNumbers}
                         required
                         value={product.amount}
                         onChange={(e) => updateProduct(product.id, 'amount', e.target.value.replace(/\D/g, ''))}
                         className="w-full p-2 rounded-[10px] border border-gold/20 text-[12px]" 
                         placeholder="0.00"
                       />
                     </div>
                     {products.length > 1 && (
                       <button type="button" onClick={() => removeProduct(product.id)} className="mb-1 p-2 text-red-400 hover:text-red-600">
                         <Trash2 size={16} />
                       </button>
                     )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gold/10 flex justify-between items-center">
                 <span className="text-[12px] text-muted font-bold">المجموع الكلي:</span>
                 <span className="text-[14px] font-extrabold text-brand tabular-nums">{formatAmount(totalAmount)} ر.س</span>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mb-6">
            <label className="block text-[12px] font-bold text-brand mb-1.5">ملخص الحالة (اختياري)</label>
            <textarea 
              name="summary" 
              value={formData.summary} 
              onChange={(e) => setFormData({...formData, summary: e.target.value})} 
              className="w-full p-3 rounded-[14px] border border-gold/30 text-[13px] focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none min-h-[80px]" 
              placeholder={prefill?.requestType === 'seized_amounts_request' ? "اكتب نبذة مختصرة عن وضعك وسبب طلب إتاحة المبالغ المستثناه..." : (prefill?.requestType === 'rescheduling_request' ? "اكتب نبذة مختصرة عن وضعك المالي وسبب طلب إعادة الجدولة..." : (prefill?.serviceType === 'جدولة المديونيات' ? "اكتب نبذة مختصرة عن وضعك المالي وطلب الجدولة..." : "اكتب نبذة مختصرة عن سبب طلب الإعفاء..."))}
            ></textarea>
          </div>

          {/* Files */}
          <div className="mb-6">
             <div className="flex justify-between items-center mb-2">
               <label className="text-[12px] font-bold text-brand">المرفقات الداعمة</label>
               <button type="button" onClick={addDocument} className="text-[11px] text-gold underline hover:text-brand">
                 + إضافة مرفق
               </button>
             </div>
             <div className="space-y-2">
                {documents.map((doc) => (
                   <div key={doc.id} className="flex gap-2 items-center">
                       <select 
                         name={`docType_${doc.id}`} 
                         value={doc.type}
                         onChange={(e) => updateDocumentType(doc.id, e.target.value)}
                         className="w-1/3 p-2 rounded-[10px] border border-gold/20 text-[11px] bg-white"
                       >
                          <option value="">نوع المرفق</option>
                          {prefill?.requestType === 'seized_amounts_request' ? (
                            <>
                              <option value="كشف حساب">كشف حساب</option>
                              <option value="رسالة إيداع">رسالة إيداع</option>
                              <option value="إفادة من جهة العمل">إفادة من جهة العمل</option>
                              <option value="خطاب منصة اعتماد">خطاب منصة اعتماد</option>
                              <option value="مستندات اخرى">مستندات اخرى</option>
                            </>
                          ) : prefill?.requestType === 'rescheduling_request' || prefill?.serviceType === 'جدولة المديونيات' ? (
                            <>
                              <option value="خطاب تعريف بالراتب">خطاب تعريف بالراتب</option>
                              <option value="قرار تقاعد">قرار تقاعد</option>
                              <option value="تقرير سمه">تقرير سمه</option>
                              <option value="كشف حساب ثلاثة أشهر">كشف حساب ثلاثة أشهر</option>
                              <option value="قرار إعادة خدمة">قرار إعادة خدمة</option>
                              <option value="مستندات اخرى">مستندات اخرى</option>
                            </>
                          ) : (
                            <>
                              <option value="تقرير طبي">تقرير طبي</option>
                              <option value="قرار انهاء خدمة">قرار انهاء خدمة</option>
                              <option value="مشهد تقييم اعاقه">مشهد تقييم اعاقه</option>
                              <option value="مشهد ضمان اجتماعي">مشهد ضمان اجتماعي</option>
                              <option value="قرار طبي">قرار طبي</option>
                              <option value="قرار اللجنة الطبية">قرار اللجنة الطبية</option>
                              <option value="مستندات اخرى">مستندات اخرى</option>
                            </>
                          )}
                      </select>
                      <div className="flex-1 relative">
                        <input 
                          type="file" 
                          id={`docFile_${doc.id}`}
                          name={`docFile_${doc.id}`} 
                          onChange={(e) => updateDocumentFile(doc.id, e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        />
                        <div className="w-full p-2 rounded-[10px] border border-gold/20 text-[11px] bg-gray-50 flex items-center justify-between">
                          <span className="truncate max-w-[150px]">{doc.fileName || 'اختر ملفاً...'}</span>
                          <Hash size={12} className="text-gold/50" />
                        </div>
                      </div>
                      {documents.length > 1 && (
                        <button type="button" onClick={() => removeDocument(doc.id)} className="text-red-400 p-1 hover:bg-red-50 rounded-full transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                   </div>
                ))}
             </div>
          </div>

          {/* Consent */}
          <div className="mb-6 space-y-3 bg-[#F9F9F9] p-4 rounded-[12px] border border-gray-100">
             <label className="flex gap-2 items-start cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={agreedToAuth}
                  onChange={(e) => setAgreedToAuth(e.target.checked)}
                  className="mt-1 accent-gold w-4 h-4" 
                />
                <span className="text-[11px] text-brand leading-relaxed">
                  أوافق على <button type="button" onClick={() => setShowAuthModal(true)} className="text-gold font-bold hover:underline">تفويض ريفانس المالية</button> بالاطلاع على المستندات ودراسة الحالة ومتابعة الإجراءات مع الجهات التمويلية.
                </span>
             </label>
             <label className="flex gap-2 items-start cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 accent-gold w-4 h-4" 
                />
                <span className="text-[11px] text-brand leading-relaxed">
                  وأوافق على <button type="button" onClick={() => setShowTermsModal(true)} className="text-gold font-bold hover:underline">الشروط والأحكام</button> ، و أتعهد بصحة جميع البيانات المدخلة والمرفقات.
                </span>
             </label>
          </div>

          {/* Signature */}
          <div className="mb-8">
             <div className="flex justify-between items-end mb-1.5">
                <label className="text-[12px] font-bold text-brand">التوقيع الإلكتروني <span className="text-red-500">*</span></label>
                <button type="button" onClick={clearSignature} className="text-[10px] text-red-500 hover:underline">مسح التوقيع</button>
             </div>
             <div className="border border-gold/60 rounded-[12px] overflow-hidden bg-white shadow-inner touch-none h-[130px]">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair"
                />
             </div>
             <p className="text-[10px] text-muted mt-1 text-center">يرجى التوقيع داخل المربع باستخدام الإصبع أو المؤشر</p>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gold/30">
             {!token || !user ? (
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
             ) : (
               <div className="flex gap-2 flex-wrap">
                 <button 
                   type="button" 
                   onClick={onClose} 
                   className="flex-1 min-w-[80px] px-3 py-3 rounded-full border border-gold/30 text-brand font-bold text-[12px] hover:bg-gray-50 transition-colors"
                 >
                   إلغاء
                 </button>
                 <button 
                   type="button" 
                   onClick={() => {
                     // Save draft to localStorage
                     const draft = {
                       formData,
                       region,
                       products,
                       documents: documents.map(d => ({ ...d, file: null })),
                       requestId,
                     };
                     localStorage.setItem(`draft_request_${user?.id}`, JSON.stringify(draft));
                     setStatusMessage('تم حفظ الطلب بنجاح. يمكنك استكماله لاحقاً.');
                     setTimeout(() => onClose(), 1500);
                   }}
                   className="flex-1 min-w-[120px] px-3 py-3 rounded-full border-2 border-gold text-gold font-bold text-[12px] hover:bg-gold/10 transition-colors"
                 >
                   الحفظ والاستكمال لاحقاً
                 </button>
                 <button 
                   type="button" 
                   onClick={() => {
                     console.log("Submit button clicked");
                     setStatusMessage('تم استلام الضغطة، جاري التحقق...');
                     handleSubmit();
                   }} 
                   disabled={isSubmitting} 
                   className="flex-[2] min-w-[140px] bg-gold-gradient text-brand font-bold py-3 rounded-full shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed text-[13px] transition-all active:scale-95 pointer-events-auto cursor-pointer"
                 >
                   {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                 </button>
               </div>
             )}
          </div>

        </form>

        {/* Authorization Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
            <div className="relative bg-white rounded-[24px] p-6 max-w-lg w-full shadow-2xl border border-gold/30 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand">تفويض ريفانس المالية</h3>
                <button onClick={() => setShowAuthModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="text-[13px] text-gray-600 leading-relaxed space-y-3 text-right">
                <p>أنا الموقع أدناه، أفوض شركة ريفانس المالية بالقيام بكافة الإجراءات اللازمة لدراسة حالتي الائتمانية والمالية لدى الجهات ذات العلاقة.</p>
                <p>يشمل هذا التفويض الاطلاع على التقارير الائتمانية والمستندات المرفقة والتواصل مع الجهات التمويلية نيابة عني لمتابعة طلبات الإعفاء أو تسوية المديونيات.</p>
                <p>هذا التفويض سارٍ حتى انتهاء معالجة الطلب أو إلغائه من قبلي كتابياً.</p>
              </div>
              <Button onClick={() => setShowAuthModal(false)} className="w-full mt-6">إغلاق</Button>
            </div>
          </div>
        )}

        {/* Terms Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTermsModal(false)} />
            <div className="relative bg-white rounded-[24px] p-6 max-w-lg w-full shadow-2xl border border-gold/30 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand">الشروط والأحكام</h3>
                <button onClick={() => setShowTermsModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="text-[13px] text-gray-600 leading-relaxed space-y-3 text-right h-[300px] overflow-y-auto px-2">
                <p className="font-bold">1. صحة البيانات:</p>
                <p>يتعهد العميل بأن جميع المعلومات والبيانات والمستندات المقدمة عبر المنصة صحيحة ودقيقة ومحدثة.</p>
                <p className="font-bold">2. المسؤولية:</p>
                <p>ريفانس المالية هي جهة وسيطة ومستشارة، ولا تضمن قبول طلب الإعفاء من قبل الجهة التمويلية حيث يخضع ذلك لسياسات تلك الجهات.</p>
                <p className="font-bold">3. الخصوصية:</p>
                <p>تلتزم ريفانس المالية بالحفاظ على سرية بيانات العميل وعدم مشاركتها إلا مع الجهات المعنية بمعالجة الطلب.</p>
                <p className="font-bold">4. الرسوم:</p>
                <p>تخضع خدماتنا لرسوم يتم الاتفاق عليها مسبقاً، ولا يتم تحصيل أي مبالغ إلا بعد توقيع العقد الرسمي.</p>
              </div>
              <Button onClick={() => setShowTermsModal(false)} className="w-full mt-6">إغلاق</Button>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default WaiveRequestForm;
