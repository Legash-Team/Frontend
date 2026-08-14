import React, { type InputHTMLAttributes, forwardRef } from 'react';

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
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>
              {label}
              {(required || requiredBadge) && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400 
            transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600
            ${error ? 'border-red-500 bg-red-50/20' : 'border-gray-300 hover:border-gray-400'}
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
