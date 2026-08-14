import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'md' | 'sm';
  className?: string;
  href?: string;
}

export const Button = ({ children, variant = 'primary', size = 'md', className = '', href }: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-95";
  
  const variants = {
    primary: "bg-crimson text-paper shadow-sm hover:bg-crimson-dark hover:-translate-y-0.5",
    ghost: "bg-transparent text-ink border border-line hover:border-ink",
    outline: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper"
  };

  const sizes = {
    md: "px-[22px] py-[11px] text-[0.94rem]",
    sm: "px-[18px] py-[9px] text-[0.86rem]"
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) return <a href={href} className={combinedClasses}>{children}</a>;
  return <button className={combinedClasses}>{children}</button>;
};