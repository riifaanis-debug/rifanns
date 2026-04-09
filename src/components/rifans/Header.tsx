import React, { useState, useEffect, useRef } from 'react';
import { Menu, User, Sun, Moon, Bell, X } from 'lucide-react';
import SideMenu from './SideMenu';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import Logo from './Logo';
import { getMyNotifications, markAllNotificationsRead } from '../../lib/api';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, token } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    if (user && token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 120000);
      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearInterval(interval);
      };
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
      const unread = data.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNotifications = async () => {
    if (!showNotifications) {
      await fetchNotifications();
    }
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
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
                </button>
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={handleToggleNotifications}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative
                      ${isScrolled ? 'bg-brand/10 text-brand dark:text-gold hover:bg-brand/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute top-12 left-0 md:left-auto md:right-0 w-[320px] max-h-[400px] bg-white dark:bg-[#12031a] rounded-2xl shadow-2xl border border-gold/20 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                      <div className="flex items-center justify-between p-3 border-b border-gold/10">
                        <h3 className="text-[13px] font-bold text-brand dark:text-gold">التنبيهات</h3>
                        <button onClick={() => setShowNotifications(false)} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                          <X size={12} />
                        </button>
                      </div>
                      <div className="overflow-y-auto max-h-[340px] custom-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 20).map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-3 border-b border-gray-50 dark:border-white/5 text-right transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${!n.is_read ? 'bg-gold/5' : ''}`}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-gold' : 'bg-gray-300 dark:bg-white/20'}`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-bold text-brand dark:text-white truncate">{n.title}</p>
                                  <p className="text-[11px] text-muted leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                                  <p className="text-[9px] text-muted/60 mt-1">{getTimeAgo(n.created_at)}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-muted">
                            <Bell size={24} className="mx-auto mb-2 opacity-20" />
                            <p className="text-[11px]">لا توجد تنبيهات</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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

            {user && (
              <button onClick={() => setIsMenuOpen(true)} className={`p-2 rounded-xl transition-all hover:bg-gold/10 group ${isScrolled ? 'text-brand dark:text-gold' : 'text-white/85'}`}>
                <Menu size={24} className="group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </header>

      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;