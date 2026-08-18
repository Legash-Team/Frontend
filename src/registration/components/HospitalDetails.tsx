import React, { type ChangeEvent } from 'react';
import Input from '../../components/ui/Input';
import type { RegisterFormData, FormErrors } from '../types/registration-types';

export interface HospitalDetailsProps {
  formData: RegisterFormData;
  errors: FormErrors;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const HospitalDetails: React.FC<HospitalDetailsProps> = ({
  formData,
  errors,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
        Hospital Information
      </h3>

      <Input
        label="Hospital Name"
        name="name"
        type="text"
        placeholder="e.g. St. Paul Hospital"
        value={formData.name}
        onChange={onChange}
        error={errors.name}
        required
        disabled={disabled}
      />

      <Input
        label="License / Registration Number"
        name="licenseNumber"
        type="text"
        placeholder="e.g. MOH/HOSP/2024/098"
        value={formData.licenseNumber}
        onChange={onChange}
        error={errors.licenseNumber}
        required
        disabled={disabled}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email Address (Login ID)"
          name="email"
          type="email"
          placeholder="contact@hospital.org"
          value={formData.email}
          onChange={onChange}
          error={errors.email}
          required
          disabled={disabled}
        />

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="+251911234567"
          value={formData.phone}
          onChange={onChange}
          error={errors.phone}
          helperText="Ethiopian format (+251...)"
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default HospitalDetails;
