import React from 'react';
import { AuthLayout } from '@/layouts/AuthLayout';
import RegistrationForm from '@/components/common/RegistrationForm';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Join Us">
      <RegistrationForm />
    </AuthLayout>
  );
};

export default RegisterPage;
