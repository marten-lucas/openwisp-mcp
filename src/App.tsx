import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OpenwispConfigModal } from './components/OpenwispConfigModal';
import { McpInspector } from './components/McpInspector';
import { ToolExplorer } from './components/ToolExplorer';
import { McphubDeployer } from './components/McphubDeployer';
import { TopologyVisualizer } from './components/TopologyVisualizer';
import { ApiLogsViewer } from './components/ApiLogsViewer';
import { McpConnectionConfig, ApiExecutionLog } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inspector' | 'catalog' | 'deploy' | 'topology' | 'logs'>('inspector');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedToolFromCatalog, setSelectedToolFromCatalog] = useState<string | null>(null);

  // Connection configuration
  const [config, setConfig] = useState<McpConnectionConfig>(() => {
    try {
      const saved = localStorage.getItem('openwisp_mcp_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      baseUrl: '',
      apiToken: '',
      useMockSandbox: true
    };
  });

  // Logs state
  const [logs, setLogs] = useState<ApiExecutionLog[]>(() => {
    try {
      const saved = localStorage.getItem('openwisp_mcp_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('openwisp_mcp_config', JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem('openwisp_mcp_logs', JSON.stringify(logs));
    } catch {}
  }, [logs]);

  const handleSaveConfig = (newConfig: McpConnectionConfig) => {
    setConfig(newConfig);
  };

  const handleLogExecution = (newLog: ApiExecutionLog) => {
    setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleSelectToolForTesting = (toolName: string) => {
    setSelectedToolFromCatalog(toolName);
    setActiveTab('inspector');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        logsCount={logs.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {activeTab === 'inspector' && (
          <McpInspector
            config={config}
            onLogExecution={handleLogExecution}
            selectedToolFromCatalog={selectedToolFromCatalog}
          />
        )}

        {activeTab === 'catalog' && (
          <ToolExplorer onSelectToolForTesting={handleSelectToolForTesting} />
        )}

        {activeTab === 'deploy' && (
          <McphubDeployer config={config} />
        )}

        {activeTab === 'topology' && (
          <TopologyVisualizer />
        )}

        {activeTab === 'logs' && (
          <ApiLogsViewer logs={logs} onClearLogs={handleClearLogs} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-semibold text-slate-400">OpenWISP MCP Server</span>
            <span>— Model Context Protocol for Network Management</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://github.com/samanhappy/mcphub"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              McpHub
            </a>
            <span>•</span>
            <a
              href="https://openwisp.io/docs/dev/users/user/rest-api.html"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              OpenWISP API Docs
            </a>
          </div>
        </div>
      </footer>

      {/* Config Modal */}
      <OpenwispConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
