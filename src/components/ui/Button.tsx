import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'outline' | 'secondary';
  size?: 'md' | 'sm';
  isLoading?: boolean;
  loadingText?: string;
  href?: string; // For internal links
  isExternal?: boolean; // For external links
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  className = '',
  href,
  isExternal,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) => {
  
 
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed";
  
  
  const variants = {
    primary: "bg-crimson text-paper shadow-sm hover:bg-crimson-dark hover:-translate-y-0.5 text-white",
    secondary: "bg-ink text-paper hover:bg-ink/90",
    ghost: "bg-transparent text-ink border border-line hover:border-ink",
    outline: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-white"
  };

  
  const sizes = {
    md: "px-[22px] py-[11px] text-[0.94rem]",
    sm: "px-[18px] py-[9px] text-[0.86rem]"
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;


  const content = (
    <>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{loadingText || children}</span>
        </span>
      ) : (
        children
      )}
    </>
  );

  // 1. If it's an external link (<a>)
  if (href && isExternal) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={combinedClasses}>{children}</a>;
  }

  // 2. If it's an internal link (React Router <Link>)
  if (href) {
    return <Link to={href} className={combinedClasses}>{children}</Link>;
  }

  // 3. Otherwise, it's a standard Button (for her forms)
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={combinedClasses}
      {...(props as any)}
    >
      {content}
    </button>
  );
};

export default Button;