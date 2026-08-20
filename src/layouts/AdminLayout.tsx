import React from 'react';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';

export const AdminLayout = ({ children, title }: { children: React.ReactNode, title: string }) => {
  return (
    <div className="flex h-screen bg-paper overflow-hidden">
      <AdminSidebar />
      
      <main className="flex-1 h-full overflow-y-auto no-scrollbar flex flex-col">
        {/* Header */}
        <header className="h-[76px] bg-white border-b border-line-soft px-8 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-serif font-bold text-ink uppercase tracking-tight">{title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold px-3 py-1 bg-crimson/10 text-crimson rounded-full uppercase">Super Admin</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};