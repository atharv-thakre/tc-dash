import React from 'react';
import {
  KeyRound,
  LayoutDashboard,
  Link,
  LogOut,
  ShieldCheck,
  Sliders,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { Badge } from '../common/Badge';

interface SidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePath,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { account, logout, isSuperAdmin } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, requiresSuperAdmin: false },
    { label: 'Accounts', path: '/accounts', icon: Users, requiresSuperAdmin: true },
    { label: 'OAuth Links', path: '/oauth-links', icon: Link, requiresSuperAdmin: true },
    { label: 'Active Sessions', path: '/sessions', icon: ShieldCheck, requiresSuperAdmin: true },
    { label: 'OTP Records', path: '/otp', icon: KeyRound, requiresSuperAdmin: true },
    { label: 'System Config', path: '/config', icon: Sliders, requiresSuperAdmin: true },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40 flex flex-col w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 transition-transform duration-200 ease-in-out md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col flex-1 p-4 overflow-y-auto">
          {/* Main Nav Section */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-2">
              Management
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group border border-transparent',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-zinc-900 dark:text-white dark:border-zinc-800'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-zinc-100'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-slate-400 dark:text-zinc-500')} />
                    <span>{item.label}</span>
                  </div>
                  {item.requiresSuperAdmin && (
                    <span className={cn('text-[10px] font-mono px-1.5 py-0.2 rounded-md', isActive ? 'bg-indigo-500/20 text-indigo-300 dark:bg-zinc-800 dark:text-zinc-400' : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500')}>
                      admin
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-2">
              Personal Account
            </p>
            <button
              onClick={() => handleNavClick('/profile')}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group border border-transparent',
                activePath === '/profile'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-zinc-900 dark:text-white dark:border-zinc-800'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-zinc-100'
              )}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                <span>My Profile</span>
              </div>
            </button>
          </div>

          {/* Bottom Card for Superadmin Status */}
          <div className="mt-auto pt-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  {account?.role || 'Guest'} Mode
                </span>
                <Badge variant={isSuperAdmin ? 'purple' : 'neutral'} className="text-[10px]">
                  {isSuperAdmin ? 'SUPERADMIN' : 'USER'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
                {isSuperAdmin
                  ? 'Full administrative privileges active. All 4 config cards & CRUD models accessible.'
                  : 'Standard permissions. Access to Profile settings and personal sessions.'}
              </p>
            </div>

            {account && (
              <button
                onClick={logout}
                className="mt-3 flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
