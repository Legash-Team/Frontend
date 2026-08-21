import React from 'react';
import { AuthLayout } from '@/layouts/AuthLayout';
import RegistrationForm from '@/features/registration/components/RegistrationForm';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
    title = "Join Us">
      <RegistrationForm />
    </AuthLayout>
  );
};

export default RegisterPage;
