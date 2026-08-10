import React, { useState } from 'react';
import {
  Play,
  Terminal,
  Code,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';
import { McpToolDefinition, McpConnectionConfig, ApiExecutionLog } from '../types';
import { OPENWISP_MCP_TOOLS } from '../data/openwispTools';

interface McpInspectorProps {
  config: McpConnectionConfig;
  onLogExecution: (log: ApiExecutionLog) => void;
  selectedToolFromCatalog?: string | null;
}

export const McpInspector: React.FC<McpInspectorProps> = ({
  config,
  onLogExecution,
  selectedToolFromCatalog
}) => {
  const [selectedToolName, setSelectedToolName] = useState<string>(
    selectedToolFromCatalog || OPENWISP_MCP_TOOLS[6].name // Default to openwisp_list_devices
  );

  const selectedTool = OPENWISP_MCP_TOOLS.find(t => t.name === selectedToolName) || OPENWISP_MCP_TOOLS[0];

  // Argument form values
  const [argValues, setArgValues] = useState<Record<string, any>>(() => {
    return selectedTool.sampleArguments || {};
  });

  // Output states
  const [isExecuting, setIsExecuting] = useState(false);
  const [mcpResult, setMcpResult] = useState<any>(null);
  const [rawOpenwispResult, setRawOpenwispResult] = useState<any>(null);
  const [executionMetadata, setExecutionMetadata] = useState<{
    durationMs: number;
    isMock: boolean;
    status: number;
    endpoint: string;
    method: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'formatted' | 'mcp_json' | 'raw_api'>('formatted');

  // Handle tool change
  const handleToolChange = (toolName: string) => {
    setSelectedToolName(toolName);
    const newTool = OPENWISP_MCP_TOOLS.find(t => t.name === toolName);
    if (newTool) {
      setArgValues(newTool.sampleArguments || {});
    }
    setMcpResult(null);
    setRawOpenwispResult(null);
    setExecutionMetadata(null);
  };

  const handleArgChange = (paramName: string, value: any) => {
    setArgValues(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleLoadSampleArgs = () => {
    if (selectedTool.sampleArguments) {
      setArgValues(selectedTool.sampleArguments);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setMcpResult(null);
    setRawOpenwispResult(null);
    setExecutionMetadata(null);

    const mcpReqPayload = {
      jsonrpc: '2.0' as const,
      id: `mcp-req-${Date.now()}`,
      method: 'tools/call',
      params: {
        name: selectedTool.name,
        arguments: argValues
      }
    };

    const startTime = Date.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (config.baseUrl) headers['x-openwisp-base-url'] = config.baseUrl;
      if (config.apiToken) headers['x-openwisp-token'] = config.apiToken;
      if (config.useMockSandbox) headers['x-openwisp-use-mock'] = 'true';

      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers,
        body: JSON.stringify(mcpReqPayload)
      });

      const data = await res.json();
      const durationMs = Date.now() - startTime;

      setMcpResult(data);

      if (data.result?.content?.[0]?.text) {
        try {
          const parsed = JSON.parse(data.result.content[0].text);
          setRawOpenwispResult(parsed);
        } catch {
          setRawOpenwispResult(data.result.content[0].text);
        }
      }

      const meta = {
        durationMs,
        isMock: data.result?._metadata?.isMockSandbox ?? config.useMockSandbox,
        status: data.result?._metadata?.status || (data.error ? 500 : 200),
        endpoint: data.result?._metadata?.endpoint || selectedTool.endpoint,
        method: data.result?._metadata?.method || selectedTool.method
      };

      setExecutionMetadata(meta);

      // Record to log
      onLogExecution({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        toolName: selectedTool.name,
        method: selectedTool.method,
        endpoint: selectedTool.endpoint,
        args: argValues,
        status: meta.status,
        durationMs,
        mcpRequest: mcpReqPayload,
        mcpResponse: data,
        rawOpenwispResponse: data.result?.content?.[0]?.text,
        isMock: meta.isMock
      });
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const errorMcpResp = {
        jsonrpc: '2.0' as const,
        id: mcpReqPayload.id,
        error: { code: -32000, message: err.message }
      };
      setMcpResult(errorMcpResp);
      setExecutionMetadata({
        durationMs,
        isMock: config.useMockSandbox,
        status: 500,
        endpoint: selectedTool.endpoint,
        method: selectedTool.method
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyJson = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Terminal className="w-48 h-48 text-cyan-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive MCP Protocol Tester
            </span>
            <span className="text-xs text-slate-400">JSON-RPC 2.0 Spec Compliant</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Test OpenWISP MCP Tools & Prompts</h2>
          <p className="text-sm text-slate-300">
            Execute OpenWISP controller commands via standard MCP protocol JSON-RPC format. Works with live OpenWISP instances or the built-in mock sandbox!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tool Selector & Parameter Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-lg">
            {/* Tool Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Select OpenWISP Tool
              </label>
              <select
                value={selectedToolName}
                onChange={e => handleToolChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {OPENWISP_MCP_TOOLS.map(t => (
                  <option key={t.name} value={t.name} className="bg-slate-900 text-slate-200">
                    [{t.category}] {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Tool Details Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{selectedTool.name}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                    selectedTool.method === 'GET'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : selectedTool.method === 'POST'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : selectedTool.method === 'PATCH'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {selectedTool.method}
                </span>
              </div>
              <p className="text-xs text-slate-300">{selectedTool.description}</p>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 pt-1">
                <span className="text-slate-500">Endpoint:</span>
                <code className="text-cyan-400">{selectedTool.endpoint}</code>
              </div>
            </div>

            {/* Parameter Inputs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tool Parameters
                </span>
                {selectedTool.sampleArguments && (
                  <button
                    type="button"
                    onClick={handleLoadSampleArgs}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium hover:underline flex items-center gap-1"
                  >
                    Load Sample Input
                  </button>
                )}
              </div>

              {selectedTool.parameters.length === 0 ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                  This tool requires no input arguments.
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {selectedTool.parameters.map(param => (
                    <div key={param.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-200 flex items-center gap-1">
                          <code>{param.name}</code>
                          {param.required && <span className="text-red-400">*</span>}
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">{param.type}</span>
                      </div>

                      {param.enum ? (
                        <select
                          value={argValues[param.name] ?? param.default ?? ''}
                          onChange={e => handleArgChange(param.name, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="">-- Select --</option>
                          {param.enum.map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : param.type === 'boolean' ? (
                        <select
                          value={argValues[param.name] !== undefined ? String(argValues[param.name]) : ''}
                          onChange={e => handleArgChange(param.name, e.target.value === 'true')}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : param.type === 'object' || param.type === 'array' ? (
                        <textarea
                          rows={3}
                          value={
                            typeof argValues[param.name] === 'object'
                              ? JSON.stringify(argValues[param.name], null, 2)
                              : argValues[param.name] || ''
                          }
                          onChange={e => {
                            try {
                              handleArgChange(param.name, JSON.parse(e.target.value));
                            } catch {
                              handleArgChange(param.name, e.target.value);
                            }
                          }}
                          placeholder={`Enter JSON ${param.type}`}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                        />
                      ) : (
                        <input
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={argValues[param.name] ?? ''}
                          onChange={e =>
                            handleArgChange(
                              param.name,
                              param.type === 'number' ? Number(e.target.value) : e.target.value
                            )
                          }
                          placeholder={param.description}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      )}
                      <p className="text-[10px] text-slate-500">{param.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Execute Button */}
            <button
              type="button"
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing MCP Tool Call...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Call MCP Tool ({selectedTool.name})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Execution Output Inspector */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg min-h-[500px] flex flex-col justify-between">
            <div>
              {/* Output Header with Tabs */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Execution Inspector</span>
                  {executionMetadata && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        executionMetadata.status < 400
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}
                    >
                      HTTP {executionMetadata.status} ({executionMetadata.durationMs}ms)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setViewTab('formatted')}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      viewTab === 'formatted' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Formatted Output
                  </button>
                  <button
                    onClick={() => setViewTab('mcp_json')}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      viewTab === 'mcp_json' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    MCP JSON-RPC
                  </button>
                  <button
                    onClick={() => setViewTab('raw_api')}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      viewTab === 'raw_api' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    OpenWISP Payload
                  </button>
                </div>
              </div>

              {/* Execution State Display */}
              {!mcpResult && !isExecuting && (
                <div className="py-20 text-center space-y-3 text-slate-500">
                  <Code className="w-12 h-12 mx-auto text-slate-700" />
                  <p className="text-sm">Click "Call MCP Tool" to view live JSON-RPC request and response payload.</p>
                </div>
              )}

              {isExecuting && (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-10 h-10 animate-spin mx-auto text-cyan-400" />
                  <p className="text-sm font-medium text-slate-300">Communicating with OpenWISP MCP Bridge...</p>
                </div>
              )}

              {mcpResult && !isExecuting && (
                <div className="space-y-4">
                  {/* Copy Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        handleCopyJson(
                          JSON.stringify(
                            viewTab === 'mcp_json' ? mcpResult : rawOpenwispResult || mcpResult,
                            null,
                            2
                          )
                        )
                      }
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>

                  {/* Tab Content 1: Formatted Output */}
                  {viewTab === 'formatted' && (
                    <div className="space-y-3">
                      {rawOpenwispResult?.results ? (
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
                            <span>Records returned: <strong>{rawOpenwispResult.count ?? rawOpenwispResult.results.length}</strong></span>
                            <span>Category: {selectedTool.category}</span>
                          </div>
                          <div className="space-y-2 max-h-[360px] overflow-y-auto">
                            {rawOpenwispResult.results.map((item: any, idx: number) => (
                              <div key={item.id || idx} className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 text-xs space-y-1">
                                <div className="flex items-center justify-between font-bold text-cyan-300">
                                  <span>{item.name || item.username || item.label || item.id}</span>
                                  {item.status && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                                      item.status === 'online' || item.status === 'up'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-amber-500/20 text-amber-400'
                                    }`}>
                                      {item.status}
                                    </span>
                                  )}
                                </div>
                                {item.mac && <p className="text-slate-400 font-mono">MAC: {item.mac} | IP: {item.ip_address || item.last_ip}</p>}
                                {item.email && <p className="text-slate-400 font-mono">Email: {item.email}</p>}
                                {item.backend && <p className="text-slate-400 font-mono">Backend: {item.backend}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[400px]">
                          {JSON.stringify(rawOpenwispResult || mcpResult, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* Tab Content 2: MCP JSON-RPC */}
                  {viewTab === 'mcp_json' && (
                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[400px]">
                      {JSON.stringify(mcpResult, null, 2)}
                    </pre>
                  )}

                  {/* Tab Content 3: OpenWISP Raw Payload */}
                  {viewTab === 'raw_api' && (
                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[400px]">
                      {JSON.stringify(rawOpenwispResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Footer Metadata Indicator */}
            {executionMetadata && (
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  Mode: {executionMetadata.isMock ? 'Mock Sandbox' : 'Live OpenWISP Instance'}
                </span>
                <span>{executionMetadata.method} {executionMetadata.endpoint}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
