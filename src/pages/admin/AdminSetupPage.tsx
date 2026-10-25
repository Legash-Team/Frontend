import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { setupAdminPassword } from '@/features/auth/api/auth-api';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

const AdminSetupPage = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const setupToken = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupToken) {
      setError(t('adminSetup.tokenMissing'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.login.passwordsMismatch'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await setupAdminPassword({
        setupToken,
        password,
        confirmPassword
      });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={t('adminSetup.title')} 
      subtitle={t('adminSetup.subtitle')}
    >
      {!setupToken ? (
        <div className="text-center p-6 bg-crimson/5 rounded-2xl border border-crimson/20">
          <ShieldCheck className="w-12 h-12 text-crimson mx-auto mb-4 opacity-50" />
          <p className="text-ink font-bold">{t('adminSetup.invalidTitle')}</p>
          <p className="text-ink-soft text-sm">{t('adminSetup.invalidSubtitle')}</p>
        </div>
      ) : isSuccess ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-verified mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-bold text-ink mb-2">{t('adminSetup.successTitle')}</h2>
          <p className="text-ink-soft">{t('adminSetup.successBody')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-crimson/5 border border-crimson/20 rounded-xl text-crimson text-xs font-bold uppercase flex gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">{t('adminSetup.newPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40" size={18} />
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-13 pl-12 pr-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">{t('adminSetup.confirmPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40" size={18} />
              <input 
                type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-13 pl-12 pr-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson text-sm"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full h-14 font-bold shadow-lg">
            {t('adminSetup.submit')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default AdminSetupPage;