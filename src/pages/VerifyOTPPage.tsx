import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, RefreshCcw } from 'lucide-react';
import Button from '@/components/ui/Button';

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Logic State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email Masking (e.g., ho***@hospital.com)
  const userEmail = location.state?.email || "hospital.admin@gmail.com";
  const maskedEmail = userEmail.replace(/^(..)(.*)(?=@)/, (_match: string, a: string, b: string) => 
    a + b.replace(/./g, '*')
  );

  // 60-Second Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle Typing & Auto-jump
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Strictly numbers
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); 
    setOtp(newOtp);

    // Move to next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace jumping back
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const code = otp.join('');
      // Simulation of Backend Call
      setTimeout(() => {
        setIsVerifying(false);
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError("The code you entered is incorrect. Please check your email.");
      setIsVerifying(false);
    }
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

      {/* 2. The Focused Card (Extra Rounded: 40px) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-line-soft rounded-[40px] p-10 md:p-12 shadow-2xl shadow-ink/5"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-crimson/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-crimson">
            <Mail size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink mb-4">Verify your email</h1>
          
          {/* Longer, more natural description */}
          <p className="text-ink-soft text-[15px] leading-relaxed px-2">
            A 6-digit verification code has been sent to your registered email: <br/>
            <span className="text-ink font-bold font-mono tracking-tight">{maskedEmail}</span>. 
           
          </p>
        </div>

        {/* 3. The 6-Digit Smooth Inputs */}
        <div className="flex justify-between gap-2 mb-10">
          {otp.map((digit, index) => (
            <div key={index} className="relative w-12 h-16">
              <input
                ref={(el) => { inputRefs.current[index] = el; }} // Fixed TS Ref logic
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-full h-full text-center text-2xl font-serif font-bold bg-paper border-2 rounded-xl outline-none transition-all duration-300
                  ${digit ? 'border-crimson bg-white' : 'border-line-soft focus:border-crimson/50'}`}
              />
              <AnimatePresence>
                {digit && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 pointer-events-none border-2 border-crimson rounded-xl"
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Error Feedback */}
        {error && <p className="text-[10px] text-crimson font-bold uppercase text-center mb-6">{error}</p>}

        {/* Action Button */}
        <Button 
          onClick={handleVerify}
          isLoading={isVerifying}
          disabled={otp.some(d => !d)}
          className="w-full h-14 rounded-2xl text-base font-bold shadow-lg mb-8"
        >
          Verify Account
        </Button>

        {/* 4. Resend Timer Logic */}
        <div className="text-center">
          {timeLeft > 0 ? (
            <div className="flex items-center justify-center gap-2">
               <span className="text-[10px] font-mono font-bold text-ink-soft/40 uppercase tracking-widest">Resend code in</span>
               <span className="text-sm font-bold text-ink-soft">{timeLeft}s</span>
            </div>
          ) : (
            <button 
              onClick={() => setTimeLeft(60)}
              className="inline-flex items-center gap-2 text-xs font-bold text-crimson hover:text-crimson-dark transition-colors uppercase tracking-widest"
            >
              <RefreshCcw size={14} /> Resend Code
            </button>
          )}
        </div>
      </motion.div>

    </div>
  );
};

export default VerifyOTPPage;