import React, { ChangeEvent } from 'react';
import { PhoneInput } from '@/components/ui/PhoneInput';
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
    <div className="space-y-8">
     

      {/* 2. Compact 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* Hospital Name */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
  Hospital Name <span className="text-crimson">*</span>
</label>
          <input
            name="name"
            type="text"
            placeholder="e.g. St. Paul Hospital"
            value={formData.name}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white border border-line-soft rounded-xl outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/10 transition-all text-sm font-medium"
          />
          {errors.name && <p className="text-[10px] text-crimson font-bold uppercase mt-1">{errors.name}</p>}
        </div>

        {/* License Number */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
  Medical License Number <span className="text-crimson">*</span>
</label>
          <input
            name="licenseNumber"
            type="text"
            placeholder="e.g. MOH/HOSP/098"
            value={formData.licenseNumber}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white border border-line-soft rounded-xl outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/10 transition-all text-sm font-medium"
          />
          {errors.licenseNumber && <p className="text-[10px] text-crimson font-bold uppercase mt-1">{errors.licenseNumber}</p>}
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
  Email <span className="text-crimson">*</span>
</label>
          <input
            name="email"
            type="email"
            placeholder="contact@hospital.org"
            value={formData.email}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white border border-line-soft rounded-xl outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/10 transition-all text-sm font-medium"
          />
          {errors.email && <p className="text-[10px] text-crimson font-bold uppercase mt-1">{errors.email}</p>}
        </div>

        {/* INTEGRATED PHONE INPUT */}
        <PhoneInput
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          error={errors.phone}
          disabled={disabled}
          required={true}
        />
        {/* Address */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
            Address <span className="text-crimson">*</span>
          </label>
          <input
            name="address"
            placeholder="e.g. Bole Sub-city, Woreda 03, Addis Ababa"
            value={formData.address || ''}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white border border-line-soft rounded-xl outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/10 transition-all text-sm font-medium"
          />
          {errors.address && <p className="text-[10px] text-crimson font-bold uppercase mt-1">{errors.address}</p>}
        </div>
      </div>
    </div>
  );
};

export default HospitalDetails;