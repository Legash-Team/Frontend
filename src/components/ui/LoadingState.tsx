import { Spinner } from './Spinner';

interface LoadingStateProps {
  text?: string;
  className?: string;
}

export const LoadingState = ({
  text = 'Loading...',
  className = '',
}: LoadingStateProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center py-12 ${className}`}
    >
      <Spinner size="md" />
      <p className="mt-3 text-sm font-sans text-ink-soft font-medium">{text}</p>
    </div>
  );
};

export default LoadingState;
