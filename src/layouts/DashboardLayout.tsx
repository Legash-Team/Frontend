import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import {
  LayoutDashboard,
  User,
  Pencil,
  Droplets,
  Search,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const navItems = [
    { label: 'Dashboard', path: '/hospital/dashboard', icon: LayoutDashboard },
    {
      label: 'Profile',
      path: '/hospital/profile',
      icon: User,
      subItems: [
        { label: 'Edit Profile', path: '/hospital/profile/edit', icon: Pencil },
      ],
    },
    { label: 'Blood Stock', path: '/hospital/blood-stock', icon: Droplets },
    { label: 'Hospital Search', path: '/hospital/search', icon: Search },
  ];

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('token');
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-sans text-ink">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white/90 backdrop-blur-md border-b border-line-soft px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Logo size="md" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-crimson/10 text-crimson">
            Hospital
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-line-soft">
            <div className="p-4 border-b border-line-soft flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Logo size="md" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-crimson/10 text-crimson">
                  Portal
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-ink-soft hover:text-ink rounded-md hover:bg-paper-dim"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.path} className="space-y-1">
                    <NavLink
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-sans font-medium transition-all ${
                          isActive
                            ? 'bg-crimson/10 text-crimson font-semibold shadow-xs'
                            : 'text-ink-soft hover:bg-paper-dim hover:text-ink'
                        }`
                      }
                    >
                      <IconComponent className="w-4 h-4 shrink-0 stroke-[1.75]" />
                      <span>{item.label}</span>
                    </NavLink>

                    {item.subItems && (
                      <div className="pl-8 space-y-1">
                        {item.subItems.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans font-medium transition-colors ${
                                  isActive
                                    ? 'bg-crimson/10 text-crimson font-semibold'
                                    : 'text-ink-soft/80 hover:bg-paper-dim hover:text-ink'
                                }`
                              }
                            >
                              <SubIcon className="w-3.5 h-3.5 shrink-0 stroke-[1.75]" />
                              <span>{sub.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="p-3 border-t border-gray-200">
              <NavLink
                to="/login"
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Left Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 bg-white border-r border-line-soft z-30 shadow-xs transition-all duration-300 ease-in-out ${
          isMinimized ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header & Minimize Toggle Button */}
        <div
          className={`py-5 border-b border-line-soft flex items-center justify-between ${
            isMinimized ? 'px-3 flex-col gap-3' : 'px-5'
          }`}
        >
          <div className="flex items-center gap-3">
            {!isMinimized ? (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Logo size="md" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-crimson/10 text-crimson">
                    Hospital
                  </span>
                </div>
                <p className="text-[11px] font-sans text-ink-soft/70 font-medium mt-0.5">Emergency Blood Network</p>
              </div>
            ) : (
              <div className="p-1">
                <span className="inline-block transform translate-y-[1px]">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.5C12 2.5 5 11.2 5 15.8C5 19.7 8.1 22.5 12 22.5C15.9 22.5 19 19.7 19 15.8C19 11.2 12 2.5 12 2.5Z" fill="#C31F3B" />
                  </svg>
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1.5 text-ink-soft hover:text-ink rounded-lg hover:bg-paper-dim transition-colors focus:outline-none"
            title={isMinimized ? 'Expand Sidebar' : 'Minimize Sidebar'}
            aria-label={isMinimized ? 'Expand Sidebar' : 'Minimize Sidebar'}
          >
            {isMinimized ? (
              <PanelLeftOpen className="w-5 h-5 text-ink-soft" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-ink-soft" />
            )}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.path} className="space-y-1">
                <NavLink
                  to={item.path}
                  title={isMinimized ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl text-sm font-sans font-medium transition-all ${
                      isMinimized ? 'justify-center p-3' : 'px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-crimson/10 text-crimson font-semibold shadow-xs'
                        : 'text-ink-soft hover:bg-paper-dim hover:text-ink'
                    }`
                  }
                >
                  <IconComponent className="w-4 h-4 shrink-0 stroke-[1.75]" />
                  {!isMinimized && <span className="flex-1 whitespace-nowrap">{item.label}</span>}
                </NavLink>

                {/* Sub Items (Only shown in expanded state) */}
                {!isMinimized && item.subItems && (
                  <div className="pl-7 space-y-1">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans font-medium transition-colors ${
                              isActive
                                ? 'bg-crimson/10 text-crimson font-semibold'
                                : 'text-ink-soft/80 hover:bg-paper-dim hover:text-ink'
                            }`
                          }
                        >
                          <SubIcon className="w-3.5 h-3.5 shrink-0 stroke-[1.75]" />
                          <span className="whitespace-nowrap">{sub.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer / Sign Out Button */}
        <div className="p-3 border-t border-gray-200 bg-gray-50/50">
          <NavLink
            to="/login"
            onClick={handleSignOut}
            title={isMinimized ? 'Sign Out' : undefined}
            className={`flex items-center gap-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors ${
              isMinimized ? 'justify-center p-3' : 'px-3.5 py-2.5'
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0 text-gray-500 group-hover:text-red-700" />
            {!isMinimized && <span className="whitespace-nowrap">Sign Out</span>}
          </NavLink>
        </div>
      </aside>

      {/* Main Content Container (Padded dynamically based on isMinimized) */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isMinimized ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Legash Healthcare System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
