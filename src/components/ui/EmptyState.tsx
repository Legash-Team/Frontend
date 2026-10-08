import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-line-soft shadow-xs ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-paper-dim flex items-center justify-center mx-auto text-ink-soft mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-serif font-bold text-base text-ink mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-ink-soft font-sans max-w-sm mx-auto mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
