import React, { useState } from 'react';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export const AdminLayout = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-paper overflow-hidden">
      <AdminSidebar 
        mobileOpen={mobileMenuOpen} 
        onMobileClose={() => setMobileMenuOpen(false)} 
      />
      
      <main className="flex-1 h-full overflow-y-auto no-scrollbar flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-[76px] bg-white border-b border-line-soft px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
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

            <h1 className="hidden md:block text-lg sm:text-xl font-serif font-bold text-ink uppercase tracking-tight truncate">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-crimson/10 text-crimson rounded-full uppercase whitespace-nowrap">
              {user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        </header>

        {/* Mobile Title strip if title is hidden on header */}
        <div className="md:hidden px-4 pt-4 pb-1">
          <h1 className="text-lg font-serif font-bold text-ink uppercase tracking-tight">
            {title}
          </h1>
        </div>

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