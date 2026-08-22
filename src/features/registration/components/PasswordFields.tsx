import React, { useState, ChangeEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { RegisterFormData, FormErrors } from '../types/registration-types';

export interface PasswordFieldsProps {
  formData: RegisterFormData;
  errors: FormErrors;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const PasswordFields: React.FC<PasswordFieldsProps> = ({
  formData,
  errors,
  onChange,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
          Password <span className="text-crimson">*</span>
        </label>
        <div className="relative group">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-4 py-3 pr-11 bg-white border border-line-soft rounded-xl outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/10 transition-all text-sm font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40 hover:text-ink transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[10px] text-crimson font-bold uppercase mt-1">
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
          Confirm Password <span className="text-crimson">*</span>
        </label>
        <div className="relative group">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-4 py-3 pr-11 bg-white border border-line-soft rounded-xl outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/10 transition-all text-sm font-medium"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40 hover:text-ink transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-[10px] text-crimson font-bold uppercase mt-1">
            {errors.confirmPassword}
          </p>
        )}
      </div>
    </div>
  );
};

export default PasswordFields;
