import React, { useState } from 'react';
import { Check, Database, Globe, Key, LogOut, Menu, Server, Settings, ShieldCheck, User, X } from 'lucide-react';
import { useApiConfig } from '../../contexts/ApiConfigContext';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  activePath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar, activePath, onNavigate }) => {
  const { account, logout, isSuperAdmin } = useAuth();
  const { apiMode, setApiMode, baseUrl, setBaseUrl } = useApiConfig();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState(baseUrl);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSaveApiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setBaseUrl(inputUrl);
    setIsConfigModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition-colors">
        {/* Left Side: Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 -ml-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg md:hidden hover:bg-slate-100 dark:hover:bg-zinc-900"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(79,70,229,0.3)] group-hover:scale-105 transition-transform">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-slate-900 dark:text-zinc-100 text-base">tc-auth</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-xs bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">v1.0</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 hidden sm:block">Control Panel</p>
            </div>
          </div>
        </div>

        {/* Right Side: Status Badge, Mode Switcher, Theme & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Mode Selector / Config Trigger */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-all shadow-2xs"
            title="Configure Backend API Endpoint"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiMode === 'demo' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${apiMode === 'demo' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </span>
            <span className="capitalize font-semibold">{apiMode === 'demo' ? 'Demo Mock Mode' : 'Live Server'}</span>
            <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 ml-0.5" />
          </button>

          <ThemeSwitcher className="hidden sm:inline-flex" />

          {/* User Profile Menu */}
          {account ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              >
                {account.avatar_url ? (
                  <img src={account.avatar_url} alt={account.name} className="w-7 h-7 rounded-lg object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs uppercase">
                    {account.name.charAt(0)}
                  </div>
                )}
                <div className="text-left hidden lg:block pr-1">
                  <p className="text-xs font-semibold leading-none text-slate-900 dark:text-zinc-100">{account.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono mt-0.5">{account.role}</p>
                </div>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{account.name}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{account.email}</p>
                    <div className="mt-1.5">
                      <Badge variant={isSuperAdmin ? 'purple' : 'default'} icon={<ShieldCheck className="w-3 h-3" />}>
                        {account.role}
                      </Badge>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('/profile');
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    Account Settings
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('/login')}
              className="px-3.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Backend API Configuration Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="API Server Connection Settings"
        description="Configure how this frontend dashboard communicates with the tc-auth backend API."
      >
        <form onSubmit={handleSaveApiSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              API Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setApiMode('demo')}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                  apiMode === 'demo'
                    ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">Demo Mock</span>
                  {apiMode === 'demo' && <Check className="w-4 h-4 text-indigo-500" />}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  In-memory realistic mock state. Test all superadmin features instantly.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setApiMode('live')}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                  apiMode === 'live'
                    ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">Live Backend</span>
                  {apiMode === 'live' && <Check className="w-4 h-4 text-indigo-500" />}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Connects via HTTP to a running tc-auth backend instance.
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Base Path / Server URL
            </label>
            <div className="relative">
              <Server className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="/tc-auth or https://app.totalchaos.online/tc-auth"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 items-center text-xs">
              <span className="text-gray-400">Presets:</span>
              <button
                type="button"
                onClick={() => { setInputUrl('/tc-auth'); setApiMode('live'); }}
                className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 font-mono text-[11px] text-gray-700 dark:text-zinc-300 transition-colors"
              >
                /tc-auth
              </button>
              <button
                type="button"
                onClick={() => { setInputUrl('https://app.totalchaos.online/tc-auth'); setApiMode('live'); }}
                className="px-2 py-0.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] font-medium transition-colors"
              >
                https://app.totalchaos.online/tc-auth
              </button>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
