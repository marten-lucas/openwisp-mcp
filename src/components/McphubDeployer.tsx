import React, { useState } from 'react';
import {
  Rocket,
  Copy,
  Check,
  Server,
  Terminal,
  FileCode,
  Shield,
  ExternalLink,
  Cpu,
  Layers
} from 'lucide-react';
import { McpConnectionConfig } from '../types';

interface McphubDeployerProps {
  config: McpConnectionConfig;
}

export const McphubDeployer: React.FC<McphubDeployerProps> = ({ config }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stdio' | 'sse' | 'docker'>('stdio');

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://openwisp-mcp.run';

  const mcpSettingsJson = {
    mcpServers: {
      "openwisp-mcp-server": {
        command: "npx",
        args: ["-y", "openwisp-mcp-server"],
        env: {
          OPENWISP_BASE_URL: config.baseUrl || "https://openwisp.example.com",
          OPENWISP_API_TOKEN: config.apiToken || "YOUR_OPENWISP_API_BEARER_TOKEN",
          OPENWISP_MOCK_SANDBOX: config.useMockSandbox ? "true" : "false"
        }
      }
    }
  };

  const mcpSseRemoteJson = {
    mcpServers: {
      "openwisp-mcp-remote": {
        url: `${appUrl}/api/mcp/sse`,
        headers: {
          "x-openwisp-base-url": config.baseUrl || "https://openwisp.example.com",
          "x-openwisp-token": config.apiToken || "YOUR_OPENWISP_API_BEARER_TOKEN"
        }
      }
    }
  };

  const dockerfileContent = `FROM node:20-alpine
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .
RUN npm run build

# Expose port & environment
ENV PORT=3000
ENV NODE_ENV=production
ENV OPENWISP_BASE_URL="${config.baseUrl || 'https://openwisp.example.com'}"
ENV OPENWISP_API_TOKEN="${config.apiToken || 'YOUR_OPENWISP_API_BEARER_TOKEN'}"

EXPOSE 3000
CMD ["npm", "run", "start"]`;

  const dockerComposeContent = `version: '3.8'
services:
  openwisp-mcp-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - OPENWISP_BASE_URL=${config.baseUrl || 'https://openwisp.example.com'}
      - OPENWISP_API_TOKEN=${config.apiToken || 'YOUR_OPENWISP_API_BEARER_TOKEN'}
      - OPENWISP_MOCK_SANDBOX=${config.useMockSandbox ? 'true' : 'false'}
    restart: always`;

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Rocket className="w-48 h-48 text-cyan-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              McpHub Deployment Guide
            </span>
            <a
              href="https://github.com/samanhappy/mcphub"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-cyan-300 underline flex items-center gap-1"
            >
              samanhappy/mcphub GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Deploying to McpHub & MCP Clients</h2>
          <p className="text-sm text-slate-300">
            Easily connect your OpenWISP MCP server to McpHub, Claude Desktop, Cursor, or VS Code using STDIO or Remote SSE transports.
          </p>
        </div>
      </div>

      {/* Deployment Modes Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('stdio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'stdio'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            1. STDIO Command (McpHub Local / CLI)
          </button>

          <button
            onClick={() => setActiveTab('sse')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'sse'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            2. Streamable Remote SSE (McpHub Proxy)
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'docker'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            3. Docker & Container Export
          </button>
        </div>

        {/* Tab 1: STDIO Configuration */}
        {activeTab === 'stdio' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">McpHub / VS Code Configuration (`mcp_settings.json`)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste this JSON block directly into your McpHub config or <code>.vscode/mcp.json</code>:
                </p>
              </div>
              <button
                onClick={() => handleCopy(JSON.stringify(mcpSettingsJson, null, 2), 'stdio')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                {copiedSection === 'stdio' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedSection === 'stdio' ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
              {JSON.stringify(mcpSettingsJson, null, 2)}
            </pre>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Execution Steps:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Open McpHub web UI or edit <code>~/.config/mcphub/mcp_settings.json</code></li>
                <li>Add the <code>openwisp-mcp-server</code> block inside <code>mcpServers</code></li>
                <li>Ensure <code>OPENWISP_BASE_URL</code> points to your OpenWISP controller instance</li>
                <li>Ensure <code>OPENWISP_API_TOKEN</code> contains your bearer API token</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Remote SSE Configuration */}
        {activeTab === 'sse' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Remote SSE Endpoint (`/api/mcp/sse`)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allows McpHub to proxy requests to this hosted HTTP/SSE service without local node processes:
                </p>
              </div>
              <button
                onClick={() => handleCopy(JSON.stringify(mcpSseRemoteJson, null, 2), 'sse')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                {copiedSection === 'sse' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedSection === 'sse' ? 'Copied!' : 'Copy Remote Config'}
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
              {JSON.stringify(mcpSseRemoteJson, null, 2)}
            </pre>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">SSE Endpoint URL:</span>
              <code className="text-cyan-400 block font-mono">{appUrl}/api/mcp/sse</code>
              <span className="font-bold text-white block pt-2">JSON-RPC Handler Endpoint:</span>
              <code className="text-cyan-400 block font-mono">{appUrl}/api/mcp</code>
            </div>
          </div>
        )}

        {/* Tab 3: Docker Deployment */}
        {activeTab === 'docker' && (
          <div className="space-y-6 animate-fade-in">
            {/* Dockerfile */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Dockerfile</span>
                <button
                  onClick={() => handleCopy(dockerfileContent, 'dockerfile')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  {copiedSection === 'dockerfile' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  Copy Dockerfile
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                {dockerfileContent}
              </pre>
            </div>

            {/* Docker Compose */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">docker-compose.yml</span>
                <button
                  onClick={() => handleCopy(dockerComposeContent, 'dockercompose')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  {copiedSection === 'dockercompose' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  Copy docker-compose.yml
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                {dockerComposeContent}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
