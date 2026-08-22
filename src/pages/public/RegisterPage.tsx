import React from 'react';
import { AuthLayout } from '@/layouts/AuthLayout';
import RegistrationForm from '@/features/registration/components/RegistrationForm';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Welcome to Legash"
      subtitle="Register your healthcare facility or hospital account to join the network."
    >
      <RegistrationForm />
    </AuthLayout>
  );
};

export default RegisterPage;

