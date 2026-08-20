import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Lock, Mail, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { requestPasswordResetEmail } from '@/services/hospitalService';
import { motion, AnimatePresence } from 'motion/react';

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot Password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Pending Approval Modal state
  const [showPendingModal, setShowPendingModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await login({ email: email.trim(), password });

      const fromPath =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ||
        '/hospital/dashboard';

      navigate(fromPath, { replace: true });
    } catch (err: unknown) {
      let message = 'Failed to log in. Please check your hospital credentials.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as {
          response?: {
            status?: number;
            data?: { message?: string; error?: string; detail?: string };
          };
        };
        if (
          axiosErr.response?.status === 403 ||
          axiosErr.response?.data?.message?.toLowerCase().includes('pending') ||
          axiosErr.response?.data?.error?.toLowerCase().includes('pending')
        ) {
          setShowPendingModal(true);
          return;
        } else if (axiosErr.response?.status === 401) {
          message =
            axiosErr.response?.data?.error ||
            axiosErr.response?.data?.message ||
            'Invalid email or password. Please verify your credentials.';
        } else {
          message =
            axiosErr.response?.data?.message ||
            axiosErr.response?.data?.error ||
            axiosErr.response?.data?.detail ||
            message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    setForgotLoading(true);

    try {
      const res = await requestPasswordResetEmail(forgotEmail.trim());
      setForgotSuccess(res.message || 'Password reset link sent! Check your hospital email inbox.');
    } catch (err: unknown) {
      let message = 'Failed to send reset link. Please verify the email address.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setForgotError(message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-3.5 bg-crimson/10 border border-crimson/20 rounded-xl text-crimson text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 stroke-[1.75]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
            Email Address <span className="text-crimson">*</span>
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40 group-focus-within:text-crimson transition-colors" size={18} />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@hospital.org"
              className="w-full h-13 pl-12 pr-4 bg-paper border border-line-soft rounded-md outline-none focus:border-crimson transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
            Password <span className="text-crimson">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40 group-focus-within:text-crimson transition-colors" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-13 pl-12 pr-12 bg-paper border border-line-soft rounded-md outline-none focus:border-crimson transition-all text-sm font-medium"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft/40 hover:text-ink transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex justify-end">
            <button 
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setForgotModalOpen(true);
                setForgotSuccess(null);
                setForgotError(null);
              }}
              className="text-[10px] font-bold text-crimson hover:underline uppercase tracking-tighter"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Action Area */}
        <div className="pt-4 space-y-6">
          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isLoading}
            className="w-full h-14 font-bold text-base shadow-lg rounded-md"
          >
            Log In
          </Button>
          <p className="text-center text-sm text-ink-soft">
            New facility?{' '}
            <Link to="/register" className="text-crimson font-bold hover:underline underline-offset-4">
              Register Hospital
            </Link>
          </p>
        </div>
      </form>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-line-soft rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line-soft">
              <h3 className="font-serif font-bold text-ink text-lg">Reset Hospital Password</h3>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="text-ink-soft hover:text-ink text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-sans text-ink-soft">
              Enter your registered hospital email address to receive a secure password recovery link.
            </p>

            {forgotSuccess && (
              <div className="p-3 bg-verified/10 border border-verified/20 text-verified rounded-xl text-xs font-medium">
                {forgotSuccess}
              </div>
            )}

            {forgotError && (
              <div className="p-3 bg-crimson/10 border border-crimson/20 text-crimson rounded-xl text-xs font-medium">
                {forgotError}
              </div>
            )}

            {!forgotSuccess && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
                    Hospital Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="contact@hospital.org"
                    className="w-full h-11 px-3.5 bg-paper border border-line-soft rounded-lg text-sm outline-none focus:border-crimson"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 border border-line-soft text-ink-soft rounded-xl text-xs font-semibold hover:bg-paper"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={forgotLoading}
                    loadingText="Sending Link..."
                    className="px-5 text-xs"
                  >
                    Send Recovery Link
                  </Button>
                </div>
              </form>
            )}

            {forgotSuccess && (
              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-5 text-xs"
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PENDING APPROVAL MODAL --- */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPendingModal(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl border border-line-soft"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
                <Clock size={40} strokeWidth={1.5} />
              </div>
              
              <h3 className="text-2xl font-serif font-bold text-ink mb-4">Approval Pending</h3>
              
              <p className="text-ink-soft text-sm leading-relaxed mb-8">
                Your email is verified, but your hospital account is currently under review by our Super Admin. 
                <br /><br />
                You will receive an official notification once your access is granted.
              </p>

              <Button 
                onClick={() => setShowPendingModal(false)}
                className="w-full rounded-xl h-12 text-xs font-bold uppercase tracking-widest"
              >
                Understood
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LoginForm;