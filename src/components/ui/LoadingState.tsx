import { useTranslation } from 'react-i18next';
import { Spinner } from './Spinner';

interface LoadingStateProps {
  text?: string;
  className?: string;
}

export const LoadingState = ({
  text,
  className = '',
}: LoadingStateProps) => {
  const { t } = useTranslation();
  const label = text ?? t('common.loading');

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center py-12 ${className}`}
    >
      <Spinner size="md" />
      <p className="mt-3 text-sm font-sans text-ink-soft font-medium">{label}</p>
    </div>
  );
};

export default LoadingState;
