import React from 'react';
import {
  Server,
  Settings,
  Terminal,
  Layers,
  Rocket,
  Activity,
  Share2,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';
import { McpConnectionConfig } from '../types';

interface NavbarProps {
  activeTab: 'inspector' | 'catalog' | 'deploy' | 'topology' | 'logs';
  setActiveTab: (tab: 'inspector' | 'catalog' | 'deploy' | 'topology' | 'logs') => void;
  config: McpConnectionConfig;
  onOpenConfig: () => void;
  logsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  onOpenConfig,
  logsCount
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Server className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-tight">OpenWISP MCP Server</h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                  McpHub Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">REST API Bridge & Controller for AI Models</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'inspector'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-4 h-4" />
              MCP Inspector
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Tools Library
            </button>

            <button
              onClick={() => setActiveTab('deploy')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'deploy'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Rocket className="w-4 h-4" />
              McpHub Deploy
            </button>

            <button
              onClick={() => setActiveTab('topology')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'topology'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Share2 className="w-4 h-4" />
              Topology Map
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'logs'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Activity Logs
              {logsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-slate-800 text-cyan-300 rounded-full border border-slate-700">
                  {logsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right actions & connection state */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenConfig}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                config.useMockSandbox
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              {config.useMockSandbox ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sandbox Mode</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[120px] truncate">{config.baseUrl || 'Live Instance'}</span>
                </>
              )}
              <Settings className="w-3.5 h-3.5 opacity-70 ml-1" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1 rounded-md font-medium ${
              activeTab === 'inspector' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            Inspector
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1 rounded-md font-medium ${
              activeTab === 'catalog' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-3 py-1 rounded-md font-medium ${
              activeTab === 'deploy' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            McpHub
          </button>
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-3 py-1 rounded-md font-medium ${
              activeTab === 'topology' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            Topology
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 rounded-md font-medium ${
              activeTab === 'logs' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            Logs ({logsCount})
          </button>
        </div>
      </div>
    </header>
  );
};
