import React, { useState } from 'react';
import { Lock, EyeOff, ShieldCheck, UserSearch } from 'lucide-react';

export const PrivacySection = () => {
  const [isAccepted, setIsAccepted] = useState(false);

  return (
    <section className="py-[120px] bg-paper-dim" id="privacy">
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-20 items-center">
          
          {/* Left Side: Content */}
          <div>
            <span className="font-mono text-[10px] font-bold text-crimson uppercase tracking-[0.3em] block mb-6">
              Privacy Protocol
            </span>
            <h2 className="text-5xl font-serif font-bold text-ink leading-[1.1] mb-8">
              Your identity is <span className="text-crimson">protected</span> until you say yes.
            </h2>
            <p className="text-lg text-ink-soft leading-relaxed mb-10">
              We designed Legash to be "Private by Default." Hospitals can see that a matching donor exists nearby, but they cannot see who you are, where exactly you live, or how to contact you until you formally accept their request.
            </p>

            <div className="space-y-6">
              <PrivacyFeat 
                icon={<Lock size={18} />} 
                title="End-to-End Anonymity" 
                desc="Your profile is encrypted. Even our admins can't see your health notes."
              />
              <PrivacyFeat 
                icon={<EyeOff size={18} />} 
                title="Selective Disclosure" 
                desc="Only the hospital you choose to help gets your contact information."
              />
            </div>
          </div>

          {/* Right Side: The "Live Disclosure" Card */}
          <div className="relative">
            <div className="bg-white border border-line-soft rounded-[32px] p-10 shadow-xl relative z-10">
              
              {/* Card Header */}
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-line-soft">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isAccepted ? 'bg-verified animate-pulse' : 'bg-amber-500'}`} />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                    {isAccepted ? 'HOSPITAL VIEW: CONNECTED' : 'HOSPITAL VIEW: ANONYMOUS'}
                  </span>
                </div>
                {/* The Toggle Switch */}
                <button 
                  onClick={() => setIsAccepted(!isAccepted)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isAccepted ? 'bg-verified' : 'bg-sand'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isAccepted ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Data Table */}
              <div className="space-y-5">
                <DataRow label="Blood Type" value="O Negative" status="Always Visible" isVisible={true} />
                <DataRow label="Distance" value="~2.4 km away" status="Always Visible" isVisible={true} />
                <DataRow label="Full Name" value="Abebe Bikila" status="Hidden" isVisible={isAccepted} />
                <DataRow label="Phone Number" value="+251 911 00 00 00" status="Hidden" isVisible={isAccepted} />
                <DataRow label="Health History" value="Private" status="Never Shared" isVisible={false} isPermanent={true} />
              </div>

              {/* Status Message */}
              <div className={`mt-10 p-4 rounded-xl text-center text-xs font-bold transition-all ${
                isAccepted ? 'bg-verified/5 text-verified border border-verified/10' : 'bg-sand/30 text-ink-soft border border-line-soft'
              }`}>
                {isAccepted 
                  ? "✓ DONOR HAS ACCEPTED. CONTACT INFO REVEALED." 
                  : "⚠ REQUEST PENDING. DONOR IDENTITY IS MASKED."}
              </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-line-soft rounded-[32px] -z-0" />
          </div>

        </div>
      </div>
    </section>
  );
};

const PrivacyFeat = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-4 items-start">
    <div className="w-10 h-10 rounded-xl bg-white border border-line-soft flex items-center justify-center text-crimson shadow-sm shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-ink text-sm">{title}</h4>
      <p className="text-sm text-ink-soft leading-snug">{desc}</p>
    </div>
  </div>
);

const DataRow = ({ label, value, status, isVisible, isPermanent }: { label: string, value: string, status: string, isVisible: boolean, isPermanent?: boolean }) => (
  <div className="flex justify-between items-center group">
    <div className="flex flex-col">
      <span className="text-[10px] font-mono font-bold text-ink-soft/50 uppercase">{label}</span>
      <span className={`text-[15px] font-bold transition-all duration-500 ${
        isVisible ? 'text-ink' : 'text-ink-soft/20 blur-[4px] select-none'
      }`}>
        {isPermanent ? "Encrypted" : value}
      </span>
    </div>
    <div className={`text-[9px] font-black uppercase px-2 py-1 rounded border transition-all ${
      isVisible ? 'bg-verified/10 border-verified/20 text-verified' : 'bg-sand/50 border-line-soft text-ink-soft/40'
    }`}>
      {isPermanent ? "Never Shared" : isVisible ? "Visible" : status}
    </div>
  </div>
);