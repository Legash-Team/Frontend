import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Droplets, 
  Network, 
  Truck, 
  UserCircle2, 
  LayoutDashboard 
} from 'lucide-react';

export const AuthVisual = () => {
  const [phase, setPhase] = useState<'dropping' | 'filling' | 'complete'>('dropping');

  return (
    <div className="relative w-full h-full bg-white overflow-hidden flex items-center justify-center">
      
      {/* 1. THE DROPLET */}
      <AnimatePresence>
        {phase === 'dropping' && (
          <motion.div
            initial={{ y: -100, x: '-50%', opacity: 0 }}
            animate={{ y: '100vh', opacity: 1 }}
            transition={{ 
              duration: 1.4, 
              ease: [0.13, 0, 0.8, 0.15] 
            }}
            onAnimationComplete={() => setPhase('filling')}
            className="absolute left-1/2 top-0 z-50"
          >
            <svg width="24" height="34" viewBox="0 0 30 42">
              <path 
                d="M15 0 C15 0 0 17.5 0 28.5 C0 36.5 6.7 42 15 42 C23.3 42 30 36.5 30 28.5 C30 17.5 15 0 15 0Z" 
                fill="#C31F3B"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* 3. THE ECOSYSTEM REVEAL */}
      <AnimatePresence>
        {phase !== 'dropping' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 1.5, ease: "easeOut" }}
            className="relative z-20 w-full max-w-lg px-12"
          >
            <div className="grid grid-cols-3 gap-8">
              <EcosystemIcon Icon={Building2} label="Hospitals" delay={2.0} />
              <EcosystemIcon Icon={Droplets} label="Inventory" delay={2.1} />
              <EcosystemIcon Icon={Network} label="Network" delay={2.2} />
              
              <div className="col-span-3 py-6">
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 2.5, duration: 1.5 }}
                  className="h-[1px] bg-white/10 origin-center"
                />
              </div>

              <EcosystemIcon Icon={Truck} label="Logistics" delay={2.3} />
              <EcosystemIcon Icon={UserCircle2} label="Verified" delay={2.4} />
              <EcosystemIcon Icon={LayoutDashboard} label="Dashboard" delay={2.5} />
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.2 }}
              className="mt-12 text-center"
            >
              <p className="text-white/20 font-mono text-[9px] uppercase tracking-[0.5em]">
                Legash Unified Ecosystem
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EcosystemIcon = ({ Icon, label, delay }: { Icon: any, label: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 1 }}
    className="flex flex-col items-center gap-3"
  >
    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
      <Icon className="text-white" size={24} strokeWidth={1.2} />
    </div>
    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest text-center">
      {label}
    </span>
  </motion.div>
);