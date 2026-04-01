import React from 'react';
import rifansLogo from '../../assets/rifans-logo.png';
interface LogoProps {
  className?: string;
  variant?: 'default' | 'white' | 'gold';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-14", variant = 'default', showText = true }) => {
  const isWhite = variant === 'white';
  const isGold = variant === 'gold';
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* The Full Transparent PNG Logo */}
        <img 
          src="https://h.top4top.io/p_37364r3kd1.png" 
          alt="Rifans Financial Transparent Logo" 
          className={`max-w-full max-h-full object-contain transition-all duration-500 
            ${isWhite 
              ? 'brightness-0 invert' 
              : isGold
                ? 'brightness-110 contrast-125'
                : 'dark:brightness-110 dark:contrast-110'
            }
          `}
          referrerPolicy="no-referrer"
        />
        
        {/* Subtle glow to enhance the gold effect in dark mode */}
        <div className="absolute inset-0 bg-gold/5 blur-2xl rounded-full opacity-0 dark:opacity-30 pointer-events-none" />
      </div>
    </div>
  );
};

export default Logo;
