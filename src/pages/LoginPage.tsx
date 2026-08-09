import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight,
  Check,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Send,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useApiConfig } from '../contexts/ApiConfigContext';
import { authService } from '../services/auth';
import { FormField } from '../components/common/FormField';
import { ProviderButton } from '../components/common/ProviderButton';
import { getErrorMessage } from '../services/apiClient';

const passwordSchema = z.object({
  identifier: z.string().min(1, 'Email or handle is required'),
  password: z.string().min(1, 'Password is required'),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const LoginPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { loginPassword, loginOTP } = useAuth();
  const { apiMode, setApiMode, baseUrl, setBaseUrl } = useApiConfig();

  const [tab, setTab] = useState<'password' | 'otp'>('password');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Server Endpoint Settings
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [inputUrl, setInputUrl] = useState(baseUrl);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      await loginPassword(data);
      toast.success('Signed in successfully');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to sign in. Please check credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setIsSendingOtp(true);
    try {
      await authService.sendEmailOTP('login', { email: otpEmail });
      setOtpSent(true);
      toast.success('OTP sent to email. Code expires soon.');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to send OTP code.'));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error('Please enter the OTP code');
      return;
    }
    setIsLoading(true);
    try {
      await loginOTP({ email: otpEmail, otp: otpCode });
      toast.success('Signed in with OTP successfully');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Invalid or expired OTP code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUrl = () => {
    setBaseUrl(inputUrl);
    toast.success(`Server URL updated: ${inputUrl || '/tc-auth'}`);
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 py-8">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 transition-all">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25 mb-3 border border-indigo-400/30">
            <KeyRound className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">tc-auth</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              v1.0
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Superadmin Authentication & Session Management Dashboard
          </p>
        </div>

        {/* Backend API Mode & Endpoint Selector */}
        <div className="mb-6 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              API Server Mode
            </span>
            <button
              type="button"
              onClick={() => setShowServerSettings(!showServerSettings)}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <Settings2 className="w-3 h-3" />
              {showServerSettings ? 'Hide URL Config' : 'Configure URL'}
            </button>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setApiMode('demo')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                apiMode === 'demo'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Demo Mock Mode
            </button>

            <button
              type="button"
              onClick={() => setApiMode('live')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                apiMode === 'live'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Server
            </button>
          </div>

          {/* Live Server URL Input */}
          {(showServerSettings || apiMode === 'live') && (
            <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-2 animate-in fade-in duration-150">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Backend Base Path / URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="/tc-auth"
                    className="w-full pl-8 pr-2 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-xl text-zinc-100 font-mono focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
                >
                  Set
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 items-center text-[10px] text-zinc-400 pt-1">
                <span className="text-zinc-500 font-medium">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('/tc-auth');
                    setBaseUrl('/tc-auth');
                    setApiMode('live');
                    toast.success('Set base URL to /tc-auth');
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 font-mono text-zinc-300 border border-zinc-700/60"
                >
                  /tc-auth
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('https://app.totalchaos.online/tc-auth');
                    setBaseUrl('https://app.totalchaos.online/tc-auth');
                    setApiMode('live');
                    toast.success('Set base URL to https://app.totalchaos.online/tc-auth');
                  }}
                  className="px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30"
                >
                  https://app.totalchaos.online/tc-auth
                </button>
              </div>
            </div>
          )}
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2.5 mb-5">
          <ProviderButton provider="google" />
          <ProviderButton provider="github" />
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-zinc-900 px-3 text-zinc-500 font-bold tracking-wider">
              or sign in with
            </span>
          </div>
        </div>

        {/* Tab Switcher: Password vs OTP */}
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
            Email OTP
          </button>
        </div>

        {/* Password Login Form */}
        {tab === 'password' ? (
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            <FormField label="Email or Handle" error={passwordErrors.identifier?.message} required>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="atharv or admin@tcauth.dev"
                  {...registerPassword('identifier')}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </FormField>

            <FormField label="Password" error={passwordErrors.password?.message} required>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('password')}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </FormField>

            <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300">
              <div className="font-semibold text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center justify-between">
                <span>Quick Test Account Credentials:</span>
                <span className="text-[10px] text-indigo-400 font-mono">Superadmin</span>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={() => {
                    const idInput = document.querySelector('input[name="identifier"]') as HTMLInputElement;
                    const passInput = document.querySelector('input[name="password"]') as HTMLInputElement;
                    if (idInput && passInput) {
                      idInput.value = 'atharv';
                      passInput.value = 'atharv@112';
                      idInput.dispatchEvent(new Event('input', { bubbles: true }));
                      passInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 font-mono text-[11px] font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  atharv / atharv@112
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* OTP Login Form */
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <FormField label="Email Address" required hint="We will generate or email a temporary OTP login code.">
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="jane@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </FormField>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-2.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSendingOtp ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Request Email OTP
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                  <span>Code sent to <strong className="text-white">{otpEmail}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="underline text-[11px] font-semibold hover:text-white"
                  >
                    Change
                  </button>
                </div>

                <FormField label="Enter OTP Code" required>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    required
                    maxLength={12}
                    className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50"
                  />
                </FormField>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('/signup')}
            className="font-bold text-indigo-400 hover:underline hover:text-indigo-300"
          >
            Create superadmin account
          </button>
        </div>
      </div>
    </div>
  );
};
