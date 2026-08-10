import React, { useState } from 'react';
import {
  Share2,
  Router,
  Wifi,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Layers
} from 'lucide-react';
import { MOCK_TOPOLOGIES, MOCK_DEVICES } from '../data/mockOpenwisp';

export const TopologyVisualizer: React.FC = () => {
  const [topology, setTopology] = useState(MOCK_TOPOLOGIES[0]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = topology.nodes?.find(n => n.id === selectedNodeId);
  const selectedNodeDevice = selectedNode
    ? MOCK_DEVICES.find(d => d.name === selectedNode.label || d.ip_address === selectedNode.addresses[0])
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Share2 className="w-48 h-48 text-cyan-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              openwisp-network-topology
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">OpenWISP Mesh Network Topology</h2>
          <p className="text-sm text-slate-300">
            Live interactive network topology topology graph generated from OpenWISP OLSR/Batman-adv parser APIs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topology Interactive Canvas */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between min-h-[450px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
              <div>
                <h3 className="font-bold text-white text-base">{topology.label}</h3>
                <p className="text-xs text-slate-400">
                  Parser: <code className="text-cyan-400 font-mono">{topology.parser}</code> | Organization: <code className="text-emerald-400 font-mono">{topology.organization}</code>
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  Nodes: <strong className="text-cyan-300">{topology.nodes_count}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  Links: <strong className="text-cyan-300">{topology.links_count}</strong>
                </span>
              </div>
            </div>

            {/* Simulated Canvas Visualizer */}
            <div className="relative w-full h-[320px] bg-slate-950 rounded-xl border border-slate-800/80 p-6 flex items-center justify-around overflow-hidden">
              {/* Background Grid Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

              {/* Network Links SVG Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Link 1: Node 1 to Node 2 */}
                <line
                  x1="20%"
                  y1="50%"
                  x2="50%"
                  y2="30%"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="6,6"
                  className="animate-pulse"
                />
                {/* Link 2: Node 2 to Node 3 */}
                <line
                  x1="50%"
                  y1="30%"
                  x2="80%"
                  y2="60%"
                  stroke="#10b981"
                  strokeWidth="3"
                />
                {/* Link 3: Node 1 to Node 3 (Down) */}
                <line
                  x1="20%"
                  y1="50%"
                  x2="80%"
                  y2="60%"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  opacity="0.6"
                />
              </svg>

              {/* Node 1 */}
              <button
                onClick={() => setSelectedNodeId('node-01')}
                className={`relative z-10 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
                  selectedNodeId === 'node-01'
                    ? 'bg-cyan-600 text-white border-cyan-400 scale-105 shadow-xl shadow-cyan-600/30'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-cyan-400">
                  <Router className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="font-bold text-xs block">GW-Berlin-HQ-01</span>
                  <span className="text-[10px] text-slate-400 font-mono">10.200.0.1</span>
                </div>
              </button>

              {/* Node 2 */}
              <button
                onClick={() => setSelectedNodeId('node-02')}
                className={`relative z-10 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
                  selectedNodeId === 'node-02'
                    ? 'bg-cyan-600 text-white border-cyan-400 scale-105 shadow-xl shadow-cyan-600/30'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-cyan-400">
                  <Wifi className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="font-bold text-xs block">AP-Munich-Floor2</span>
                  <span className="text-[10px] text-slate-400 font-mono">10.200.0.2</span>
                </div>
              </button>

              {/* Node 3 */}
              <button
                onClick={() => setSelectedNodeId('node-03')}
                className={`relative z-10 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
                  selectedNodeId === 'node-03'
                    ? 'bg-cyan-600 text-white border-cyan-400 scale-105 shadow-xl shadow-cyan-600/30'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-amber-400">
                  <Router className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="font-bold text-xs block">Outdoor-Mesh-03</span>
                  <span className="text-[10px] text-slate-400 font-mono">10.200.0.3</span>
                </div>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-2">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            Click any network node to view hardware specs, IP assignments, and assigned OpenWISP configuration templates.
          </p>
        </div>

        {/* Right Node Inspector Panel */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Node Inspector
          </h3>

          {!selectedNode ? (
            <div className="py-16 text-center text-xs text-slate-500 space-y-2">
              <Share2 className="w-10 h-10 mx-auto text-slate-700" />
              <p>Select a topology node on the graph to view device parameters.</p>
            </div>
          ) : (
            <div className="space-y-4 text-xs animate-fade-in">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Node Identifier</span>
                <div className="font-bold text-sm text-cyan-300 font-mono">{selectedNode.label}</div>
                <div className="text-slate-400">ID: <code>{selectedNode.id}</code></div>
                <div className="text-slate-400">Organization: <code>{selectedNode.organization}</code></div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">IP Addresses</span>
                <div className="space-y-1">
                  {selectedNode.addresses.map(ip => (
                    <div key={ip} className="font-mono text-emerald-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800/80">
                      {ip}
                    </div>
                  ))}
                </div>
              </div>

              {selectedNodeDevice && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">OpenWISP Device Record</span>
                  <div className="space-y-1 text-slate-300">
                    <div>Model: <strong>{selectedNodeDevice.model}</strong></div>
                    <div>MAC: <code className="text-cyan-400">{selectedNodeDevice.mac}</code></div>
                    <div>OS: <strong>{selectedNodeDevice.os}</strong></div>
                    <div>Status: <span className="text-emerald-400 font-semibold">{selectedNodeDevice.status}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
