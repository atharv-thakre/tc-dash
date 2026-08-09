import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, KeyRound, Lock, Mail, Send, User, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import { FormField } from '../components/common/FormField';
import { ProviderButton } from '../components/common/ProviderButton';
import { getErrorMessage } from '../services/apiClient';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  handle: z.string().min(2, 'Handle must be at least 2 characters').regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { signupPassword, signupOTP } = useAuth();
  const [tab, setTab] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const formValues = watch();

  const onSubmitPassword = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signupPassword(data);
      toast.success('Account created successfully');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to create account.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.email) {
      toast.error('Please fill in your email address first');
      return;
    }
    setIsSendingOtp(true);
    try {
      await authService.sendEmailOTP('signup', { email: formValues.email });
      setOtpSent(true);
      toast.success('Verification code sent to email');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to send OTP verification email.'));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error('Please enter the OTP code');
      return;
    }
    setIsLoading(true);
    try {
      await signupOTP({
        name: formValues.name,
        email: formValues.email,
        handle: formValues.handle,
        password: formValues.password,
        otp: otpCode,
      });
      toast.success('Account verified and created successfully');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to complete signup.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl transition-all">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Join tc-auth system with instant session context
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2 mb-6">
          <ProviderButton provider="google" label="Sign up with Google" />
          <ProviderButton provider="github" label="Sign up with GitHub" />
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 font-medium tracking-wider">
              or register with
            </span>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 mb-6 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60">
          <button
            type="button"
            onClick={() => setTab('password')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'password'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Direct Password
          </button>
          <button
            type="button"
            onClick={() => setTab('otp')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'otp'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            OTP Verification
          </button>
        </div>

        {tab === 'password' ? (
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-3.5">
            <FormField label="Full Name" error={errors.name?.message} required>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Jane Doe"
                  {...register('name')}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </FormField>

            <FormField label="Handle / Username" error={errors.handle?.message} required>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-mono text-gray-400">@</span>
                <input
                  type="text"
                  placeholder="janedoe"
                  {...register('handle')}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 font-mono text-xs"
                />
              </div>
            </FormField>

            <FormField label="Email" error={errors.email?.message} required>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="jane@example.com"
                  {...register('email')}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </FormField>

            <FormField label="Password" error={errors.password?.message} required>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  {...register('password')}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </FormField>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Register Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-3.5">
            <FormField label="Full Name">
              <input
                type="text"
                placeholder="Jane Doe"
                {...register('name')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
              />
            </FormField>

            <FormField label="Handle">
              <input
                type="text"
                placeholder="janedoe"
                {...register('handle')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono text-xs"
              />
            </FormField>

            <FormField label="Email">
              <input
                type="email"
                placeholder="jane@example.com"
                {...register('email')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
              />
            </FormField>

            <FormField label="Password">
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
              />
            </FormField>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSendingOtp ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Request Signup OTP
                  </>
                )}
              </button>
            ) : (
              <form onSubmit={handleVerifyAndSignupOtp} className="space-y-3">
                <FormField label="Enter Verification Code">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full text-center font-mono tracking-widest text-base py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
                  />
                </FormField>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Verify & Create Account'
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
