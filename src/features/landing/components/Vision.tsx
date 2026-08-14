import { useTranslation } from '@/context/LanguageContext';
import { AlertTriangle, Map, BarChart3, ArrowRight } from 'lucide-react';

export const Vision = () => {
  const { t } = useTranslation();

  return (
    <section className="py-32 bg-white" id="vision">
      <div className="max-w-[1180px] mx-auto px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-24">
          <span className="font-mono text-xs font-bold text-crimson uppercase tracking-[0.2em] mb-6 block">
            {t('vision_eyebrow')}
          </span>
          <h2 className="text-5xl font-serif font-bold text-ink leading-tight">
            {t('vision_title')}
          </h2>
        </div>

        {/* The Real Problems: Vertical Stack */}
        <div className="grid lg:grid-cols-12 gap-16 mb-32">
          <div className="lg:col-span-4">
            <h3 className="text-2xl font-bold text-ink mb-6">Real-Time Challenges in Ethiopia</h3>
            <p className="text-ink-soft">Our research across local facilities identified these three critical failure points.</p>
          </div>
          
          <div className="lg:col-span-8 space-y-12">
            <ProblemRow 
              icon={<AlertTriangle className="text-amber-600" />}
              title={t('problem_1_title')}
              desc={t('problem_1_desc')}
            />
            <ProblemRow 
              icon={<Map className="text-amber-600" />}
              title={t('problem_2_title')}
              desc={t('problem_2_desc')}
            />
            <ProblemRow 
              icon={<BarChart3 className="text-amber-600" />}
              title={t('problem_3_title')}
              desc={t('problem_3_desc')}
            />
          </div>
        </div>

        {/* The Roadmap: Future Plan Horizontal */}
        <div className="bg-ink rounded-[40px] p-12 text-paper relative overflow-hidden">
          <h3 className="text-3xl font-serif font-bold mb-12 relative z-10">{t('plan_title')}</h3>
          
          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            <PlanStep number="01" text={t('plan_step_1')} />
            <PlanStep number="02" text={t('plan_step_2')} />
            <PlanStep number="03" text={t('plan_step_3')} />
          </div>

          {/* Abstract background detail */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-crimson/10 blur-[80px] rounded-full" />
        </div>
      </div>
    </section>
  );
};

const ProblemRow = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-8 group">
    <div className="shrink-0 w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
      {icon}
    </div>
    <div>
      <h4 className="text-xl font-bold text-ink mb-3">{title}</h4>
      <p className="text-ink-soft leading-relaxed max-w-2xl">{desc}</p>
    </div>
  </div>
);

const PlanStep = ({ number, text }: { number: string, text: string }) => (
  <div className="flex flex-col gap-6">
    <div className="text-crimson font-mono font-bold text-sm tracking-widest flex items-center gap-4">
      STEP {number} <ArrowRight size={14} />
    </div>
    <p className="text-paper/70 font-medium leading-relaxed">
      {text}
    </p>
  </div>
);