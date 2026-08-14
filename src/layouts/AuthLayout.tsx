import React from 'react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = 'Legash Hospital Portal',
  subtitle = 'Blood Donation Management & Emergency Hospital Network',
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-red-100/40 flex flex-col justify-between">
      {/* Header Bar */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-6 py-4 sticky top-0 z-10 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              +
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Legash</span>
              <span className="text-xs ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 font-semibold">
                Hospital
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header Banner */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6 text-white text-center">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-red-100 text-sm mt-1">{subtitle}</p>}
          </div>

          {/* Card Form Body */}
          <div className="p-6 sm:p-8">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Legash Healthcare System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
