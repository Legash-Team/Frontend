import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Sparkles } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';

export const AiChatFloatingButton: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // STRICT ROLE GUARD:
  // Render ONLY when logged-in role is 'hospital'.
  // Backend's POST /api/ai/chat strictly accepts only 'donor' and 'hospital' roles.
  // Do NOT render for Admin or Super Admin.
  if (user?.role !== 'hospital') {
    return null;
  }

  // Hide button if already on the dedicated AI chat page
  if (location.pathname === '/ai-chat' || location.pathname === '/hospital/ai-chat') {
    return null;
  }

  return (
    <aside
      aria-label="AI Health Assistant Shortcut"
      className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8"
    >
      <button
        id="ai-chat-fab-btn"
        type="button"
        onClick={() => navigate('/ai-chat')}
        className="group relative flex items-center gap-2.5 px-4 py-3.5 sm:px-5 sm:py-3.5 bg-gradient-to-r from-crimson to-crimson-dark text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-crimson/30"
        title="Open AI Health Assistant"
        aria-label="Open AI Health Assistant"
      >
        {/* Animated pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-crimson/30 blur-xs animate-pulse group-hover:bg-crimson/40 pointer-events-none" />

        {/* Icon with glowing badge */}
        <div className="relative flex items-center justify-center">
          <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2]" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
        </div>

        {/* Text Label */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-sans font-bold tracking-tight">
          <span>AI Assistant</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
        </div>
      </button>
    </aside>
  );
};

export default AiChatFloatingButton;
