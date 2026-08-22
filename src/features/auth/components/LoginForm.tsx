import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { 
  requestPasswordResetEmail, 
  resetPassword // ADDED THIS IMPORT
} from '@/features/auth/api/auth-api'; 
import { Eye, EyeOff, Lock, Mail, Clock, AlertCircle, X, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // --- 1. STATE ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showPendingModal, setShowPendingModal] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  // Forgot/Reset Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // --- 2. HANDLERS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsRejected(false);
    setIsLoading(true);
    try {
      const data = await login({ email: email.trim(), password });
      if (data.role === 'admin' || data.role === 'superadmin') {
        navigate('/admin/dashboard');
      } else {
        const fromPath = (location.state as any)?.from?.pathname || '/hospital/dashboard';
        navigate(fromPath, { replace: true });
      }
    } catch (err: any) {
      const backendError = err.response?.data?.error || err.message || "";
      if (backendError.includes("pending Super Admin approval")) {
        setShowPendingModal(true);
      } else if (backendError.toLowerCase().includes("not approved") || backendError.toLowerCase().includes("rejected")) {
        setIsRejected(true);
        setErrorMsg(backendError || 'Your registration was not approved. Check your email for details.');
      } else {
        setErrorMsg(backendError || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);
    try {
      const res = await requestPasswordResetEmail(forgotEmail.trim());
      if (res.success) {
        setForgotStep('reset');
        setForgotSuccess("Verification code sent to your email.");
      }
    } catch (err: any) {
      setForgotError(err);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setForgotError("Passwords do not match.");
      return;
    }
    setForgotError(null);
    setForgotLoading(true);
    try {
      const res = await resetPassword({
        email: forgotEmail.trim(),
        code: resetCode,
        newPassword
      });
      if (res.success) {
        setForgotSuccess("Password updated! Please log in.");
        setTimeout(() => {
          setForgotModalOpen(false);
          setForgotStep('request');
          setForgotSuccess(null);
        }, 3000);
      }
    } catch (err: any) {
      setForgotError(err);
    } finally {
      setForgotLoading(false);
    }
  };

  // --- 3. RENDER ---
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-3.5 bg-crimson/10 border border-crimson/20 rounded-xl text-crimson text-xs font-medium flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {isRejected && (
              <Link 
                to={`/appeal?email=${encodeURIComponent(email.trim())}`}
                className="font-bold underline hover:text-crimson/80 ml-6 text-[11px]"
              >
                Click here to submit an appeal or inquiry →
              </Link>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
            Email Address <span className="text-crimson">*</span>
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40 group-focus-within:text-crimson transition-colors" size={18} />
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@hospital.org"
              className="w-full h-12 pl-12 pr-4 bg-white border border-line-soft rounded-xl outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/10 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
            Password <span className="text-crimson">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40 group-focus-within:text-crimson transition-colors" size={18} />
            <input 
              type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 pl-12 pr-12 bg-white border border-line-soft rounded-xl outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/10 transition-all text-sm font-medium"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft/40 hover:text-ink transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => setForgotModalOpen(true)} className="text-[11px] font-bold text-crimson hover:underline uppercase tracking-wider">
              Forgot Password?
            </button>
          </div>
        </div>

        <div className="pt-2 space-y-4">
          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full h-14 bg-crimson hover:bg-crimson/90 text-white font-bold rounded-2xl shadow-lg text-base">
            Log In
          </Button>
          <p className="text-center text-sm text-ink-soft">
            New facility?{' '}
            <Link to="/register" className="text-crimson font-bold hover:underline">
              Register Hospital
            </Link>
          </p>
        </div>
      </form>

      {/* --- MODAL: PENDING --- */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-ink/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl">
              <Clock className="w-16 h-16 text-amber-500 mx-auto mb-6" />
              <h3 className="text-2xl font-serif font-bold text-ink mb-4">Approval Pending</h3>
              <p className="text-ink-soft text-sm mb-8">Your account is under review by our Super Admin. You will receive an email once approved.</p>
              <Button onClick={() => setShowPendingModal(false)} className="w-full rounded-xl">Understood</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: FORGOT/RESET --- */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-ink/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl relative">
              <button onClick={() => setForgotModalOpen(false)} className="absolute top-6 right-6 text-ink-soft hover:text-ink"><X size={20}/></button>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-ink mb-2">
                  {forgotStep === 'request' ? 'Reset Password' : 'New Credentials'}
                </h3>
                <p className="text-ink-soft text-sm">
                  {forgotStep === 'request' ? 'Enter your email to receive a reset code.' : 'Enter the code from your email and set a new password.'}
                </p>
              </div>

              {forgotError && <div className="mb-4 p-3 bg-crimson/5 text-crimson text-[10px] font-bold uppercase rounded-lg">{forgotError}</div>}
              {forgotSuccess && <div className="mb-4 p-3 bg-verified/5 text-verified text-[10px] font-bold uppercase rounded-lg">{forgotSuccess}</div>}

              {forgotStep === 'request' ? (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest text-left">Email Address</label>
                    <input 
                      type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson"
                    />
                  </div>
                  <Button type="submit" isLoading={forgotLoading} className="w-full h-12 rounded-xl">Send Code</Button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <input 
                    type="text" required maxLength={6} placeholder="6-Digit Code"
                    value={resetCode} onChange={(e) => setResetCode(e.target.value)}
                    className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson text-center font-mono text-xl tracking-[0.5em]"
                  />
                  <input 
                    type="password" required placeholder="New Password"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson"
                  />
                  <input 
                    type="password" required placeholder="Confirm New Password"
                    value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full h-12 px-4 bg-paper border border-line-soft rounded-xl outline-none focus:border-crimson"
                  />
                  <Button type="submit" isLoading={forgotLoading} className="w-full h-12 rounded-xl">Update Password</Button>
                  <button type="button" onClick={() => setForgotStep('request')} className="w-full text-[10px] font-bold text-ink-soft uppercase flex items-center justify-center gap-1 mt-2">
                    <ChevronLeft size={14}/> Back
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};