import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-[90] w-[50px] h-[50px] rounded-full bg-brand dark:bg-white text-gold dark:text-brand border border-gold/40 shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center justify-center transition-all duration-500 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
      } hover:scale-110 hover:shadow-[0_15px_35px_rgba(199,169,105,0.35)] active:scale-95`}
      aria-label="Back to Top"
    >
      <ArrowUp size={24} strokeWidth={2.5} />
      {/* Pulse ring effect */}
      <span className="absolute inset-0 rounded-full border border-gold opacity-0 animate-ping"></span>
    </button>
  );
};

export default BackToTop;