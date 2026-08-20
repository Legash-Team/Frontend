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
            
            <p className="text-lg text-ink-soft leading-relaxed mb-8 text-justify">
              Legash was born from a simple observation: Ethiopia has enough donors, but not enough connection. We are a dedicated team of developers and health advocates building the bridge between those who have blood to give and those who need it now.
            </p>

{/* Compact National Data Badge */}
<div className="mt-8 p-5 bg-crimson/[0.04] border border-crimson/10 rounded-2xl max-w-[1180px] ">
  <div className="flex justify-between items-end mb-3">
    <div>
      <p className="text-[10px] font-mono font-bold text-crimson uppercase tracking-[0.15em] mb-1">Annual Need</p>
      <p className="text-2xl font-serif font-bold text-ink">1.2M <span className="text-sm font-sans font-medium text-ink-soft">units</span></p>
    </div>
    <div className="text-right">
      <p className="text-[10px] font-mono font-bold text-crimson uppercase tracking-[0.15em] mb-1">The Gap</p>
      <p className="text-2xl font-serif font-bold text-ink text-crimson">78%</p>
    </div>
  </div>

  {/* Slim Visual Gap Bar */}
  <div className="h-1.5 w-full bg-sand/50 rounded-full overflow-hidden mb-2">
    <div className="h-full bg-crimson w-[22%]" />
  </div>

  <p className="text-[10px] text-ink-soft leading-tight font-medium">
    Current collection rate is only <span className="text-ink font-bold">22%</span> of the WHO-recommended supply for Ethiopia.
  </p>
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