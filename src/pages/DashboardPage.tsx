import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Database,
  Key,
  KeyRound,
  Link as LinkIcon,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/common/PageHeader';
import { CodeBlock } from '../components/common/CodeBlock';
import { accountsService } from '../services/accounts';
import { sessionsService } from '../services/sessions';
import { otpService } from '../services/otp';
import { oauthLinksService } from '../services/oauthLinks';
import { configService } from '../services/config';
import { formatDate } from '../lib/utils';

export const DashboardPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { account, session, payload, isSuperAdmin, refetchMe } = useAuth();
  const [stats, setStats] = useState({
    accountsCount: 0,
    activeSessionsCount: 0,
    otpRecordsCount: 0,
    oauthLinksCount: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const loadDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      if (isSuperAdmin) {
        try {
          const counts = await configService.getCounts();
          setStats({
            accountsCount: counts.accounts,
            activeSessionsCount: counts.sessions,
            otpRecordsCount: counts.otp,
            oauthLinksCount: counts.oauth,
          });
        } catch {
          const [accs, sess, otps, links] = await Promise.all([
            accountsService.listAccounts(1, 1).catch(() => ({ items: [], total: 0 })),
            sessionsService.listSessions(1, 1).catch(() => ({ items: [], total: 0 })),
            otpService.listRecords(1, 1).catch(() => ({ items: [], total: 0 })),
            oauthLinksService.listLinks(1, 1).catch(() => ({ items: [], total: 0 })),
          ]);
          setStats({
            accountsCount: accs.total ?? accs.items.length,
            activeSessionsCount: sess.total ?? sess.items.length,
            otpRecordsCount: otps.total ?? otps.items.length,
            oauthLinksCount: links.total ?? links.items.length,
          });
        }
      }
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, [isSuperAdmin]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Dashboard Overview"
        description="Real-time authentication system status, security logs, and quick control shortcuts."
        badge={
          <Badge variant={isSuperAdmin ? 'purple' : 'info'} icon={<ShieldCheck className="w-3 h-3" />}>
            {account?.role || 'Guest'}
          </Badge>
        }
        action={
          <button
            onClick={() => {
              refetchMe();
              loadDashboardStats();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
            Refresh
          </button>
        }
      />

      {/* High Level Stat Grid */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card gradientHover className="cursor-pointer" onClick={() => onNavigate('/accounts')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Accounts</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {isLoadingStats ? '...' : stats.accountsCount}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                Registered identity records <ArrowUpRight className="w-3 h-3" />
              </p>
            </div>
          </Card>

          <Card gradientHover className="cursor-pointer" onClick={() => onNavigate('/sessions')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Active Sessions</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {isLoadingStats ? '...' : stats.activeSessionsCount}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                Valid token sessions <ArrowUpRight className="w-3 h-3" />
              </p>
            </div>
          </Card>

          <Card gradientHover className="cursor-pointer" onClick={() => onNavigate('/otp')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">OTP Records</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <KeyRound className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {isLoadingStats ? '...' : stats.otpRecordsCount}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                Active & expired challenge codes <ArrowUpRight className="w-3 h-3" />
              </p>
            </div>
          </Card>

          <Card gradientHover className="cursor-pointer" onClick={() => onNavigate('/oauth-links')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">OAuth Links</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <LinkIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {isLoadingStats ? '...' : stats.oauthLinksCount}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                Google / GitHub accounts <ArrowUpRight className="w-3 h-3" />
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Action Bar */}
      <Card className="bg-gradient-to-r from-indigo-900/10 via-purple-900/5 to-transparent border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Quick Admin Actions
          </CardTitle>
          <CardDescription>Shortcut workflows for common authentication management tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2.5">
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => onNavigate('/accounts')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Account
                </button>
                <button
                  onClick={() => onNavigate('/otp')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors shadow-2xs"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  Generate OTP
                </button>
                <button
                  onClick={() => onNavigate('/sessions')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors shadow-2xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  Manage Sessions
                </button>
                <button
                  onClick={() => onNavigate('/config')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors shadow-2xs"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  Configure System
                </button>
              </>
            )}
            <button
              onClick={() => onNavigate('/profile')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              Update My Profile
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Current Session Context & Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              Authenticated User Context (`GET /me`)
            </CardTitle>
            <CardDescription>Response shape returned directly from the backend context endpoint.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {account ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Account ID:</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">{account.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Name & Handle:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{account.name} (@{account.handle})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Email:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{account.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">System Role:</span>
                  <Badge variant={account.role === 'superadmin' ? 'purple' : 'default'}>{account.role}</Badge>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Account Status:</span>
                  <Badge variant={account.status === 'active' ? 'success' : 'warning'}>{account.status}</Badge>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Created At:</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">{formatDate(account.created_at)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No active user logged in.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-500" />
              JWT Payload Context
            </CardTitle>
            <CardDescription>Verified claims decoded from Bearer access token.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock code={JSON.stringify({ account, session, payload }, null, 2)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
