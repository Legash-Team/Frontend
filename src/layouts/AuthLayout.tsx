import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';
import { AuthVisual } from '@/features/auth/components/AuthVisual';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-paper lg:bg-white">
      {/* 1. FULL-WIDTH HEADER */}
      <header className="h-[76px] w-full bg-paper/90 backdrop-blur-md border-b border-line-soft z-30 shrink-0 sticky top-0">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-8 h-full flex items-center justify-between">
          <Logo />
        </div>
      </header>

      {/* 2. THE MIDDLE CONTENT (SPLIT SCREEN) */}
      <main className="flex-1 flex overflow-y-auto lg:overflow-hidden">
        {/* LEFT: Form Side (Scrollable) */}
        <div className="w-full lg:w-1/2 min-h-full flex items-center justify-center p-4 sm:p-6 md:p-10 lg:overflow-y-auto no-scrollbar bg-paper">
          <div className="w-full max-w-[540px] py-4">
            {/* Header Section */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">{title}</h1>
            </div>
            {/* The Form Container */}
            <div className="bg-white border border-line-soft rounded-2xl sm:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-xl shadow-ink/5">
              {children}
            </div>
          </div>
        </div>

        {/* RIGHT: Visual Side (Fixed on Desktop) */}
        <div className="hidden lg:block lg:w-1/2 h-full relative bg-white border-l border-line-soft overflow-hidden">
          <AuthVisual />
        </div>
      </main>
    </div>
  );
};