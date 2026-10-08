import { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  requiredBadge?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, requiredBadge = false, className = '', id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-soft flex items-center justify-between">
            <span>
              {label}
              {(required || requiredBadge) && <span className="text-crimson ml-1">*</span>}
            </span>
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-ink placeholder-ink-soft/40 
            transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson
            ${error ? 'border-crimson bg-crimson/5' : 'border-line-soft hover:border-line'}
            disabled:bg-paper-dim disabled:text-ink-soft/50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-crimson font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-ink-soft/60">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
