import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  LayoutDashboard, 
  MessageSquare, 
  CalendarPlus, 
  UserPlus, 
  LogOut,
  ChevronLeft,
  X
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/context/AuthContext';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const AdminSidebar = ({ mobileOpen = false, onMobileClose }: AdminSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useAuth(); 
  const navigate = useNavigate();

  const isSuperAdmin = user?.role === 'superadmin';
  const canApprove = isSuperAdmin || Boolean(user?.permissions?.canApproveHospitals);
  const canPost = isSuperAdmin || Boolean(user?.permissions?.canPostEvents);

  const menuItems = [];

  if (canApprove) {
    menuItems.push({ icon: LayoutDashboard, label: 'Facilities', path: '/admin/dashboard' });
    menuItems.push({ icon: MessageSquare, label: 'Feedbacks', path: '/admin/feedbacks' });
  }

  if (canPost) {
    menuItems.push({ icon: CalendarPlus, label: 'Post Event', path: '/admin/events' });
  }

  // Only show "Create Admin" if the user is a superadmin
  if (isSuperAdmin) {
    menuItems.push({ icon: UserPlus, label: 'Create Admin', path: '/admin/create-admin' });
  }
  
  const handleSignOut = () => {
    // 1. Clear Context State & LocalStorage
    logout(); 
    
    // 2. Wipe everything else just to be safe
    localStorage.removeItem('legash_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_permissions');

    // 3. Redirect to Login
    navigate('/login', { replace: true });
  };

  const navContent = (
    <>
      {/* NAVIGATION LINKS */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => onMobileClose?.()}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
              ${isActive 
                ? 'bg-crimson text-white shadow-md shadow-crimson/20' 
                : 'text-ink-soft hover:bg-paper hover:text-ink'}
            `}
          >
            <item.icon size={20} className="shrink-0" />
            <span className={`text-[11px] font-bold uppercase tracking-widest whitespace-nowrap ${isCollapsed ? 'md:hidden' : ''}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* ADMIN PROFILE / LOGOUT AREA */}
      <div className="p-4 border-t border-line-soft bg-paper/30">
        <button 
          onClick={handleSignOut} 
          className="flex items-center gap-4 px-4 py-3 w-full text-ink-soft hover:text-crimson hover:bg-crimson/5 rounded-xl transition-colors group"
        >
          <LogOut size={20} className="shrink-0" />
          <span className={`text-[11px] font-bold uppercase tracking-widest ${isCollapsed ? 'md:hidden' : ''}`}>
            Sign Out
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop & Drawer (< md) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-white border-r border-line-soft shadow-2xl z-50">
            <div className="flex items-center justify-between h-[76px] px-6 border-b border-line-soft">
              <Logo />
              <button 
                type="button"
                onClick={onMobileClose}
                className="p-2 rounded-lg text-ink-soft hover:text-ink hover:bg-paper"
              >
                <X size={20} />
              </button>
            </div>

            {/* Admin Badge */}
            <div className="px-6 py-3 bg-paper/60 border-b border-line-soft flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-ink">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-crimson/10 text-crimson rounded-full uppercase">
                {isSuperAdmin ? 'Super' : 'Staff'}
              </span>
            </div>

            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar (md+) */}
      <aside className={`hidden md:flex h-screen bg-white border-r border-line-soft transition-all duration-300 flex-col relative shrink-0 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {/* INTERNAL HEADER AREA */}
        <div className={`flex items-center h-[76px] px-6 border-b border-line-soft ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <Logo isCollapsed={isCollapsed} />
          
          {!isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-paper text-ink-soft transition-colors"
              title="Collapse sidebar"
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
              title="Expand sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
        )}

        {navContent}
      </aside>
    </>
  );
};