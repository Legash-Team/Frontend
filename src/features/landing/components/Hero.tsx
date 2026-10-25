import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { useTranslation } from 'react-i18next';

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative pt-[104px] pb-16 sm:pt-[128px] sm:pb-24 min-h-[calc(100vh-76px)] flex items-center justify-center overflow-hidden bg-paper">
      {/* Full-width ECG heartbeat line with large center gap to avoid text */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-0 w-full overflow-hidden flex items-center"
        aria-hidden="true"
        style={{ maskImage: 'linear-gradient(to right, black 0%, black 20%, transparent 35%, transparent 65%, black 80%, black 100%)', WebkitMaskImage: 'linear-gradient(to right, black 0%, black 20%, transparent 35%, transparent 65%, black 80%, black 100%)' }}
      >
        <div className="flex w-[200%] shrink-0 ecg-flow">
          <div className="w-1/2 shrink-0">
            <EcgTrack />
          </div>
          <div className="w-1/2 shrink-0">
            <EcgTrack />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-[860px] mx-auto px-4 sm:px-6 md:px-8 text-center flex flex-col items-center justify-center">
        <ScrollReveal className="inline-flex items-center gap-2 text-[0.76rem] font-bold text-crimson-dark uppercase mb-4 sm:mb-5">
          <span className="w-[7px] h-[7px] rounded-full bg-crimson animate-[blip_1.8s_ease-in-out_infinite]" />
          {t('landing.heroBadge')}
        </ScrollReveal>

        <ScrollReveal as="h1" delay={100} className="text-[clamp(2.2rem,5.5vw,4.25rem)] leading-[1.08] text-ink mb-5 sm:mb-6">
          {t('landing.heroTitleLead')}<br className="hidden sm:inline" /> {t('landing.heroTitleMid')} <em className="italic text-crimson font-serif">{t('landing.heroTitleEmphasis')}</em>
        </ScrollReveal>

        <ScrollReveal as="p" delay={200} className="text-base sm:text-[1.13rem] leading-relaxed text-ink-soft max-w-[48ch] mx-auto mb-8 sm:mb-10">
          {t('landing.heroDescription')}
        </ScrollReveal>

        <ScrollReveal delay={300} className="flex justify-center gap-3.5 flex-wrap mb-8 sm:mb-10">
          <Button
            variant="primary"
            size="md"
            href="/register"
            className="bg-crimson border-2 border-crimson hover:bg-ink hover:border-ink transition-all duration-300 shadow-md w-full sm:w-auto justify-center"
          >
            {t('landing.registerHospital')}
          </Button>
        </ScrollReveal>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <ScrollReveal delay={400}>
            <Fact text={t('landing.factVerifyEmail')} />
          </ScrollReveal>
          <ScrollReveal delay={500}>
            <Fact text={t('landing.factAdminReview')} />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

const ECG_PATH =
  'M 0 70 L 120 70 L 140 45 L 160 70 L 180 70 L 200 90 L 220 5 L 245 135 L 270 70 L 290 70 L 310 40 L 330 70 L 480 70 ' +
  'L 600 70 L 620 45 L 640 70 L 660 70 L 680 90 L 700 5 L 725 135 L 750 70 L 770 70 L 790 40 L 810 70 L 960 70 ' +
  'L 1080 70 L 1100 45 L 1120 70 L 1140 70 L 1160 90 L 1180 5 L 1205 135 L 1230 70 L 1250 70 L 1270 40 L 1290 70 L 1440 70 ' +
  'L 1560 70 L 1580 45 L 1600 70 L 1620 70 L 1640 90 L 1660 5 L 1685 135 L 1710 70 L 1730 70 L 1750 40 L 1770 70 L 1920 70 ' +
  'L 2040 70 L 2060 45 L 2080 70 L 2100 70 L 2120 90 L 2140 5 L 2165 135 L 2190 70 L 2210 70 L 2230 40 L 2250 70 L 2400 70';

const EcgTrack = () => (
  <svg
    viewBox="0 0 2400 140"
    className="w-full h-28 sm:h-36 md:h-44"
    preserveAspectRatio="none"
    fill="none"
  >
    {/* Single unbroken pulse line in pure, uniform LEGASH crimson */}
    <path
      d={ECG_PATH}
      stroke="#C31F3B"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: 'drop-shadow(0 0 5px rgba(195, 31, 59, 0.45))' }}
    />
  </svg>
);

const Fact = ({ text }: { text: string }) => (
  <div className="flex items-start sm:items-center gap-2.5 max-w-[280px] text-left">
    <svg className="w-4.5 h-4.5 text-verified mt-0.5 sm:mt-0 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
    <span className="text-[0.86rem] text-ink-soft leading-tight">{text}</span>
  </div>
);
