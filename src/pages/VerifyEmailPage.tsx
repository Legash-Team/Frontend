import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, RefreshCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';
// MODIFIED: Changed to default import to match your Button.tsx file
import Button from '@/components/ui/Button';

// Added this interface to fix the TypeScript "state" error
interface LocationState {
  email?: string;
}

const VerifyEmailPage = () => {
  // MODIFIED: Cast location to know about our state
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Use state email or fallback
  const userEmail = state?.email || "hospital.admin@gmail.com";
  
  // Masking logic
  const maskedEmail = userEmail.replace(/^(..)(.*)(?=@)/, (_, a, b) => a + b.replace(/./g, '*'));

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResendLink = async () => {
    setIsResending(true);
    // Mock API call
    setTimeout(() => {
      setIsResending(false);
      setResendSuccess(true);
      setTimeLeft(60);
      setTimeout(() => setResendSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      
      {/* 1. Back Navigation */}
      <div className="w-full max-w-md mb-8">
        <Link to="/register" className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-crimson transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to registration
        </Link>
      </div>

      {/* 2. The Information Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-line-soft rounded-[32px] p-10 shadow-2xl shadow-ink/5"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-crimson/5 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Mail size={40} className="text-crimson animate-pulse" />
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 border border-line-soft">
               <div className="w-2 h-2 rounded-full bg-crimson" />
            </div>
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-ink mb-4">Verify your email</h1>
          <p className="text-ink-soft text-[15px] leading-relaxed">
            We’ve sent a secure verification link to: <br/>
            <span className="text-ink font-bold font-mono tracking-tight text-sm">{maskedEmail}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* Resend Action */}
          <div className="text-center pt-2">
            {resendSuccess ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-verified text-sm font-bold flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> Link Resent Successfully
              </motion.p>
            ) : timeLeft > 0 ? (
              <p className="text-[11px] font-mono font-bold text-ink-soft/40 uppercase tracking-widest">
                Resend link in <span className="text-ink-soft">{timeLeft}s</span>
              </p>
            ) : (
              <button 
                onClick={handleResendLink}
                disabled={isResending}
                type="button"
                className="inline-flex items-center gap-2 text-xs font-bold text-crimson hover:text-crimson-dark transition-colors uppercase tracking-wider"
              >
                <RefreshCcw size={14} className={isResending ? 'animate-spin' : ''} /> 
                {isResending ? 'Resending...' : 'Resend Verification Link'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="mt-12 flex flex-col items-center gap-4 text-center">
        <p className="text-[9px] font-mono font-bold text-ink-soft/20 uppercase tracking-widest">
          © {new Date().getFullYear()} LEGASH • Ethiopia's Blood Network
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;