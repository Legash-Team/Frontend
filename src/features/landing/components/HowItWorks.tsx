import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

type Role = 'donor' | 'hospital';

type Step = {
  number: string;
  title: string;
  desc: string;
};

export const HowItWorks = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Role>('donor');

  const DONOR_STEPS: Step[] = [
    {
      number: '01',
      title: t('landing.how.donorStep1Title'),
      desc: t('landing.how.donorStep1Desc'),
    },
    {
      number: '02',
      title: t('landing.how.donorStep2Title'),
      desc: t('landing.how.donorStep2Desc'),
    },
    {
      number: '03',
      title: t('landing.how.donorStep3Title'),
      desc: t('landing.how.donorStep3Desc'),
    },
  ];

  const HOSPITAL_STEPS: Step[] = [
    {
      number: '01',
      title: t('landing.how.hospitalStep1Title'),
      desc: t('landing.how.hospitalStep1Desc'),
    },
    {
      number: '02',
      title: t('landing.how.hospitalStep2Title'),
      desc: t('landing.how.hospitalStep2Desc'),
    },
    {
      number: '03',
      title: t('landing.how.hospitalStep3Title'),
      desc: t('landing.how.hospitalStep3Desc'),
    },
  ];

  const steps = activeTab === 'donor' ? DONOR_STEPS : HOSPITAL_STEPS;

  return (
    <section className="py-16 sm:py-24 bg-paper-dim scroll-mt-24" id="how">
        {/* Role Toggle — flush to the left edge of the page */}
        <div className="px-4 sm:px-6 md:px-8 mb-10 sm:mb-14">
          <ScrollReveal className="inline-flex bg-sand rounded-full p-1">
            <button
              onClick={() => setActiveTab('donor')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'donor'
                  ? 'bg-ink text-paper shadow-sm'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              {t('landing.how.forDonors')}
            </button>
            <button
              onClick={() => setActiveTab('hospital')}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'hospital'
                  ? 'bg-ink text-paper shadow-sm'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              {t('landing.how.forHospitals')}
            </button>
          </ScrollReveal>
        </div>

        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-8">

          {/* Section Header */}
          <ScrollReveal className="max-w-[640px] mb-10 sm:mb-14">
            <span className="font-mono text-[0.76rem] font-bold text-crimson-dark uppercase tracking-widest block mb-3.5">
              {t('landing.howItWorks')}
            </span>
            <h2 className="text-[clamp(1.75rem,3vw,2.6rem)] font-serif font-bold text-ink leading-[1.15]">
              {t('landing.how.title')}
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-[1.03rem] text-ink-soft leading-relaxed">
              {t('landing.how.description')}
            </p>
          </ScrollReveal>

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
