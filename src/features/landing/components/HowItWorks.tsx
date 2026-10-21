import { useState } from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

type Role = 'donor' | 'hospital';

type Step = {
  number: string;
  title: string;
  desc: string;
};

const DONOR_STEPS: Step[] = [
  {
    number: '01',
    title: 'Register once',
    desc: "Name, blood type, location, and a password. Confirm your email and you're in — no waiting on anyone.",
  },
  {
    number: '02',
    title: 'Hear about nearby requests',
    desc: 'When a hospital within your radius needs your blood type, you get notified. Nothing reaches you otherwise.',
  },
  {
    number: '03',
    title: 'Accept or decline',
    desc: 'Accept, and that hospital gets your phone and email so they can reach you. Decline, and they learn nothing.',
  },
];

const HOSPITAL_STEPS: Step[] = [
  {
    number: '01',
    title: 'Submit your details',
    desc: 'Hospital name, license number, location, and current stock. An admin reviews your account before it goes live.',
  },
  {
    number: '02',
    title: 'Set type, quantity, urgency',
    desc: 'Matching donors in your configured radius are notified immediately — no manual outreach needed.',
  },
  {
    number: '03',
    title: 'See who said yes',
    desc: "Only accepted donors' contact info appears. Everything else is worked out in person, when they arrive.",
  },
];

export const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<Role>('donor');
  const steps = activeTab === 'donor' ? DONOR_STEPS : HOSPITAL_STEPS;

  return (
    <section className="py-16 sm:py-24 bg-paper-dim" id="how">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-8">

        {/* Section Header */}
        <ScrollReveal className="max-w-[640px] mb-10 sm:mb-14">
          <span className="font-mono text-[0.76rem] font-bold text-crimson-dark uppercase tracking-widest block mb-3.5">
            How it works
          </span>
          <h2 className="text-[clamp(1.75rem,3vw,2.6rem)] font-serif font-bold text-ink leading-[1.15]">
            Three steps to save a life.
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-[1.03rem] text-ink-soft leading-relaxed">
            Donors and hospitals use LEGASH differently — but every path leads to the same handoff: a request, a match, a call.
          </p>
        </ScrollReveal>

        {/* Role Toggle */}
        <div className="flex justify-start mb-8 sm:mb-11">
          <ScrollReveal className="inline-flex bg-sand rounded-full p-1">
            <button
              onClick={() => setActiveTab('donor')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'donor'
                  ? 'bg-ink text-paper shadow-sm'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              For donors
            </button>
            <button
              onClick={() => setActiveTab('hospital')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'hospital'
                  ? 'bg-ink text-paper shadow-sm'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              For hospitals
            </button>
          </ScrollReveal>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-7">
          {steps.map((step, index) => (
            <ScrollReveal key={step.number} delay={index * 120} className="h-full">
              <StepCard number={step.number} title={step.title} desc={step.desc} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const StepCard = ({ number, title, desc }: { number: string; title: string; desc: string }) => (
  <div className="h-full bg-paper border border-line-soft rounded-[14px] p-6 sm:p-7 transition-all hover:shadow-md hover:border-crimson/30 relative">
    <span className="font-mono text-[0.78rem] font-bold px-2.5 py-1.5 rounded-lg bg-sand text-crimson-dark inline-block mb-4">
      {number}
    </span>
    <h3 className="text-[1.15rem] font-bold text-ink mb-2.5">{title}</h3>
    <p className="text-[0.94rem] text-ink-soft leading-[1.58]">{desc}</p>
  </div>
);
