import React, { useState } from 'react';
import {
  Activity,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Code
} from 'lucide-react';
import { ApiExecutionLog } from '../types';

interface ApiLogsViewerProps {
  logs: ApiExecutionLog[];
  onClearLogs: () => void;
}

export const ApiLogsViewer: React.FC<ApiLogsViewerProps> = ({ logs, onClearLogs }) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(
    l =>
      l.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.endpoint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {logs.length} Activity Logs Recorded
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">OpenWISP MCP Activity & Debug Logs</h2>
            <p className="text-sm text-slate-300">
              Real-time audit telemetry for all tool calls executed through the OpenWISP Model Context Protocol bridge.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter logs..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="px-3.5 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredLogs.length === 0 ? (
          <div className="py-20 text-center space-y-2 text-slate-500">
            <Activity className="w-10 h-10 mx-auto text-slate-700" />
            <p className="text-sm">No activity logs recorded yet. Execute tool calls in the MCP Inspector!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredLogs.map(log => {
              const isExpanded = expandedLogId === log.id;
              const isSuccess = typeof log.status === 'number' && log.status < 400;

              return (
                <div key={log.id} className="transition-colors hover:bg-slate-950/40">
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-4 flex items-center justify-between cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}

                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                          log.method === 'GET'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : log.method === 'POST'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {log.method}
                      </span>

                      <span className="font-bold text-white font-mono">{log.toolName}</span>
                      <span className="text-slate-400 font-mono hidden sm:inline">{log.endpoint}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-500 text-[11px]">{log.timestamp}</span>
                      <span className="text-slate-400 text-[11px]">{log.durationMs}ms</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSuccess
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        HTTP {log.status}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-4 text-xs font-mono animate-fade-in">
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">MCP Request JSON-RPC Payload:</span>
                        <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-cyan-300 overflow-x-auto">
                          {JSON.stringify(log.mcpRequest, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold block mb-1">MCP Response Payload:</span>
                        <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-emerald-400 overflow-x-auto">
                          {JSON.stringify(log.mcpResponse, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
