import React, { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import Checkbox from '../../components/ui/Checkbox';

export interface TermsAgreementProps {
  agreeToTerms: boolean;
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const TermsAgreement: React.FC<TermsAgreementProps> = ({
  agreeToTerms,
  error,
  onChange,
  disabled = false,
}) => {
  const termsLabel = (
    <span>
      I agree to the{' '}
      <Link
        to="/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="text-red-600 hover:text-red-700 underline font-medium"
      >
        Terms of Service & Privacy Policy
      </Link>{' '}
      and confirm all registered hospital details are official and accurate.
    </span>
  );

  return (
    <div className="pt-2">
      <Checkbox
        name="agreeToTerms"
        checked={agreeToTerms}
        onChange={onChange}
        label={termsLabel}
        error={error}
        disabled={disabled}
      />
    </div>
  );
};

export default TermsAgreement;
