import { ShieldCheck, Database, Radio } from 'lucide-react'; // If you have lucide-react installed

export const Trust = () => {
  return (
    <section className="py-32 bg-white" id="hospitals">
      <div className="max-w-1180px mx-auto px-8">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Side: Content */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/5 border border-crimson/10 text-crimson text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
              Institutional Grade
            </div>
            <h2 className="text-5xl font-serif font-bold text-ink leading-[1.1] mb-6">
              Built for hospitals, <br />
              <span className="text-ink-soft/40 italic">trusted by donors.</span>
            </h2>
            <p className="text-lg text-ink-soft leading-relaxed mb-8">
              We provide the infrastructure that turns urgent needs into immediate matches. Every hospital on the Legash network undergoes a multi-step verification process before being allowed to broadcast.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-paper border border-line-soft flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-verified">
                  <ShieldCheck size={20} />
                </div>
                <span className="font-bold text-ink">Manual Admin Verification</span>
              </div>
            </div>
          </div>

          {/* Right Side: Feature Grid */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
            <FeatureCard 
              icon={<Database className="text-crimson" />}
              title="Inventory Control"
              desc="Update your stock levels in real-time. Gain visibility into blood availability at neighboring verified facilities."
            />
            <FeatureCard 
              icon={<Radio className="text-crimson" />}
              title="Smart Broadcast"
              desc="Our matching engine only alerts donors within your specific radius who carry the exact blood type needed."
            />
            <div className="sm:col-span-2 p-8 rounded-32px bg-ink text-paper flex flex-col md:flex-row items-center gap-8 group overflow-hidden relative">
               <div className="relative z-10">
                  <h3 className="text-2xl font-serif font-bold mb-2">Verified Status</h3>
                  <p className="text-paper/60 text-sm leading-relaxed">
                    Once verified, your hospital appears on the "Safe Search" for donors, building trust before the request is even made.
                  </p>
               </div>
               <div className="shrink-0 w-24 h-24 rounded-full bg-crimson flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500 relative z-10">
                  <ShieldCheck size={48} strokeWidth={1.5} />
               </div>
               {/* Decorative glow for the dark card */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-crimson/20 blur-[50px] pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 rounded-32px border border-line-soft bg-paper-dim/30 hover:bg-white hover:shadow-xl hover:shadow-crimson/5 transition-all duration-300">
    <div className="mb-6">{icon}</div>
    <h3 className="text-xl font-bold text-ink mb-3">{title}</h3>
    <p className="text-ink-soft text-sm leading-relaxed">{desc}</p>
  </div>
);