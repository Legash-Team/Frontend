import { Logo } from '@/components/ui/Logo';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { ReactNode } from 'react';

type Social = {
  label: string;
  href: string;
  icon: ReactNode;
  solid?: boolean;
};

const SOCIALS: Social[] = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  },
  {
    label: 'X',
    href: 'https://x.com',
    solid: true,
    icon: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
      />
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  {
    label: 'Telegram',
    href: 'https://t.me',
    icon: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
  },
];

export const Footer = () => {
  return (
    <footer className="bg-ink pt-12 sm:pt-20 pb-8 sm:pb-10 text-paper border-t border-white/5">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-8">

        {/* Top Section: Brand and Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16 mb-12 sm:mb-20">

          {/* Column 1: Brand & Description */}
          <ScrollReveal className="lg:col-span-6 flex flex-col items-start">
            <Logo className="text-paper mb-5 sm:mb-6" />
            <p className="text-paper/50 text-sm sm:text-[0.95rem] max-w-sm leading-relaxed">
              The link between Ethiopia's health care and a verififed network of donors. Optimized to help the health care system and donors to connect and work together to save lives.
            </p>
          </ScrollReveal>

          {/* Column 2: Navigation Links */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-8 sm:gap-12">
            <ScrollReveal delay={100}>
              <FooterGroup
                title="Company"
                links={[
                  { label: 'How it works', href: '#how' },
                  { label: 'About Us', href: '#about' },
                  { label: 'Privacy Protocol', href: '#privacy' }
                ]}
              />
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <FooterGroup
                title="Facilities"
                links={[
                  { label: 'For Hospitals', href: '#hospitals' },
                  { label: 'Register Facility', href: '/register' },
                  { label: 'Hospital Login', href: '/login' }
                ]}
              />
            </ScrollReveal>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Socials */}
        <ScrollReveal className="pt-8 sm:pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="text-[10px] font-mono font-bold tracking-[0.15em] text-paper/40 uppercase">
              © {new Date().getFullYear()} LEGASH. All rights reserved.
            </div>
            
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
            <nav aria-label="Social links" className="flex items-center gap-2.5">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="w-9 h-9 rounded-full border border-white/10 text-paper/50 hover:text-paper hover:border-crimson hover:bg-crimson/15 transition-all duration-300 flex items-center justify-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`w-[15px] h-[15px] ${
                      social.solid ? 'fill-current' : 'fill-none stroke-current'
                    }`}
                    strokeWidth={social.solid ? undefined : 1.9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {social.icon}
                  </svg>
                </a>
              ))}
            </nav>

            <a
              href="mailto:contact@legash.com"
              className="text-paper/40 hover:text-crimson transition-all duration-300 text-[11px] font-bold uppercase tracking-widest"
            >
              Contact
            </a>
          </div>
        </ScrollReveal>

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