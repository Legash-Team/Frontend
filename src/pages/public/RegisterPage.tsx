import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/layouts/AuthLayout';
import RegistrationForm from '@/features/registration/components/RegistrationForm';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AuthLayout
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
    >
      <RegistrationForm />
    </AuthLayout>
  );
};

export default RegisterPage;
