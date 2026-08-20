import React, { useState, ChangeEvent } from 'react';
import Input from '@/components/ui/Input';
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

  return (
    <div className="space-y-4">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.password}
          onChange={onChange}
          error={errors.password}
          helperText="Min 8 chars, 1 uppercase & 1 special char"
          required
          disabled={disabled}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={onChange}
          error={errors.confirmPassword}
          helperText="Must match Password"
          required
          disabled={disabled}
        />
      </div>
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-xs text-red-600 hover:text-red-700 font-medium focus:outline-none"
        >
          {showPassword ? 'Hide Passwords' : 'Show Passwords'}
        </button>
      </div>

    </div>
  );
};

export default PasswordFields;
