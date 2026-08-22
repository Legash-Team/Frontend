import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, RefreshCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
// 1. Ensure this points to your real API file
import { verifyHospitalOTP, resendHospitalOTP } from '@/features/auth/api/auth-api';

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resolve user email from state, URL query parameter, or browser storage
  const queryParams = new URLSearchParams(location.search);
  const urlEmail = queryParams.get('email')?.trim() || '';
  const urlCode = queryParams.get('code')?.trim() || queryParams.get('token')?.trim() || '';

  const initialEmail =
    location.state?.email ||
    urlEmail ||
    sessionStorage.getItem('pending_verification_email') ||
    localStorage.getItem('pending_verification_email') ||
    '';

  const [userEmail, setUserEmail] = useState(initialEmail);
  const [inputEmail, setInputEmail] = useState(initialEmail);

  // Auto-fill OTP from URL query parameter if available
  useEffect(() => {
    if (urlCode && /^\d{6}$/.test(urlCode)) {
      setOtp(urlCode.split(''));
    }
  }, [urlCode]);

  // Synchronize storage whenever userEmail changes
  useEffect(() => {
    if (userEmail && userEmail.includes('@')) {
      sessionStorage.setItem('pending_verification_email', userEmail);
      localStorage.setItem('pending_verification_email', userEmail);
    }
  }, [userEmail]);

  const maskedEmail = userEmail && userEmail.includes('@')
    ? userEmail.replace(/^(..)(.*)(?=@)/, (_match: string, a: string, b: string) =>
        a + b.replace(/./g, '*')
      )
    : userEmail || 'No email specified';

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); 
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setUserEmail(inputEmail.trim());
    setIsEditingEmail(false);
    setError(null);
  };

  // 2. REAL BACKEND INTEGRATION
  const handleVerify = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      setError('Please provide your registered email address.');
      setIsEditingEmail(true);
      return;
    }

    setIsVerifying(true);
    setError(null);
    const code = otp.join('');

    try {
      // Hits POST /api/hospital/verify-email
      const response = await verifyHospitalOTP(userEmail, code);

      if (response.success) {
        sessionStorage.removeItem('pending_verification_email');
        localStorage.removeItem('pending_verification_email');
        navigate('/login', { 
          state: { message: "Email verified successfully. Please log in." } 
        });
      }
    } catch (err: any) {
      setError(err || "The code is incorrect or expired.");
    } finally {
      setIsVerifying(false);
    }
  };

 

const handleResend = async () => {
  setResendMessage(null);
  setError(null);
  
  try {
    const response = await resendHospitalOTP(userEmail);
    
    if (response.success) {
      // Start the 60s cooldown timer again
      setTimeLeft(60);
      // Show success feedback
      setResendMessage("A new code has been dispatched to your email.");
      // Hide message after 5 seconds
      setTimeout(() => setResendMessage(null), 5000);
    }
  } catch (err: any) {
    // If backend returns 429 (Cooldown active)
    setError(err);
  }
};

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4 sm:p-6">
      
      <div className="w-full max-w-md mb-6 sm:mb-8">
        <Link to="/register" className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-crimson transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to registration
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-line-soft rounded-3xl sm:rounded-[40px] p-6 sm:p-10 md:p-12 shadow-2xl shadow-ink/5"
      >
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-crimson/5 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-crimson">
            <Mail size={28} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink mb-3 sm:mb-4">Verify your email</h1>
          
          <p className="text-ink-soft text-sm sm:text-[15px] leading-relaxed px-1 sm:px-2">
            A 6-digit verification code has been sent to your registered email: <br/>
            <span className="text-ink font-bold font-mono tracking-tight">{maskedEmail}</span>.
            {!isEditingEmail && (
              <button
                type="button"
                onClick={() => {
                  setInputEmail(userEmail);
                  setIsEditingEmail(true);
                }}
                className="ml-2 text-xs text-crimson font-medium hover:underline inline-block"
              >
                (Change)
              </button>
            )}
          </p>

          {isEditingEmail && (
            <form onSubmit={handleSaveEmail} className="mt-4 flex gap-2 justify-center">
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="px-3 py-1.5 text-xs rounded-lg border border-line-soft focus:border-crimson outline-none w-64 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs bg-crimson text-white font-bold rounded-lg hover:bg-crimson/90"
              >
                Set
              </button>
              <button
                type="button"
                onClick={() => setIsEditingEmail(false)}
                className="px-2 py-1.5 text-xs text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        <div className="flex justify-center sm:justify-between gap-1.5 sm:gap-2 mb-8 sm:mb-10">
          {otp.map((digit, index) => (
            <div key={index} className="relative w-10 sm:w-12 h-14 sm:h-16">
              <input
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onPaste={handlePaste}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-full h-full text-center text-xl sm:text-2xl font-serif font-bold bg-paper border-2 rounded-xl outline-none transition-all duration-300
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

        {error && <p className="text-[10px] text-crimson font-bold uppercase text-center mb-6">{error}</p>}
        {resendMessage && (
  <motion.p 
    initial={{ opacity: 0, y: -10 }} 
    animate={{ opacity: 1, y: 0 }} 
    className="text-[10px] text-verified font-bold uppercase text-center mb-6"
  >
    {resendMessage}
  </motion.p>
)}
        <Button 
          onClick={handleVerify}
          isLoading={isVerifying}
          disabled={otp.some(d => !d)}
          className="w-full h-14 rounded-2xl text-base font-bold shadow-lg mb-8"
        >
          Verify Account
        </Button>

        <div className="text-center">
          {timeLeft > 0 ? (
            <div className="flex items-center justify-center gap-2">
               <span className="text-[10px] font-mono font-bold text-ink-soft/40 uppercase tracking-widest">Resend code in</span>
               <span className="text-sm font-bold text-ink-soft">{timeLeft}s</span>
            </div>
          ) : (
            <button 
              onClick={handleResend}
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