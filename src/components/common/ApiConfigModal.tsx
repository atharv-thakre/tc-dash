import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Database,
  Globe,
  Plus,
  Server,
  Trash2,
  BookmarkPlus,
  Zap,
  Activity,
  Copy,
  CheckCheck,
  RefreshCw,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { useApiConfig } from '../../contexts/ApiConfigContext';
import { Modal } from './Modal';
import { toast } from 'sonner';
import { configService, PulseResponse } from '../../services/config';
import { BorderBeam } from '../reactbits/BorderBeam';
import { ShinyText } from '../reactbits/ShinyText';
import { DecryptedText } from '../reactbits/DecryptedText';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const {
    apiMode,
    setApiMode,
    baseUrl,
    setBaseUrl,
    builtinPresets,
    customPresets,
    addPreset,
    removePreset,
  } = useApiConfig();

  const [inputUrl, setInputUrl] = useState(baseUrl);
  const [selectedMode, setSelectedMode] = useState(apiMode);
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'routes' | 'diagnostics'>('config');

  // Interactive Live Ping / Pulse State
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    latency: number;
    data: PulseResponse | null;
    success: boolean;
    error?: string;
    timestamp: string;
  } | null>(null);

  // Copy state
  const [copiedRoute, setCopiedRoute] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputUrl(baseUrl);
      setSelectedMode(apiMode);
      setIsAddingPreset(false);
      setNewPresetName('');
      setPingResult(null);
    }
  }, [isOpen, baseUrl, apiMode]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiMode(selectedMode);
    setBaseUrl(inputUrl.trim());
    toast.success('Server configuration applied successfully');
    onClose();
  };

  const handleCreateCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      toast.error('Please specify a valid URL before saving preset');
      return;
    }
    const name = newPresetName.trim() || inputUrl.trim().replace(/^https?:\/\//, '');
    addPreset(name, inputUrl.trim());
    toast.success(`Saved custom preset "${name}" locally`);
    setIsAddingPreset(false);
    setNewPresetName('');
  };

  const handleSelectPreset = (url: string) => {
    setInputUrl(url);
    setSelectedMode('live');
    toast.info(`Selected preset: ${url}`);
  };

  const handleDeletePreset = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removePreset(id);
    toast.success(`Removed preset "${name}"`);
  };

  const handleTestPulse = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      // Temporarily set local URL in apiClient for test if in live mode
      const res = await configService.testPulse();
      const elapsed = Math.round(performance.now() - start);
      setPingResult({
        latency: Math.max(8, elapsed),
        data: res,
        success: true,
        timestamp: new Date().toLocaleTimeString(),
      });
      toast.success(`Ping successful (${elapsed}ms)`);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setPingResult({
        latency: elapsed,
        data: null,
        success: false,
        error: err?.message || 'Failed to reach server endpoint',
        timestamp: new Date().toLocaleTimeString(),
      });
      toast.error(`Server unreachable (${elapsed}ms)`);
    } finally {
      setIsPinging(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRoute(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedRoute(null), 2000);
  };

  // Computed routes for explorer
  const cleanUrl = inputUrl.trim().replace(/\/+$/, '');
  const sampleRoutes = [
    { method: 'POST', path: '/login/password', desc: 'Password Authentication', url: `${cleanUrl}/login/password` },
    { method: 'POST', path: '/login/otp/request', desc: 'Email OTP Request', url: `${cleanUrl}/login/otp/request` },
    { method: 'POST', path: '/login/otp/verify', desc: 'OTP Code Verification', url: `${cleanUrl}/login/otp/verify` },
    { method: 'GET', path: '/sessions/me', desc: 'Current Session Token Info', url: `${cleanUrl}/sessions/me` },
    { method: 'GET', path: '/config/pulse', desc: 'System Telemetry Pulse', url: `${cleanUrl}/config/pulse` },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="relative">
        {/* ReactBits Glowing Border Beam Frame */}
        <BorderBeam size={280} duration={14} colorFrom="#6366f1" colorTo="#a855f7" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Backend Server Configuration</span>
                <ShinyText text="v1.5 Live" className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/60" />
              </h2>
              <p className="text-xs text-zinc-400">
                Configure runtime API target, server presets, and live connection telemetry.
              </p>
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveSubTab('config')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'config'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Config</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('routes')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'routes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Routes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('diagnostics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'diagnostics'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Ping Probe</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* TAB 1: MAIN CONFIGURATION */}
          {activeSubTab === 'config' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Execution Mode Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Execution Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => setSelectedMode('demo')}
                    className={`relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer select-none ${
                      selectedMode === 'demo'
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                          <Database className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-white">Demo Mock Mode</span>
                      </div>
                      {selectedMode === 'demo' && (
                        <span className="p-1 rounded-full bg-amber-500 text-zinc-950">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Instant in-memory simulation with realistic auth tokens and zero network dependencies.
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => setSelectedMode('live')}
                    className={`relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer select-none ${
                      selectedMode === 'live'
                        ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-white">Live Backend</span>
                      </div>
                      {selectedMode === 'live' && (
                        <span className="p-1 rounded-full bg-indigo-500 text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Direct HTTP REST communication with FastAPI/tc_auth backend server.
                    </p>
                  </motion.button>
                </div>
              </div>

              {/* URL Input & Presets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Backend Base URL (<code className="font-mono text-indigo-400">server_url</code>)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingPreset(!isAddingPreset)}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{isAddingPreset ? 'Close' : '+ Save as Preset'}</span>
                  </button>
                </div>

                <div className="relative">
                  <Server className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://api.codesena.me/tc-auth or /tc-auth"
                    className="w-full pl-10 pr-24 py-2.5 text-sm bg-zinc-900/90 border border-zinc-800 rounded-xl font-mono text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleTestPulse}
                      disabled={isPinging}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Zap className={`w-3 h-3 ${isPinging ? 'text-amber-400 animate-spin' : 'text-indigo-400'}`} />
                      <span>{isPinging ? 'Pinging...' : 'Ping'}</span>
                    </button>
                  </div>
                </div>

                {/* Add Custom Preset Form */}
                <AnimatePresence>
                  {isAddingPreset && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 rounded-xl bg-zinc-900/90 border border-indigo-500/40 space-y-2">
                        <div className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Save current URL as custom local preset</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            placeholder="Preset label (e.g. Production Cluster)"
                            className="flex-1 px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={handleCreateCustomPreset}
                            className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                          >
                            Save Preset
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Presets List */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Server Presets</span>
                    <span className="text-[10px] text-zinc-600 font-mono">Stored Locally</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 items-center">
                    {/* Builtin */}
                    {builtinPresets.map((preset) => {
                      const isSelected = inputUrl === preset.url;
                      const isDefault = preset.id === 'codesena-live';
                      return (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset.url)}
                          className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-950/90 border-indigo-500 text-indigo-200 font-bold ring-1 ring-indigo-500/50'
                              : isDefault
                              ? 'bg-zinc-900/90 hover:bg-zinc-850 border-indigo-500/40 text-indigo-300 font-semibold'
                              : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <Radio className={`w-3 h-3 ${isSelected ? 'text-indigo-400' : 'text-zinc-600'}`} />
                          <span>{preset.url}</span>
                          {isDefault && (
                            <span className="px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-400 text-[9px] uppercase font-bold tracking-wider">
                              Default
                            </span>
                          )}
                        </motion.button>
                      );
                    })}

                    {/* Custom */}
                    {customPresets.map((preset) => {
                      const isSelected = inputUrl === preset.url;
                      return (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset.url)}
                          className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'bg-indigo-950/90 border-indigo-500 text-indigo-200 font-bold ring-1 ring-indigo-500/50'
                              : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <span className="text-zinc-400 group-hover:text-zinc-200 font-sans font-medium text-[11px]">
                            {preset.name}:
                          </span>
                          <span className="truncate max-w-[140px] sm:max-w-[200px]">{preset.url}</span>
                          <button
                            type="button"
                            onClick={(e) => handleDeletePreset(preset.id, preset.name, e)}
                            title="Delete custom preset"
                            className="p-0.5 ml-0.5 text-zinc-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ROUTE EXPLORER */}
          {activeSubTab === 'routes' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Target Base URL:</span>
                <code className="font-mono text-indigo-400 font-bold">{cleanUrl}</code>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {sampleRoutes.map((route, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            route.method === 'POST'
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {route.method}
                        </span>
                        <span className="font-mono font-semibold text-zinc-200 truncate">{route.path}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate">{route.url}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(route.url, route.path)}
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors shrink-0 cursor-pointer"
                      title="Copy full route URL"
                    >
                      {copiedRoute === route.path ? (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: PING DIAGNOSTICS */}
          {activeSubTab === 'diagnostics' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Live Telemetry Probe
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestPulse}
                    disabled={isPinging}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>{isPinging ? 'Testing...' : 'Execute Pulse Ping'}</span>
                  </button>
                </div>

                {pingResult ? (
                  <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Status Check:</span>
                      <span
                        className={`flex items-center gap-1.5 font-bold ${
                          pingResult.success ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pingResult.success ? (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Online (200 OK)</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4" />
                            <span>Connection Error</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400 font-sans">Round-Trip Latency:</span>
                      <span className="text-amber-400 font-bold">{pingResult.latency} ms</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400 font-sans">Probe Timestamp:</span>
                      <span className="text-zinc-300">{pingResult.timestamp}</span>
                    </div>

                    {pingResult.data && (
                      <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono space-y-1 text-zinc-300">
                        <div className="text-[10px] uppercase font-bold text-zinc-500 font-sans">
                          Server Telemetry Response:
                        </div>
                        <div className="text-indigo-300">
                          <DecryptedText text={`state: ${pingResult.data.state} | status: ${pingResult.data.status}`} />
                        </div>
                        <div className="text-zinc-400 text-[11px]">
                          system_time: {pingResult.data.system_time}
                        </div>
                      </div>
                    )}

                    {pingResult.error && (
                      <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 font-mono">
                        Error: {pingResult.error}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-zinc-500">
                    Click <strong>Execute Pulse Ping</strong> to verify server connectivity and latency to{' '}
                    <code className="font-mono text-zinc-400">{inputUrl}</code>.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Action Footer */}
          <div className="pt-3 flex items-center justify-between border-t border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Target: <code className="font-mono text-zinc-200">{selectedMode}</code></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                Apply Configuration
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
