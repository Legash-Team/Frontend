import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Retry',
  className = '',
}: ErrorStateProps) => {
  return (
    <div
      role="alert"
      className={`bg-crimson/5 border border-crimson/20 rounded-xl p-4 text-ink text-sm flex items-start justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-crimson shrink-0" />
        <div>
          <p className="font-serif font-bold text-ink">{title}</p>
          <p className="text-crimson text-xs mt-0.5 font-sans">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-crimson/10 hover:bg-crimson/20 text-crimson px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
