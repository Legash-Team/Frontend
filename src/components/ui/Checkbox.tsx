import React, { type InputHTMLAttributes, forwardRef } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={checkboxId} className="inline-flex items-start gap-2.5 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={`mt-0.5 h-4 w-4 rounded border-line-soft text-crimson focus:ring-crimson cursor-pointer ${className}`}
            {...props}
          />
          {label && <span className="text-sm text-ink-soft leading-snug">{label}</span>}
        </label>
        {error && <p className="text-xs text-crimson font-medium pl-6">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
