import { Heart, Shield, Zap } from 'lucide-react';

export const AboutUs = () => {
  return (
    <section className="py-[120px] bg-white" id="about">
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          
          {/* Left Side: The Story */}
          <div>
              <span className="font-mono text-[0.76rem] font-bold text-crimson-dark uppercase tracking-widest block mb-3.5">
            About Us
          </span>
            
            
            <h2 className="text-5xl font-serif font-bold text-ink leading-[1.1] mb-8">
              A smarter way to <span className="text-crimson">give and receive</span> blood in Ethiopia.
            </h2>
            
            <p className="text-lg text-ink-soft leading-relaxed mb-8">
              Legash was born from a simple observation: Ethiopia has enough donors, but not enough connection. We are a dedicated team of developers and health advocates building the bridge between those who have blood to give and those who need it now.
            </p>

            {/* The Problem & Gap Card */}
<div className="mt-12 p-8 rounded-[32px] bg-crimson/[0.03] border border-crimson/10 relative overflow-hidden group">
  <div className="relative z-10">
    <div className="flex items-center gap-2 mb-6">
      <span className="w-2 h-2 rounded-full bg-crimson animate-pulse" />
      <h3 className="font-mono text-[10px] font-bold text-crimson uppercase tracking-[0.2em]">The National Crisis</h3>
    </div>

    <div className="grid sm:grid-cols-2 gap-8 items-center">
      <div>
        <h4 className="text-4xl font-serif font-bold text-ink mb-2">~1,200,000</h4>
        <p className="text-xs font-mono font-bold text-ink-soft uppercase tracking-wider mb-6">Units Needed Annually</p>
        
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-sm font-medium text-ink-soft">Collection Rate</span>
            <span className="text-sm font-bold text-ink">~22%</span>
          </div>
          {/* Progress Bar Showing the Gap */}
          <div className="h-2 w-full bg-sand/50 rounded-full overflow-hidden">
            <div className="h-full bg-crimson w-[22%]" />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-line-soft shadow-sm">
        <div className="text-crimson font-serif text-3xl font-bold mb-1">78%</div>
        <p className="text-sm font-bold text-ink mb-3 leading-tight">The Current "Resource Gap"</p>
        <p className="text-[0.8rem] text-ink-soft leading-relaxed">
          Ethiopia currently collects less than 1/4th of the WHO-recommended blood supply. Most hospitals operate in a permanent state of emergency due to this deficit.
        </p>
      </div>
    </div>
  </div>

  {/* Subtle Background Watermark Icon */}
  <svg className="absolute -bottom-4 -right-4 w-32 h-32 opacity-[0.03] text-crimson" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.5C12 2.5 5 11.2 5 15.8C5 19.7 8.1 22.5 12 22.5C15.9 22.5 19 19.7 19 15.8C19 11.2 12 2.5 12 2.5Z"/>
  </svg>
</div>
          </div>

          {/* Right Side: The Pillars (Icons) */}
          <div className="space-y-12 pt-10">
            
            <VisionPoint 
              icon={<Zap className="text-crimson" size={28} />}
              title="Speed over Chaos"
              desc="We replace manual social media pleas with instant, location-aware notifications sent directly to matching donors."
            />

            <VisionPoint 
              icon={<Shield className="text-crimson" size={28} />}
              title="Privacy over Exposure"
              desc="Donors remain completely anonymous until they choose to accept a request. We protect your data so you can focus on saving lives."
            />

            <VisionPoint 
              icon={<Heart className="text-crimson" size={28} />}
              title="Community over Crisis"
              desc="By building a verified network of hospitals and donors, we move Ethiopia from emergency-only responses to a sustainable, stable blood supply."
            />

          </div>
        </div>
      </div>
    </section>
  );
};

// Simple helper component for the points
const VisionPoint = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-6">
    <div className="shrink-0 w-14 h-14 rounded-2xl bg-crimson/5 border border-crimson/10 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h4 className="text-xl font-bold text-ink mb-2">{title}</h4>
      <p className="text-ink-soft leading-relaxed">{desc}</p>
    </div>
  </div>
);