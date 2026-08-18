import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';

const LoginPage = () => {
  return (
    <AuthLayout 
      title="Welcome back" 
    >
      <form className="space-y-6">
        {/* We will build these inputs next */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">Email Address</label>
          <input type="email" className="w-full px-5 py-4 rounded-2xl bg-paper border border-line-soft focus:border-crimson outline-none transition-all" />
        </div>
        
        <Button variant="primary" className="w-full h-14">Sign In</Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;