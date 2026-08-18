import React from 'react';
interface PhoneInputProps {
  label: string;
  value: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean; // Add this
}

export const PhoneInput = ({ label, value, name, onChange, error, disabled, required }: PhoneInputProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
        {label} {required && <span className="text-crimson">*</span>}
      </label>
      
      <div className="flex group">
        {/* Static Prefix - The user sees it, but doesn't type it */}
        <div className="flex items-center px-3 bg-sand/30 border border-r-0 border-line-soft rounded-l-md text-ink font-bold text-sm">
          +251
        </div>

        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => {
            // STRICT: Only numbers, max 9 digits (since 251 is already there)
            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
            e.target.value = val;
            onChange(e);
          }}
          disabled={disabled}
          placeholder="911223344"
          className={`w-full px-4 py-3 bg-white border border-line-soft rounded-r-md outline-none transition-all 
            focus:border-crimson ${error ? 'border-crimson' : ''}`}
        />
      </div>
      {error && <p className="text-[10px] text-crimson font-bold uppercase">{error}</p>}
    </div>
  );
};