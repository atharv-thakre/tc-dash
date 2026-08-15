import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Shield, Mail, KeyRound, Globe, ArrowRight, CheckCircle2, Lock, Cpu, Server } from 'lucide-react';

interface NodeInfo {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  codeSnippet: string;
  metrics: { label: string; value: string }[];
  color: string;
}

export const ArchitectureFlow: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string>('framework');

  const nodes: Record<string, NodeInfo> = {
    client: {
      id: 'client',
      title: 'Client Application / Browser',
      category: 'Frontend / API Consumer',
      icon: <Globe className="w-5 h-5 text-sky-400" />,
      description:
        'Dispatches standard Bearer tokens in Authorization headers or HTTP-only cookie headers to your backend endpoints.',
      codeSnippet: `// Frontend Bearer token dispatch
fetch("https://api.domain.com/tc-auth/me", {
  headers: {
    "Authorization": \`Bearer \${token}\`
  }
});`,
      metrics: [
        { label: 'Token Type', value: 'JWT / Bearer' },
        { label: 'Header', value: 'Authorization' },
      ],
      color: 'sky',
    },
    framework: {
      id: 'framework',
      title: 'tc_auth Core Engine',
      category: 'FastAPI / Python Middleware',
      icon: <Shield className="w-5 h-5 text-indigo-400" />,
      description:
        'Validates HMAC-SHA256 JWT signatures, inspects session claims in real-time, manages brute-force guards, and routes user identity.',
      codeSnippet: `# Pure Python Auth Core
auth = Auth(
    app=app,
    engine=engine,
    secret_key=SECRET_KEY,
    session_duration_days=7
)
# Protected dependency
@app.get("/protected")
def protected_route(user = Depends(auth.require_auth)):
    return {"user": user.name}`,
      metrics: [
        { label: 'Signing Algorithm', value: 'HS256' },
        { label: 'Revocation Check', value: '< 1ms' },
      ],
      color: 'indigo',
    },
    database: {
      id: 'database',
      title: 'SQLAlchemy Stateful DB',
      category: 'Postgres / MySQL / SQLite',
      icon: <Database className="w-5 h-5 text-purple-400" />,
      description:
        'Holds stateful tables for accounts, active sessions, OTP attempt logs, and linked OAuth identity providers.',
      codeSnippet: `-- Core relational session table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    account_id INT REFERENCES accounts(id),
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_revoked BOOLEAN DEFAULT FALSE
);`,
      metrics: [
        { label: 'ORM', value: 'SQLAlchemy 2.0' },
        { label: 'Storage', value: '100% On-Prem / Cloud' },
      ],
      color: 'purple',
    },
    smtp: {
      id: 'smtp',
      title: 'SMTP Mailer Engine',
      category: 'Passwordless OTP Channel',
      icon: <Mail className="w-5 h-5 text-emerald-400" />,
      description:
        'Direct connection to SMTP mail relays (SendGrid, AWS SES, Resend, or local Postfix) for 6-digit email OTPs.',
      codeSnippet: `# Dispatch cryptographic OTP
auth.otp.create_otp(
    email="user@domain.com",
    purpose="login",
    expires_minutes=10
)`,
      metrics: [
        { label: 'OTP Length', value: '6 Digits' },
        { label: 'Default TTL', value: '10 Minutes' },
      ],
      color: 'emerald',
    },
    oauth: {
      id: 'oauth',
      title: 'OAuth 2.0 / OIDC Providers',
      category: 'Google & GitHub Federation',
      icon: <KeyRound className="w-5 h-5 text-amber-400" />,
      description:
        'Secure authorization code exchange for single-click login with Google and GitHub with unified account merging.',
      codeSnippet: `# OAuth link synchronization
account = auth.service.handle_oauth_callback(
    provider="google",
    code=auth_code,
    redirect_uri="https://app.com/callback"
)`,
      metrics: [
        { label: 'Providers', value: 'Google, GitHub' },
        { label: 'Protocol', value: 'OAuth 2.0 + PKCE' },
      ],
      color: 'amber',
    },
  };

  const selected = nodes[activeNodeId];

  return (
    <div className="space-y-8">
      {/* Node Flow Horizontal Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
        {Object.values(nodes).map((node, index) => {
          const isActive = node.id === activeNodeId;
          return (
            <motion.div
              key={node.id}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveNodeId(node.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-zinc-900 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                  : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    isActive
                      ? 'bg-indigo-950/80 border-indigo-600/80'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  {node.icon}
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-500">0{index + 1}</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-0.5 truncate">{node.title}</h4>
                <p className="text-[10px] text-zinc-400 truncate">{node.category}</p>
              </div>

              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Deep Inspection Panel for Selected Node */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 backdrop-blur-md shadow-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Description & Metrics */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  {selected.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{selected.title}</h3>
                  <span className="text-xs font-mono text-indigo-400">{selected.category}</span>
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">{selected.description}</p>

              {/* Metrics Pills */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {selected.metrics.map((m, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">{m.label}</span>
                    <p className="text-xs font-bold font-mono text-zinc-200">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Code Sandbox View */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs overflow-hidden space-y-2 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                  <Cpu className="w-3.5 h-3.5" /> Implementation Spec
                </span>
                <span className="text-emerald-400">Validated</span>
              </div>
              <pre className="text-[11px] text-zinc-300 leading-relaxed overflow-x-auto p-1">
                <code>{selected.codeSnippet}</code>
              </pre>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
