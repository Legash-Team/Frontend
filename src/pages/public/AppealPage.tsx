import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { submitHospitalFeedback } from '@/features/auth/api/auth-api';

const AppealPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse email from query parameter if present
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get('email') || '';

  // Form states
  const [email, setEmail] = useState(initialEmail);
  const [hospitalName, setHospitalName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !message.trim()) {
      setErrorMsg('Email address and appeal message are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitHospitalFeedback({
        email: email.trim(),
        hospitalName: hospitalName.trim() || undefined,
        message: message.trim(),
      });

      if (response.success) {
        setSuccessMsg(
          response.message || 'Your appeal has been successfully submitted. The System Administrator will review it soon.'
        );
        setMessage('');
        // If email was not preset, keep it, otherwise clear form
        if (!initialEmail) {
          setEmail('');
          setHospitalName('');
        }
      }
    } catch (err: any) {
      setErrorMsg(err || 'Failed to submit your appeal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg mb-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-crimson transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to login</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white border border-line-soft rounded-[40px] p-10 md:p-12 shadow-2xl shadow-ink/5"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-crimson/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-crimson">
            <MessageSquare size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink mb-4">Registration Appeal</h1>
          <p className="text-ink-soft text-[15px] leading-relaxed">
            If your hospital registration request was rejected, you can submit an appeal or inquiry here for Super Admin review.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-crimson/10 border border-crimson/20 rounded-2xl text-crimson text-xs font-medium flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-verified/10 border border-verified/20 rounded-2xl text-verified text-xs font-medium flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
              Registered Hospital Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. contact@hospital.org"
              className="w-full h-13 px-4 bg-paper border border-line-soft rounded-md outline-none focus:border-crimson text-sm"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
              Hospital Name <span className="text-ink-soft/40">(Optional)</span>
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="e.g. Semera General Hospital"
              className="w-full h-13 px-4 bg-paper border border-line-soft rounded-md outline-none focus:border-crimson text-sm"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
              Appeal Message
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please explain why your hospital registration should be approved or describe changes you have made."
              className="w-full p-4 bg-paper border border-line-soft rounded-md outline-none focus:border-crimson text-sm resize-none"
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!email.trim() || !message.trim()}
            className="w-full h-14 rounded-2xl text-base font-bold shadow-lg mt-4"
          >
            Submit Appeal
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default AppealPage;
