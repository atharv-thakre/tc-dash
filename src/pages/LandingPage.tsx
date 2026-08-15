import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  KeyRound,
  Shield,
  Zap,
  Terminal,
  Users,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Lock,
  Code2,
  Sliders,
  Send,
  Mail,
  Play,
  LogIn,
  UserPlus,
  ChevronRight,
  Database,
  ExternalLink,
  Cpu,
  Layers,
  Flame,
  X,
  Radio,
  Server,
  Activity,
  Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApiConfig } from '../contexts/ApiConfigContext';
import { toast } from 'sonner';

// React Bits Components
import { ShinyText } from '../components/reactbits/ShinyText';
import { DecryptedText } from '../components/reactbits/DecryptedText';
import { SplitText } from '../components/reactbits/SplitText';
import { TrueFocus } from '../components/reactbits/TrueFocus';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { TiltedCard } from '../components/reactbits/TiltedCard';
import { BorderBeam } from '../components/reactbits/BorderBeam';
import { Magnet } from '../components/reactbits/Magnet';
import { ParticlesBackground } from '../components/reactbits/ParticlesBackground';
import { SquaresBackground } from '../components/reactbits/SquaresBackground';
import { AnimatedCounter } from '../components/reactbits/AnimatedCounter';
import { InteractiveTerminal } from '../components/reactbits/InteractiveTerminal';
import { ArchitectureFlow } from '../components/reactbits/ArchitectureFlow';
import { FloatingDock } from '../components/reactbits/FloatingDock';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { account, login } = useAuth();
  const { apiMode, setApiMode } = useApiConfig();

  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'init' | 'otp' | 'sessions' | 'rest'>('init');

  // Interactive Playground State
  const [playgroundTab, setPlaygroundTab] = useState<'otp' | 'jwt' | 'rest'>('otp');
  const [otpEmail, setOtpEmail] = useState('developer@tcauth.dev');
  const [otpPurpose, setOtpPurpose] = useState<'signup' | 'login' | 'reset'>('login');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [inputOtp, setInputOtp] = useState('');
  const [otpVerificationResult, setOtpVerificationResult] = useState<'success' | 'failure' | null>(null);

  // Playground JWT State
  const [jwtRole, setJwtRole] = useState<'user' | 'admin' | 'superadmin'>('superadmin');
  const [jwtStatus, setJwtStatus] = useState<'active' | 'expired'>('active');

  // Playground REST state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('login');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleLaunchDemo = () => {
    setApiMode('demo');
    login('superadmin@tcauth.dev', 'superadmin123', true);
    toast.success('Launched Live Demo Console as Superadmin!');
    onNavigate('/dashboard');
  };

  const handleSimulateOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setInputOtp('');
    setOtpVerificationResult(null);
    toast.success(`Simulated OTP dispatched to ${otpEmail}: [ ${code} ]`);
  };

  const handleVerifyOtp = () => {
    if (inputOtp === generatedOtp) {
      setOtpVerificationResult('success');
      toast.success('OTP successfully verified! Access Token issued.');
    } else {
      setOtpVerificationResult('failure');
      toast.error('Invalid OTP. Please check the simulated code.');
    }
  };

  const codeSnippets = {
    init: `# 1. Install & Initialize tc_auth
from tc_auth import Auth
from sqlalchemy import create_engine
from fastapi import FastAPI

app = FastAPI(title="Production Auth API")
engine = create_engine("postgresql+psycopg2://user:pass@localhost:5432/authdb")

# Initialize tc_auth with your database engine and secret
auth = Auth(
    app=app,
    engine=engine,
    secret_key="your-secure-jwt-secret-key-32-chars",
    session_duration_days=7
)

# User registration & password login
account = auth.account.create(
    name="Jane Doe",
    email="jane@example.com",
    password="superSecretPassword123!"
)

# Verify credentials & generate stateful session
session_data = auth.service.login(
    identifier="jane@example.com",
    password="superSecretPassword123!",
    ip_address="203.0.113.10"
)

print("JWT Access Token:", session_data["access_token"])`,

    otp: `# 2. Passwordless Email OTP Flow
from tc_auth import Auth

auth = Auth(app=app, engine=engine, secret_key="your-jwt-secret")

# Step A: Dispatch 6-digit cryptographic OTP to user's email
otp_code = auth.otp.create_otp(
    email="jane@example.com",
    purpose="login",
    expires_minutes=10
)

# Step B: Verify the OTP & automatically issue active session token
verification = auth.service.verify_otp_and_login(
    email="jane@example.com",
    otp_code="849201",
    ip_address="203.0.113.10"
)

if verification["status"] == "success":
    print("User authenticated:", verification["account"]["name"])
    print("Session ID:", verification["session"]["id"])`,

    sessions: `# 3. Stateful Database Session Management
from tc_auth import Auth

auth = Auth(app=app, engine=engine, secret_key="your-jwt-secret")

# List all active connected sessions for a given account ID
active_sessions = auth.session.get_user_sessions(account_id=1)
print(f"Total active devices: {len(active_sessions)}")

# Instantly revoke a specific compromised session token
auth.session.revoke_session(session_id=42)

# Purge all sessions across all devices (force global re-login)
auth.session.revoke_all_sessions(account_id=1)`,

    rest: `# 4. Standard REST API Call (cURL)
curl -X POST https://api.example.com/tc-auth/login/password \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "jane@example.com",
    "password": "superSecretPassword123!"
  }'

# Response: 200 OK
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "Bearer",
#   "account": {
#     "id": 1,
#     "name": "Jane Doe",
#     "email": "jane@example.com",
#     "role": "superadmin"
#   }
# }`
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white font-sans antialiased relative overflow-hidden">
      {/* Dynamic React Bits Canvas Particle Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <ParticlesBackground
          particleCount={50}
          particleColor="rgba(99, 102, 241, 0.35)"
          lineColor="rgba(129, 140, 248, 0.08)"
          minDistance={120}
          speed={0.4}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-gradient-to-b from-indigo-500/15 via-purple-500/5 to-transparent blur-3xl opacity-80 pointer-events-none" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white flex items-center">
                tc<span className="text-indigo-400">-</span>auth
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 rounded-md">
                <DecryptedText text="v1.5.0" speed={40} maxIterations={8} animateOn="hover" />
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
            <a href="#features" className="hover:text-indigo-400 transition-colors">
              Features
            </a>
            <a href="#terminal-section" className="hover:text-indigo-400 transition-colors">
              CLI Shell
            </a>
            <a href="#playground" className="hover:text-indigo-400 transition-colors">
              Live Playground
            </a>
            <a href="#architecture" className="hover:text-indigo-400 transition-colors">
              Architecture
            </a>
            <button
              onClick={() => onNavigate('/docs/lib/setup')}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Python Docs
            </button>
            <button
              onClick={() => onNavigate('/docs/api/login-routes')}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
            >
              REST API
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Live API Mode Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border border-zinc-800 bg-zinc-900/60 text-zinc-400">
              <span className={`w-1.5 h-1.5 rounded-full ${apiMode === 'demo' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="capitalize">{apiMode} Mode</span>
            </div>

            {account ? (
              <Magnet magnetStrength={0.2}>
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Magnet>
            ) : (
              <div className="flex items-center gap-2">
                <Magnet magnetStrength={0.2}>
                  <button
                    onClick={handleLaunchDemo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
                    title="Test dashboard immediately with sample data"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Try Demo</span>
                  </button>
                </Magnet>

                <button
                  onClick={() => onNavigate('/login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  Sign In
                </button>

                <Magnet magnetStrength={0.2}>
                  <button
                    onClick={() => onNavigate('/signup')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Magnet>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Version Announcement Pill with Decrypted Animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-950/60 border border-indigo-800/80 text-indigo-300 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>
                <DecryptedText
                  text="v1.5.0 Released • Modular Python Auth Suite"
                  speed={40}
                  maxIterations={12}
                  animateOn="view"
                />
              </span>
              <span className="text-zinc-700">|</span>
              <span className="font-mono text-[11px] opacity-90 text-indigo-200">
                <ShinyText text="pip install tc_auth" speed={4} />
              </span>
            </motion.div>

            {/* SplitText Animated Headline */}
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] flex flex-col items-center">
              <SplitText
                text="Authentication Made"
                className="justify-center"
                delay={40}
              />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-1">
                <DecryptedText
                  text="Modular, Secure & Pythonic"
                  speed={35}
                  maxIterations={14}
                  animateOn="view"
                  encryptedClassName="text-purple-400"
                />
              </span>
            </div>

            {/* Interactive TrueFocus Keyword Showcase */}
            <div className="flex justify-center py-1">
              <TrueFocus
                sentence="Modular Pythonic Stateful Self-Hosted Zero-Lockin"
                blurAmount={3}
                borderColor="#818cf8"
                glowColor="rgba(99, 102, 241, 0.4)"
                animationDuration={0.4}
                pauseBetweenAnimations={1.6}
              />
            </div>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-400 font-normal max-w-2xl mx-auto leading-relaxed"
            >
              A self-hosted, modular authentication framework for Python backends.
              Featuring database-backed stateful JWT sessions, passwordless email OTP,
              Google & GitHub OAuth 2.0, and a live administration console.
            </motion.p>

            {/* Options To Launch in Demo, Sign In, or Create Account */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-2 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* 1. Try Live Demo Option with Magnet */}
                <Magnet magnetStrength={0.3}>
                  <button
                    onClick={handleLaunchDemo}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-950/30 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Try Live Demo</span>
                  </button>
                </Magnet>

                {/* 2. Sign In Option with Magnet */}
                <Magnet magnetStrength={0.3}>
                  <button
                    onClick={() => onNavigate('/login')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Console</span>
                  </button>
                </Magnet>

                {/* 3. Register / Get Started Option */}
                <Magnet magnetStrength={0.3}>
                  <button
                    onClick={() => onNavigate('/signup')}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-purple-400" />
                    <span>Create Account</span>
                  </button>
                </Magnet>
              </div>

              {/* Pip Install Copy Box with ShinyText */}
              <div className="flex items-center justify-center pt-2">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 font-mono text-xs shadow-inner">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <ShinyText text="pip install tc_auth" speed={5} className="text-zinc-200" />
                  <button
                    onClick={() => copyToClipboard('pip install tc_auth', 'pip install tc_auth')}
                    className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy command"
                  >
                    {copiedSnippet === 'pip install tc_auth' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Interactive Code Preview Card with BorderBeam Effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-14 max-w-4xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-2xl overflow-hidden backdrop-blur-sm relative"
          >
            <BorderBeam size={260} duration={12} colorFrom="#6366f1" colorTo="#a855f7" />

            {/* Code Tabs Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono font-bold text-zinc-400">
                  tc_auth_python_suite
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg">
                <button
                  onClick={() => setActiveCodeTab('init')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
                    activeCodeTab === 'init'
                      ? 'bg-zinc-800 text-indigo-400 shadow-2xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Quickstart
                </button>
                <button
                  onClick={() => setActiveCodeTab('otp')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
                    activeCodeTab === 'otp'
                      ? 'bg-zinc-800 text-indigo-400 shadow-2xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Email OTP
                </button>
                <button
                  onClick={() => setActiveCodeTab('sessions')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
                    activeCodeTab === 'sessions'
                      ? 'bg-zinc-800 text-indigo-400 shadow-2xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Session Control
                </button>
                <button
                  onClick={() => setActiveCodeTab('rest')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
                    activeCodeTab === 'rest'
                      ? 'bg-zinc-800 text-indigo-400 shadow-2xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  REST API
                </button>
              </div>

              {/* Copy Code */}
              <button
                onClick={() => copyToClipboard(codeSnippets[activeCodeTab], `${activeCodeTab} snippet`)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedSnippet === `${activeCodeTab} snippet` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-5 bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[380px]">
              <pre>
                <code>{codeSnippets[activeCodeTab]}</code>
              </pre>
            </div>
          </motion.div>
        </section>

        {/* LIVE METRICS / STATS BAR WITH ANIMATED COUNTERS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-y border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-center justify-center">
                <AnimatedCounter to={100} suffix="%" />
              </div>
              <p className="text-xs text-zinc-400 font-medium">Self-Hosted & Private</p>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono flex items-center justify-center">
                <AnimatedCounter to={0} prefix="< " suffix="ms" decimals={0} />
              </div>
              <p className="text-xs text-zinc-400 font-medium">Session Revocation Latency</p>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono flex items-center justify-center">
                <AnimatedCounter to={4} suffix=" Strategies" />
              </div>
              <p className="text-xs text-zinc-400 font-medium">Password, OTP, Google, GitHub</p>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono flex items-center justify-center">
                <AnimatedCounter to={0} prefix="$" suffix=" / Unlimited" />
              </div>
              <p className="text-xs text-zinc-400 font-medium">Open Source & Free</p>
            </div>
          </div>
        </section>

        {/* INTERACTIVE DEVELOPER TERMINAL SECTION */}
        <section id="terminal-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/60">
              Developer Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Interactive CLI Emulator
            </h2>
            <p className="text-sm text-zinc-400">
              Run commands directly in this simulated tc_auth shell. Try initializing the database, dispatching OTPs, inspecting tokens, or typing <code className="font-mono text-indigo-400">help</code>.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <InteractiveTerminal />
          </div>
        </section>

        {/* CORE PILLARS / FEATURES BENTO GRID WITH SPOTLIGHT & 3D TILT */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/60">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Engineered for Modern Security & DX
            </h2>
            <p className="text-sm text-zinc-400">
              Everything you need to ship secure authentication, user management, and session control without third-party vendor lock-in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: SpotlightCard */}
            <SpotlightCard className="p-6 h-full" spotlightColor="rgba(99, 102, 241, 0.2)" borderColor="rgba(99, 102, 241, 0.4)">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-900 flex items-center justify-center text-indigo-400 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Multi-Strategy Authentication
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Support bcrypt-hashed passwords, passwordless 6-digit email OTPs, Google OpenID Connect, and GitHub OAuth 2.0 in a unified user model.
              </p>
            </SpotlightCard>

            {/* Feature 2: SpotlightCard */}
            <SpotlightCard className="p-6 h-full" spotlightColor="rgba(168, 85, 247, 0.2)" borderColor="rgba(168, 85, 247, 0.4)">
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-900 flex items-center justify-center text-purple-400 mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Stateful JWT Sessions
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tokens contain active session IDs (<code className="font-mono text-indigo-400">sid</code>) backed by the database. Revoke compromised devices instantly without waiting for JWT expiry.
              </p>
            </SpotlightCard>

            {/* Feature 3: SpotlightCard */}
            <SpotlightCard className="p-6 h-full" spotlightColor="rgba(16, 185, 129, 0.2)" borderColor="rgba(16, 185, 129, 0.4)">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-900 flex items-center justify-center text-emerald-400 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Pure Python SDK Architecture
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Clean, modular class structure (<code className="font-mono text-indigo-400">auth.account</code>, <code className="font-mono text-indigo-400">auth.otp</code>, <code className="font-mono text-indigo-400">auth.session</code>) designed for seamless backend integration.
              </p>
            </SpotlightCard>

            {/* Feature 4: SpotlightCard */}
            <SpotlightCard className="p-6 h-full" spotlightColor="rgba(245, 158, 11, 0.2)" borderColor="rgba(245, 158, 11, 0.4)">
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-900 flex items-center justify-center text-amber-400 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Granular Role Hierarchy (RBAC)
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Built-in <code className="font-mono text-amber-400">user</code>, <code className="font-mono text-indigo-400">admin</code>, and <code className="font-mono text-purple-400">superadmin</code> authorization tiers with role checks and privilege guards.
              </p>
            </SpotlightCard>

            {/* Feature 5: SpotlightCard */}
            <SpotlightCard className="p-6 h-full" spotlightColor="rgba(14, 165, 233, 0.2)" borderColor="rgba(14, 165, 233, 0.4)">
              <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-900 flex items-center justify-center text-sky-400 mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Built-in Email OTP Engine
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Direct SMTP integration for sending verification codes, signup authorizations, and password resets with brute-force attempt limits.
              </p>
            </SpotlightCard>

            {/* Feature 6: SpotlightCard */}
            <SpotlightCard className="p-6 h-full" spotlightColor="rgba(236, 72, 153, 0.2)" borderColor="rgba(236, 72, 153, 0.4)">
              <div className="w-12 h-12 rounded-xl bg-pink-950/60 border border-pink-900 flex items-center justify-center text-pink-400 mb-4">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Real-Time Admin Control Panel
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Full web dashboard for auditing active sessions, inspecting accounts, managing OAuth links, and updating SMTP credentials at runtime.
              </p>
            </SpotlightCard>
          </div>
        </section>

        {/* INTERACTIVE PLAYGROUND TESTER */}
        <section id="playground" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60">
              Interactive Test Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Test tc_auth in Real Time
            </h2>
            <p className="text-sm text-zinc-400">
              Try the core authentication mechanics right here in your browser before integrating into your backend.
            </p>
          </div>

          {/* Playground Card */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden relative">
            <BorderBeam size={220} duration={14} colorFrom="#10b981" colorTo="#6366f1" />

            {/* Top Playground Bar */}
            <div className="flex border-b border-zinc-800 bg-zinc-950/60">
              <button
                onClick={() => setPlaygroundTab('otp')}
                className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  playgroundTab === 'otp'
                    ? 'border-indigo-600 text-indigo-400 bg-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>1. Email OTP Simulator</span>
              </button>

              <button
                onClick={() => setPlaygroundTab('jwt')}
                className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  playgroundTab === 'jwt'
                    ? 'border-indigo-600 text-indigo-400 bg-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>2. JWT Claims Inspector</span>
              </button>

              <button
                onClick={() => setPlaygroundTab('rest')}
                className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  playgroundTab === 'rest'
                    ? 'border-indigo-600 text-indigo-400 bg-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>3. Live REST Probe</span>
              </button>
            </div>

            {/* Playground Tab 1: OTP Simulator */}
            {playgroundTab === 'otp' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Input parameters */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Step A: Dispatch OTP Code
                    </h4>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Recipient Email Address
                      </label>
                      <input
                        type="email"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-700 bg-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Purpose Flow
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['login', 'signup', 'reset'] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setOtpPurpose(p)}
                            className={`py-1.5 text-xs font-mono font-bold rounded-lg border capitalize transition-all cursor-pointer ${
                              otpPurpose === p
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Magnet magnetStrength={0.2} className="w-full">
                      <button
                        onClick={handleSimulateOtp}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Simulated OTP</span>
                      </button>
                    </Magnet>
                  </div>

                  {/* Right: Code Received Box & Verification */}
                  <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                      <span>Simulated SMTP Inbox</span>
                      {generatedOtp && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded">
                          Delivered
                        </span>
                      )}
                    </h4>

                    {generatedOtp ? (
                      <div className="p-3.5 rounded-lg border border-indigo-900 bg-indigo-950/30 text-xs space-y-1.5 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
                          <span>From: noreply@tcauth.dev</span>
                          <span>TTL: 300s</span>
                        </div>
                        <p className="font-medium text-zinc-200">
                          Your <span className="font-bold uppercase text-indigo-400">{otpPurpose}</span> code is:
                        </p>
                        <div className="text-2xl font-mono font-black text-indigo-400 tracking-widest py-1">
                          <DecryptedText text={generatedOtp} speed={30} maxIterations={8} animateOn="view" />
                        </div>
                        <button
                          onClick={() => setInputOtp(generatedOtp)}
                          className="text-[11px] text-indigo-400 hover:underline font-semibold cursor-pointer"
                        >
                          Auto-fill into verification input →
                        </button>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-zinc-600">
                        Click "Send Simulated OTP" on the left to trigger a simulated email event.
                      </div>
                    )}

                    <div className="pt-2 space-y-2">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Step B: Verify Received 6-Digit OTP
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6 digits"
                          value={inputOtp}
                          onChange={(e) => setInputOtp(e.target.value.trim())}
                          className="flex-1 px-3 py-2 text-xs font-mono font-bold tracking-widest text-center rounded-xl border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button
                          onClick={handleVerifyOtp}
                          disabled={!generatedOtp || !inputOtp}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all cursor-pointer"
                        >
                          Verify
                        </button>
                      </div>

                      {otpVerificationResult === 'success' && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 p-2 rounded-lg border border-emerald-800 animate-in fade-in">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>OTP Validated! Bearer Access Token generated successfully.</span>
                        </div>
                      )}
                      {otpVerificationResult === 'failure' && (
                        <div className="text-xs text-rose-400 font-bold bg-rose-950/60 p-2 rounded-lg border border-rose-800 animate-in fade-in">
                          Verification failed. Incorrect code or expired.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Playground Tab 2: JWT Claims Inspector */}
            {playgroundTab === 'jwt' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-400">Account Role:</span>
                    {(['user', 'admin', 'superadmin'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setJwtRole(r)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                          jwtRole === r
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-400">Session Status:</span>
                    {(['active', 'expired'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setJwtStatus(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                          jwtStatus === s
                            ? s === 'active'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Encoded JWT String */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-mono font-bold text-zinc-400 uppercase">
                      1. Encoded JWT String (Header.Payload.Signature)
                    </h5>
                    <div className="p-3.5 rounded-xl bg-zinc-950 text-indigo-400 font-mono text-[11px] break-all leading-relaxed h-[220px] overflow-y-auto">
                      <span className="text-rose-400">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>.
                      <span className="text-purple-400">
                        {btoa(
                          JSON.stringify({
                            aid: 1,
                            sid: 60,
                            role: jwtRole,
                            status: jwtStatus,
                            exp: jwtStatus === 'active' ? 1787404800 : 1600000000
                          })
                        ).replace(/=/g, '')}
                      </span>.
                      <span className="text-sky-400">c3VwZXJzZWNyZXRzaWduYXR1cmVoYXNoMTIzNDU2</span>
                    </div>
                  </div>

                  {/* Decoded Claims Payload */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-mono font-bold text-zinc-400 uppercase">
                      2. Decoded Header & Payload Claims
                    </h5>
                    <div className="p-3.5 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-[11px] leading-relaxed h-[220px] overflow-y-auto">
                      <pre>
                        {JSON.stringify(
                          {
                            header: { alg: 'HS256', typ: 'JWT' },
                            payload: {
                              aid: 1,
                              sid: 60,
                              role: jwtRole,
                              status: jwtStatus,
                              exp: jwtStatus === 'active' ? 1787404800 : 1600000000,
                              iss: 'tc_auth_v1.5.0'
                            },
                            verified: jwtStatus === 'active'
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Playground Tab 3: REST Probe */}
            {playgroundTab === 'rest' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-400">Target Endpoint:</span>
                  {[
                    { id: 'login', label: 'POST /tc-auth/login/password' },
                    { id: 'pulse', label: 'GET /tc-auth/config/pulse' },
                    { id: 'me', label: 'GET /tc-auth/me' },
                    { id: 'counts', label: 'GET /tc-auth/config/counts' }
                  ].map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => setSelectedEndpoint(ep.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedEndpoint === ep.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {ep.label}
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-200 space-y-3">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px] pb-2 border-b border-zinc-800">
                    <span>HTTP/1.1 200 OK</span>
                    <span className="text-emerald-400 font-bold">latency: 12ms</span>
                  </div>

                  <pre className="text-[11px] text-emerald-400 overflow-x-auto">
                    {selectedEndpoint === 'login' &&
                      JSON.stringify(
                        {
                          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                          token_type: 'Bearer',
                          account: {
                            id: 1,
                            uid: '2d7b5f8e-8d8a-4cc4-9c3d-2f2c6c4d2e28',
                            name: 'Jane Doe',
                            email: 'jane@example.com',
                            role: 'superadmin',
                            status: 'active'
                          }
                        },
                        null,
                        2
                      )}
                    {selectedEndpoint === 'pulse' &&
                      JSON.stringify(
                        {
                          system_time: new Date().toISOString(),
                          response: 'Hello',
                          status: 'healthy',
                          state: 'active',
                          version: '1.5.0'
                        },
                        null,
                        2
                      )}
                    {selectedEndpoint === 'me' &&
                      JSON.stringify(
                        {
                          account: { id: 1, name: 'Jane Doe', email: 'jane@example.com', role: 'superadmin' },
                          session: { id: 60, ip_address: '203.0.113.10', expires_at: '2026-08-22T12:00:00' },
                          payload: { aid: 1, sid: 60, token: 'Bearer eyJ...' }
                        },
                        null,
                        2
                      )}
                    {selectedEndpoint === 'counts' &&
                      JSON.stringify(
                        {
                          accounts: 128,
                          oauth: 24,
                          sessions: 52,
                          otp: 4
                        },
                        null,
                        2
                      )}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ARCHITECTURE & INTERACTIVE PIPELINE FLOW */}
        <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/60">
              Architecture & Strategy
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Interactive System Architecture
            </h2>
            <p className="text-sm text-zinc-400">
              Click on each pipeline node to inspect security mechanisms, data models, and implementation snippets.
            </p>
          </div>

          <ArchitectureFlow />

          {/* Comparison Matrix Table */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm overflow-hidden mt-16">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-mono uppercase text-[10px]">
                    <th className="py-3.5 px-4 font-bold">Feature</th>
                    <th className="py-3.5 px-4 font-bold text-indigo-400 bg-indigo-950/30">
                      tc_auth v1.5.0
                    </th>
                    <th className="py-3.5 px-4 font-bold">Custom Auth Code</th>
                    <th className="py-3.5 px-4 font-bold">Heavy Auth SaaS (Auth0/Okta)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  <tr>
                    <td className="py-3 px-4 font-semibold">Self-Hosted & Zero Lock-in</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-indigo-950/20 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> 100% On-Prem / Cloud
                    </td>
                    <td className="py-3 px-4 text-zinc-500">Yes (requires maintenance)</td>
                    <td className="py-3 px-4 text-rose-500 font-medium">No (Strictly Locked-In)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Stateful Active Session Revocation</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-indigo-950/20">
                      Instant single & all-device purge
                    </td>
                    <td className="py-3 px-4 text-zinc-500">Complex to build properly</td>
                    <td className="py-3 px-4 text-zinc-500">Supported</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Drop-in Python SDK API</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-indigo-950/20">
                      Unified <code className="font-mono text-[10px]">Auth</code> class
                    </td>
                    <td className="py-3 px-4 text-zinc-500">Hundreds of manual lines</td>
                    <td className="py-3 px-4 text-zinc-500">Requires SDK boilerplate</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Live Admin Control Panel UI</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-indigo-950/20">
                      Included with live audit metrics
                    </td>
                    <td className="py-3 px-4 text-rose-500 font-medium">Must build from scratch</td>
                    <td className="py-3 px-4 text-zinc-500">Included</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Cost / MAU Limits</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-indigo-950/20">
                      Free & Open-Source (Unlimited)
                    </td>
                    <td className="py-3 px-4 text-zinc-500">Free (High Dev Cost)</td>
                    <td className="py-3 px-4 text-rose-500 font-medium">$$$ Per Active User</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3-STEP QUICKSTART */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/60">
              Get Started in Minutes
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Three Steps to Full Production Auth
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <TiltedCard className="h-full bg-zinc-900 border border-zinc-800 p-6 space-y-3">
              <div className="text-3xl font-black font-mono text-indigo-400">01</div>
              <h3 className="text-base font-bold text-white">Install Package</h3>
              <p className="text-xs text-zinc-400">
                Install tc_auth into your Python virtual environment using pip.
              </p>
              <div className="p-2.5 rounded-lg bg-zinc-950 text-zinc-300 font-mono text-[11px] flex items-center justify-between">
                <span>pip install tc_auth</span>
                <button
                  onClick={() => copyToClipboard('pip install tc_auth', 'pip install')}
                  className="p-1 hover:text-white text-zinc-500"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </TiltedCard>

            {/* Step 2 */}
            <TiltedCard className="h-full bg-zinc-900 border border-zinc-800 p-6 space-y-3">
              <div className="text-3xl font-black font-mono text-indigo-400">02</div>
              <h3 className="text-base font-bold text-white">Initialize & Configure</h3>
              <p className="text-xs text-zinc-400">
                Instantiate Auth with your database engine, secret key, and session policy.
              </p>
              <div className="p-2.5 rounded-lg bg-zinc-950 text-zinc-300 font-mono text-[11px]">
                auth = Auth(app, engine, secret_key=SECRET)
              </div>
            </TiltedCard>

            {/* Step 3 */}
            <TiltedCard className="h-full bg-zinc-900 border border-zinc-800 p-6 space-y-3">
              <div className="text-3xl font-black font-mono text-indigo-400">03</div>
              <h3 className="text-base font-bold text-white">Manage & Monitor</h3>
              <p className="text-xs text-zinc-400">
                Open the interactive control panel to configure SMTP, Google/GitHub OAuth, and audit sessions.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleLaunchDemo}
                  className="flex-1 py-2 px-2.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Try Demo</span>
                </button>
                <button
                  onClick={() => onNavigate('/login')}
                  className="flex-1 py-2 px-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
                >
                  Sign In →
                </button>
              </div>
            </TiltedCard>
          </div>
        </section>

        {/* BOTTOM CTA BANNER WITH SPOTLIGHT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-white border border-indigo-800/60 shadow-2xl relative overflow-hidden text-center space-y-6">
            <BorderBeam size={320} duration={16} colorFrom="#818cf8" colorTo="#c084fc" />

            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Ready to Secure Your Python Application?
              </h2>
              <p className="text-sm text-indigo-200/80 leading-relaxed">
                Take complete ownership of your authentication layer. Try the live demo, sign into your control panel, or explore the documentation.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Magnet magnetStrength={0.25}>
                  <button
                    onClick={handleLaunchDemo}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-lg transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch Live Demo</span>
                  </button>
                </Magnet>

                <Magnet magnetStrength={0.25}>
                  <button
                    onClick={() => onNavigate('/login')}
                    className="px-6 py-3 rounded-xl text-xs font-bold bg-white text-indigo-950 hover:bg-indigo-50 shadow-lg transition-all cursor-pointer"
                  >
                    Sign In to Console
                  </button>
                </Magnet>

                <Magnet magnetStrength={0.25}>
                  <button
                    onClick={() => onNavigate('/signup')}
                    className="px-5 py-3 rounded-xl text-xs font-bold bg-indigo-800/60 hover:bg-indigo-800 border border-indigo-700 text-white transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </Magnet>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Dock for Fast Interactive Navigation */}
      <FloatingDock onNavigate={onNavigate} onLaunchDemo={handleLaunchDemo} />

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-12 pb-24 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">
              tc-auth <span className="font-mono text-indigo-400">v1.5.0</span>
            </span>
            <span>•</span>
            <span>Modular Authentication Framework for Python</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <button onClick={() => onNavigate('/docs/lib/setup')} className="hover:text-indigo-400 cursor-pointer">
              Library Docs
            </button>
            <button onClick={() => onNavigate('/docs/api/login-routes')} className="hover:text-indigo-400 cursor-pointer">
              REST API
            </button>
            <button onClick={handleLaunchDemo} className="hover:text-amber-400 cursor-pointer flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Live Demo</span>
            </button>
            <button onClick={() => onNavigate('/login')} className="hover:text-indigo-400 cursor-pointer">
              Admin Login
            </button>
            <button onClick={() => onNavigate('/signup')} className="hover:text-indigo-400 cursor-pointer">
              Register
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
