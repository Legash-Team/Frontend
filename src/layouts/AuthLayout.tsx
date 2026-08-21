import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';
import { AuthVisual } from '@/features/auth/AuthVisual';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children ,title}: AuthLayoutProps) => {
  return (
    /* We use h-screen and flex-col to fix the Header/Footer and make the middle stretch */
    <div className="h-screen flex flex-col bg-white">
      
      {/* 1. FULL-WIDTH HEADER */}
      <header className="h-[76px] w-full bg-paper/80 backdrop-blur-md border-b border-line-soft z-50 flex-shrink-0">
        <div className="max-w-[1180px] mx-auto px-8 h-full flex items-center justify-between">
          <Logo />
        </div>
      </header>

      {/* 2. THE MIDDLE CONTENT (SPLIT SCREEN) */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT: Form Side (Scrollable) */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto no-scrollbar bg-paper">
        <div className="max-h-[880px] flex items-center justify-center  max-w-[900px]">
            <div className="w-full max-w-[990px]">
              {/* Header Section */}
              <div className="mb-5 text-center">
  <h1 className="text-3xl font-serif font-bold text-ink">{title}</h1>
</div>
              {/* The Form Container */}
              <div className="bg-white border border-line-soft  p-8 md:p-12 shadow-xl shadow-ink/5">
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Visual Side (Fixed) */}
        <div className="hidden lg:block lg:w-1/2 h-full relative bg-white border-l border-line-soft overflow-hidden">
          <AuthVisual />
        </div>

      </main>
    </div>
  );
};
