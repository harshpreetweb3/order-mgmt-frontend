import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { promptPWAInstall } from '../../utils/registerSW';
import { Download, LogOut, Shield, Store, ShoppingBag, Package, Sun, Moon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleInstallable = () => setCanInstall(true);
    window.addEventListener('pwa-installable', handleInstallable);
    return () => window.removeEventListener('pwa-installable', handleInstallable);
  }, []);

  const handleInstallClick = async () => {
    const installed = await promptPWAInstall();
    if (installed) {
      setCanInstall(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'Super Stockist':
        return <Package className="w-4 h-4 text-sky-400" />;
      case 'Distributor':
        return <Store className="w-4 h-4 text-indigo-400" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">RGDG Agro India</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Order & Supply Management</p>
          </div>
        </div>

        {/* User profile & Theme Toggle Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 transition-all text-xs font-semibold"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{ color: 'var(--c-text-secondary)' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden sm:inline" style={{ color: 'var(--c-text-secondary)' }}>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="hidden sm:inline" style={{ color: 'var(--c-text-secondary)' }}>Dark</span>
              </>
            )}
          </button>

          {canInstall && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span>Install App</span>
            </button>
          )}

          {user && (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-100">{user.name}</span>
                <span className="text-xs text-slate-400 flex items-center justify-end gap-1">
                  {getRoleIcon(user.role)}
                  <span>{user.role === 'Admin' ? 'RGDG Agro (Company)' : user.role}</span>
                </span>
              </div>

              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
