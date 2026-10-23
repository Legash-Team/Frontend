import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  CalendarPlus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardList,
  Building2,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/context/AuthContext';
import { TEMP_OPEN_ACCESS } from '@/lib/temporaryAccess';
import { useTranslation } from 'react-i18next';

interface BloodCenterSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const BloodCenterSidebar = ({ mobileOpen = false, onMobileClose }: BloodCenterSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useAuth(); 
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Hospital approval / feedback is only available when the Super Admin has granted it.
  // TEMP_OPEN_ACCESS: show everything while the backend auth flow is unfinished.
  const canApprove =
    TEMP_OPEN_ACCESS ||
    user?.role === 'superadmin' ||
    Boolean(user?.permissions?.canApproveHospitals);

  const menuItems = [];

  // Blood Center Dashboard
  menuItems.push({ icon: LayoutDashboard, label: t('nav.bloodCenter.dashboard'), path: '/blood-center/dashboard' });

  // Event Management - every invited blood center can post events
  menuItems.push({ icon: CalendarPlus, label: t('nav.bloodCenter.postEvent'), path: '/blood-center/events' });
  menuItems.push({ icon: ClipboardList, label: t('nav.bloodCenter.myEvents'), path: '/blood-center/my-posts' });

  // Hospitals - only visible when hospital-approval access was granted
  if (canApprove) {
    menuItems.push({ icon: Building2, label: t('nav.bloodCenter.hospitals'), path: '/blood-center/hospitals' });
    menuItems.push({ icon: MessageSquare, label: t('nav.bloodCenter.feedback'), path: '/blood-center/feedbacks' });
  }
  
  const handleSignOut = () => {
    logout(); 
    localStorage.removeItem('legash_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_permissions');
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

      {/* LOGOUT AREA */}
      <div className="p-4 border-t border-line-soft bg-paper/30">
        <button 
          onClick={handleSignOut} 
          className="flex items-center gap-4 px-4 py-3 w-full text-ink-soft hover:text-crimson hover:bg-crimson/5 rounded-xl transition-colors group"
        >
          <LogOut size={20} className="shrink-0" />
          <span className={`text-[11px] font-bold uppercase tracking-widest ${isCollapsed ? 'md:hidden' : ''}`}>
            {t('common.signOut')}
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
                {user?.name || t('badge.bloodCenterAdmin')}
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-crimson/10 text-crimson rounded-full uppercase">
                {t('badge.bloodCenter')}
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
              className="p-2 rounded-full bg-crimson/5 text-crimson hover:bg-crimson/10 transition-colors hover:scale-110"
              title="Expand sidebar"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {navContent}
      </aside>
    </>
  );
};
