import React, { useState } from 'react';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Menu, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export const AdminLayout = ({ children, icon }: { children: React.ReactNode; title: string; icon?: React.ReactNode }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isSuperAdmin = user?.role === 'superadmin';
  
  return (
    <div className="flex h-screen bg-paper overflow-hidden">
      <AdminSidebar 
        mobileOpen={mobileMenuOpen} 
        onMobileClose={() => setMobileMenuOpen(false)} 
      />
      
      <main className="flex-1 h-full overflow-y-auto no-scrollbar flex flex-col min-w-0">
        {/* Top Header — page title text intentionally removed; icon badge only */}
        <header className="h-[76px] bg-white border-b border-line-soft px-4 sm:px-8 flex items-center justify-between gap-3 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button (< md) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-paper focus:outline-none"
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>

            <div className="md:hidden">
              <Logo />
            </div>

            <div
              className="hidden md:flex w-8 h-8 rounded-lg bg-crimson/10 items-center justify-center text-crimson shrink-0"
              aria-hidden="true"
            >
              {icon ?? <ShieldCheck size={16} className="stroke-[1.75]" />}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher />
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-crimson/10 text-crimson rounded-full uppercase whitespace-nowrap">
              {isSuperAdmin ? t('badge.superAdmin') : t('badge.admin')}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 md:p-8 flex-1">
          <div className="max-w-6xl mx-auto min-w-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};