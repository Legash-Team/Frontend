import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Logic will go here later
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
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

  {/* MODIFIED: Link now sits at the bottom right */}
  <div className="flex justify-end">
    <button 
      type="button" 
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
  );
};