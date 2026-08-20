import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginForm } from '@/features/auth/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout 
      title="Welcome back" 
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
