import React, { useState, useEffect } from 'react';
import { Menu, User, Sun, Moon } from 'lucide-react';
import SideMenu from './SideMenu';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import Logo from './Logo';
import { getMyNotifications } from '../../lib/api';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, token } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    if (user && token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 120000);
      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearInterval(interval);
      };
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, token]);

  const fetchUnreadCount = async () => {
    try {
      const data = await getMyNotifications();
      const unread = data.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAuth = () => {
    window.dispatchEvent(new CustomEvent('open-auth'));
  };

  const handleOpenDashboard = () => {
    window.location.hash = '#/dashboard';
  };

  const handleOpenAdmin = () => {
    window.location.hash = '#/admin';
  };

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 h-[72px] flex items-center
        ${isScrolled ? 'bg-white/80 dark:bg-brand/80 backdrop-blur-xl border-b border-gold/20 shadow-lg' : 'bg-transparent'}`}>
        
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Right: User Actions (RTL: Right edge) */}
          <div className="flex-1 flex items-center justify-start gap-3 order-1">
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                  <button 
                    onClick={handleOpenAdmin} 
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-brand text-gold hover:bg-brand/90 transition-all shadow-md"
                  >
                    <span className="hidden md:block text-[9px] font-black uppercase">لوحة الإدارة</span>
                  </button>
                )}
                <button 
                  onClick={handleOpenDashboard} 
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-all group relative"
                >
                  <span className="hidden md:block text-[10px] font-bold">{user.fullName || user.name || 'حسابي'}</span>
                  <User size={16} className="group-hover:rotate-12 transition-transform" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-brand animate-pulse"></span>
                  )}
                </button>
              </div>
            ) : (
              <button 
                onClick={handleOpenAuth} 
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 border
                  ${isScrolled ? 'border-gold/50 text-brand dark:text-gold hover:bg-gold/10' : 'border-white/50 text-white/85 hover:bg-white/10'} whitespace-nowrap`}
              >
                {t('login_register')}
              </button>
            )}
          </div>

          {/* Center: Logo */}
          <a href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); }} className="flex-shrink-0 flex items-center justify-center order-2 transition-transform hover:scale-105 active:scale-95 mx-4">
            <Logo className="w-[150px] md:w-[200px] h-auto" variant={isScrolled ? "default" : "white"} />
          </a>

          {/* Left: Menu & Controls (RTL: Left edge) */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-4 order-3">
            <div className="hidden md:flex items-center gap-2">
              <button onClick={toggleLanguage} className="w-10 h-10 flex items-center justify-center font-bold text-xs rounded-xl transition-all hover:bg-gold/10 text-brand dark:text-gold">
                {language === 'ar' ? 'EN' : 'ع'}
              </button>
              <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-gold/10 text-brand dark:text-gold">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-xl transition-all hover:bg-gold/10 group text-brand dark:text-gold">
              <Menu size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;