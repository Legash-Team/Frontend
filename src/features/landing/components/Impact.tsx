import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const Impact = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 sm:py-28 bg-paper" id="impact">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-8">

        {/* Section Header */}
        <ScrollReveal className="max-w-[640px] mb-12 sm:mb-16">
          <span className="font-mono text-[0.76rem] font-bold text-crimson-dark uppercase tracking-widest block mb-3.5">
            {t('landing.impactBadge')}
          </span>
          <h2 className="text-[clamp(1.75rem,3vw,2.6rem)] font-serif font-bold text-ink leading-[1.15]">
            {t('landing.impactTitle')}
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-[1.03rem] text-ink-soft leading-relaxed">
            {t('landing.impactDescription')}
          </p>
        </ScrollReveal>

        {/* Statistics Grid */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 mb-16 sm:mb-20">
          <ScrollReveal delay={0} className="h-full">
            <CountingStat
              target={18000}
              label={t('landing.stat1Label')}
              description={t('landing.stat1Description')}
            />
          </ScrollReveal>
          <ScrollReveal delay={150} className="h-full">
            <CountingStat
              target={1100}
              label={t('landing.stat2Label')}
              description={t('landing.stat2Description')}
            />
          </ScrollReveal>
        </div>

        {/* About Us Section */}
        <ScrollReveal className="mb-16 sm:mb-20">
          <div className="relative scroll-mt-24" id="about">
            {/* Left accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-crimson to-crimson/50 rounded-full" />

            <div className="pl-6">
              <span className="font-mono text-[0.76rem] font-bold text-crimson-dark uppercase tracking-widest block mb-4">
                {t('landing.aboutUs')}
              </span>

              <h3 className="text-[1.5rem] sm:text-[1.75rem] font-serif font-bold text-ink leading-[1.15] mb-5">
                {t('landing.aboutTitle')}
              </h3>

              <p className="text-[0.98rem] sm:text-[1.05rem] text-ink-soft leading-[1.7] mb-6">
                {t('landing.aboutParagraph1')}
              </p>

              <p className="text-[0.98rem] sm:text-[1.05rem] text-ink-soft leading-[1.7] mb-6">
                {t('landing.aboutParagraph2')}
              </p>

              <p className="text-[0.98rem] sm:text-[1.05rem] text-ink-soft leading-[1.7]">
                {t('landing.aboutParagraph3')}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Privacy Section */}
        <ScrollReveal>
          <div className="relative scroll-mt-24" id="privacy">
            {/* Left accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-verified to-verified/50 rounded-full" />

            <div className="pl-6">
              <span className="font-mono text-[0.76rem] font-bold text-crimson-dark uppercase tracking-widest block mb-4">
                {t('landing.privacy')}
              </span>

              <h3 className="text-[1.5rem] sm:text-[1.75rem] font-serif font-bold text-ink leading-[1.15] mb-5">
                {t('landing.privacyTitle')}
              </h3>

              <p className="text-[0.98rem] sm:text-[1.05rem] text-ink-soft leading-[1.7] mb-8">
                {t('landing.privacyDescription')}
              </p>

              {/* Interactive Privacy Demo */}
              <PrivacyDemo />
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

const CountingStat = ({ target, label, description }: { target: number; label: string; description: string }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.8 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, target]);

  const formattedNumber = count.toLocaleString();

  return (
    <div ref={ref} className="bg-paper border border-line-soft rounded-[14px] p-8 sm:p-10 transition-all hover:shadow-md hover:border-crimson/30">
      <div className="text-[3rem] sm:text-[3.5rem] font-serif font-bold text-crimson leading-none mb-3">
        {formattedNumber}
      </div>
      <h3 className="text-[1.15rem] font-bold text-ink mb-3">
        {label}
      </h3>
      <p className="text-[0.94rem] text-ink-soft leading-[1.58]">
        {description}
      </p>
    </div>
  );
};

const DataField = ({ label, value, visible, actualValue }: { label: string; value: string; visible: boolean; actualValue?: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-[11px] font-mono font-bold text-ink-soft/60 uppercase">{label}</span>
    <span className={`text-sm font-bold transition-all duration-500 ${
      visible ? 'text-ink' : 'text-ink-soft/20 blur-[3px] select-none'
    }`}>
      {visible ? (actualValue || value) : value}
    </span>
  </div>
);

const PrivacyDemo = () => {
  const { t } = useTranslation();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleReveal = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsRevealed(true);
      setIsScanning(false);
    }, 1500);
  };

  const handleReset = () => {
    setIsRevealed(false);
  };

  return (
    <>
      <div className="bg-paper-dim rounded-2xl p-6 border border-line-soft mb-6 relative overflow-hidden">
        {/* Scanning Animation */}
        {isScanning && (
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-crimson/10 to-transparent animate-scan" />
        )}

        <div className="space-y-4">
          <DataField label={t('landing.demoBloodType')} value="O+" visible={true} />
          <DataField label={t('landing.demoDistance')} value="2.3 km" visible={true} />
          <DataField label={t('landing.demoName')} value={t('landing.demoHidden')} visible={isRevealed} actualValue="Abebe Bikila" />
          <DataField label={t('landing.demoPhone')} value={t('landing.demoHidden')} visible={isRevealed} actualValue="+251 911 234 567" />
        </div>

        {/* Status Badge */}
        <div className={`mt-4 p-3 rounded-xl text-center text-xs font-bold transition-all ${
          isRevealed
            ? 'bg-verified/10 text-verified border border-verified/20'
            : 'bg-sand/30 text-ink-soft border border-line-soft'
        }`}>
          {isRevealed ? t('landing.identityRevealed') : t('landing.identityProtected')}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={isRevealed ? handleReset : handleReveal}
        disabled={isScanning}
        className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl ${
          isScanning
            ? 'bg-sand text-ink-soft cursor-not-allowed'
            : isRevealed
            ? 'bg-ink text-paper hover:bg-crimson'
            : 'bg-crimson text-paper hover:bg-ink'
        }`}
      >
        {isScanning ? t('landing.revealing') : isRevealed ? t('landing.resetPrivacy') : t('landing.revealIdentity')}
      </button>
    </>
  );
};
