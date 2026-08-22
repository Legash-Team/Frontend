import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to manage blood requests and donor coordinates."
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;