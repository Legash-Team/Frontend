import { Logo } from '@/components/ui/Logo';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-ink pt-12 sm:pt-20 pb-8 sm:pb-10 text-paper border-t border-white/5">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Top Section: Brand and Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16 mb-12 sm:mb-20">
          
          {/* Column 1: Brand & Description */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <Logo className="text-paper mb-5 sm:mb-6" />
            <p className="text-paper/50 text-sm sm:text-[0.95rem] max-w-sm leading-relaxed">
              The professional digital link between Ethiopia's medical facilities and a verified network of donors. Optimized for speed, privacy, and precision.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-8 sm:gap-12">
            <FooterGroup 
              title="Network" 
              links={[
                { label: 'How it works', href: '#how' },
                { label: 'About Us', href: '#about' },
                { label: 'Privacy Protocol', href: '#privacy' }
              ]} 
            />
            
            <FooterGroup 
              title="Facilities" 
              links={[
                { label: 'For Hospitals', href: '#hospitals' },
                { label: 'Register Facility', href: '/register' },
                { label: 'Hospital Login', href: '/login' }
              ]} 
            />
          </div>
        </div>

        {/* Bottom Bar: Tagline and Contact */}
        <div className="pt-8 sm:pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-center sm:text-left">
          <div className="text-[10px] font-mono font-bold tracking-[0.15em] text-paper/30 uppercase">
            © {new Date().getFullYear()} LEGASH WEB. ETHIOPIA’S DIGITAL BLOOD INFRASTRUCTURE.
          </div>
          
          <div className="flex gap-8">
            <a 
              href="mailto:contact@legash.com" 
              className="text-paper/40 hover:text-crimson transition-all duration-300 text-[11px] font-bold uppercase tracking-widest"
            >
              Contact
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-paper/40 hover:text-crimson transition-all duration-300 text-[11px] font-bold uppercase tracking-widest"
            >
              LinkedIn
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

// Sub-component for consistent link columns
const FooterGroup = ({ title, links }: { title: string, links: { label: string, href: string }[] }) => (
  <div className="flex flex-col items-start">
    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-paper/20 mb-8">
      {title}
    </h4>
    <ul className="space-y-4">
      {links.map((link) => (
        <li key={link.label}>
          {/* Logic to handle anchor links (#) vs internal page links (/) */}
          {link.href.startsWith('#') ? (
            <a 
              href={link.href} 
              className="text-paper/60 hover:text-crimson transition-all duration-300 text-sm font-medium flex items-center group"
            >
              {link.label}
              <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 ml-1 text-[10px]">
                →
              </span>
            </a>
          ) : (
            <Link 
              to={link.href} 
              className="text-paper/60 hover:text-crimson transition-all duration-300 text-sm font-medium flex items-center group"
            >
              {link.label}
              <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 ml-1 text-[10px]">
                →
              </span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  </div>
);