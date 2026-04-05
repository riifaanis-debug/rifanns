import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import samaCmaLogos from '../../assets/sama-cma-logos.jpeg';

const Footer: React.FC = () => {
  const { t, direction } = useLanguage();

  return (
    <footer className="w-full mt-auto pt-16 pb-8 bg-[#FDFDFF] dark:bg-[#08020c] border-t border-gold/10 relative overflow-hidden">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      
      <div className="max-w-[520px] mx-auto px-6 relative z-10">
        
        {/* Social Links - Refined */}
        <div className="flex justify-center items-center gap-2 mb-12 overflow-x-auto pb-2 scrollbar-hide">
            <SocialLink href="https://wa.me/message/JTZH5YWVJJLON1" icon="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/600px-WhatsApp.svg.png" label="WhatsApp" />
            <SocialLink href="https://x.com/rifaniis" icon="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/X_logo_2023.svg/600px-X_logo_2023.svg.png" label="X" />
            
            <SocialLink href="https://www.snapchat.com/add/rifaniis" icon="https://upload.wikimedia.org/wikipedia/en/thumb/c/c4/Snapchat_logo.svg/600px-Snapchat_logo.svg.png" label="Snapchat" />
            <SocialLink href="https://www.instagram.com/rifaniis" icon="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/600px-Instagram_icon.png" label="Instagram" />
            <SocialLink href="mailto:info@rifans.net" icon="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/600px-Gmail_icon_%282020%29.svg.png" label="Email" />
        </div>

        {/* Links Grid */}
        <div className={`flex ${direction === 'rtl' ? 'justify-start' : 'justify-end'} mb-16`}>
            <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                <h3 className={`text-[13px] font-black text-brand dark:text-white mb-5 flex items-center gap-2 ${direction === 'rtl' ? 'justify-start' : 'justify-start'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  {t('important_links')}
                </h3>
                <ul className="space-y-4">
                    <li><FooterLink href="#/terms">{t('terms_conditions')}</FooterLink></li>
                    <li><FooterLink href="#/privacy">{t('privacy_policy')}</FooterLink></li>
                    <li><FooterLink href="#/acceptable-use">{t('policy_acceptable_use')}</FooterLink></li>
                    <li><FooterLink href="#/cookies">{t('policy_cookies')}</FooterLink></li>
                    <li><FooterLink href="#/intellectual-property">{t('policy_intellectual_property')}</FooterLink></li>
                    <li><FooterLink href="#/complaints">{t('complaints_suggestions')}</FooterLink></li>
                    <li><FooterLink href="#/contact">{t('contact_us')}</FooterLink></li>
                </ul>
            </div>
        </div>

        {/* Trust & Licensing */}
        <div className="mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold/30 to-brand/30 rounded-[32px] blur-md opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white/80 dark:bg-[#12031a]/80 backdrop-blur-xl rounded-[28px] p-8 border border-gold/20 shadow-xl flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
                <a href="https://www.raed.net/" target="_blank" rel="noopener noreferrer" title="https://www.raed.net/">
                  <img 
                    src="https://www.raed.net/img?id=1528586" 
                    alt="Rifans Financial" 
                    className="w-[160px] h-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </a>
                <div className="h-10 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
              </div>
              <div className="text-center">
                <h3 className="text-[16px] font-black text-brand dark:text-gold mb-1 uppercase tracking-wider">التراخيص والرقابة</h3>
                <p className="text-[12px] text-muted dark:text-gray-400 font-medium max-w-[320px] mx-auto leading-relaxed">
                  مرخصة من البنك المركزي السعودي
                  <br />
                  وخاضعة لإشراف ورقابة هيئة السوق المالية
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <img 
                  src={samaCmaLogos}
                  alt="البنك المركزي السعودي وهيئة السوق المالية" 
                  className="h-12 w-auto object-contain rounded-md" 
                />
                <span className="text-[10px] font-bold text-muted dark:text-gray-400 uppercase tracking-widest">آمن وموثوق</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-gold/10">
            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] text-brand/40 dark:text-gray-500 font-bold uppercase tracking-widest">
                © 2025 Rifans Financial. All Rights Reserved.
              </p>
              <p className="text-[11px] text-brand dark:text-gold font-black">
                جميع الحقوق محفوظة | ريفانس المالية
              </p>
            </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink: React.FC<{ href: string; icon: string; label: string }> = ({ href, icon, label }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    aria-label={label} 
    className="w-10 h-10 rounded-full bg-white dark:bg-white border border-[#C7A969] flex items-center justify-center shadow-sm hover:bg-[#22042C] hover:border-[#22042C] transition-all duration-300 group overflow-hidden shrink-0"
  >
    <img 
      src={icon} 
      alt={label} 
      className="w-5 h-5 object-contain group-hover:brightness-0 group-hover:invert transition-all duration-300" 
      referrerPolicy="no-referrer"
    />
  </a>
);

const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} className="text-xs font-medium text-muted hover:text-gold transition-colors block hover:translate-x-1 duration-200">
        {children}
    </a>
);

export default Footer;
