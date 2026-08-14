import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Hospital Portal Login"
      subtitle="Sign in with your registered email and password"
    >
      <div className="space-y-6 text-center py-4">
        <p className="text-sm text-gray-600">
          This is the Login Page placeholder. Hospital and Super Admin login feature belongs to the Login Developer.
        </p>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Need to register your facility?{' '}
            <Link to="/register" className="text-red-600 hover:text-red-700 font-semibold hover:underline">
              Create a Hospital Account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
