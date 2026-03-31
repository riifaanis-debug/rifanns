import React, { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`rounded-[18px] border border-gold/45 shadow-[0_12px_30px_rgba(0,0,0,0.08)] bg-card-gradient dark:bg-none dark:bg-dark-card dark:border-white/10 overflow-hidden transition-colors duration-300 ${noPadding ? '' : 'p-4'} ${className}`}>
      {children}
    </div>
  );
};

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ id, children, className = '' }) => {
  return (
    <section id={id} className={`max-w-[520px] mx-auto px-3.5 pt-4 scroll-mt-[90px] ${className}`}>
      {children}
    </section>
  );
};

interface SectionHeaderProps {
  eyebrow?: string;
  title?: string;
  subtitle?: ReactNode;
  align?: 'right' | 'center' | 'left';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ eyebrow, title, subtitle, align }) => {
  const { direction } = useLanguage();
  
  // Determine alignment based on props or direction
  let textAlignClass = '';
  if (align) {
    if (align === 'center') textAlignClass = 'text-center';
    else if (align === 'right') textAlignClass = 'text-right';
    else textAlignClass = 'text-left';
  } else {
    // Default based on direction
    textAlignClass = direction === 'rtl' ? 'text-right' : 'text-left';
  }

  return (
    <div className={`mb-3 ${textAlignClass}`}>
      {eyebrow && <div className="text-[10px] font-bold text-gold mb-1">{eyebrow}</div>}
      {title && <h2 className="text-xl font-bold text-brand dark:text-gray-100 mb-1.5 transition-colors tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{title}</h2>}
      {subtitle && <div className="text-sm text-muted dark:text-gray-400 leading-relaxed transition-colors">{subtitle}</div>}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-full px-4 py-2 text-[12px] font-bold cursor-pointer transition-transform active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  const variants = {
    primary: "bg-gold-gradient text-brand shadow-md border border-transparent",
    ghost: "bg-white dark:bg-transparent dark:text-gold border border-gold/80 text-brand shadow-sm hover:bg-gray-50 dark:hover:bg-white/5",
    outline: "bg-transparent border border-gold text-gold"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const PulseDot = () => (
  <span className="w-[9px] h-[9px] rounded-full bg-gold animate-rf-pulse block" />
);

export const StripContainer: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`flex gap-4 overflow-x-auto pb-6 pt-4 px-3.5 scrollbar-default -mx-3.5 touch-pan-x snap-x snap-proximity cursor-grab active:cursor-grabbing ${className}`}>
    {children}
  </div>
);