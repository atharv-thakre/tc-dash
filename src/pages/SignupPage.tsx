import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowRight, Lock, Mail, Send, User, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useApiConfig } from '../contexts/ApiConfigContext';
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
  const { apiMode, setApiMode } = useApiConfig();

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
      toast.error(getErrorMessage(err, 'Failed to create account. Please check details or server connection.'));
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

  // Block access to Signup Page if in Demo Mode
  if (apiMode === 'demo') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in fade-in duration-200">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Live Server Mode Required</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Account registration is disabled in Demo Mock Mode. Switch to Live Server mode to create an account.
            </p>
          </div>
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setApiMode('live');
                toast.success('Switched to Live Server mode');
              }}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer border border-indigo-400/30"
            >
              Switch to Live Server Mode
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="w-full py-2.5 px-4 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer border border-zinc-700/60"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 transition-all">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 text-indigo-400 mb-3 shadow-inner">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Create Account</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Register your account on tc-auth
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2.5 mb-5">
          <ProviderButton provider="google" label="Sign up with Google" onSuccessNavigate={() => onNavigate('/dashboard')} />
          <ProviderButton provider="github" label="Sign up with GitHub" onSuccessNavigate={() => onNavigate('/dashboard')} />
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-zinc-900 px-3 text-zinc-500 font-bold tracking-wider">
              or register with details
            </span>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 mb-5 rounded-2xl bg-zinc-950 border border-zinc-800">
          <button
            type="button"
            onClick={() => setTab('password')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'password'
                ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setTab('otp')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'otp'
                ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            OTP Verification
          </button>
        </div>

        {tab === 'password' ? (
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-3.5">
            <FormField label="Full Name" error={errors.name?.message} required>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Atharv Thakre"
                  {...register('name')}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </FormField>

            <FormField label="Handle / Username" error={errors.handle?.message} required>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-mono text-zinc-500">@</span>
                <input
                  type="text"
                  placeholder="atharvthakre"
                  {...register('handle')}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50 font-mono text-xs"
                />
              </div>
            </FormField>

            <FormField label="Email Address" error={errors.email?.message} required>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  placeholder="admin@tcauth.dev"
                  {...register('email')}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </FormField>

            <FormField label="Password" error={errors.password?.message} required>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  {...register('password')}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </FormField>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
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
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white"
              />
            </FormField>

            <FormField label="Handle">
              <input
                type="text"
                placeholder="janedoe"
                {...register('handle')}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-xs"
              />
            </FormField>

            <FormField label="Email">
              <input
                type="email"
                placeholder="jane@example.com"
                {...register('email')}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white"
              />
            </FormField>

            <FormField label="Password">
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white"
              />
            </FormField>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="w-full py-2.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
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
                    value={otpCode || ''}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full text-center tracking-[0.25em] font-mono text-base py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-indigo-200 placeholder:tracking-normal placeholder:font-sans placeholder:text-zinc-600 placeholder:text-xs focus:ring-2 focus:ring-indigo-500/50"
                  />
                </FormField>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
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

        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="font-bold text-indigo-400 hover:underline hover:text-indigo-300 cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
