import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';

export const TermsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'am' || i18n.language === 'om' ? i18n.language : 'en';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-red-100/30 p-4 sm:p-8 md:p-12">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100 space-y-8">
        
        {/* Header and Language Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">{t('terms.platform')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t('terms.title')}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {t('terms.lastUpdated')}
            </p>
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => i18n.changeLanguage(language.code)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  lang === language.code
                    ? 'bg-white text-red-600 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t(`language.${language.code}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          <p className="font-medium text-gray-800">
            {t('terms.intro')}
          </p>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block"></span>
              {t('terms.dataTitle')}
            </h2>
            <p>
              {t('terms.dataP1')}
            </p>
            <p>
              {t('terms.dataP2')}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block"></span>
              {t('terms.usageTitle')}
            </h2>
            <p>
              {t('terms.usageP1')}
            </p>
            <p>
              {t('terms.usageP2')}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block"></span>
              {t('terms.verificationTitle')}
            </h2>
            <p>
              {t('terms.verificationP1')}
            </p>
            <p>
              {t('terms.verificationP2')}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-red-600 rounded-full inline-block"></span>
              {t('terms.responsibilitiesTitle')}
            </h2>
            <p>
              {t('terms.responsibilitiesP1')}
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2 text-gray-700">
              <li>{t('terms.responsibilityB1')}</li>
              <li>{t('terms.responsibilityB2')}</li>
              <li>{t('terms.responsibilityB3')}</li>
            </ul>
          </section>
        </div>

        {/* Footer Navigation Link */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
          >
            ← {t('terms.backToRegistration')}
          </Link>
          <span className="text-xs text-gray-400">{t('terms.footerBrand')}</span>
        </div>

      </div>
    </div>
  );
};

export default TermsPage;