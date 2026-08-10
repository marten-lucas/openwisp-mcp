import React, { useState } from 'react';
import {
  X,
  Server,
  Key,
  Globe,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Box,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { McpConnectionConfig } from '../types';

interface OpenwispConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: McpConnectionConfig;
  onSaveConfig: (newConfig: McpConnectionConfig) => void;
}

export const OpenwispConfigModal: React.FC<OpenwispConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || '');
  const [apiToken, setApiToken] = useState(config.apiToken || '');
  const [useMockSandbox, setUseMockSandbox] = useState(config.useMockSandbox);
  
  // Quick auth token generator inputs
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isGettingToken, setIsGettingToken] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Health check states
  const [isTesting, setIsTesting] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    online: boolean;
    message: string;
    status?: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!baseUrl.trim()) {
      setHealthStatus({ online: false, message: 'Please enter a valid OpenWISP Base URL' });
      return;
    }

    setIsTesting(true);
    setHealthStatus(null);

    try {
      const res = await fetch('/api/openwisp/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, apiToken })
      });
      const data = await res.json();
      setHealthStatus(data);
    } catch (err: any) {
      setHealthStatus({ online: false, message: `Network request error: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleFetchTokenFromCredentials = async () => {
    if (!baseUrl.trim()) {
      setAuthError('OpenWISP Base URL is required to fetch API token.');
      return;
    }
    if (!password) {
      setAuthError('Please enter password.');
      return;
    }

    setIsGettingToken(true);
    setAuthError(null);

    try {
      const cleanUrl = baseUrl.replace(/\/+$/, '');
      const tokenUrl = `${cleanUrl}/api/v1/users/token/`;
      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        setApiToken(data.token);
        setPassword('');
        setHealthStatus({ online: true, message: 'API Token successfully retrieved and set!' });
      } else {
        setAuthError(data.detail || data.non_field_errors?.[0] || 'Authentication failed. Check credentials.');
      }
    } catch (err: any) {
      setAuthError(`Connection error: ${err.message}`);
    } finally {
      setIsGettingToken(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      baseUrl: baseUrl.trim(),
      apiToken: apiToken.trim(),
      useMockSandbox
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">OpenWISP Server Connection</h2>
              <p className="text-xs text-slate-400">Configure connection to your OpenWISP REST API instance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Execution Mode Toggle */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Execution Mode</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUseMockSandbox(false)}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  !useMockSandbox
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Globe className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-white">Live OpenWISP Instance</div>
                  <div className="text-xs opacity-80 mt-0.5">Connect to your real OpenWISP URL & REST API</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUseMockSandbox(true)}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  useMockSandbox
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Box className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-white">Mock Sandbox</div>
                  <div className="text-xs opacity-80 mt-0.5">Instant zero-config test environment with sample hardware</div>
                </div>
              </button>
            </div>
          </div>

          {!useMockSandbox && (
            <div className="space-y-4 animate-fade-in">
              {/* Base URL Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>OpenWISP Controller Base URL</span>
                  <a
                    href="https://openwisp.io/docs/dev/users/user/rest-api.html"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    API Docs <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={baseUrl}
                    onChange={e => setBaseUrl(e.target.value)}
                    placeholder="https://openwisp.example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Root URL of your OpenWISP installation (e.g. <code>https://openwisp.org</code> or <code>http://192.168.1.50</code>)
                </p>
              </div>

              {/* API Token Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  API Bearer Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={apiToken}
                    onChange={e => setApiToken(e.target.value)}
                    placeholder="Enter Token (e.g., 994a32...)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Quick Token Fetch Helper */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Obtain Token via Credentials
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Username"
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
                {authError && (
                  <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">{authError}</p>
                )}
                <button
                  type="button"
                  onClick={handleFetchTokenFromCredentials}
                  disabled={isGettingToken}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isGettingToken ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Fetch API Token'}
                </button>
              </div>

              {/* Health Check Button & Status */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Server className="w-4 h-4 text-cyan-400" />
                      Test OpenWISP Endpoint Connectivity
                    </>
                  )}
                </button>

                {healthStatus && (
                  <div
                    className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      healthStatus.online
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    {healthStatus.online ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold">{healthStatus.online ? 'Connection Successful' : 'Connection Failed'}</div>
                      <div className="opacity-90 mt-0.5">{healthStatus.message}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors shadow-md shadow-cyan-600/20"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
