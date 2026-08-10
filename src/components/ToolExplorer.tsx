import React, { useState } from 'react';
import {
  Layers,
  Search,
  ArrowRight,
  Terminal,
  Shield,
  Wifi,
  Router,
  FileCode,
  Users,
  Building2,
  Share2
} from 'lucide-react';
import { OPENWISP_MCP_TOOLS } from '../data/openwispTools';

interface ToolExplorerProps {
  onSelectToolForTesting: (toolName: string) => void;
}

export const ToolExplorer: React.FC<ToolExplorerProps> = ({ onSelectToolForTesting }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Users & Auth',
    'Devices & Controller',
    'Templates',
    'Network Topology',
    'RADIUS & WiFi',
    'Organizations'
  ];

  const filteredTools = OPENWISP_MCP_TOOLS.filter(tool => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Users & Auth':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'Devices & Controller':
        return <Router className="w-4 h-4 text-cyan-400" />;
      case 'Templates':
        return <FileCode className="w-4 h-4 text-emerald-400" />;
      case 'Network Topology':
        return <Share2 className="w-4 h-4 text-indigo-400" />;
      case 'RADIUS & WiFi':
        return <Wifi className="w-4 h-4 text-amber-400" />;
      case 'Organizations':
        return <Building2 className="w-4 h-4 text-blue-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Search & Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {OPENWISP_MCP_TOOLS.length} API Tools Available
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">OpenWISP MCP Tool Catalog</h2>
            <p className="text-sm text-slate-300">
              Browse, filter, and inspect Model Context Protocol tools for OpenWISP REST API REST endpoints.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tools, endpoints, methods..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {getCategoryIcon(cat)}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map(tool => (
          <div
            key={tool.name}
            className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg group hover:shadow-cyan-950/20"
          >
            <div className="space-y-3">
              {/* Category & Method Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  {getCategoryIcon(tool.category)}
                  {tool.category}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                    tool.method === 'GET'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : tool.method === 'POST'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : tool.method === 'PATCH'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {tool.method}
                </span>
              </div>

              {/* Tool Name & Description */}
              <div>
                <h3 className="font-bold text-base text-white font-mono group-hover:text-cyan-300 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">{tool.description}</p>
              </div>

              {/* Endpoint Path */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px] text-cyan-400 truncate">
                {tool.endpoint}
              </div>

              {/* Parameters List */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Parameters ({tool.parameters.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {tool.parameters.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic">None</span>
                  ) : (
                    tool.parameters.map(p => (
                      <span
                        key={p.name}
                        className={`px-2 py-0.5 text-[10px] rounded font-mono border ${
                          p.required
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {p.name}{p.required && '*'}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Test Button */}
            <div className="pt-4 border-t border-slate-800/80 mt-4">
              <button
                type="button"
                onClick={() => onSelectToolForTesting(tool.name)}
                className="w-full bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5" />
                Test in MCP Inspector
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
