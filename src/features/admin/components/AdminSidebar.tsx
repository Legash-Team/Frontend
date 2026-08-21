import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  MessageSquare, 
  CalendarPlus, 
  UserPlus, 
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Facilities', path: '/admin/dashboard' },
    { icon: MessageSquare, label: 'Feedbacks', path: '/admin/feedbacks' },
    { icon: CalendarPlus, label: 'Post Event', path: '/admin/events' },
    { icon: UserPlus, label: 'Create Admin', path: '/admin/create-admin' },
  ];

  return (
    <aside className={`h-screen bg-white border-r border-line-soft transition-all duration-300 flex flex-col relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* INTERNAL HEADER AREA */}
      <div className={`flex items-center h-[76px] px-6 border-b border-line-soft ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <Logo isCollapsed={isCollapsed} />
        
        {/* The Internal Toggle Icon */}
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-paper text-ink-soft transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* Expand trigger when collapsed */}
      {isCollapsed && (
        <div className="flex justify-center py-4 border-b border-line-soft">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-full bg-crimson/5 text-crimson hover:bg-crimson/10 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
              ${isActive 
                ? 'bg-crimson text-white shadow-md shadow-crimson/20' 
                : 'text-ink-soft hover:bg-paper hover:text-ink'}
            `}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ADMIN PROFILE / LOGOUT AREA */}
      <div className="p-4 border-t border-line-soft">
        <button className="flex items-center gap-4 px-4 py-3 w-full text-ink-soft hover:text-crimson transition-colors group">
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-[11px] font-bold uppercase tracking-widest">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};