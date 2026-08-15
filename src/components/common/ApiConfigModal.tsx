import React, { useState, useEffect } from 'react';
import { Check, Database, Globe, Server } from 'lucide-react';
import { useApiConfig } from '../../contexts/ApiConfigContext';
import { Modal } from './Modal';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const { apiMode, setApiMode, baseUrl, setBaseUrl } = useApiConfig();
  const [inputUrl, setInputUrl] = useState(baseUrl);
  const [selectedMode, setSelectedMode] = useState(apiMode);

  useEffect(() => {
    if (isOpen) {
      setInputUrl(baseUrl);
      setSelectedMode(apiMode);
    }
  }, [isOpen, baseUrl, apiMode]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiMode(selectedMode);
    setBaseUrl(inputUrl.trim());
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Backend API Server Configuration" size="md">
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            API Execution Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMode('demo')}
              className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedMode === 'demo'
                  ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm text-white">Demo Mock Mode</span>
                </div>
                {selectedMode === 'demo' && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                In-memory mock store. Instant zero-backend playground simulation.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode('live')}
              className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedMode === 'live'
                  ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-sm text-white">Live Backend</span>
                </div>
                {selectedMode === 'live' && <Check className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Connects via HTTP REST requests to a running FastAPI backend.
              </p>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Base Path / Server URL (<code className="font-mono text-indigo-400">server_url</code>)
          </label>
          <div className="relative">
            <Server className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="/tc-auth or https://api.yourdomain.com/tc-auth"
              className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5 items-center text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">Presets:</span>
            <button
              type="button"
              onClick={() => {
                setInputUrl('/tc-auth');
                setSelectedMode('live');
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-mono text-[11px] text-zinc-300 transition-colors cursor-pointer"
            >
              /tc-auth
            </button>
            <button
              type="button"
              onClick={() => {
                setInputUrl('https://app.totalchaos.online/tc-auth');
                setSelectedMode('live');
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800 text-indigo-300 font-mono text-[11px] font-medium transition-colors cursor-pointer"
            >
              https://app.totalchaos.online/tc-auth
            </button>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2.5 border-t border-zinc-800">
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
            Save Configuration
          </button>
        </div>
      </form>
    </Modal>
  );
};
