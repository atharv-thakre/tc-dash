import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Check,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Send,
  Server,
  Settings2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useApiConfig } from '../contexts/ApiConfigContext';
import { authService } from '../services/auth';
import { configService, PulseResponse } from '../services/config';
import { FormField } from '../components/common/FormField';
import { ProviderButton } from '../components/common/ProviderButton';
import { getErrorMessage } from '../services/apiClient';

const passwordSchema = z.object({
  identifier: z.string().min(1, 'Email or handle is required'),
  password: z.string().min(1, 'Password is required'),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const LoginPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { loginPassword, loginOTP, loginOAuth, forgotPassword } = useAuth();
  const { apiMode, setApiMode, baseUrl, setBaseUrl } = useApiConfig();

  const [tab, setTab] = useState<'password' | 'otp' | 'reset'>('password');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Forgot / Reset Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isTestingPulse, setIsTestingPulse] = useState(false);
  const [pulseResult, setPulseResult] = useState<PulseResponse | null>(null);
  const [pulseError, setPulseError] = useState<string | null>(null);

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
      toast.error(getErrorMessage(err, 'Failed to sign in. Please check credentials or server connection.'));
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

  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setIsSendingReset(true);
    try {
      await authService.sendEmailOTP('reset', { email: forgotEmail });
      setResetSent(true);
      toast.success('Reset OTP sent to email (purpose="reset").');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to send reset OTP.'));
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp) {
      toast.error('Please enter the reset OTP code');
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword({ email: forgotEmail, otp: forgotOtp });
      toast.success('Password reset & logged in successfully via POST /forgot/password');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to reset password. Check OTP code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPulse = async () => {
    setIsTestingPulse(true);
    setPulseResult(null);
    setPulseError(null);
    try {
      const res = await configService.testPulse();
      setPulseResult(res);
      toast.success(`Server Pulse OK: status=${res.status}, state=${res.state}`);
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Pulse connection check failed.');
      setPulseError(msg);
    } finally {
      setIsTestingPulse(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    try {
      setApiMode('demo');
      await loginPassword({ identifier: 'admin@tcauth.dev', password: 'demo' });
      toast.success('Entered Demo Mode as Superadmin (Atharv Thakre)');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to enter demo mode'));
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
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 text-indigo-400 mb-3 shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">tc-auth</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/80">
              v1.5.0
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Superadmin Authentication & Session Management Dashboard
          </p>
        </div>

        {/* Backend API Mode & Pulse Connection Status */}
        <div className="mb-6 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              API SERVER MODE
            </span>
            <button
              type="button"
              onClick={() => setShowServerSettings(!showServerSettings)}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {showServerSettings
                ? apiMode === 'demo' ? 'Hide Access' : 'Hide URL'
                : apiMode === 'demo' ? 'Configure Access' : 'Configure URL'}
            </button>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setApiMode('demo')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                apiMode === 'demo'
                  ? 'border-indigo-500/80 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Demo Mock
            </button>

            <button
              type="button"
              onClick={() => setApiMode('live')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                apiMode === 'live'
                  ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Server
            </button>
          </div>

          {/* Server Connection Pulse Button */}
          <div className="pt-2 border-t border-zinc-800/60">
            <button
              type="button"
              onClick={handleTestPulse}
              disabled={isTestingPulse}
              className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-[11px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Activity className={`w-3.5 h-3.5 text-indigo-400 ${isTestingPulse ? 'animate-spin' : ''}`} />
              {isTestingPulse ? 'Checking Pulse...' : 'Test Server Connection (/config/pulse)'}
            </button>
          </div>

          {pulseResult && (
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono space-y-2 shadow-inner animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${apiMode === 'demo' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'}`} />
                  <span className="font-bold text-zinc-100 text-xs flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Pulse: {pulseResult.status}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/90 text-zinc-300 text-[10px] font-semibold tracking-wider uppercase border border-zinc-700/70">
                  {pulseResult.state}
                </span>
              </div>
              {pulseResult.response && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <span className="text-zinc-400 font-sans font-medium">Response</span>
                  <span className="text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold">
                    {pulseResult.response}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 font-mono">
                <span>System Time</span>
                <span className="text-zinc-400">{pulseResult.system_time}</span>
              </div>
            </div>
          )}

          {pulseError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs space-y-1.5 shadow-inner animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 font-bold text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Pulse Connection Failed</span>
              </div>
              <div className="text-[11px] text-rose-200/90 font-sans leading-relaxed">{pulseError}</div>
            </div>
          )}

          {/* Lower Toggleable Section: Demo Instant Access OR Live Backend Base URL */}
          {showServerSettings && (
            <div className="pt-3 border-t border-zinc-800/80 space-y-2.5 animate-in fade-in duration-150">
              {apiMode === 'demo' ? (
                /* Demo Mode Instant Access Section */
                <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Demo Mode Active
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 uppercase tracking-wider">
                      Instant Access
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Signed out or testing? Jump straight back into full Superadmin control panel.
                  </p>
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    disabled={isLoading}
                    className="w-full py-2.5 px-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-zinc-700/80 shadow-sm active:scale-[0.99] disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    Enter as SuperAdmin
                  </button>
                </div>
              ) : (
                /* Live Server Mode Base URL Settings */
                <>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    BACKEND BASE URL PATH
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                      <input
                        type="text"
                        value={inputUrl || ''}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="/tc-auth"
                        className="w-full pl-8 pr-2 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-xl text-zinc-100 font-mono focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveUrl}
                      className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer shadow-sm"
                    >
                      Set
                    </button>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-1.5 items-center text-[10px] text-zinc-400 pt-0.5">
                    <span className="text-zinc-500 font-medium">Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setInputUrl('/tc-auth');
                        setBaseUrl('/tc-auth');
                        toast.success('Set base URL to /tc-auth');
                      }}
                      className={`px-2 py-0.5 rounded font-mono text-xs border transition-all cursor-pointer ${
                        baseUrl === '/tc-auth'
                          ? 'bg-zinc-800 text-white border-zinc-600 font-bold'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700/60'
                      }`}
                    >
                      /tc-auth
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputUrl('https://app.totalchaos.online/tc-auth');
                        setBaseUrl('https://app.totalchaos.online/tc-auth');
                        toast.success('Set base URL to https://app.totalchaos.online/tc-auth');
                      }}
                      className={`px-2 py-0.5 rounded font-mono text-xs border transition-all cursor-pointer ${
                        baseUrl === 'https://app.totalchaos.online/tc-auth'
                          ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/50 font-bold'
                          : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      https://app.totalchaos.online/tc-auth
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2.5 mb-5">
          <ProviderButton provider="google" onSuccessNavigate={() => onNavigate('/dashboard')} />
          <ProviderButton provider="github" onSuccessNavigate={() => onNavigate('/dashboard')} />
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-zinc-900 px-3 text-zinc-500 font-bold tracking-wider">
              or sign in with credentials
            </span>
          </div>
        </div>

        {/* Tab Switcher: Password vs OTP vs Reset */}
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
          <button
            type="button"
            onClick={() => setTab('reset')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'reset'
                ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Reset
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
                  placeholder="admin@tcauth.dev or atharv"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
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
        ) : tab === 'otp' ? (
          /* OTP Login Form */
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <FormField label="Email Address" required hint="We will email a temporary OTP login code.">
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      value={otpEmail || ''}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="admin@tcauth.dev"
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </FormField>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-2.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
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

                <FormField label="Enter Verification Code" required>
                  <input
                    type="text"
                    value={otpCode || ''}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    maxLength={12}
                    className="w-full text-center tracking-[0.25em] font-mono text-base py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-indigo-200 placeholder:tracking-normal placeholder:font-sans placeholder:text-zinc-600 placeholder:text-xs focus:ring-2 focus:ring-indigo-500/50"
                  />
                </FormField>

                {apiMode === 'demo' && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
                    <span>Demo Mode: Any code works</span>
                    <button
                      type="button"
                      onClick={() => setOtpCode('123456')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-[10px] border border-amber-500/30 transition-all cursor-pointer"
                    >
                      Fill Demo Code (123456)
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
        ) : (
          /* Forgot Password / Reset OTP Form */
          <div className="space-y-4">
            {!resetSent ? (
              <form onSubmit={handleRequestResetOtp} className="space-y-4">
                <FormField label="Email Address" required hint="We will send a password reset OTP (purpose='reset').">
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </FormField>

                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="w-full py-2.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSendingReset ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Send Reset OTP (`purpose=reset`)'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                  <span>Reset OTP sent to <strong className="text-white">{forgotEmail}</strong></span>
                  <button
                    type="button"
                    onClick={() => setResetSent(false)}
                    className="underline text-[11px] font-semibold hover:text-white"
                  >
                    Change
                  </button>
                </div>

                <FormField label="Enter Reset Code" required hint="Code for POST /forgot/password">
                  <input
                    type="text"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    maxLength={12}
                    className="w-full text-center tracking-[0.25em] font-mono text-base py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-indigo-200 placeholder:tracking-normal placeholder:font-sans placeholder:text-zinc-600 placeholder:text-xs focus:ring-2 focus:ring-indigo-500/50"
                  />
                </FormField>

                {apiMode === 'demo' && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
                    <span>Demo Mode: Any code works</span>
                    <button
                      type="button"
                      onClick={() => setForgotOtp('123456')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-[10px] border border-amber-500/30 transition-all cursor-pointer"
                    >
                      Fill Demo Code (123456)
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Reset & Sign In (`POST /forgot/password`)'
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          Don't have an account?{' '}
          <button
            onClick={() => {
              if (apiMode === 'demo') {
                toast.error('Sign up is only available in Live Server mode. Please switch to Live Server mode first.');
              } else {
                onNavigate('/signup');
              }
            }}
            className="font-bold text-indigo-400 hover:underline hover:text-indigo-300 cursor-pointer"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};
