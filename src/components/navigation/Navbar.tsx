import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';


export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { name: t('landing.howItWorks'), href: '#how' },
    { name: t('landing.aboutUs'), href: '#about' },
    { name: t('landing.privacy'), href: '#privacy' },
    { name: t('landing.forHospitals'), href: '#hospitals' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full bg-paper/90 backdrop-blur-md z-50 border-b border-line-soft">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-8 h-[76px] flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex items-center gap-8 lg:gap-9">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group relative py-2 text-[0.94rem] font-medium text-ink-soft hover:text-crimson transition-colors duration-300"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-crimson transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Button 
              variant="primary" 
              size="sm" 
              className="hover:bg-crimson-dark"
              href="/login"
            >
              {t('landing.login')}
            </Button>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-paper-dim transition-colors"
              aria-label={t('common.toggleMenu')}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Menu Content */}
          <div className="relative z-50 bg-white border-b border-line-soft mt-[76px] p-6 shadow-2xl space-y-5 animate-in slide-in-from-top-4 duration-200">
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-base font-bold text-ink-soft hover:text-crimson transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-line-soft flex flex-col gap-3">
              <Button 
                variant="primary" 
                className="w-full justify-center"
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('landing.registerFacility')}
              </Button>
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-widest text-ink-soft hover:text-crimson"
              >
                {t('landing.signIn')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};