import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Activity, Zap } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const Trust = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-24 bg-white border-y border-line-soft scroll-mt-24" id="hospitals">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-8">

        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 sm:gap-16 items-center">

          {/* Left: Minimal Heading */}
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
               <ShieldCheck size={16} className="text-verified" />
               <span className="font-mono text-[10px] font-bold text-ink-soft uppercase tracking-[0.2em]">{t('landing.verifiedNetwork')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ink leading-tight mb-3 sm:mb-4">
              {t('landing.securityTitleLead')} <br/>
              <span className="text-crimson">{t('landing.securityTitleAccent')}</span>
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed max-w-sm">
              {t('landing.securityDescription')}
            </p>
          </ScrollReveal>

          {/* Right: The Strip (Low Profile) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <ScrollReveal delay={0}>
              <SmallFeature
                icon={<ShieldCheck size={20} />}
                title={t('landing.featureVettedTitle')}
                desc={t('landing.featureVettedDesc')}
              />
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <SmallFeature
                icon={<Activity size={20} />}
                title={t('landing.featureLiveStockTitle')}
                desc={t('landing.featureLiveStockDesc')}
              />
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <SmallFeature
                icon={<Zap size={20} />}
                title={t('landing.featureRadiusTitle')}
                desc={t('landing.featureRadiusDesc')}
              />
            </ScrollReveal>
          </div>

        </div>

        {/* Minimalist Bottom Bar */}
        <ScrollReveal className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-line-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div className="text-[10px] font-mono font-bold text-ink-soft/40 uppercase tracking-widest">
             {t('landing.trustedBy')}
           </div>
           <a href="/register" className="text-xs font-bold text-crimson hover:text-ink transition-colors flex items-center gap-2 group">
             {t('landing.registerYourFacility')} <span className="group-hover:translate-x-1 transition-transform">→</span>
           </a>
        </ScrollReveal>
      </div>
    </section>
  );
};

const SmallFeature = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex flex-col items-start group">
    <div className="text-crimson mb-4 transition-transform group-hover:scale-110">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-ink mb-2 uppercase tracking-tight">{title}</h3>
    <p className="text-[13px] text-ink-soft leading-snug">{desc}</p>
  </div>
);