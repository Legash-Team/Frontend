import { useState } from 'react';

export const PrivacySection = () => {
  const [isLive, setIsLive] = useState(false);

  return (
    <section className="py-32 bg-paper-dim" id="privacy">
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="w-12 h-1 bg-crimson mb-8" />
            <h2 className="text-4xl font-serif font-bold text-ink mb-6">
              Privacy isn't a feature. <br />It's our foundation.
            </h2>
            <p className="text-xl text-ink-soft mb-12 leading-relaxed">
              We built Legash so you never have to choose between helping and staying private. Your data stays on your device until the moment you decide to share it.
            </p>
            
            <div className="space-y-8">
              <PrivacyItem title="Encrypted Identity" desc="Your name and blood type are only visible to hospitals when they need a match." />
              <PrivacyItem title="Zero-Tracking History" desc="We don't store your donation locations. We only remind you when you're eligible again." />
            </div>
          </div>

          <div className="relative">
            {/* The "Safe Card" UI */}
            <div className="bg-white p-10 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-line-soft relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink-soft">
                    Access Level: {isLive ? 'Full Contact' : 'Protected'}
                  </span>
                </div>
                <button 
                  onClick={() => setIsLive(!isLive)}
                  className={`w-14 h-8 rounded-full transition-all p-1 ${isLive ? 'bg-verified' : 'bg-sand'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all ${isLive ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="space-y-6">
                <DataRow label="Legal Name" value="Abebe Bikila" blurred={false} />
                <DataRow label="Blood Group" value="O Negative" blurred={false} />
                <DataRow label="Phone Number" value="+251 911 234 567" blurred={!isLive} />
                <DataRow label="Precise Location" value="Bole, Addis Ababa" blurred={!isLive} />
              </div>
            </div>
            {/* Decorative Background Element */}
            <div className="absolute -inset-4 bg-crimson/5 rounded-[40px] rotate-2" />
          </div>
        </div>
      </div>
    </section>
  );
};

const DataRow = ({ label, value, blurred }: { label: string, value: string, blurred: boolean }) => (
  <div className="flex justify-between items-center py-4 border-b border-line-soft last:border-0">
    <span className="text-sm font-medium text-ink-soft">{label}</span>
    <span className={`text-sm font-bold font-mono transition-all duration-500 ${blurred ? 'blur-md select-none text-gray-300' : 'text-ink'}`}>
      {value}
    </span>
  </div>
);

const PrivacyItem = ({ title, desc }: { title: string, desc: string }) => (
  <div className="flex gap-4">
    <div className="shrink-0 w-6 h-6 rounded-full bg-verified/10 flex items-center justify-center text-verified">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
    </div>
    <div>
      <h4 className="font-bold text-ink">{title}</h4>
      <p className="text-sm text-ink-soft">{desc}</p>
    </div>
  </div>
);