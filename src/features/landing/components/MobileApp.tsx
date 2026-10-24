import { useTranslation } from 'react-i18next';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const MobileApp = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-20 bg-paper-dim">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-8">

        <ScrollReveal className="max-w-[800px] mx-auto text-center">
          <span className="font-mono text-[0.76rem] font-bold text-crimson-dark uppercase tracking-widest block mb-3.5">
            {t('landing.mobileBadge')}
          </span>
          <h2 className="text-[clamp(1.75rem,3vw,2.6rem)] font-serif font-bold text-ink leading-[1.15] mb-4">
            {t('landing.mobileTitle')}
          </h2>
          <p className="text-base sm:text-[1.05rem] text-ink-soft leading-relaxed">
            {t('landing.mobileDescription')}
          </p>
        </ScrollReveal>

      </div>
    </section>
  );
};
