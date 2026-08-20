import { Link } from 'react-router-dom';

interface LogoProps {
  isCollapsed?: boolean;
  className?: string;
}

export const Logo = ({ isCollapsed, className = '' }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center font-serif font-bold text-ink ${className}`}>
      <span className="shrink-0">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 2.5C12 2.5 5 11.2 5 15.8C5 19.7 8.1 22.5 12 22.5C15.9 22.5 19 19.7 19 15.8C19 11.2 12 2.5 12 2.5Z" fill="#C31F3B"/>
        </svg>
      </span>
      {/* Smoothly hide text when collapsed */}
      {!isCollapsed && (
        <span className="ml-2 tracking-tighter text-xl transition-all duration-300">
          LEGASH
        </span>
      )}
    </Link>
  );
};