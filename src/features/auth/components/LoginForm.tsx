import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Lock, Mail, Clock, AlertCircle } from 'lucide-react'; // Added Clock & AlertCircle
import { motion, AnimatePresence } from 'framer-motion'; // For the smooth popup

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- NEW STATE ADDED HERE ---
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // In a real scenario, you would call your API here:
      // const response = await loginUser(email, password);
      
      // MOCK LOGIC FOR YOUR TEST:
      // If the backend returns: "Your account is still pending Super Admin approval."
      const isPending = true; // Change this to false to test successful login

      if (isPending) {
        setShowPendingModal(true);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.error || "Invalid email or password");
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Banner for standard errors (wrong password, etc) */}
        {errorMessage && (
          <div className="p-4 bg-crimson/5 border border-crimson/20 rounded-lg flex items-center gap-3 text-crimson text-xs font-bold uppercase">
            <AlertCircle size={16} />
            {errorMessage}
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
            <button type="button" className="text-[10px] font-bold text-crimson hover:underline uppercase tracking-tighter">
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