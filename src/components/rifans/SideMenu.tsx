
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Logo from './Logo';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  href: string;
  highlight?: boolean;
}

const menuItems: MenuItem[] = [
  { label: 'الصفحة الرئيسية', href: '#/' },
  { label: 'احصل على استشارة', href: '#/contact', highlight: true },
  { label: 'من نحن', href: '#/about' },
  { label: 'اتصل بنا', href: '#/contact' },
  { label: 'الخدمات القضائية والعدلية', href: '#/service/legal' },
  { label: 'الخدمات المصرفية', href: '#/service/banking' },
  { label: 'الخدمات العقارية', href: '#/service/realestate' },
  { label: 'الخدمات الزكوية والضريبية', href: '#/service/zakat' },
  { label: 'الخدمات الائتمانية', href: '#/service/credit' },
  { label: 'الخدمات الاستشارية', href: '#/service/consulting' },
];

const socialLinks = [
    { href: "https://wa.me/message/JTZH5YWVJJLON1", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/600px-WhatsApp.svg.png", label: "WhatsApp" },
    { href: "https://x.com/rifaniis", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/X_logo_2023.svg/600px-X_logo_2023.svg.png", label: "X" },
    
    { href: "https://www.snapchat.com/add/rifaniis", icon: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c4/Snapchat_logo.svg/600px-Snapchat_logo.svg.png", label: "Snapchat" },
    { href: "https://www.instagram.com/rifaniis", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/600px-Instagram_icon.png", label: "Instagram" },
    { href: "mailto:info@rifans.net", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/600px-Gmail_icon_%282020%29.svg.png", label: "Email" },
];

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleLinkClick = () => {
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-[320px] h-full bg-white dark:bg-brand shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gold/10">
           <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-muted hover:text-brand hover:bg-gray-50 dark:hover:bg-white/10 rounded-xl transition-colors">
             <X size={24} />
           </button>
           <Logo className="w-[180px] h-auto" />
        </div>
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
            {menuItems.map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.href} 
                  onClick={handleLinkClick}
                  className={`block px-8 py-4 text-sm font-black transition-all text-right border-r-4
                    ${item.highlight 
                      ? 'text-gold bg-gold/5 border-gold' 
                      : 'text-brand dark:text-white hover:bg-gold/5 border-transparent hover:border-gold/30'
                    }`}
                >
                    {item.label}
                </a>
            ))}
        </div>
        <div className="p-8 bg-gray-50 dark:bg-black/40 border-t border-gold/10 flex flex-col items-center">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-brand/40 dark:text-gold/40 mb-6">RIFANS FINANCIAL</div>
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full">
                {socialLinks.map((link, i) => (
                    <a 
                      key={i} 
                      href={link.href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label={link.label}
                      className="w-10 h-10 rounded-full bg-white dark:bg-white border border-[#C7A969] flex items-center justify-center shadow-sm hover:bg-[#22042C] hover:border-[#22042C] transition-all duration-300 group overflow-hidden shrink-0"
                    >
                        <img 
                          src={link.icon} 
                          alt={link.label} 
                          className="w-5 h-5 object-contain group-hover:brightness-0 group-hover:invert transition-all duration-300" 
                          referrerPolicy="no-referrer"
                        />
                    </a>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
