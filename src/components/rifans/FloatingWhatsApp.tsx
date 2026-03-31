import React from 'react';
import { MessageCircle } from 'lucide-react';

const FloatingWhatsApp: React.FC = () => {
  return (
    <div className="fixed bottom-6 left-6 z-[100] group">
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-brand text-gold text-[11px] font-black rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 whitespace-nowrap pointer-events-none border border-gold/20">
        تحدث مع مستشارك المالي
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-brand"></div>
      </div>

      {/* Main Button */}
      <a
        href="https://wa.me/message/JTZH5YWVJJLON1"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-[60px] h-[60px] bg-white dark:bg-[#22042C] rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-[#C7A969] hover:bg-[#22042C] hover:border-[#22042C] transition-all duration-500 group"
        aria-label="تواصل معنا عبر واتساب"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-[#C7A969]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="text-[#22042C] dark:text-gold group-hover:text-white transition-colors duration-300 relative z-10">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/600px-WhatsApp.svg.png" 
            alt="WhatsApp" 
            className="w-[32px] h-[32px] object-contain group-hover:scale-110 transition-all duration-300" 
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Notification Badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-brand animate-bounce shadow-lg z-20">
          1
        </span>

        {/* Pulse effect rings */}
        <span className="absolute inset-0 rounded-full border-2 border-gold/50 opacity-0 animate-[ping_2s_infinite]"></span>
        <span className="absolute inset-0 rounded-full border border-gold/30 opacity-0 animate-[ping_3s_infinite]"></span>
      </a>
    </div>
  );
};

export default FloatingWhatsApp;