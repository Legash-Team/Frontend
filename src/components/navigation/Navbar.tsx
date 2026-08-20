import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export const Navbar = () => {
  const navLinks = [
    { name: 'How it works', href: '#how' },
    { name: 'About Us', href: '#about' },
    { name: 'Privacy', href: '#privacy' },
    { name: 'For hospitals', href: '#hospitals' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-paper/80 backdrop-blur-md z-50 border-b border-line-soft">
      <div className="max-w-[1180px] mx-auto px-8 h-[76px] flex items-center justify-between">
        <Logo />

        <ul className="hidden md:flex items-center gap-9">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a 
                href={link.href} 
                className="group relative py-2 text-[0.94rem] font-medium text-ink-soft hover:text-crimson transition-colors duration-300"
              >
                {link.name}
                {/* Fixed: h-[2px] */}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-crimson transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          <Button 
            variant="primary" 
            size="sm" 
            className="hidden sm:flex hover:bg-crimson-dark"
            href="/login"
          >
            Log in
          </Button>
        </div>
      </div>
    </nav>
  );
};
