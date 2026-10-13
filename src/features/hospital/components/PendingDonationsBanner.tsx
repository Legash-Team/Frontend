import React from 'react';
import { ClipboardCheck, ArrowRight, HeartPulse, Sparkles } from 'lucide-react';

interface PendingDonationsBannerProps {
  count: number;
  onOpenQueue: () => void;
  loading?: boolean;
}

export const PendingDonationsBanner: React.FC<PendingDonationsBannerProps> = ({
  count,
  onOpenQueue,
  loading = false,
}) => {
  if (count <= 0) return null;

  return (
    <div
      id="pending-donations-banner"
      className="relative overflow-hidden rounded-2xl border-2 border-crimson/25 bg-gradient-to-r from-red-50 via-paper to-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md"
      role="region"
      aria-label="Pending Donation Confirmation Banner"
    >
      {/* Decorative background glow accents */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-crimson/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          {/* Animated Badge Icon */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-crimson/10 border border-crimson/20 flex items-center justify-center text-crimson shadow-xs">
              <ClipboardCheck className="w-6 h-6 stroke-[2]" />
            </div>
            {/* Blinking indicator dot */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-crimson text-white text-[9px] font-mono font-bold items-center justify-center">
                {count > 99 ? '99+' : count}
              </span>
            </span>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-crimson/10 border border-crimson/20 text-crimson text-[11px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-crimson" />
              <span>Action Required</span>
            </div>

            <h3 className="text-lg sm:text-xl font-serif font-bold text-ink tracking-tight flex items-center gap-2">
              <span>
                You have {count} donation {count === 1 ? 'record' : 'records'} to confirm
              </span>
            </h3>

            <p className="text-xs sm:text-sm font-sans text-ink-soft leading-relaxed max-w-2xl">
              Donors have accepted requests for your facility. Review each donor in chronological order to record successful donations or mark non-donations.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <button
            id="open-donation-queue-btn"
            type="button"
            onClick={onOpenQueue}
            disabled={loading}
            className="group inline-flex items-center gap-2.5 px-5 py-3 bg-crimson hover:bg-crimson-dark active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-sans font-bold transition-all shadow-sm hover:shadow hover:gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HeartPulse className="w-4 h-4 text-white stroke-[2]" />
            <span>Open Queue</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-mono font-bold">
              {count} pending
            </span>
            <ArrowRight className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingDonationsBanner;
