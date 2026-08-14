import { Logo } from '@/components/ui/Logo';

export const Footer = () => {
  return (
    <footer className="bg-ink pt-24 pb-12 text-paper">
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          <div className="lg:col-span-5">
            <Logo className="text-paper mb-8" />
            <p className="text-paper/50 text-lg max-w-sm leading-relaxed mb-8">
              Transforming blood donation in Ethiopia through direct, private, and smart matching technology.
            </p>
            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-full border border-paper/10 text-xs font-mono uppercase tracking-widest">
                System Status: <span className="text-green-400">Operational</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <FooterGroup title="Platform" links={['The Network', 'For Hospitals', 'Donor Privacy']} />
            <FooterGroup title="Organization" links={['About Us', 'Contact', 'Support']} />
            <FooterGroup title="Legal" links={['Terms', 'Privacy Policy', 'Security']} />
          </div>
        </div>

        <div className="pt-12 border-t border-paper/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-paper/40 font-mono">
            &copy; {new Date().getFullYear()} LEGASH WEB. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-8 text-sm font-bold uppercase tracking-widest text-paper/60">
            <a href="#" className="hover:text-crimson transition-colors">Twitter</a>
            <a href="#" className="hover:text-crimson transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterGroup = ({ title, links }: { title: string, links: string[] }) => (
  <div>
    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-paper/30 mb-6">{title}</h4>
    <ul className="space-y-4">
      {links.map((link) => (
        <li key={link}>
          <a href="#" className="text-paper/70 hover:text-white transition-colors text-sm font-medium">{link}</a>
        </li>
      ))}
    </ul>
  </div>
);