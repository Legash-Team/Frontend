import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'md' | 'lg';
}

export const Logo = ({ className = '', size = 'md' }: LogoProps) => {
  const textSizes = size === 'lg' ? 'text-3xl' : 'text-xl';
  const dropSizes = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <Link 
      to="/" 
      className={`flex items-center font-serif font-bold tracking-tighter text-ink hover:opacity-90 transition-opacity ${textSizes} ${className}`}
    >
      LEG
      <span className="inline-block px-[1px] transform translate-y-[1px]">
        <svg 
          className={`${dropSizes}`} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2.5C12 2.5 5 11.2 5 15.8C5 19.7 8.1 22.5 12 22.5C15.9 22.5 19 19.7 19 15.8C19 11.2 12 2.5 12 2.5Z" 
            fill="#C31F3B"
          />
        </svg>
      </span>
      SH
    </Link>
  );
};