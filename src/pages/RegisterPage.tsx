import React from 'react';
import AuthLayout from '../layouts/AuthLayout';
import RegistrationForm from '../registration/components/RegistrationForm';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Hospital Account Registration"
      subtitle="Register your medical facility to access the Legash Emergency Blood Network"
    >
      <RegistrationForm />
    </AuthLayout>
  );
};

export default RegisterPage;
