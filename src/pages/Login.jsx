import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Package, Store, ShoppingBag, ArrowRight, Lock, Mail, Sun, Moon } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      showSuccess(`Welcome back, ${user.name}! Login Successful.`);

      // Redirect based on role
      switch (user.role) {
        case 'Admin':
          navigate('/admin');
          break;
        case 'Super Stockist':
          navigate('/super-stockist');
          break;
        case 'Distributor':
          navigate('/distributor');
          break;
        case 'Salesman':
        default:
          navigate('/salesman');
          break;
      }
    } catch (err) {
      showError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoRole = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Theme Toggle - top-right corner */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-all shadow-lg"
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      >
        {theme === 'dark' ? (
          <><Sun className="w-4 h-4 text-amber-400" /><span className="hidden sm:inline">Light Mode</span></>
        ) : (
          <><Moon className="w-4 h-4 text-indigo-400" /><span className="hidden sm:inline">Dark Mode</span></>
        )}
      </button>

      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/30">
            <Package className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          OrderFlow PWA
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Sign in to access your role-based dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>Email Address / Username</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sales@ordermanager.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 transition-all duration-200 disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Selector */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="block text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              One-Click Demo Account Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoRole('sales@ordermanager.com', 'sales123')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-left transition-all group"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">Salesman</div>
                  <div className="text-[10px] text-slate-400">sales123</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoRole('dist@ordermanager.com', 'dist123')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-left transition-all group"
              >
                <Store className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400">Distributor</div>
                  <div className="text-[10px] text-slate-400">dist123</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoRole('ss@ordermanager.com', 'ss123')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/10 text-left transition-all group"
              >
                <Package className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-sky-400">Super Stockist</div>
                  <div className="text-[10px] text-slate-400">ss123</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoRole('admin@ordermanager.com', 'admin123')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/10 text-left transition-all group"
              >
                <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-purple-400">Admin</div>
                  <div className="text-[10px] text-slate-400">admin123</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
