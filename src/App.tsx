import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/rifans/Header';
import IntroVideo from './components/rifans/IntroVideo';
import Hero from './components/rifans/Hero';
import About from './components/rifans/About';
import Calculator from './components/rifans/Calculator';
import Performance from './components/rifans/Performance';
import FAQ from './components/rifans/FAQ';
import Footer from './components/rifans/Footer';
import WaiveServices from './components/rifans/WaiveServices';
import Services from './components/rifans/Services';
import BackToTop from './components/rifans/BackToTop';
import { Section, SectionHeader, Card, Button, StripContainer } from './components/rifans/Shared';
import { Check, Scale, MessageCircle, Lock, Monitor, FileText, Bell, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage, LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import samaCmaLogos from './assets/sama-cma-logos.jpeg';
import FloatingWhatsApp from './components/rifans/FloatingWhatsApp';
import CompanyIntro from './components/rifans/CompanyIntro';
import { Terms, Privacy, Complaints, Contact, AboutPage, GoalPage, VisionPage, MessagePage, MissionPage, ServicesPage, AcceptableUse, CookiePolicy, IntellectualProperty } from './components/rifans/StaticPages';
import { ServiceDetailPage } from './components/rifans/ServiceDetailPage';
import WaiveRequestForm from './components/rifans/WaiveRequestForm';
import AuthPage from './components/rifans/AuthPage';
import AdminDashboard from './components/rifans/AdminDashboard';
import CustomerDashboard from './components/rifans/CustomerDashboard';
import ContractPage from './components/rifans/ContractPage';
import InvoicePage from './components/rifans/InvoicePage';
import ClientCard from './components/rifans/ClientCard';
import ProfileCompletionModal from './components/rifans/ProfileCompletionModal';

const StorySection = () => {
  const { t, direction } = useLanguage();
  return (
    <Section id="story">
      <Card className="bg-story-gradient dark:bg-none dark:bg-[#1a0520] border-gold/90 shadow-xl">
        <h2 className={`text-xl font-bold text-brand dark:text-gold mb-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} transition-colors tracking-tight`}>{t('story_title')}</h2>
        <div className={`space-y-3 text-sm leading-relaxed text-muted dark:text-gray-300 ${direction === 'rtl' ? 'text-right' : 'text-left'} transition-colors`}>
          <p>{t('story_p1')}</p>
          <p>{t('story_p2')}</p>
          <p>{t('story_p3')}</p>
        </div>
      </Card>
    </Section>
  );
};

const WhySection = () => {
  const { t } = useLanguage();
  return (
    <Section id="why-rv">
      <Card>
        <SectionHeader eyebrow={t('why_eyebrow')} title={t('why_title')} subtitle={t('why_subtitle')} />
        <div className="grid grid-cols-1 gap-2.5">
          {[
            { icon: <Check size={14} />, title: t('why_1_title'), text: t('why_1_text') },
            { icon: <Scale size={14} />, title: t('why_2_title'), text: t('why_2_text') },
            { icon: <MessageCircle size={14} />, title: t('why_3_title'), text: t('why_3_text') },
            { icon: <Lock size={14} />, title: t('why_4_title'), text: t('why_4_text') }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-white to-[#F6F0E4] border border-gold/70 flex items-center justify-center text-gold shrink-0">{item.icon}</div>
              <div>
                <div className="text-sm font-bold text-brand dark:text-gray-100 mb-0.5 transition-colors">{item.title}</div>
                <div className="text-xs text-muted dark:text-gray-400 transition-colors">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
};

const AudienceSection = () => {
  const { t, direction } = useLanguage();
  const audienceItems = [
    { tag: t('aud_1_tag'), title: t('aud_1_title'), text: t('aud_1_text') },
    { tag: t('aud_2_tag'), title: t('aud_2_title'), text: t('aud_2_text') },
    { tag: t('aud_3_tag'), title: t('aud_3_title'), text: t('aud_3_text') },
  ];
  const [isPaused, setIsPaused] = useState(false);
  return (
    <Section id="audience">
      <Card className="overflow-hidden">
        <SectionHeader eyebrow={t('aud_eyebrow')} title={t('aud_title')} subtitle={t('aud_subtitle')} />
        <div className="relative w-full overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          <motion.div className="flex gap-4" animate={isPaused ? {} : { x: direction === 'rtl' ? ["50%", "0%"] : ["0%", "-50%"] }} transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 25, ease: "linear" } }} style={{ width: 'max-content' }}>
            {[...audienceItems, ...audienceItems].map((item, i) => (
              <div key={i} className="min-w-[210px] max-w-[210px] bg-white dark:bg-[#12031a] rounded-[18px] border border-gold/70 dark:border-white/10 p-3 shadow-sm transition-colors">
                <div className="text-[11px] text-gold mb-1">{item.tag}</div>
                <div className="text-[13px] font-extrabold text-brand dark:text-gray-100 mb-1 transition-colors">{item.title}</div>
                <div className="text-[12px] text-muted dark:text-gray-400 transition-colors">{item.text}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </Card>
    </Section>
  );
};

const CTASection = () => {
  const { t } = useLanguage();
  return (
    <Section id="cta-block">
      <Card className="bg-gradient-to-br from-[#FFFDF5] to-[#F6ECD4] dark:from-[#1a0b25] dark:to-[#0f0216] border-gold/90 shadow-xl">
        <div className="flex flex-col gap-2.5">
          <div>
            <div className="text-[14px] font-extrabold text-brand dark:text-gold transition-colors">{t('cta_title')}</div>
            <div className="text-[12px] text-muted dark:text-gray-300 mt-1 transition-colors">{t('cta_text')}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="https://wa.me/9668002440432" target="_blank" rel="noopener noreferrer"><Button>{t('cta_whatsapp')}</Button></a>
            <a href="#/services" target="_blank" rel="noopener noreferrer"><Button variant="ghost">{t('cta_all_services')}</Button></a>
          </div>
        </div>
      </Card>
    </Section>
  );
};

const PlatformSection = () => {
  const { t } = useLanguage();
  return (
    <Section id="platform">
      <Card>
        <SectionHeader eyebrow={t('plat_eyebrow')} title={t('plat_title')} subtitle={t('plat_subtitle')} />
        <div className="grid grid-cols-1 gap-2">
          {[
            { icon: <FileText size={16} />, title: t('plat_1_title'), text: t('plat_1_text') },
            { icon: <Monitor size={16} />, title: t('plat_2_title'), text: t('plat_2_text') },
            { icon: <Bell size={16} />, title: t('plat_3_title'), text: t('plat_3_text') },
          ].map((item, i) => (
            <div key={i} className="rounded-[14px] bg-white dark:bg-[#12031a] border border-gold/50 dark:border-white/10 p-2.5 flex items-start gap-2 transition-colors">
              <div className="text-gold pt-0.5">{item.icon}</div>
              <div>
                <div className="text-[13px] font-extrabold text-brand dark:text-gray-100 mb-0.5 transition-colors">{item.title}</div>
                <div className="text-[12px] text-muted dark:text-gray-400 transition-colors">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
};

const TimelineSection = () => {
  const { t, direction } = useLanguage();
  return (
    <Section id="timeline">
      <Card>
        <SectionHeader eyebrow={t('time_eyebrow')} title={t('time_title')} />
        <div className={`relative flex flex-col gap-2 ${direction === 'rtl' ? 'pr-2' : 'pl-2'}`}>
          <div className={`absolute top-1 ${direction === 'rtl' ? 'right-[11px]' : 'left-[11px]'} w-[2px] h-full bg-gold/50`} />
          {[
            { title: t('time_1_title'), text: t('time_1_text') },
            { title: t('time_2_title'), text: t('time_2_text') },
            { title: t('time_3_title'), text: t('time_3_text') },
            { title: t('time_4_title'), text: t('time_4_text') },
          ].map((item, i) => (
            <div key={i} className={`relative ${direction === 'rtl' ? 'pr-6' : 'pl-6'}`}>
              <div className={`w-[10px] h-[10px] rounded-full bg-gold absolute ${direction === 'rtl' ? 'right-[7px]' : 'left-[7px]'} top-[5px] shadow-[0_0_0_4px_rgba(199,169,105,0.25)] z-10`} />
              <div className="text-[13px] font-extrabold text-brand dark:text-gray-100 mb-0.5 transition-colors">{item.title}</div>
              <div className="text-[12px] text-muted dark:text-gray-400 transition-colors">{item.text}</div>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  );
};

const LoginPrompt: React.FC = () => {
  const handleOpenAuth = () => {
    window.dispatchEvent(new CustomEvent('open-auth'));
  };
  return (
    <div className="max-w-[520px] mx-auto px-4 py-10 text-center">
      <div className="flex items-center justify-center gap-3 mb-5">
        <span className="h-[1px] w-10 bg-gold/40" />
        <Lock size={20} className="text-gold" />
        <span className="h-[1px] w-10 bg-gold/40" />
      </div>
      <p className="text-sm text-muted dark:text-gray-300 leading-relaxed mb-6 transition-colors">
        لتصفح الموقع والاطلاع على جميع الأقسام والخدمات
        <br />
        يرجى تسجيل الدخول
      </p>

      {/* SAMA & CMA Logos */}
      <div className="flex justify-center mb-4">
        <img src={samaCmaLogos} alt="البنك المركزي السعودي وهيئة السوق المالية" className="h-20 w-auto object-contain" />
      </div>

      <div className="text-center mb-6 space-y-1">
        <p className="text-sm font-black text-brand dark:text-white">ريفانس المالية | Revans Finance</p>
        <p className="text-xs text-brand dark:text-purple-300 font-medium">مرخصة من قِبل البنك المركزي السعودي</p>
        <p className="text-xs text-brand dark:text-purple-300 font-medium">خاضعة لإشراف ورقابة هيئة السوق المالية</p>
        <p className="text-[10px] text-brand dark:text-purple-400 mt-2 font-bold">جميع الحقوق محفوظة | ريفانس المالية 2026</p>
      </div>

      <button
        onClick={handleOpenAuth}
        className="px-6 py-2.5 rounded-xl bg-gold text-brand font-bold text-sm hover:bg-gold/90 transition-all active:scale-95 shadow-md"
      >
        تسجيل الدخول
      </button>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  return (
    <>
      <Header />
      <IntroVideo />
      <CompanyIntro />
      {user ? (
        <div className="relative z-10">
          <About />
          <StorySection />
          <WhySection />
          <Services />
          <Performance />
          <Calculator />
          <AudienceSection />
          <WaiveServices />
          <FAQ />
          <CTASection />
          <TimelineSection />
          <Footer />
        </div>
      ) : (
        <LoginPrompt />
      )}
      <BackToTop />
    </>
  );
};

const AppContent: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);
  const [showAuth, setShowAuth] = useState(false);
  const [waivePrefill, setWaivePrefill] = useState<any>(null);
  const [showWaiveForm, setShowWaiveForm] = useState(false);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const { user, logout } = useAuth();

  // Show warning modal on first login
  useEffect(() => {
    if (user) {
      const warningShown = sessionStorage.getItem('login_warning_shown');
      if (!warningShown) {
        setShowLoginWarning(true);
        sessionStorage.setItem('login_warning_shown', 'true');
      }
    }
  }, [user]);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleOpenAuth = () => setShowAuth(true);
    const handleOpenWaiveForm = (e: any) => {
      setWaivePrefill(e.detail);
      setShowWaiveForm(true);
    };
    window.addEventListener('open-auth', handleOpenAuth);
    window.addEventListener('open-waive-form', handleOpenWaiveForm);
    return () => {
      window.removeEventListener('open-auth', handleOpenAuth);
      window.removeEventListener('open-waive-form', handleOpenWaiveForm);
    };
  }, []);

  const getComponent = () => {
    if (route.startsWith('#/service/')) {
      const fullType = route.replace('#/service/', '');
      const [type, subType] = fullType.split('/');
      return <ServiceDetailPage type={type} subType={subType} />;
    }
    if (route.startsWith('#/contract/')) {
      const submissionId = route.replace('#/contract/', '');
      return user ? <ContractPage submissionId={submissionId} onClose={() => window.location.hash = '#/dashboard?tab=contracts'} /> : <LandingPage />;
    }
    if (route.startsWith('#/invoice/')) {
      const submissionId = route.replace('#/invoice/', '');
      return user ? <InvoicePage submissionId={submissionId} onClose={() => window.location.hash = '#/dashboard?tab=contracts'} /> : <LandingPage />;
    }
    switch(route) {
      case '#/services': return <ServicesPage />;
      case '#/terms': return <Terms />;
      case '#/privacy': return <Privacy />;
      case '#/complaints': return <Complaints />;
      case '#/contact': return <Contact />;
      case '#/about': return <AboutPage />;
      case '#/goal': return <GoalPage />;
      case '#/vision': return <VisionPage />;
      case '#/message': return <MessagePage />;
      case '#/mission': return <MissionPage />;
      case '#/acceptable-use': return <AcceptableUse />;
      case '#/cookies': return <CookiePolicy />;
      case '#/intellectual-property': return <IntellectualProperty />;
      case '#/waive-landing': return <LandingPage />;
      case '#/client-card': return <ClientCard />;
      case '#/admin': return user?.role === 'admin' ? <AdminDashboard onClose={() => { window.location.hash = '#/';}} /> : <LandingPage />;
      case '#/dashboard': return user ? <CustomerDashboard user={{ id: user.id, fullName: '', email: '', nationalId: user.national_id || '', mobile: user.phone || '', joinDate: new Date().toISOString() }} onClose={() => { window.location.hash = '#/';}} onLogout={logout} /> : <LandingPage />;
      default: return <LandingPage />;
    }
  };

  return (
    <main key={route} className="w-full max-w-full overflow-x-hidden mx-auto min-h-screen bg-page dark:bg-[#06010a] transition-colors duration-300">
      {getComponent()}
      {showAuth && !user && <AuthPage onClose={() => setShowAuth(false)} />}
      {showWaiveForm && <WaiveRequestForm prefill={waivePrefill} onClose={() => { setShowWaiveForm(false); setWaivePrefill(null); }} />}
      <ProfileCompletionModal />
    </main>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </LanguageProvider>
);

export default App;
