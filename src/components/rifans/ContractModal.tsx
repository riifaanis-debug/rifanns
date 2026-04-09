import React, { useState, useRef, useEffect } from 'react';
import rifansStampImg from '@/assets/rifans-stamp.png';
import { X, CheckCircle, Download, Printer, ShieldCheck, PenTool, ArrowRight } from 'lucide-react';
import { Button } from './Shared';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signatureData: string) => void;
  userData: {
    fullName: string;
    nationalId: string;
    mobile: string;
    email: string;
  } & Record<string, any>;
  contractId: string;
}

const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, onSign, userData, contractId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#0000FF';
      }
      
      const resizeCanvas = () => {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = 150;
          if (ctx) {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#0000FF';
          }
        }
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [isOpen]);

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

  const handleSignSubmit = async () => {
    if (!hasSignature) {
      alert('يرجى التوقيع أولاً');
      return;
    }
    
    setIsSubmitting(true);
    const signatureData = canvasRef.current?.toDataURL();
    if (signatureData) {
      await onSign(signatureData);
      setIsSuccess(true);
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-[#22042C]/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-[#fcfaf7] w-full max-w-5xl h-full sm:h-[95vh] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10">
        
        {/* Top Navigation Bar */}
        <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#22042C] rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
              <ShieldCheck className="text-[#C5A059]" size={22} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#22042C] font-['Tajawal']">بوابة توقيع العقود الإلكترونية</h2>
              <p className="text-[10px] text-muted font-medium">عقد رقم: {contractId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2.5 text-muted hover:text-brand hover:bg-gray-50 rounded-xl transition-all" title="طباعة">
              <Printer size={20} />
            </button>
            <button className="p-2.5 text-muted hover:text-brand hover:bg-gray-50 rounded-xl transition-all" title="تحميل">
              <Download size={20} />
            </button>
            <div className="w-px h-6 bg-gray-100 mx-1" />
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center bg-gray-50 text-muted hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#fcfaf7] p-4 sm:p-10">
          <div className="max-w-3xl mx-auto bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 rounded-[24px] p-8 sm:p-16 relative overflow-hidden font-['Tajawal']">
            
            {/* Watermark Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-[-15deg]">
              <img src="https://mrkzgulfup.com/uploads/17723308921271.png" alt="" className="w-[400px]" referrerPolicy="no-referrer" />
            </div>

            {/* Document Header */}
            <div className="flex justify-between items-start mb-16 relative">
              <div className="text-right">
                <img src="https://mrkzgulfup.com/uploads/17723308921271.png" alt="Rifans Logo" className="h-24 mb-4" referrerPolicy="no-referrer" />
                <div className="space-y-1">
                  <p className="text-[20px] font-black text-[#22042C]">شركة ريفانس المالية</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-[18px] font-black text-[#22042C]">عقد تفويض ومتابعة طلب إعفاء تمويلي</p>
                    <p className="text-[12px] font-bold text-[#22042C]">رقم العقد: {contractId}</p>
                    <p className="text-[12px] font-bold text-[#22042C]">التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
              </div>
            </div>

            {/* Contract Body */}
            <div className="space-y-10 text-right dir-rtl relative">
              <div className="text-center mb-12">
                <div className="w-24 h-1 bg-[#C5A059] mx-auto rounded-full" />
              </div>

              <div className="space-y-8 text-[15px] text-[#22042C] leading-[1.8]">
                <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-[17px] mb-4 text-[#C5A059] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                    الطرف الأول:
                  </h3>
                  <div className="space-y-2 pr-4">
                    <p><strong>الاسم:</strong> شركة ريفانس المالية – شركة ذات مسؤولية محدودة</p>
                    <p><strong>الرقم الوطني الموحد:</strong> 7038821125</p>
                    <p><strong>ويمثلها في هذا العقد:</strong> AZZAH ALBIDDI بصفته: المدير العام – بموجب تفويض رقم: DLG398908</p>
                  </div>
                </section>

                <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-[17px] mb-4 text-[#C5A059] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                    الطرف الثاني:
                  </h3>
                  <div className="space-y-2 pr-4">
                    <p><strong>الاسم:</strong> {userData.fullName || '____________________'}</p>
                    <p><strong>الهوية:</strong> {userData.nationalId || '____________________'}</p>
                    <p><strong>الجوال:</strong> {userData.mobile || '____________________'}</p>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold text-[17px] mb-4 text-[#C5A059] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                    التمهيد:
                  </h3>
                  <p className="pr-4 text-justify leading-relaxed">
                    حيث إن الطرف الثاني قد تقدم وأفاد بأن لديه عجزاً طبياً مثبتاً بموجب تقارير رسمية صادرة من الجهات الطبية المختصة؛ وحيث إن الطرف الأول يُعد من الجهات المتخصصة ذات الخبرة والكفاءة المهنية العالية في مجال المنازعات المصرفية والتمويلية، ويضم نخبة من اللجان القانونية المؤهلة القادرة على دراسة الطلبات، وتدقيق المستندات والتقارير الطبية، ومتابعة الإجراءات بشكل رسمي ونظامي مع البنوك والمصارف والجهات التمويلية والهيئات الطبية وكافة الجهات التنظيمية ذات العلاقة؛ وحيث إن الطرف الثاني قد أبدى رغبته الصريحة في التقدم بطلب إعفاء من جميع التزاماته التمويلية القائمة لدى البنوك والمصارف؛ وحيث إن الطرف الأول قد أثبت جدارته المهنية من خلال ما يملكه من لجان متخصصة وخبرات عملية في إدارة طلبات العملاء المقدمة إلى الجهات التمويلية، وما حققه من نتائج إيجابية تسهم في حفظ حقوق العملاء وتحقيق مصالحهم؛ وحيث إن هذا التمهيد يُعد جزءاً لا يتجزأ من هذا العقد ومكملاً ومفسراً لبنوده؛ فقد اتفق الطرفان، وهما بكامل الأهلية المعتبرة شرعاً ونظاماً، على إبرام هذا العقد وفقاً لما يلي:
                  </p>
                </section>

                <div className="space-y-10">
                  <h2 className="text-center text-[20px] font-black text-[#22042C] border-b-2 border-[#C5A059] pb-2 inline-block">بنود العقد التفصيلية</h2>
                  
                  <section>
                    <h3 className="font-bold text-[16px] text-[#C5A059] mb-2">المادة (1): حجية التعامل الإلكتروني</h3>
                    <p className="pr-4">يقر الطرفان بموافقتهما على إبرام هذا العقد واستخدام الوسائل الإلكترونية (البريد الإلكتروني، الرسائل النصية OTP) لتوثيقه، وتعد هذه الوسائل حجة ملزمة وقائمة بذاتها وفقاً لنظام التعاملات الإلكترونية السعودي، ولها ذات الحجية القانونية للتوقيع اليدوي أمام كافة الجهات الرسمية والقضائية.</p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[16px] text-[#C5A059] mb-2">المادة (2): موضوع العقد والتفويض</h3>
                    <p className="pr-4">يفوض الطرف الثاني بموجب هذا العقد تفويضاً صريحاً ومباشراً وقابلاً للتنفيذ للطرف الأول في استلام وتقديم ومتابعة طلب الإعفاء المقدم من الطرف الثاني لدى {userData.bank || 'البنك الأهلي السعودي'}، وذلك فيما يتعلق بمنتجات التمويل الموضحة أدناه:</p>
                    
                    <div className="mt-4 p-6 border border-gray-200 rounded-xl bg-gray-50/30 space-y-4 text-[15px]">
                      <p className="font-bold text-brand pb-2 border-b border-gray-100">تفاصيل المديونية المشمولة بالتفويض لدى ({userData.bank || 'الجهة المالية'}) :</p>
                      {userData.products && userData.products.length > 0 ? (
                        userData.products.map((product, idx) => (
                          <div key={idx} className="space-y-2 pb-2 border-b border-gray-50 last:border-0">
                            <p><strong>نوع المنتج :</strong> {product.type || '____________________'}</p>
                            <p><strong>رقم حساب المنتج :</strong> {product.accountNumber || '____________________'}</p>
                            <p><strong>مبلغ المنتج :</strong> {product.amount || '____________________'}</p>
                          </div>
                        ))
                      ) : (
                        <div className="space-y-2">
                          <p><strong>نوع المنتج :</strong> ____________________</p>
                          <p><strong>رقم حساب المنتج :</strong> ____________________</p>
                          <p><strong>مبلغ المنتج :</strong> ____________________</p>
                        </div>
                      )}
                      <p className="font-black text-brand pt-2 text-[17px]">إجمالي المديونية : {userData.totalDebt || '____________________'}</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="font-bold text-[16px] text-[#C5A059] mb-2">المادة (3): نطاق التفويض</h3>
                    <div className="pr-4">
                      <p className="mb-1">يشمل التفويض الممنوح للطرف الأول الصلاحيات التالية :</p>
                      <ul className="list-disc pr-6 space-y-1">
                        <li>الاطلاع على التقارير الطبية والمستندات الرسمية</li>
                        <li>التواصل مع البنوك والجهات التمويلية</li>
                        <li>رفع الطلبات ومتابعتها، وإعداد المذكرات القانونية والحضور النظامي عند الحاجة.</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h3 className="font-bold text-[16px] text-[#C5A059] mb-2">المادة (4): التزامات الطرف الأول</h3>
                    <p className="pr-4">يلتزم الطرف الأول بالمحافظة على سرية بيانات الطرف الثاني، وبذل أقصى درجات العناية المهنية ، ورفع الطلبات بصيغة رسمية تعزز فرص القبول ، وإبلاغ الطرف الثاني بالمستجدات دورياً.</p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[16px] text-[#C5A059] mb-2">المادة (5): التزامات الطرف الثاني</h3>
                    <p className="pr-4">يلتزم الطرف الثاني بتقديم كافة المستندات والبيانات الصحيحة ، التعاون مع الطرف الأول لاستكمال النواقص ، والالتزام بسداد الأتعاب المستحقة وفقاً لأحكام العقد.</p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[16px] text-[#C5A059] mb-2">المادة (6): المستحقات المالية والأتعاب</h3>
                    <p className="pr-4">لا تستحق أتعاب الطرف الأول إلا بعد صدور قبول طلب الإعفاء وإصدار خطاب المخالصة المالية ، وفي حال قبول طلب الإعفاء ، يستحق الطرف الأول أتعاباً مقطوعة قدرها (4%) من إجمالي المبالغ المعفاة فعلياً</p>
                    <p className="pr-4 mt-2 font-bold text-red-600">"وفي حال عدم قبول الطلب، لا يحق للطرف الأول المطالبة بأي أتعاب"</p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[16px] text-[#C5A059] mb-2">المادة (7): مدة العقد</h3>
                    <p className="pr-4">يبدأ العمل بهذا العقد من تاريخ توقيعه ، ويستمر سارياً حتى قبول طلب الإعفاء ، ما لم يتم إنهاؤه باتفاق مكتوب بين الطرفين أو وفقاً للأنظمة.</p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[16px] text-[#C5A059] mb-2">المادة (8): سند لأمر وإقرار دين واجب النفاذ</h3>
                    <p className="pr-4 leading-relaxed">
                      اتفق الطرفان على أن يُعد هذا العقد بمثابة سندٍ لأمرٍ واجب النفاذ وفقًا لأحكام نظام الأوراق التجارية ونظام التنفيذ السعودي ،ويقر الطرف الثاني إقرارًا صريحًا ونهائيًا بالتزامه بسداد أتعاب الطرف الأول بنسبة (4%) من إجمالي مبالغ المنتجات التمويلية التي يتم إعفاؤه منها، وذلك فور قبول طلب الإعفاء واستلام خطاب المخالصة المالية.
                    </p>
                    <div className="mt-4 p-6 bg-brand/5 rounded-2xl border border-brand/10 text-[14px] space-y-3">
                      <p><strong>• رقم السند :</strong> ({contractId})</p>
                      <p><strong>• قيمة السند :</strong> تمثل نسبة (4%) من إجمالي مبالغ المنتجات التمويلية المعفاة فعليًا</p>
                      <p><strong>• تاريخ الاستحقاق :</strong> فور قبول طلب الإعفاء واستلام خطاب المخالصة المالية الصادر من الجهة المختصة</p>
                      <p><strong>• مكان الوفاء:</strong> مدينة (جدة)، المملكة العربية السعودية</p>
                      <p className="text-[12px] pt-2 border-t border-brand/10 text-justify">
                        ويُعد هذا السند مستوفيًا لكافة البيانات والشروط النظامية المقررة، ويُعد دينًا ثابتًا في ذمة الطرف الثاني، ويحق للطرف الأول التقدم به مباشرة إلى محكمة التنفيذ المختصة لتنفيذه دون حاجة إلى رفع دعوى موضوعية أو توجيه أي إشعار أو إنذار مسبق، وذلك وفقًا لما تقضي به الأنظمة المعمول بها في المملكة العربية السعودية.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="font-bold text-[16px] text-[#C5A059] mb-2">المادة (9): أحكام عامة</h3>
                    <p className="pr-4">يخضع العقد لأنظمة المملكة العربية السعودية. لا يُعد أي تعديل نافذاً إلا إذا كان مكتوباً وموقعاً من الطرفين.</p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[16px] text-[#C5A059] mb-2">المادة (10): الإقرار والتنازل عن الدفوع</h3>
                    <p className="pr-4 mb-3">يُقر الطرف الثاني إقراراً صريحاً ونهائياً بما يلي:</p>
                    <ul className="list-decimal list-inside pr-8 space-y-2">
                      <li>صحة جميع البيانات والمستندات المقدمة منه.</li>
                      <li>صحة احتساب الأتعاب وفق النسبة المتفق عليها.</li>
                      <li>التنازل عن أي دفوع أو منازعات تتعلق بسند الأمر متى ما تم إصداره عبر منصة نافذ وفق أحكام هذا العقد.</li>
                      <li>عدم الطعن أو الاعتراض على التنفيذ أمام محكمة التنفيذ إلا في الحدود التي يجيزها النظام.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-bold text-[16px] text-[#C5A059] mb-2">المادة (11): الإقرار والقبول النهائي</h3>
                    <p className="pr-4">يُقر الطرف الثاني بما يلي: اطلاعه الكامل على العقد وفهمه لآثاره، صحة التفويض الممنوح، صحة احتساب الأتعاب، وأن هذا الإقرار حجة قاطعة وملزمة أمام جميع الجهات القضائية والتنفيذية.</p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[16px] text-[#C5A059] mb-2">المادة (12): التفويض</h3>
                    <div className="pr-4 space-y-4 text-justify leading-relaxed">
                      <p>أقر أنا الموقع أدناه وبكامل أهليتي المعتبرة شرعاً ونظاماً بأنني قد فوضت شركة ريفانس المالية ، سجل تجاري رقم 7038821125 تفويضاً كاملاً غير مشروط بمراجعة كافة الجهات الحكومية والخاصة والجهات التمويلية (البنوك والمصارف وشركات التمويل) وشركة المعلومات الائتمانية (سمة)، وذلك للاطلاع على كافة بياناتي الائتمانية والتمويلية والطبية.</p>
                      <p>كما يشمل هذا التفويض حق تقديم طلبات الإعفاء من المديونيات ، أو طلبات إعادة الجدولة ، أو تسوية الالتزامات واستلام خطابات المخالصة أو قرارات الإعفاء ، ومتابعة كافة الإجراءات المتعلقة بملفي لدى البنك المركزي السعودي وكافة اللجان القضائية والرقابية.</p>
                      <p>ويعد هذا التفويض سارياً من تاريخ توقيعه وحتى انتهاء الغرض الذي أعد من أجله أو قيامي بإلغائه رسمياً عبر القنوات المعتمدة لدى الشركة، مع التزامي بكافة النتائج والآثار القانونية المترتبة على هذا التفويض.</p>
                    </div>
                    
                    <div className="mt-8 flex justify-between items-end border-t border-gray-100 pt-6">
                      <div className="space-y-1">
                        <p><strong>الاسم:</strong> {userData.fullName || '____________________'}</p>
                        <p><strong>رقم الهوية الوطنية:</strong> {userData.nationalId || '____________________'}</p>
                      </div>
                      <div className="w-40 h-16 border-b-2 border-dotted border-brand flex items-center justify-center">
                        {isSuccess && <span className="text-green-600 text-[10px] font-bold">موقع إلكترونياً</span>}
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-20 pt-10 border-t border-gray-100 grid grid-cols-2 gap-12">
                  <div className="text-center space-y-4">
                    <p className="font-bold text-[14px] text-[#22042C]">توقيع الطرف الأول</p>
                    <div className="h-28 flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={rifansStampImg} 
                        alt="First Party Stamp" 
                        className="h-full w-auto object-contain mix-blend-multiply" 
                      />
                    </div>
                  </div>
                  <div className="text-center space-y-4">
                    <p className="font-bold text-[14px] text-[#22042C]">توقيع الطرف الثاني</p>
                    <div className="h-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden">
                      {isSuccess ? (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                          <CheckCircle className="text-green-500 mb-1" size={24} />
                          <span className="text-green-600 font-bold text-[11px]">تم التوقيع إلكترونياً</span>
                          <span className="text-[8px] text-muted mt-1">{new Date().toLocaleString('ar-SA')}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted italic">بانتظار توقيع العميل...</span>
                      )}
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>

        {/* Bottom Signature Action Bar */}
        {!isSuccess && (
          <div className="bg-white border-t border-gray-100 p-6 sm:p-8 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10">
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-8 items-center">
              
              {/* Signature Pad */}
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[13px] font-bold text-[#22042C] flex items-center gap-2 font-['Tajawal']">
                    <PenTool size={18} className="text-[#C5A059]" />
                    يرجى التوقيع في المربع أدناه:
                  </label>
                  <button 
                    onClick={clearSignature} 
                    className="text-[11px] font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-all"
                  >
                    مسح التوقيع
                  </button>
                </div>
                <div className="bg-[#fcfaf7] border-2 border-dashed border-gray-200 rounded-2xl h-[140px] relative shadow-inner group transition-all focus-within:border-[#C5A059]/50">
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
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                      <p className="text-[12px] text-muted font-['Tajawal']">ارسم توقيعك هنا</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full md:w-[280px] flex flex-col gap-3">
                <Button 
                  onClick={handleSignSubmit} 
                  disabled={!hasSignature || isSubmitting}
                  className="w-full py-4 bg-[#22042C] text-white rounded-2xl font-bold shadow-xl shadow-brand/20 hover:bg-brand/90 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 font-['Tajawal']"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      اعتماد التوقيع والإرسال
                      <ArrowRight size={18} className="rotate-180" />
                    </>
                  )}
                </Button>
                <button 
                  onClick={onClose}
                  className="w-full py-3 text-[13px] font-bold text-muted hover:text-brand transition-all font-['Tajawal']"
                >
                  إلغاء ومراجعة لاحقاً
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-[200] animate-in fade-in duration-500">
            <div className="text-center p-10 max-w-sm">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                <CheckCircle className="text-green-500" size={48} />
              </div>
              <h3 className="text-[24px] font-black text-[#22042C] mb-3 font-['Tajawal']">تم ارسال العقد بنجاح</h3>
              <p className="text-[14px] text-muted leading-relaxed font-['Tajawal'] mb-6">
                شكراً لك {userData?.fullName?.split(' ')[0]}، تم اعتماد توقيعك الإلكتروني بنجاح وإرسال النسخة الموقعة إلى النظام.
              </p>
              <Button 
                onClick={onClose}
                className="w-full py-3 bg-brand text-white rounded-xl font-bold shadow-lg hover:bg-brand/90 transition-all flex items-center justify-center gap-2 font-['Tajawal']"
              >
                الرجوع
                <ArrowRight size={18} className="rotate-180" />
              </Button>
              <div className="mt-8 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 animate-[progress_3s_linear]" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractModal;
