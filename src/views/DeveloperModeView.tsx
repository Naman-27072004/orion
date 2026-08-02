import React from 'react';
import { Code2, Terminal, Cpu, Database, Server, GitBranch } from 'lucide-react';

export const DeveloperModeView: React.FC = () => {
  const devTools = [
    { name: 'Node.js', version: 'v22.13.0', status: 'Active (ARM64 Native)', icon: Terminal, color: 'text-emerald-400' },
    { name: 'Rust & Cargo', version: 'v1.91.0', status: 'Installed (aarch64/msvc)', icon: Cpu, color: 'text-amber-400' },
    { name: 'WSL2 (Linux)', version: 'Ubuntu 24.04 ARM64', status: 'Virtualization Active', icon: Code2, color: 'text-blue-400' },
    { name: 'SQLite Storage', version: 'v3.45', status: 'orion.db Connected', icon: Database, color: 'text-cyan-400' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-400" />
          Developer Mode & Environment Telemetry
        </h2>
        <p className="text-xs text-gray-400">Track local server ports, WSL2 state, Cargo/NPM cache & dev toolchains</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {devTools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <div key={idx} className="glass-panel p-4 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${tool.color}`} /> {tool.name}
                </span>
              </div>
              <p className="text-lg font-bold text-white">{tool.version}</p>
              <p className="text-[11px] text-gray-400">{tool.status}</p>
            </div>
          );
        })}
      </div>

      {/* Dev Caches & Active Ports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            Active Local Services & Ports
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="font-mono text-cyan-300">http://localhost:1420</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">Tauri Vite Dev Server</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="font-mono text-cyan-300">http://localhost:1421</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px]">HMR WebSocket</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            Workspace & Caches
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Cargo Target Cache</span>
              <span className="text-white font-medium">~1.4 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Node Modules Storage</span>
              <span className="text-white font-medium">~320 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Git Repositories Tracked</span>
              <span className="text-emerald-400 font-medium">1 Active Repo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
