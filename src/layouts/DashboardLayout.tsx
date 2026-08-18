import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Pencil,
  Droplets,
  Search,
  LogOut,
  Menu,
  X,
  Plus,
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Legash</span>
            <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold">
              Hospital
            </span>
          </div>
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
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-900 tracking-tight">Legash</span>
                  <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold">
                    Portal
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
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
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-red-50 text-red-700 font-semibold shadow-xs'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      }
                    >
                      <IconComponent className="w-4 h-4 shrink-0" />
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
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                  isActive
                                    ? 'bg-red-50 text-red-700 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`
                              }
                            >
                              <SubIcon className="w-3.5 h-3.5 shrink-0" />
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
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-30 shadow-xs transition-all duration-300 ease-in-out ${
          isMinimized ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header & Minimize Toggle Button */}
        <div
          className={`py-5 border-b border-gray-100 flex items-center justify-between ${
            isMinimized ? 'px-3 flex-col gap-3' : 'px-5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            {!isMinimized && (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-gray-900 tracking-tight">Legash</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold">
                    Hospital
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">Emergency Blood Network</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
            title={isMinimized ? 'Expand Sidebar' : 'Minimize Sidebar'}
            aria-label={isMinimized ? 'Expand Sidebar' : 'Minimize Sidebar'}
          >
            {isMinimized ? (
              <PanelLeftOpen className="w-5 h-5 text-gray-700" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-gray-700" />
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
                    `flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                      isMinimized ? 'justify-center p-3' : 'px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-red-50 text-red-700 font-semibold shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <IconComponent className="w-5 h-5 shrink-0" />
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
                            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-red-50 text-red-700 font-semibold'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                            }`
                          }
                        >
                          <SubIcon className="w-3.5 h-3.5 shrink-0" />
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
