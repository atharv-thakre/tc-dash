import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, KeyRound, Lock, LogOut, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { UserAvatar } from '../components/common/UserAvatar';
import { PageHeader } from '../components/common/PageHeader';
import { FormField } from '../components/common/FormField';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatDate } from '../lib/utils';
import { getErrorMessage } from '../services/apiClient';

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export const ProfilePage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { account, session, payload, logout, logoutAll, isSuperAdmin } = useAuth();
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isLogoutAllDialogOpen, setIsLogoutAllDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmitPassword = async (data: UpdatePasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      await profileService.updatePassword({ password: data.password });
      toast.success('Password updated successfully');
      reset();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to update password'));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleConfirmLogoutAll = async () => {
    setIsSubmitting(true);
    try {
      await logoutAll();
      toast.success('Logged out from all active sessions');
      setIsLogoutAllDialogOpen(false);
      onNavigate('/login');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to logout from all sessions'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Please sign in to view your profile settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="My Profile & Security"
        description="Self-service account management, password change, and personal session control."
        badge={
          <Badge variant={isSuperAdmin ? 'purple' : 'info'} icon={<ShieldCheck className="w-3 h-3" />}>
            {account.role}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <UserAvatar src={account.avatar_url} name={account.name} size="xl" />
            </div>
            <CardTitle>{account.name}</CardTitle>
            <CardDescription className="font-mono text-xs text-indigo-500">@{account.handle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Email Address:</span>
              <span className="font-medium text-gray-900 dark:text-white">{account.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Account ID:</span>
              <span className="font-mono font-medium text-gray-900 dark:text-white">{account.id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Phone Number:</span>
              <span className="text-gray-900 dark:text-white">{account.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Account Status:</span>
              <Badge variant={account.status === 'active' ? 'success' : 'warning'}>{account.status}</Badge>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500 dark:text-gray-400">Member Since:</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{formatDate(account.created_at)}</span>
            </div>

            {session && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  Current Active Session
                </p>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 font-mono text-[11px] space-y-1">
                  <p><span className="text-gray-400">IP:</span> {session.ip_address || '127.0.0.1'}</p>
                  <p><span className="text-gray-400">Session ID:</span> {session.id}</p>
                  <p className="truncate"><span className="text-gray-400">Client:</span> {session.user_agent}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password & Security Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" />
                Update Password (`PUT /update/password`)
              </CardTitle>
              <CardDescription>Change your account login password directly in the security context.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4 max-w-md">
                <FormField label="New Password" error={errors.password?.message} required>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    {...register('password')}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
                  />
                </FormField>

                <FormField label="Confirm New Password" error={errors.confirmPassword?.message} required>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    {...register('confirmPassword')}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
                  />
                </FormField>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardHeader>
              <CardTitle className="text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Session & Authentication Actions
              </CardTitle>
              <CardDescription>Sign out from this device or invalidate all active user sessions globally.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  toast.success('Signed out');
                  onNavigate('/login');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors shadow-2xs"
              >
                <LogOut className="w-4 h-4 text-gray-500" />
                Sign Out Current Session (`POST /logout`)
              </button>

              <button
                type="button"
                onClick={() => setIsLogoutAllDialogOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                Log Out Everywhere (`POST /logout-all`)
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logout All Confirm Dialog */}
      <ConfirmDialog
        isOpen={isLogoutAllDialogOpen}
        onClose={() => setIsLogoutAllDialogOpen(false)}
        onConfirm={handleConfirmLogoutAll}
        title="Log Out From All Devices"
        description="Are you sure you want to log out everywhere? This will destroy all active sessions across all browser instances and devices."
        confirmText="Log Out Everywhere"
        isDestructive
        isLoading={isSubmitting}
      />
    </div>
  );
};
