import React from 'react';
import { ShieldCheck, Activity, Zap } from 'lucide-react';

export const Trust = () => {
  return (
    <section className="py-[100px] bg-white border-y border-line-soft" id="hospitals">
      <div className="max-w-[1180px] mx-auto px-8">
        
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-16 items-center">
          
          {/* Left: Minimal Heading */}
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
               <ShieldCheck size={16} className="text-verified" />
               <span className="font-mono text-[10px] font-bold text-ink-soft uppercase tracking-[0.2em]">Verified Network</span>
            </div>
            <h2 className="text-4xl font-serif font-bold text-ink leading-tight mb-4">
              Institutional grade <br/>
              <span className="text-crimson">security.</span>
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed max-w-sm">
              We vet every facility manually to ensure a 100% legitimate hospital-to-donor connection.
            </p>
          </div>

          {/* Right: The Strip (Low Profile) */}
          <div className="grid sm:grid-cols-3 gap-12">
            <SmallFeature 
              icon={<ShieldCheck size={20} />} 
              title="Vetted Identity" 
              desc="License-based verification for every admin."
            />
            <SmallFeature 
              icon={<Activity size={20} />} 
              title="Live Stock" 
              desc="Real-time blood inventory management."
            />
            <SmallFeature 
              icon={<Zap size={20} />} 
              title="Smart Radius" 
              desc="Targeted alerts to nearby matching donors."
            />
          </div>

        </div>

        {/* Minimalist Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-line-soft flex items-center justify-between">
           <div className="text-[10px] font-mono font-bold text-ink-soft/40 uppercase tracking-widest">
             Trusted by 85+ Ethiopian Medical Centers
           </div>
           <a href="/register" className="text-xs font-bold text-crimson hover:text-ink transition-colors flex items-center gap-2 group">
             Register your facility <span className="group-hover:translate-x-1 transition-transform">→</span>
           </a>
        </div>
      </div>
    </section>
  );
};

const SmallFeature = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex flex-col items-start group">
    <div className="text-crimson mb-4 transition-transform group-hover:scale-110">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-ink mb-2 uppercase tracking-tight">{title}</h3>
    <p className="text-[13px] text-ink-soft leading-snug">{desc}</p>
  </div>
);
