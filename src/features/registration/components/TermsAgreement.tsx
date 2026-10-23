import React, { type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1 pt-1">
      <label className="inline-flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={agreeToTerms}
          onChange={onChange}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 rounded border-line-soft text-crimson focus:ring-crimson accent-crimson cursor-pointer"
        />
        <span className="text-xs sm:text-sm text-ink-soft leading-snug">
          {t('auth.register.termsPrefix')}{' '}
          <Link
            to="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-crimson font-bold hover:underline"
          >
            {t('auth.register.termsLink')}
          </Link>{' '}
          {t('auth.register.termsSuffix')}
        </span>
      </label>
      {error && (
        <p className="text-[10px] text-crimson font-bold uppercase pl-7 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default TermsAgreement;
