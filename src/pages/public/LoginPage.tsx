import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';

const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <AuthLayout 
      title={t('auth.login.title')} 
      subtitle={t('auth.login.subtitle')}
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;