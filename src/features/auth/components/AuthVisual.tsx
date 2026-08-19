import { useState } from 'react';
import { motion } from 'motion/react';
import bloodImage from '@/assets/images/blood.png';

export const AuthVisual = () => {
  const [phase, setPhase] = useState<'dropping' | 'filling' | 'complete'>('dropping');

  return (
    <div className="relative w-full h-full bg-white overflow-hidden flex items-center justify-center">
      
      {/* 1. THE NATURAL DROPLET */}
      {phase === 'dropping' && (
        <motion.div
          // Physics: Starts slow, accelerates, and stretches as it falls
          initial={{ y: -150, x: '-50%', scaleX: 0.95, scaleY: 1 }}
          animate={{ 
            y: '100vh', 
            scaleY: 1.2, // Stretching as it gains speed
            scaleX: 0.85, // Narrowing as it stretches
            opacity: 1 
          }}
          transition={{ 
            duration: 1.5, 
            ease: [0.13, 0, 0.8, 0.15] // True gravity acceleration
          }}
          onAnimationComplete={() => setPhase('filling')}
          className="absolute left-1/2 top-0 z-50"
        >
          {/* Bigger, Organic Drop Shape */}
          <svg width="48" height="68" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M15 0C15 0 0 14.5 0 27C0 35.2843 6.71573 42 15 42C23.2843 42 30 35.2843 30 27C30 14.5 15 0 15 0Z" 
              fill="#C31F3B"
            />
            {/* Subtle light reflection for "Natural" look */}
            <ellipse cx="20" cy="28" rx="3" ry="5" fill="white" fillOpacity="0.15" />
          </svg>
        </motion.div>
      )}

      {/* 2. THE RISING FLUID */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={phase !== 'dropping' ? { y: '0%' } : { y: '100%' }}
        transition={{ duration: 3.5, ease: [0.45, 0.05, 0.55, 0.95] }}
        className="absolute inset-0 z-10"
      >
        {/* The Wave Edge */}
        <svg 
          className="absolute top-0 left-0 w-[200%] h-[120px] -translate-y-[98%]" 
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none"
        >
          <motion.path
            animate={{ 
              x: ['-50%', '0%'],
              d: [
                "M0,60 C360,10 720,110 1080,60 C1440,10 1800,110 2160,60 L2160,120 L0,120 Z",
                "M0,60 C360,110 720,10 1080,60 C1440,110 1800,10 2160,60 L2160,120 L0,120 Z",
                "M0,60 C360,10 720,110 1080,60 C1440,10 1800,110 2160,60 L2160,120 L0,120 Z"
              ]
            }}
            transition={{ 
              x: { repeat: Infinity, duration: 5, ease: "linear" },
              d: { repeat: Infinity, duration: 4, ease: "easeInOut" } 
            }}
            fill="#C31F3B"
          />
        </svg>
        <div className="w-full h-full bg-crimson" />
      </motion.div>

      {/* 3. THE "NATURAL" IMAGE REVEAL (Full Screen) */}
      {phase !== 'dropping' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 2, ease: "easeOut" }}
          className="absolute inset-0 z-20 w-full h-full"
        >
          <div className="relative w-full h-full overflow-hidden">
            <img 
              src={bloodImage} 
              alt="Hospital Care"
              className="w-full h-full object-cover grayscale-[10%] brightness-90"
            />
            
            {/* Keep the overlays but make them full-bleed */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Adjust the Brand Tagline to sit at the absolute bottom */}
          <div className="absolute bottom-10 left-0 w-full text-center px-8">
            <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.6em]">
              LEGASH • ETHIOPIA
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

