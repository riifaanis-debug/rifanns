import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Header
    "login_register": "دخول/تسجيل",
    "my_profile": "ملفي",
    "theme_toggle": "تبديل المظهر",
    "menu_open": "القائمة",
    
    // Intro
    "intro_text": "ريفانس المالية\nشركة سعودية ذات مسؤولية محدودة مرخصة من البنك المركزي السعودي لتقديم نشاط خدمات إنترنت الأشياء للأنشطة المالية وأنشطة التأمين والنشاطات الأخرى المساعدة لأنشطة الخدمات المالية وأنشطة الشركات الاستثمارية والإستشارات العقارية على أساس رسوم أو عقود\n\nتهتم بدراسة ومعالجة طلبات الأفراد في القطاع المصرفي وتقدم الحلول التمويلية والإستشارات المالية والإئتمانية تلتزم بأعلى معايير الشفافية والسرعة ، وتسعى لتخفيف الأعباء المالية عن العملاء وتمكينهم من تحقيق الإستقرار المالي والرفاهية المستدامة عبر منظومة رقمية متكاملة وبخبرة مصرفية وقانونية متخصصة",
    
    // Story
    "story_title": "قصتنا",
    "story_p1": "في ريفانس المالية بدأت حكايتنا من شغف حقيقي لصناعة فرق في حياة الناس؛ درسنا كيف يواجه الكثير من الأفراد تحديات مالية معقدة قد تعيق مسيرتهم، وكيف يمكن لحلول بسيطة ومدروسة أن تعيد لهم الأمل والاستقرار.",
    "story_p2": "من هنا وُلدت ريفانس، رؤية طموحة لتكون الجسر بين احتياجات الأفراد المالية والحلول العملية التي تراعي الأنظمة وتخدم الإنسان أولاً.",
    "story_p3": "تم تأسيس ريفانس لتقديم منظومة متكاملة من الخدمات المالية والاستشارية، تعتمد على فهم عميق لضوابط التمويل والتشريعات المعتمدة، وتُنفَّذ من خلال فريق متخصص يجمع بين الخبرة المصرفية والمعرفة القانونية والكفاءة التقنية.",

    // Why Rifans
    "why_eyebrow": "لماذا ريفانس؟",
    "why_title": "منصة متخصصة تفهم التزاماتك",
    "why_subtitle": "نعمل بمنهجية تجمع بين الخبرة المصرفية والقانونية والتقنية، لنقدّم لك حلولاً عملية وآمنة بعيداً عن الاجتهادات العشوائية.",
    "why_1_title": "خبرة مصرفية وقانونية معتمدة",
    "why_1_text": "فريق عمل يمتلك سنوات من الخبرة في البنوك والجهات التمويلية.",
    "why_2_title": "التزام كامل بالأنظمة والتعليمات",
    "why_2_text": "جميع الحلول حسب أنظمة وتعليمات البنك المركزي السعودي",
    "why_3_title": "متابعة شخصية لكل حالة",
    "why_3_text": "كل عميل له ملف مستقل، وخطة معالجة خاصة تناسب دخله.",
    "why_4_title": "سرية وخصوصية عالية",
    "why_4_text": "بياناتك الائتمانية والمالية محفوظة لدينا وفق أعلى معايير السرية.",

    // How it works
    "how_eyebrow": "رحلة العميل في ريفانس",
    "how_title": "كيف نعمل على معالجة التزاماتك المالية؟",
    "how_subtitle": "تعتمد ريفانس على منهجية عمل احترافية مبنية على خطوات مدروسة بعناية، تهدف إلى تقديم حلول مالية نظامية تحقق أفضل النتائج للعميل، مع ضمان أعلى درجات الدقة والمتابعة حتى إتمام المعالجة بشكل كامل.",
    "step_1_title": "١- استقبال الطلب وتحليل الالتزامات المالية",
    "step_1_text": "يتم استقبال طلب العميل ومراجعة جميع البيانات ذات العلاقة، بما في ذلك التقرير الائتماني، العقود التمويلية القائمة، مصادر الدخل، والالتزامات الشهرية، وذلك بهدف تكوين صورة شاملة ودقيقة عن الوضع المالي وتحديد نقطة الانطلاق المناسبة لمعالجة الالتزامات.",
    "step_2_title": "٢- دراسة فرص الحلول النظامية المتاحة",
    "step_2_text": "يقوم الفريق المختص بدراسة الخيارات المتاحة وفق الأنظمة والتعليمات المنظمة للقطاع المالي في المملكة العربية السعودية، بما يشمل حلول إعادة الجدولة، إعادة الهيكلة، أو التسويات الممكنة، بما يتوافق مع ضوابط Saudi Central Bank والأنظمة ذات العلاقة.",
    "step_3_title": "٣- التواصل مع الجهات التمويلية وتمثيل العميل",
    "step_3_text": "تتولى ريفانس مخاطبة الجهات التمويلية ذات العلاقة من بنوك وشركات تمويل، وإعداد المخاطبات الرسمية والاعتراضات النظامية اللازمة، مع متابعة الملف بشكل احترافي لضمان معالجة الطلب وفق الإجراءات النظامية المعتمدة.",
    "step_4_title": "٤- اعتماد الحل ومتابعة التنفيذ",
    "step_4_text": "بعد اعتماد الحل المناسب، تقوم ريفانس بمتابعة تنفيذ الإجراءات مع الجهات المعنية حتى يتم تطبيق القرار على حسابات العميل وتحديث البيانات في السجل الائتماني لدى SIMAH، بما يضمن اكتمال المعالجة بشكل رسمي ونهائي.",

    // Services
    "services_title": "خدمات ريفانس المالية",
    "srv_legal": "الخدمات القضائية والعدلية",
    "srv_legal_desc": "منظومة قانونية متخصصة لحماية حقوقك أمام الجهات القضائية، تشمل رفع الدعاوى المالية، ومعالجة ملفات التنفيذ، ورفع إيقاف الخدمات، وإعداد الاعتراضات القانونية وفق الأنظمة المعتمدة.",
    "srv_banking": "الخدمات المصرفية",
    "srv_banking_desc": "حلول مصرفية متكاملة لتنظيم تعاملاتك مع البنوك والجهات التمويلية، تشمل إعادة الجدولة وتسوية المديونيات وتأجيل الأقساط وإدارة البطاقات الائتمانية وفق ضوابط ساما.",
    "srv_realestate": "الخدمات العقارية",
    "srv_realestate_desc": "خدمات عقارية شاملة تغطي التقييم المعتمد، واستخراج الصكوك، والإفراغ، وعقود الإيجار الموحدة، والرهن العقاري، والوساطة، عبر منصة ناجز ومنصة إيجار الرسمية.",
    "srv_zakat": "الخدمات الزكوية والضريبية",
    "srv_zakat_desc": "دعم متخصص لأصحاب المنشآت في الالتزام الزكوي والضريبي، يشمل التسجيل، وإعداد الإقرارات، والاعتراض على الغرامات، والفوترة الإلكترونية، وفق أنظمة هيئة زاتكا.",
    "srv_credit": "الخدمات الائتمانية",
    "srv_credit_desc": "خدمات تحليلية لتحسين سجلك الائتماني ورفع تقييمك في سمة، تشمل تصحيح السجل، ودراسة الملاءة المالية، وتقديم توصيات ائتمانية مهنية لاستعادة جدارتك التمويلية.",
    "srv_consult": "الخدمات الاستشارية",
    "srv_consult_desc": "استشارات مالية وقانونية مهنية للأفراد والمنشآت، تشمل التخطيط المالي الشخصي، والاستشارات الاستثمارية، وإعادة الهيكلة المالية بإشراف خبراء متخصصين.",
    "srv_debt_solutions": "حلول المديونيات",
    "srv_debt_solutions_desc": "جدولة الديون، توحيد الالتزامات، ومعالجة التعثرات.",
    "srv_debt_waiver": "خدمات الإعفاء من المديونية",
    "srv_debt_waiver_desc": "دراسة طلبات الإعفاء من الالتزامات المالية وفق الضوابط.",
    "know_more": "اعرف المزيد",
    "goto_service": "الانتقال للخدمة",

    // Audience
    "aud_eyebrow": "لمن صُمّمت ريفانس؟",
    "aud_title": "نخدم شريحة واسعة من العملاء",
    "aud_subtitle": "سواءً كنت موظفاً، متقاعداً، صاحب منشأة صغيرة، أو مستثمراً، تم تصميم خدمات ريفانس لتلائم وضعك المالي والائتماني.",
    "aud_1_tag": "موظفون على رأس العمل",
    "aud_1_title": "التزامات متعددة ورواتب محدودة",
    "aud_1_text": "إذا كنت تحمل أكثر من تمويل، وبطاقة ائتمانية، وفواتير شهرية متراكمة.",
    "aud_2_tag": "متقاعدون",
    "aud_2_title": "دخل ثابت ومسؤوليات قائمة",
    "aud_2_text": "نعيد جدولة التزاماتك بما يتناسب مع راتب التقاعد.",
    "aud_3_tag": "أصحاب المنشآت",
    "aud_3_title": "منشآت صغيرة ومتوسطة",
    "aud_3_text": "نعالج قضايا الغرامات الزكوية والضريبية والالتزامات التمويلية.",

    // CTA
    "cta_title": "جاهز تبدأ أول خطوة لحل التزاماتك؟",
    "cta_text": "أرسل طلبك إلكترونياً، أو تواصل معنا عبر الواتساب لنساعدك في اختيار الخدمة الأنسب.",
    "cta_whatsapp": "تواصل عبر واتساب الآن",
    "cta_all_services": "تصفّح جميع الخدمات",

    // Platform
    "plat_eyebrow": "منصة رقمية",
    "plat_title": "كل شيء يتم إلكترونياً وبشكل منظم",
    "plat_subtitle": "ريفانس المالية تعتمد على نماذج رقمية وتقارير موحدة، مع أرشفة آمنة لكل المستندات.",
    "plat_1_title": "نماذج إلكترونية ذكية",
    "plat_1_text": "تعبئة بياناتك مرة واحدة فقط، ويتم استخدامها في جميع الطلبات.",
    "plat_2_title": "أرشفة ومتابعة",
    "plat_2_text": "حفظ المكاتبات والقرارات في ملف رقمي خاص بك.",
    "plat_3_title": "تحديثات مستمرة",
    "plat_3_text": "إشعارك بأي ردود أو مستجدات من الجهات التمويلية.",

    // Timeline
    "time_eyebrow": "مراحل الخدمة",
    "time_title": "من أول تواصل حتى إقفال الملف",
    "time_1_title": "١- تواصل وتسجيل الطلب",
    "time_1_text": "تبدأ رحلتك معنا من نموذج إلكتروني أو رسالة واتساب.",
    "time_2_title": "٢- دراسة الملف وإبرام اتفاق الخدمة",
    "time_2_text": "يتم تحليل وضعك المالي والائتماني، ثم مشاركة تفاصيل الخدمة.",
    "time_3_title": "٣- تنفيذ الإجراءات النظامية",
    "time_3_text": "إعداد ورفع الطلبات والمخاطبات والاعتراضات.",
    "time_4_title": "٤- إقفال الملف وتوثيق النتيجة",
    "time_4_text": "توثيق القرارات الصادرة وإقفال الملف بعد التأكد من التنفيذ.",
    "policy_acceptable_use": "سياسة الاستخدام المقبول",
    "policy_cookies": "سياسة ملفات تعريف الارتباط",
    "policy_intellectual_property": "سياسة الملكية الفكرية",
    "important_links": "روابط هامة",
    "about_rifans": "عن ريفانس",
    "privacy_policy": "سياسة الخصوصية",
    "terms_conditions": "الشروط والأحكام",
    "complaints_suggestions": "الشكاوي والاقتراحات",
    "contact_us": "تواصل معنا",
    "who_we_are": "من نحن",
    "our_goals": "أهدافنا",
    "our_vision": "رؤيتنا",
    "our_message": "رسالتنا",
    "our_mission": "مهمتنا",
    "services_guide": "دليل الخدمات",
  },
  en: {
    "policy_acceptable_use": "Acceptable Use Policy",
    "policy_cookies": "Cookie Policy",
    "policy_intellectual_property": "Intellectual Property Policy",
    "important_links": "Important Links",
    "about_rifans": "About Rifans",
    "privacy_policy": "Privacy Policy",
    "terms_conditions": "Terms & Conditions",
    "complaints_suggestions": "Complaints & Suggestions",
    "contact_us": "Contact Us",
    "who_we_are": "Who We Are",
    "our_goals": "Our Goals",
    "our_vision": "Our Vision",
    "our_message": "Our Message",
    "our_mission": "Our Mission",
    "services_guide": "Services Guide",
    // Header
    "login_register": "Login / Register",
    "my_profile": "My Profile",
    "theme_toggle": "Toggle Theme",
    "menu_open": "Menu",

    // Intro
    "intro_text": "Rifans Financial\nA Saudi limited liability company licensed by the Saudi Central Bank to provide IoT services for financial and insurance activities and other auxiliary activities for financial services, investment companies, and real estate consultations on a fee or contract basis.\n\nIt focuses on studying and processing individual requests in the banking sector, providing financing solutions, financial and credit consultations, adhering to the highest standards of transparency and speed, and seeking to alleviate financial burdens on clients and enable them to achieve financial stability and sustainable well-being through an integrated digital system with specialized banking and legal experience.",

    // Story
    "story_title": "Our Story",
    "story_p1": "At Rifans Financial, our story began with a genuine passion to make a difference in people's lives. We studied how many individuals face complex financial challenges that may hinder their progress, and how simple, well-thought-out solutions can restore hope and stability.",
    "story_p2": "From here, Rifans was born—an ambitious vision to be the bridge between individuals' financial needs and practical solutions that respect regulations and serve the human first.",
    "story_p3": "Rifans was established to provide an integrated system of financial and consulting services, based on a deep understanding of financing regulations and approved legislation, executed by a specialized team combining banking experience, legal knowledge, and technical competence.",

    // Why Rifans
    "why_eyebrow": "Why Rifans?",
    "why_title": "A specialized platform that understands your obligations",
    "why_subtitle": "We work with a methodology that combines banking, legal, and technical expertise to provide you with practical and safe solutions.",
    "why_1_title": "Certified Banking & Legal Expertise",
    "why_1_text": "A team with years of experience in banks and financing entities.",
    "why_2_title": "Full Compliance with Regulations",
    "why_2_text": "All solutions are based on Saudi Central Bank regulations and instructions.",
    "why_3_title": "Personalized Follow-up",
    "why_3_text": "Each client has an independent file and a treatment plan that suits their income.",
    "why_4_title": "High Confidentiality & Privacy",
    "why_4_text": "Your credit and financial data are kept with us according to the highest standards of confidentiality.",

    // How it works
    "how_eyebrow": "Client Journey",
    "how_title": "How do we process your financial obligations?",
    "how_subtitle": "Rifans relies on a professional work methodology based on carefully studied steps, aiming to provide systematic financial solutions that achieve the best results for the client, with a guarantee of the highest degrees of accuracy and follow-up until the processing is fully completed.",
    "step_1_title": "1. Request Receipt & Analysis of Financial Obligations",
    "step_1_text": "The client's request is received and all relevant data is reviewed, including the credit report, existing financing contracts, sources of income, and monthly obligations, with the aim of forming a comprehensive and accurate picture of the financial situation and determining the appropriate starting point for processing obligations.",
    "step_2_title": "2. Studying Available Systematic Solution Opportunities",
    "step_2_text": "The specialized team studies the options available according to the regulations and instructions governing the financial sector in the Kingdom of Saudi Arabia, including rescheduling, restructuring, or possible settlements, in accordance with Saudi Central Bank regulations and relevant systems.",
    "step_3_title": "3. Communication with Financing Entities & Client Representation",
    "step_3_text": "Rifans handles contacting the relevant financing entities from banks and financing companies, and preparing the necessary official correspondence and systematic objections, while following up on the file professionally to ensure the request is processed according to the approved systematic procedures.",
    "step_4_title": "4. Approval of the Solution & Implementation Follow-up",
    "step_4_text": "After the appropriate solution is approved, Rifans follows up on the implementation of procedures with the relevant authorities until the decision is applied to the client's accounts and the data is updated in the credit record at SIMAH, ensuring the completion of the processing officially and finally.",

    // Services
    "services_title": "Rifans Financial Services",
    "srv_legal": "Legal & Judicial Services",
    "srv_legal_desc": "Specialized legal services protecting your rights before judicial bodies — including filing financial lawsuits, processing execution files, lifting service suspensions, and preparing legal objections under approved regulations.",
    "srv_banking": "Banking Services",
    "srv_banking_desc": "Comprehensive banking solutions for managing your dealings with banks and financing entities — including rescheduling, debt settlement, installment deferral, and credit card management under SAMA regulations.",
    "srv_realestate": "Real Estate Services",
    "srv_realestate_desc": "Full real estate services covering certified valuation, deed issuance, property transfer, unified lease contracts, mortgages, and brokerage — through Najiz and the official Ejar platform.",
    "srv_zakat": "Zakat & Tax Services",
    "srv_zakat_desc": "Specialized support for businesses with zakat and tax compliance — including registration, returns preparation, fines objection, and e-invoicing — in accordance with ZATCA regulations.",
    "srv_credit": "Credit Services",
    "srv_credit_desc": "Analytical services to improve your credit record and raise your SIMAH score — including record correction, solvency analysis, and professional credit recommendations to restore your financing eligibility.",
    "srv_consult": "Consulting Services",
    "srv_consult_desc": "Professional financial and legal consulting for individuals and enterprises — including personal financial planning, investment advisory, and corporate financial restructuring under expert supervision.",
    "srv_debt_solutions": "Debt Solutions",
    "srv_debt_solutions_desc": "Debt rescheduling, consolidation, and settlement.",
    "srv_debt_waiver": "Debt Waiver Services",
    "srv_debt_waiver_desc": "Studying debt waiver requests according to regulations.",
    "know_more": "Learn More",
    "goto_service": "Go to Service",

    // Audience
    "aud_eyebrow": "Who is Rifans for?",
    "aud_title": "We serve a wide segment of clients",
    "aud_subtitle": "Whether you are an employee, retiree, small business owner, or investor, Rifans services are designed to suit your financial situation.",
    "aud_1_tag": "Active Employees",
    "aud_1_title": "Multiple obligations, limited salary",
    "aud_1_text": "If you have more than one loan, credit card, and accumulated monthly bills.",
    "aud_2_tag": "Retirees",
    "aud_2_title": "Fixed income, ongoing responsibilities",
    "aud_2_text": "We reschedule your obligations to fit your retirement pension.",
    "aud_3_tag": "Business Owners",
    "aud_3_title": "SMEs",
    "aud_3_text": "We handle Zakat and Tax fine issues and financing obligations.",

    // CTA
    "cta_title": "Ready to take the first step?",
    "cta_text": "Submit your request electronically, or contact us via WhatsApp to help you choose the most suitable service.",
    "cta_whatsapp": "Contact via WhatsApp",
    "cta_all_services": "Browse All Services",

    // Platform
    "plat_eyebrow": "Digital Platform",
    "plat_title": "Everything is electronic and organized",
    "plat_subtitle": "Rifans Financial relies on digital forms and unified reports, with secure archiving for all documents.",
    "plat_1_title": "Smart Electronic Forms",
    "plat_1_text": "Fill in your data once, and it is used for all requests.",
    "plat_2_title": "Archiving & Tracking",
    "plat_2_text": "Save correspondence and decisions in your private digital file.",
    "plat_3_title": "Continuous Updates",
    "plat_3_text": "Notify you of any responses or updates from financing entities.",

    // Timeline
    "time_eyebrow": "Service Stages",
    "time_title": "From first contact to file closure",
    "time_1_title": "1. Contact & Registration",
    "time_1_text": "Your journey begins with an electronic form or WhatsApp message.",
    "time_2_title": "2. File Study & Agreement",
    "time_2_text": "Your financial status is analyzed, then service details are shared.",
    "time_3_title": "3. Implementation",
    "time_3_text": "Preparing and submitting requests, correspondence, and objections.",
    "time_4_title": "4. Closure & Documentation",
    "time_4_text": "Documenting issued decisions and closing the file after ensuring implementation.",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    // Load from local storage
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && (storedLang === 'ar' || storedLang === 'en')) {
      setLanguage(storedLang);
    }
  }, []);

  useEffect(() => {
    // Update document attributes
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction: language === 'ar' ? 'rtl' : 'ltr', toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
