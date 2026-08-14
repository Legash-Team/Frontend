import { Button } from '@/components/ui/Button';

export const Hero = () => {
  return (
    <section className="pt-[88px] pb-10 overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-8 grid lg:grid-cols-[1.05fr_0.85fr] gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-[0.76rem] font-bold text-crimson-dark uppercase mb-5">
            <span className="w-[7px] h-[7px] rounded-full bg-crimson animate-[blip_1.8s_ease-in-out_infinite]"></span>
            Matched by blood type & distance
          </div>
          
          <h1 className="text-[clamp(2.5rem,4.6vw,3.75rem)] leading-[1.04] text-ink mb-6">
            The right blood type,<br />close enough, <em className="italic text-crimson font-serif">in time</em>.
          </h1>
          
          <p className="text-[1.13rem] leading-relaxed text-ink-soft max-w-[46ch] mb-8">
            LEGASH connects donors and hospitals directly. When a hospital posts an urgent request, every nearby donor with a matching blood type hears about it.
          </p>

          <div className="flex gap-3.5 flex-wrap mb-10">
             <Button 
    variant="primary" 
    size="md" 
    href="/register"
    className="bg-crimson border-2 border-crimson hover:bg-ink hover:border-ink transition-all duration-300 shadow-md"
  >Register your hospital</Button>
          </div>
          
          {/* Hero Facts */}
          <div className="flex gap-8 flex-wrap">
             <Fact text="Every donor account starts with email verification." />
             <Fact text="Hospitals are reviewed by an admin before they go live." />
          </div>
        </div>

        {/* Pulse Panel */}
        <div className="relative rounded-[20px] bg-ink p-[38px_30px_30px] text-paper overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(560px_260px_at_85%_-10%,rgba(195,31,59,0.35),transparent_60%)] pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-4 text-[0.72rem] uppercase tracking-widest text-paper/55">
            <span>Request &rarr; Match</span>
            <span className="text-paper font-mono">O− needed nearby</span>
          </div>

          <svg className="w-full h-auto mb-6" viewBox="0 0 460 140">
            <path 
              className="pulse-path fill-none stroke-crimson stroke-[2.5] stroke-round"
              d="M0 90 L70 90 L90 90 L102 40 L116 120 L128 70 L140 90 L200 90 L215 90 L228 55 L242 105 L255 90 L320 90 L340 90 L352 30 L368 130 L382 90 L460 90" 
            />
          </svg>

          <div className="flex gap-2.5 mb-5 flex-wrap">
            <TypeChip label="A+" />
            <TypeChip label="B+" />
            <TypeChip label="O-" match />
            <TypeChip label="AB+" />
          </div>
          
          <p className="text-[0.85rem] text-paper/60 leading-relaxed">
            A hospital posts a request — only donors within its radius who carry a matching type are notified.
          </p>
        </div>
      </div>
    </section>
  );
};

const Fact = ({ text }: { text: string }) => (
  <div className="flex items-start gap-2.5 max-w-[220px]">
    <svg className="w-4.5 h-4.5 text-verified mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
    <span className="text-[0.86rem] text-ink-soft leading-tight">{text}</span>
  </div>
);

const TypeChip = ({ label, match }: { label: string, match?: boolean }) => (
  <span className={`font-mono text-[0.78rem] font-semibold px-3 py-1.5 rounded-lg border ${
    match ? 'bg-crimson border-crimson text-paper' : 'bg-paper/10 border-paper/15 text-paper/85'
  }`}>
    {label}
  </span>
);